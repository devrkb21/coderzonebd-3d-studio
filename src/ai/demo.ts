// "Build my site live": the visitor describes their business and the AI streams a mock-up.
import { create } from 'zustand'
import { useStore } from '../store'
import { streamDemo, type ApiError } from './client'

export type DemoStatus = 'idle' | 'building' | 'done' | 'error'

interface Demo {
  /** The camera is at the demo screen and the form is showing. */
  open: boolean
  status: DemoStatus
  html: string
  error: ApiError | null
  business: { name: string; type: string; description: string }
  setOpen: (open: boolean) => void
  build: (business: Demo['business']) => void
  reset: () => void
}

let controller: AbortController | null = null

/** Drops anything before <!doctype or <html> (stray code fences) and after </html>. */
export function tidyHtml(raw: string) {
  const start = raw.search(/<!doctype|<html/i)
  let html = start >= 0 ? raw.slice(start) : ''
  const end = html.search(/<\/html>/i)
  if (end >= 0) html = html.slice(0, end + 7)
  return html
}

/**
 * The mock-up rendered for the iframe. The CSP blocks every network request and script even
 * if the model ignored the rules; the iframe sandbox blocks scripts too.
 */
export function safeDoc(html: string) {
  const csp = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:">`
  return /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, (m) => `${m}${csp}`) : `${csp}${html}`
}

export const useDemo = create<Demo>((set, get) => ({
  open: false,
  status: 'idle',
  html: '',
  error: null,
  business: { name: '', type: '', description: '' },
  setOpen: (open) => set({ open }),
  build: (business) => {
    controller?.abort()
    controller = new AbortController()
    const ctrl = controller
    set({ business, status: 'building', html: '', error: null })
    streamDemo({ ...business, lang: useStore.getState().lang }, (e) => {
      if (e.t === 'html') set({ html: get().html + e.v })
    }, ctrl.signal).then((error) => {
      if (ctrl.signal.aborted) return
      const ok = !error && tidyHtml(get().html).length > 200
      set({ status: ok ? 'done' : 'error', error: error ?? (ok ? null : { kind: 'failed' }) })
    })
  },
  reset: () => {
    controller?.abort()
    set({ status: 'idle', html: '', error: null })
  },
}))
