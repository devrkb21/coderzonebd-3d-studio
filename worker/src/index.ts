// cz3d-api: the AI receptionist, the founders' assistants, the live site demo and live
// visitor presence for the Coder Zone BD 3D studio.
import Anthropic from '@anthropic-ai/sdk'
import { chatSystem, DEMO_SYSTEM, TOOLS, type Persona } from './prompts'
import { SERVICE_IDS, STOP_IDS } from './knowledge'

export { Limiter } from './limiter'
export { Presence } from './presence'

export interface Env {
  ANTHROPIC_API_KEY?: string
  LIMITER: DurableObjectNamespace<import('./limiter').Limiter>
  PRESENCE: DurableObjectNamespace<import('./presence').Presence>
  ALLOWED_ORIGINS: string
  CHAT_MODEL: string
  DEMO_MODEL: string
  CHAT_PER_HOUR: string
  DEMO_PER_HOUR: string
  CHAT_PER_DAY: string
  DEMO_PER_DAY: string
}

const PERSONAS: Persona[] = ['receptionist', 'ceo', 'cmo']
const HOUR = 3_600_000
const DAY = 86_400_000
const MAX_BODY = 16_000
const MAX_TURNS = 16
const MAX_MESSAGE = 1_000
const MAX_HISTORY = 6_000
/** Model calls per chat reply: the answer, plus a follow-up after any tool calls. */
const MAX_ROUNDS = 3

const LOCAL = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/

function allowedOrigin(req: Request, env: Env) {
  const origin = req.headers.get('Origin') ?? ''
  const list = env.ALLOWED_ORIGINS.split(',').map((s) => s.trim())
  return list.includes(origin) || LOCAL.test(origin) ? origin : null
}

const cors = (origin: string) => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
  Vary: 'Origin',
})

const json = (body: unknown, status: number, origin: string) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...cors(origin) } })

/** Strips control characters and angle brackets, collapses whitespace, caps the length. */
const clean = (v: unknown, max: number) =>
  typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000B-\u001F\u007F<>]/g, ' ').replace(/[ \t]+/g, ' ').trim().slice(0, max) : ''

