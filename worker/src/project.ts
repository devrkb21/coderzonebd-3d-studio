// Client project rooms: `GET /project/:token` returns one client's project record from KV.
// Records are keyed by a SHA-256 hash of the token, so the lookup never compares the token
// itself and the stored keys are useless without the link. Keys are never listed here.
// worker/scripts/client.mjs creates and edits the records (same key scheme, same shape).

type L = { en: string; bn: string }
export const PHASES = ['discover', 'build', 'launch', 'support'] as const
type Phase = (typeof PHASES)[number]

export interface Commit { message: string; date: string }

export interface ProjectRecord {
  name: string
  project: L
  startDate: string
  dueDate: string
  percent: number
  phase: Phase
  milestones: { title: L; done: boolean; date?: string }[]
  updates: { date: string; text: L }[]
  manager: string
  /** owner/name on GitHub; never sent to the browser, only its latest commits. */
  repo?: string
  /** Labels a record as a demo in the UI. */
  demo?: boolean
  /** YYYY-MM-DD (Dhaka); after that day the link stops working. */
  expiresAt?: string
  commits?: Commit[]
}

/** 128-bit random token, base64url without padding. */
export const TOKEN = /^[A-Za-z0-9_-]{22}$/
const DATE = /^\d{4}-\d{2}-\d{2}$/
const REPO = /^[A-Za-z0-9_.-]{1,100}\/[A-Za-z0-9_.-]{1,100}$/

export async function tokenKey(token: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))
  return `client:${[...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')}`
}

const str = (v: unknown, max: number) =>
  typeof v === 'string' ? v.replace(/[\u0000-\u001F\u007F‪-‮⁦-⁩]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max) : ''
const lang = (v: unknown, max: number): L => {
  const o = (v ?? {}) as Partial<L>
  const en = str(typeof v === 'string' ? v : o.en, max)
  return { en, bn: str(o.bn, max) || en }
}
const date = (v: unknown) => (typeof v === 'string' && DATE.test(v) ? v : '')

/** Only the fields the client page shows, cleaned and capped, whatever the stored record holds. */
export function publicRecord(raw: unknown): ProjectRecord | null {
  const r = raw as Record<string, unknown> | null
  if (!r || typeof r !== 'object') return null
  const name = str(r.name, 80)
  if (!name) return null
  const phase = PHASES.includes(r.phase as Phase) ? (r.phase as Phase) : 'discover'
  const percent = Math.max(0, Math.min(100, Math.round(Number(r.percent) || 0)))
  const milestones = (Array.isArray(r.milestones) ? r.milestones : []).slice(0, 12).map((m) => ({
    title: lang((m as Record<string, unknown>)?.title, 120),
    done: (m as Record<string, unknown>)?.done === true,
    ...(date((m as Record<string, unknown>)?.date) ? { date: date((m as Record<string, unknown>).date) } : {}),
  })).filter((m) => m.title.en)
  const updates = (Array.isArray(r.updates) ? r.updates : []).slice(0, 10).map((u) => ({
    date: date((u as Record<string, unknown>)?.date),
    text: lang((u as Record<string, unknown>)?.text, 400),
  })).filter((u) => u.text.en)
  return {
    name,
    project: lang(r.project, 100),
    startDate: date(r.startDate),
    dueDate: date(r.dueDate),
    percent,
    phase,
    milestones,
    updates,
    manager: str(r.manager, 60),
    ...(r.demo === true ? { demo: true } : {}),
  }
}

export function expired(raw: unknown, now = Date.now()) {
  const e = date((raw as Record<string, unknown> | null)?.expiresAt)
  // the link works to the end of that day in Dhaka
  return !!e && now > Date.parse(`${e}T23:59:59+06:00`)
}

export const repoOf = (raw: unknown) => {
  const repo = (raw as Record<string, unknown> | null)?.repo
  return typeof repo === 'string' && REPO.test(repo) ? repo : null
}

/**
 * The latest 5 commit messages and dates for `repo`, cached in KV for 10 minutes (the Cache API
 * does nothing on workers.dev). No token, or any GitHub error: null, and the page shows none.
 */
export async function latestCommits(kv: KVNamespace, repo: string, token: string | undefined): Promise<Commit[] | null> {
  if (!token) return null
  const key = `gh:${repo.toLowerCase()}`
  const cached = await kv.get<Commit[]>(key, 'json')
  if (cached) return cached.length ? cached : null
  let commits: Commit[] = []
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/commits?per_page=5`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'cz3d-api', 'X-GitHub-Api-Version': '2022-11-28' },
      signal: AbortSignal.timeout(5000),
    })
    if (res.ok) {
      const list = (await res.json()) as { commit?: { message?: string; committer?: { date?: string }; author?: { date?: string } } }[]
      commits = (Array.isArray(list) ? list : []).slice(0, 5).map((c) => ({
        message: str((c.commit?.message ?? '').split('\n')[0], 140),
        date: str(c.commit?.committer?.date ?? c.commit?.author?.date, 40),
      })).filter((c) => c.message)
    } else {
      console.error('github commits', res.status, repo)
    }
  } catch (err) {
    console.error('github commits failed', repo, err)
  }
  // a failure is remembered briefly, so a broken repo setting doesn't hit GitHub on every visit
  await kv.put(key, JSON.stringify(commits), { expirationTtl: commits.length ? 600 : 120 })
  return commits.length ? commits : null
}
