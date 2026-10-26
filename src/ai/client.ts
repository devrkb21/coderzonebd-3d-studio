// Talks to the cz3d-api Worker (worker/). With no VITE_API_URL at build time there is no AI UI.
import { CONTACT, STOPS, type Lang, type StopId } from '../content'
import { useStore, type Persona } from '../store'

export const API = ((import.meta.env.VITE_API_URL as string | undefined) ?? '').replace(/\/+$/, '')
export const AI_ENABLED = API.length > 0

export interface ChatTurn { role: 'user' | 'assistant'; content: string }

/** Why a request didn't stream: no API key yet, a rate limit (with a message), or anything else. */
export type ApiError = { kind: 'not_configured' } | { kind: 'rate_limited'; message: Record<Lang, string> } | { kind: 'failed' }

export type ChatEvent =
  | { t: 'text'; v: string }
  | { t: 'tool'; name: string; input: Record<string, unknown> }
  | { t: 'html'; v: string }
  | { t: 'error'; v: string }
  | { t: 'done' }

/** POSTs `body` and calls `onEvent` for each server-sent event. Resolves with an error or null. */
async function stream(path: string, body: unknown, onEvent: (e: ChatEvent) => void, signal?: AbortSignal): Promise<ApiError | null> {
  let res: Response
  try {
    res = await fetch(`${API}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal })
  } catch {
    return signal?.aborted ? null : { kind: 'failed' }
  }
  if (!res.ok || !res.body) {
    const data = await res.json().catch(() => null) as { error?: string; message?: Record<Lang, string> } | null
    if (data?.error === 'not_configured') return { kind: 'not_configured' }
    if (data?.error === 'rate_limited' && data.message) return { kind: 'rate_limited', message: data.message }
    return { kind: 'failed' }
  }
  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader()
  let buf = ''
  let failed = false
  try {
    for (;;) {
      const { value, done } = await reader.read()
      if (done) break
      buf += value
      let cut: number
      while ((cut = buf.indexOf('\n\n')) >= 0) {
        const line = buf.slice(0, cut).trim()
        buf = buf.slice(cut + 2)
        if (!line.startsWith('data:')) continue
        try {
          const e = JSON.parse(line.slice(5)) as ChatEvent
          if (e.t === 'error') failed = true
          onEvent(e)
        } catch { /* ignore a malformed event */ }
      }
    }
  } catch {
    if (!signal?.aborted) return { kind: 'failed' }
  }
  return failed ? { kind: 'failed' } : null
}

export const streamChat = (persona: Persona, lang: Lang, messages: ChatTurn[], onEvent: (e: ChatEvent) => void, signal?: AbortSignal) =>
  stream('/chat', { persona, lang, messages }, onEvent, signal)

export const streamDemo = (input: { name: string; type: string; description: string; lang: Lang }, onEvent: (e: ChatEvent) => void, signal?: AbortSignal) =>
  stream('/demo', input, onEvent, signal)

export const waHref = (text: string) => `https://wa.me/${CONTACT.whatsappNumber}?text=${encodeURIComponent(text)}`

/**
 * Runs a tool call from the assistant with the site's own store actions. Returns a WhatsApp
 * link for `open_whatsapp`, which the chat shows as a button (nothing is sent automatically).
 * `book_call` opens the booking dialog; the visitor picks the slot and sends it themselves.
 */
export function runTool(name: string, input: Record<string, unknown>): { wa?: string } {
  const s = useStore.getState()
  if (name === 'add_to_quote' && Array.isArray(input.serviceIds)) {
    for (const id of input.serviceIds) if (typeof id === 'string' && !s.quote.includes(id)) useStore.getState().toggleQuote(id)
  } else if (name === 'go_to_section' && STOPS.some((x) => x.id === input.stop)) {
    if (s.mode === '3d') s.goTo(input.stop as StopId)
    else document.getElementById(input.stop as string)?.scrollIntoView({ behavior: 'smooth' })
  } else if (name === 'book_call' && (input.founder === 'ceo' || input.founder === 'cmo')) {
    s.openBooking(input.founder)
  } else if (name === 'open_whatsapp' && typeof input.summary === 'string') {
    return { wa: waHref(input.summary) }
  }
  return {}
}
