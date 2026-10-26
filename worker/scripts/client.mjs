#!/usr/bin/env node
// Client project rooms: create and update the records behind `?client=<token>` links.
// Runs `wrangler kv` against the Worker's CLIENTS namespace (wrangler must be logged in).
//
//   node scripts/client.mjs new "<client name>" "<project>" ["<project in Bangla>"] [--days 30] [--start YYYY-MM-DD] [--due YYYY-MM-DD] [--manager "<name>"] [--repo owner/name] [--demo]
//   node scripts/client.mjs set <token> <field> <value>
//   node scripts/client.mjs milestone <token> add "<en>" "<bn>" [YYYY-MM-DD]
//   node scripts/client.mjs milestone <token> done|undo|remove <n>
//   node scripts/client.mjs update <token> "<en>" "<bn>" [--date YYYY-MM-DD]
//   node scripts/client.mjs show <token>
//   node scripts/client.mjs list
//   node scripts/client.mjs relink <id>
//   node scripts/client.mjs delete <token|id>
//
// <token> can also be the whole private link. The token itself is never stored: the KV key is
// its SHA-256 hash, so a lost link can't be read back. `relink` issues a new one instead.
// Env: CZ_SITE (default https://3d.coderzonebd.com/), CZ_KV_LOCAL=1 to use `wrangler dev`'s local KV.
import { spawnSync } from 'node:child_process'
import { createHash, randomBytes } from 'node:crypto'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const WORKER_DIR = join(dirname(fileURLToPath(import.meta.url)), '..')
const WRANGLER = join(WORKER_DIR, 'node_modules', 'wrangler', 'bin', 'wrangler.js')
const SITE = (process.env.CZ_SITE ?? 'https://3d.coderzonebd.com/').replace(/\/?$/, '/')
const WHERE = process.env.CZ_KV_LOCAL === '1' ? '--local' : '--remote'
const PHASES = ['discover', 'build', 'launch', 'support']
const FIELDS = ['name', 'project', 'project.en', 'project.bn', 'startDate', 'dueDate', 'percent', 'phase', 'manager', 'repo', 'expiresAt', 'demo']
const DATE = /^\d{4}-\d{2}-\d{2}$/
const TOKEN = /^[A-Za-z0-9_-]{22}$/

function fail(msg) {
  console.error(`✗ ${msg}`)
  process.exit(1)
}

function wrangler(args) {
  const r = spawnSync(process.execPath, [WRANGLER, 'kv', ...args, '--binding', 'CLIENTS', WHERE], { cwd: WORKER_DIR, encoding: 'utf8' })
  if (r.status !== 0) fail(`wrangler kv ${args[0]} ${args[1]} failed:\n${r.stderr || r.stdout}`)
  return r.stdout
}

const keyOf = (token) => `client:${createHash('sha256').update(token).digest('hex')}`
const idOf = (key) => key.slice('client:'.length, 'client:'.length + 10)
const today = () => new Date(Date.now() + 6 * 3600_000).toISOString().slice(0, 10)
const addDays = (d, n) => new Date(Date.parse(`${d}T00:00:00Z`) + n * 86400_000).toISOString().slice(0, 10)
const linkOf = (token) => `${SITE}?client=${token}`

