// Live visitors: a WebSocket to the Worker's presence room. Only camera positions travel.
import { useEffect } from 'react'
import { create } from 'zustand'
import { API, AI_ENABLED } from './client'
import { useStore } from '../store'

/** Another visitor: camera x, y, z and heading (radians). */
export type Visitor = [x: number, y: number, z: number, heading: number]

interface Presence {
  count: number
  others: Map<string, Visitor>
}

export const usePresence = create<Presence>(() => ({ count: 0, others: new Map() }))

let socket: WebSocket | null = null
let me = ''

/** Sends this visitor's camera; the server ignores anything faster than ~3× a second. */
export function sendPosition(v: Visitor) {
  if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ p: v.map((n) => Math.round(n * 100) / 100) }))
}

function connect(onClose: () => void) {
  const ws = new WebSocket(`${API.replace(/^http/, 'ws')}/presence`)
  socket = ws
  ws.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data as string) as { you?: string; n?: number; v?: [string, ...Visitor][] }
      if (data.you) me = data.you
      if (typeof data.n === 'number') {
        const others = new Map<string, Visitor>()
        for (const [id, ...v] of data.v ?? []) if (id !== me) others.set(id, v as Visitor)
        usePresence.setState({ count: data.n, others })
      }
    } catch { /* ignore a malformed message */ }
  }
  ws.onclose = () => {
    if (socket === ws) socket = null
    usePresence.setState({ count: 0, others: new Map() })
    onClose()
  }
}

/** Keeps the presence socket open while the tab is visible, reconnecting with a backoff. */
export function usePresenceSocket() {
  useEffect(() => {
    if (!AI_ENABLED || typeof WebSocket === 'undefined') return
    let stopped = false
    let wait = 2000
    let timer: ReturnType<typeof setTimeout>
    const open = () => {
      if (stopped || document.hidden || socket) return
      connect(() => { if (!stopped) timer = setTimeout(open, (wait = Math.min(wait * 2, 60000))) })
    }
    const onVisible = () => {
      if (document.hidden) socket?.close()
      else { wait = 2000; open() }
    }
    open()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      stopped = true
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisible)
      socket?.close()
    }
  }, [])
}

const bnDigits = (n: number) => String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)])

/** "3 people in the studio now", shown once someone else is here too. */
export function PresenceChip() {
  usePresenceSocket()
  const count = usePresence((s) => s.count)
  const lang = useStore((s) => s.lang)
  if (count < 2) return null
  return (
    <div className="presence-chip" role="status">
      <span className="presence-dot" aria-hidden />
      {lang === 'bn' ? `এখন স্টুডিওতে ${bnDigits(count)} জন` : `${count} people in the studio now`}
    </div>
  )
}