async function visitorKey(req: Request) {
  const ip = req.headers.get('CF-Connecting-IP') ?? 'unknown'
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`cz3d:${ip}`))
  return [...new Uint8Array(digest).slice(0, 12)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** Per-visitor hourly limit first, then the global daily cap. Returns a 429 response or null. */
async function limit(req: Request, env: Env, kind: 'chat' | 'demo', origin: string) {
  const perHour = Number(kind === 'chat' ? env.CHAT_PER_HOUR : env.DEMO_PER_HOUR)
  const perDay = Number(kind === 'chat' ? env.CHAT_PER_DAY : env.DEMO_PER_DAY)
  const mine = await env.LIMITER.get(env.LIMITER.idFromName(await visitorKey(req))).hit(kind, perHour, HOUR)
  if (!mine.ok) {
    return json({
      error: 'rate_limited',
      retryAfter: mine.retryAfter,
      message: kind === 'chat'
        ? { en: "You've sent a lot of messages this hour. Please try again a little later, or message us on WhatsApp.", bn: 'এই ঘণ্টায় অনেক মেসেজ পাঠিয়েছেন। একটু পরে আবার চেষ্টা করুন, অথবা WhatsApp-এ মেসেজ দিন।' }
        : { en: "You've built a few demos this hour. Please try again later, or message us on WhatsApp.", bn: 'এই ঘণ্টায় কয়েকটা ডেমো বানিয়েছেন। পরে আবার চেষ্টা করুন, অথবা WhatsApp-এ মেসেজ দিন।' },
    }, 429, origin)
  }
  const all = await env.LIMITER.get(env.LIMITER.idFromName('global')).hit(kind, perDay, DAY)
  if (!all.ok) {
    return json({
      error: 'rate_limited',
      retryAfter: all.retryAfter,
      message: { en: 'Our AI desk is very busy today. Please message us on WhatsApp and the team will reply.', bn: 'আজ আমাদের AI ডেস্ক খুব ব্যস্ত। WhatsApp-এ মেসেজ দিন, টিম উত্তর দেবে।' },
    }, 429, origin)
  }
  return null
}

async function readBody(req: Request): Promise<Record<string, unknown> | null> {
  const text = await req.text()
  if (text.length > MAX_BODY) return null
  try {
    const body = JSON.parse(text)
    return body && typeof body === 'object' ? body : null
  } catch { return null }
}

/** Server-sent events: one JSON object per `data:` line. */
function sse(origin: string) {
  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>()
  const writer = writable.getWriter()
  const enc = new TextEncoder()
  let open = true
  const send = async (event: Record<string, unknown>) => {
    if (!open) return false
    try { await writer.write(enc.encode(`data: ${JSON.stringify(event)}\n\n`)) } catch { open = false }
    return open
  }
  const close = async () => { if (open) { open = false; try { await writer.close() } catch { /* client left */ } } }
  const response = new Response(readable, {
    headers: { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache, no-transform', ...cors(origin) },
  })
  return { response, send, close }
}

function chatMessages(raw: unknown): Anthropic.Beta.BetaMessageParam[] | null {
  if (!Array.isArray(raw)) return null
  const out: Anthropic.Beta.BetaMessageParam[] = []
  for (const m of raw.slice(-MAX_TURNS)) {
    const role = (m as { role?: unknown })?.role
    const content = clean((m as { content?: unknown })?.content, MAX_MESSAGE)
    if ((role !== 'user' && role !== 'assistant') || !content) continue
    out.push({ role, content })
  }
  // Oldest turns go first when the history is long; it must start and end with the visitor.
  let total = out.reduce((n, m) => n + (m.content as string).length, 0)
  while (out.length && (total > MAX_HISTORY || out[0].role !== 'user')) total -= (out.shift()!.content as string).length
  return out.length && out[out.length - 1].role === 'user' ? out : null
}

function validTool(name: string, input: unknown): Record<string, unknown> | null {
  const i = input as Record<string, unknown> | null
  if (!i || typeof i !== 'object') return null
  if (name === 'add_to_quote') {
    const ids = Array.isArray(i.serviceIds) ? i.serviceIds.filter((x): x is string => typeof x === 'string' && SERVICE_IDS.includes(x)) : []
    return ids.length ? { serviceIds: [...new Set(ids)] } : null
  }
  if (name === 'go_to_section') return typeof i.stop === 'string' && STOP_IDS.includes(i.stop as never) ? { stop: i.stop } : null
  if (name === 'open_whatsapp') {
    const summary = clean(i.summary, 400)
    return summary ? { summary } : null
  }
  return null
}

const REFUSED = { en: "Sorry, I can't help with that here. For anything else about your project, ask away or message the team on WhatsApp.", bn: 'দুঃখিত, এ বিষয়ে এখানে সাহায্য করতে পারছি না। আপনার প্রজেক্ট নিয়ে আর কিছু জানতে চাইলে বলুন, অথবা WhatsApp-এ টিমকে মেসেজ দিন।' }

async function chat(req: Request, env: Env, ctx: ExecutionContext, origin: string) {
  const body = await readBody(req)
  const persona = body?.persona as Persona
  const lang = body?.lang === 'bn' ? 'bn' : 'en'
  const messages = chatMessages(body?.messages)
  if (!body || !PERSONAS.includes(persona) || !messages) return json({ error: 'bad_request' }, 400, origin)
  const limited = await limit(req, env, 'chat', origin)
  if (limited) return limited
  if (!env.ANTHROPIC_API_KEY) return json({ error: 'not_configured' }, 503, origin)

  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, maxRetries: 1 })
  const out = sse(origin)
  // The visitor's UI language, as a hint: the model still mirrors the language they write in.
  const last = messages[messages.length - 1]
  messages[messages.length - 1] = { role: 'user', content: `${last.content as string}\n\n(Site language: ${lang === 'bn' ? 'Bangla' : 'English'})` }
  const run = async () => {
    try {
      for (let round = 0; round < MAX_ROUNDS; round++) {
        const stream = client.beta.messages.stream({
          model: env.CHAT_MODEL,
          max_tokens: 2000,
          betas: ['server-side-fallback-2026-07-01'],
          fallbacks: 'default',
          output_config: { effort: 'low' },
          system: chatSystem(persona),
          tools: TOOLS,
          messages,
        })
        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            if (!(await out.send({ t: 'text', v: event.delta.text }))) { stream.abort(); return }
          }
        }
        const final = await stream.finalMessage()
        if (final.stop_reason === 'refusal') { await out.send({ t: 'text', v: REFUSED[lang] }); break }
        const calls = final.content.filter((b): b is Anthropic.Beta.BetaToolUseBlock => b.type === 'tool_use')
        if (final.stop_reason !== 'tool_use' || !calls.length) break
        const results: Anthropic.Beta.BetaToolResultBlockParam[] = []
        for (const call of calls) {
          const input = validTool(call.name, call.input)
          if (input) await out.send({ t: 'tool', name: call.name, input })
          results.push(input
            ? { type: 'tool_result', tool_use_id: call.id, content: 'Done in the visitor\'s browser.' }
            : { type: 'tool_result', tool_use_id: call.id, content: 'Invalid input, nothing happened.', is_error: true })
        }
        messages.push({ role: 'assistant', content: final.content }, { role: 'user', content: results })
      }
      await out.send({ t: 'done' })
    } catch (err) {
      console.error('chat failed', err instanceof Anthropic.APIError ? `${err.status} ${err.message}` : err)
      await out.send({ t: 'error', v: err instanceof Anthropic.RateLimitError ? 'busy' : 'failed' })
    } finally {
      await out.close()
    }
  }
  ctx.waitUntil(run())
  return out.response
}