/** Accepts a bare token or a whole link with `?client=`. */
function tokenFrom(arg) {
  if (!arg) fail('Missing <token>.')
  let t = arg.trim()
  const m = t.match(/[?&]client=([^&#\s]+)/)
  if (m) t = decodeURIComponent(m[1])
  if (!TOKEN.test(t)) fail(`That doesn't look like a client token or link: ${arg}`)
  return t
}

function getKey(key) {
  const out = wrangler(['key', 'get', key, '--text'])
  const a = out.indexOf('{')
  const b = out.lastIndexOf('}')
  if (a < 0 || b < a) return null
  try { return JSON.parse(out.slice(a, b + 1)) } catch { return null }
}

function putKey(key, record) {
  const dir = mkdtempSync(join(tmpdir(), 'cz3d-'))
  const file = join(dir, 'record.json')
  try {
    writeFileSync(file, JSON.stringify(record))
    // the name and project ride along as metadata, so `list` needs no extra reads
    const meta = JSON.stringify({ name: record.name, project: record.project.en, demo: !!record.demo })
    wrangler(['key', 'put', key, '--path', file, '--metadata', meta])
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

function load(token) {
  const key = keyOf(token)
  const record = getKey(key)
  if (!record) fail('No project found for that link (wrong token, or it was deleted / relinked).')
  return { key, record }
}

function listKeys() {
  const out = wrangler(['key', 'list', '--prefix', 'client:'])
  const a = out.indexOf('[')
  try { return JSON.parse(out.slice(a)) } catch { fail(`Couldn't read the key list:\n${out}`) }
}

function keyFromId(id) {
  if (!/^[0-9a-f]{6,64}$/.test(id ?? '')) fail('Give the id from `list` (at least 6 hex characters).')
  const hits = listKeys().filter((k) => k.name.startsWith(`client:${id}`))
  if (hits.length !== 1) fail(hits.length ? 'That id matches more than one project; give more characters.' : 'No project with that id.')
  return hits[0].name
}

function checkDate(v, what) {
  if (!DATE.test(v) || Number.isNaN(Date.parse(v))) fail(`${what} must be YYYY-MM-DD, got "${v}".`)
  return v
}

function flags(args) {
  const out = { _: [] }
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const name = args[i].slice(2)
      if (name === 'demo') out.demo = true
      else out[name] = args[++i]
    } else out._.push(args[i])
  }
  return out
}

function show(record, token) {
  const r = record
  const bar = '█'.repeat(Math.round(r.percent / 5)).padEnd(20, '░')
  console.log(`\n${r.name}${r.demo ? '  [DEMO]' : ''}\n${r.project.en}${r.project.bn !== r.project.en ? ` / ${r.project.bn}` : ''}`)
  console.log(`${bar} ${r.percent}%   phase: ${r.phase}   ${r.startDate} → ${r.dueDate}${r.manager ? `   manager: ${r.manager}` : ''}${r.repo ? `   repo: ${r.repo}` : ''}${r.expiresAt ? `   link expires: ${r.expiresAt}` : ''}`)
  console.log('\nMilestones:')
  if (!r.milestones.length) console.log('  (none)')
  r.milestones.forEach((m, i) => console.log(`  ${i + 1}. [${m.done ? 'x' : ' '}] ${m.title.en}${m.title.bn !== m.title.en ? ` / ${m.title.bn}` : ''}${m.date ? `  (${m.date})` : ''}`))
  console.log('\nUpdates (newest first):')
  if (!r.updates.length) console.log('  (none)')
  r.updates.forEach((u) => console.log(`  ${u.date}  ${u.text.en}${u.text.bn !== u.text.en ? `\n              ${u.text.bn}` : ''}`))
  if (token) console.log(`\nLink: ${linkOf(token)}`)
  console.log('')
}

const [cmd, ...rest] = process.argv.slice(2)

switch (cmd) {
  case 'new': {
    const f = flags(rest)
    const [name, en, bn] = f._
    if (!name || !en) fail('Usage: new "<client name>" "<project>" ["<project in Bangla>"] [--days 30] [--start YYYY-MM-DD] [--due YYYY-MM-DD] [--manager "<name>"] [--repo owner/name] [--demo]')
    const start = f.start ? checkDate(f.start, '--start') : today()
    const due = f.due ? checkDate(f.due, '--due') : addDays(start, Number(f.days ?? 30))
    if (f.repo && !/^[\w.-]+\/[\w.-]+$/.test(f.repo)) fail('--repo must be owner/name.')
    const token = randomBytes(16).toString('base64url')
    const record = {
      name: name.slice(0, 80), project: { en: en.slice(0, 100), bn: (bn ?? en).slice(0, 100) },
      startDate: start, dueDate: due, percent: 0, phase: 'discover',
      milestones: [], updates: [], manager: (f.manager ?? '').slice(0, 60),
      ...(f.repo ? { repo: f.repo } : {}), ...(f.demo ? { demo: true } : {}),
    }
    putKey(keyOf(token), record)
    show(record, token)
    console.log('Send this private link to the client. It is shown only now: the token is not stored, so keep it in the client\'s chat.')
    console.log(`id (for list / relink / delete): ${idOf(keyOf(token))}`)
    break
  }
  case 'set': {
    const [t, field, ...v] = rest
    const value = v.join(' ')
    if (!FIELDS.includes(field)) fail(`Field must be one of: ${FIELDS.join(', ')}`)
    const { key, record } = load(tokenFrom(t))
    if (field === 'name') record.name = value.slice(0, 80)
    else if (field === 'project') record.project = { en: value.slice(0, 100), bn: value.slice(0, 100) }
    else if (field === 'project.en' || field === 'project.bn') record.project[field.slice(8)] = value.slice(0, 100)
    else if (field === 'startDate' || field === 'dueDate') record[field] = checkDate(value, field)
    else if (field === 'percent') {
      const n = Number(value)
      if (!Number.isFinite(n) || n < 0 || n > 100) fail('percent must be 0–100.')
      record.percent = Math.round(n)
    } else if (field === 'phase') {
      if (!PHASES.includes(value)) fail(`phase must be one of: ${PHASES.join(', ')}`)
      record.phase = value
    } else if (field === 'manager') record.manager = value.slice(0, 60)
    else if (field === 'repo') {
      if (value && !/^[\w.-]+\/[\w.-]+$/.test(value)) fail('repo must be owner/name, or "" to clear it.')
      if (value) record.repo = value; else delete record.repo
    } else if (field === 'expiresAt') {
      if (value) record.expiresAt = checkDate(value, 'expiresAt'); else delete record.expiresAt
    } else if (field === 'demo') {
      if (value === 'true') record.demo = true; else delete record.demo
    }
    putKey(key, record)
    show(record)
    break
  }
  case 'milestone': {
    const [t, action, ...args] = rest
    const { key, record } = load(tokenFrom(t))
    if (action === 'add') {
      const [en, bn, date] = args
      if (!en) fail('Usage: milestone <token> add "<en>" "<bn>" [YYYY-MM-DD]')
      if (record.milestones.length >= 12) fail('A project shows at most 12 milestones; remove one first.')
      record.milestones.push({ title: { en: en.slice(0, 120), bn: (bn || en).slice(0, 120) }, done: false, ...(date ? { date: checkDate(date, 'date') } : {}) })
    } else if (['done', 'undo', 'remove'].includes(action)) {
      const i = Number(args[0]) - 1
      if (!record.milestones[i]) fail(`No milestone #${args[0]} (there are ${record.milestones.length}).`)
      if (action === 'remove') record.milestones.splice(i, 1)
      else {
        record.milestones[i].done = action === 'done'
        if (action === 'done' && !record.milestones[i].date) record.milestones[i].date = today()
      }
    } else fail('Usage: milestone <token> add "<en>" "<bn>" [date] | done <n> | undo <n> | remove <n>')
    putKey(key, record)
    show(record)
    break
  }
  case 'update': {
    const f = flags(rest)
    const [t, en, bn] = f._
    if (!en) fail('Usage: update <token> "<en>" "<bn>" [--date YYYY-MM-DD]')
    const { key, record } = load(tokenFrom(t))
    record.updates.unshift({ date: f.date ? checkDate(f.date, '--date') : today(), text: { en: en.slice(0, 400), bn: (bn || en).slice(0, 400) } })
    record.updates = record.updates.slice(0, 10)
    putKey(key, record)
    show(record)
    break
  }
  case 'show': {
    const token = tokenFrom(rest[0])
    show(load(token).record, token)
    break
  }
  case 'list': {
    const keys = listKeys()
    if (!keys.length) console.log('No client projects yet.')
    for (const k of keys) console.log(`${idOf(k.name)}  ${k.metadata?.name ?? '?'} · ${k.metadata?.project ?? ''}${k.metadata?.demo ? '  [DEMO]' : ''}`)
    break
  }
  case 'relink': {
    const old = keyFromId(rest[0])
    const record = getKey(old)
    if (!record) fail('Couldn\'t read that project.')
    const token = randomBytes(16).toString('base64url')
    putKey(keyOf(token), record)
    wrangler(['key', 'delete', old])
    console.log(`New private link for ${record.name}: ${linkOf(token)}\nThe old link no longer works. id: ${idOf(keyOf(token))}`)
    break
  }
  case 'delete': {
    const arg = rest[0] ?? ''
    const key = /^[0-9a-f]{6,64}$/.test(arg) ? keyFromId(arg) : keyOf(tokenFrom(arg))
    wrangler(['key', 'delete', key])
    console.log('Deleted. That link now shows the normal site with a "link not valid" note.')
    break
  }
  default:
    console.log(`Client project rooms. Commands:
  new "<client name>" "<project>" ["<project in Bangla>"] [--days 30] [--start YYYY-MM-DD] [--due YYYY-MM-DD] [--manager "<name>"] [--repo owner/name] [--demo]
  set <token> <field> <value>        fields: ${FIELDS.join(', ')}
  milestone <token> add "<en>" "<bn>" [YYYY-MM-DD]  |  done <n>  |  undo <n>  |  remove <n>
  update <token> "<en>" "<bn>" [--date YYYY-MM-DD]
  show <token>
  list
  relink <id>                        new link for a project (the old one stops working)
  delete <token|id>
<token> can be the bare token or the whole link.`)
}