async function demo(req: Request, env: Env, ctx: ExecutionContext, origin: string) {
  const body = await readBody(req)
  const name = clean(body?.name, 60)
  const type = clean(body?.type, 60)
  const description = clean(body?.description, 400)
  const lang = body?.lang === 'bn' ? 'bn' : 'en'
  if (!name || !type) return json({ error: 'bad_request' }, 400, origin)
  const limited = await limit(req, env, 'demo', origin)
  if (limited) return limited
  if (!env.ANTHROPIC_API_KEY) return json({ error: 'not_configured' }, 503, origin)

  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, maxRetries: 1 })
  const out = sse(origin)
  const run = async () => {
    try {
      const stream = client.beta.messages.stream({
        model: env.DEMO_MODEL,
        max_tokens: 16000,
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        output_config: { effort: 'low' },
        system: [{ type: 'text', text: DEMO_SYSTEM, cache_control: { type: 'ephemeral' } }],
        messages: [{
          role: 'user',
          content: `Language for the page text: ${lang === 'bn' ? 'Bangla' : 'English'}\n<business>\nName: ${name}\nType: ${type}\nAbout: ${description || '(not given)'}\n</business>`,
        }],
      })
      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          if (!(await out.send({ t: 'html', v: event.delta.text }))) { stream.abort(); return }
        }
      }
      const final = await stream.finalMessage()
      await out.send(final.stop_reason === 'refusal' ? { t: 'error', v: 'refused' } : { t: 'done' })
    } catch (err) {
      console.error('demo failed', err instanceof Anthropic.APIError ? `${err.status} ${err.message}` : err)
      await out.send({ t: 'error', v: err instanceof Anthropic.RateLimitError ? 'busy' : 'failed' })
    } finally {
      await out.close()
    }
  }
  ctx.waitUntil(run())
  return out.response
}

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(req.url)
    const origin = allowedOrigin(req, env)
    if (!origin) return new Response('Forbidden', { status: 403 })
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(origin) })

    if (url.pathname === '/presence' && req.method === 'GET') {
      return env.PRESENCE.get(env.PRESENCE.idFromName('studio')).fetch(req)
    }
    if (url.pathname === '/health' && req.method === 'GET') return json({ ok: true, ai: !!env.ANTHROPIC_API_KEY }, 200, origin)
    if (url.pathname === '/chat' && req.method === 'POST') return chat(req, env, ctx, origin)
    if (url.pathname === '/demo' && req.method === 'POST') return demo(req, env, ctx, origin)
    return json({ error: 'not_found' }, 404, origin)
  },
} satisfies ExportedHandler<Env>
