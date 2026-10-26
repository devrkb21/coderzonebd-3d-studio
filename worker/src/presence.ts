import { DurableObject } from 'cloudflare:workers'

const MAX_SOCKETS = 60
const MAX_SHOWN = 40
/** Minimum gap between a visitor's own updates, and between broadcasts to everyone. */
const CLIENT_GAP_MS = 300
const BROADCAST_GAP_MS = 450
const LIMIT = 60

interface Visitor { id: string; at: number; p: [number, number, number, number] | null }

const clamp = (n: unknown) => (typeof n === 'number' && Number.isFinite(n) ? Math.max(-LIMIT, Math.min(LIMIT, Math.round(n * 100) / 100)) : null)

/**
 * Live visitors in the studio. Each browser sends only its camera position and heading
 * (no names, no IPs); everyone gets everyone's positions and the head count back.
 * Uses the hibernation API, so an empty studio costs nothing.
 */
export class Presence extends DurableObject {
  private lastBroadcast = 0

  async fetch(request: Request) {
    if (request.headers.get('Upgrade') !== 'websocket') return new Response('Expected a WebSocket', { status: 426 })
    if (this.ctx.getWebSockets().length >= MAX_SOCKETS) return new Response('Studio is full', { status: 503 })
    const pair = new WebSocketPair()
    const [client, server] = [pair[0], pair[1]]
    this.ctx.acceptWebSocket(server)
    const me: Visitor = { id: crypto.randomUUID().slice(0, 8), at: 0, p: null }
    server.serializeAttachment(me)
    server.send(JSON.stringify({ you: me.id }))
    this.broadcast(true)
    return new Response(null, { status: 101, webSocket: client })
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    if (typeof message !== 'string' || message.length > 160) return
    const me = ws.deserializeAttachment() as Visitor
    const now = Date.now()
    if (now - me.at < CLIENT_GAP_MS) return
    let data: unknown
    try { data = JSON.parse(message) } catch { return }
    const p = (data as { p?: unknown })?.p
    if (!Array.isArray(p) || p.length !== 4) return
    const v = p.map(clamp)
    if (v.some((n) => n === null)) return
    me.at = now
    me.p = v as Visitor['p']
    ws.serializeAttachment(me)
    this.broadcast()
  }

  async webSocketClose(ws: WebSocket) {
    try { ws.close() } catch { /* already closed */ }
    this.broadcast(true)
  }

  async webSocketError(ws: WebSocket) {
    await this.webSocketClose(ws)
  }

  /** Sends `{ n, v: [[id, x, y, z, heading], ...] }` to everyone, at most ~2× a second. */
  private broadcast(force = false) {
    const now = Date.now()
    if (!force && now - this.lastBroadcast < BROADCAST_GAP_MS) return
    this.lastBroadcast = now
    const sockets = this.ctx.getWebSockets().filter((s) => s.readyState === WebSocket.OPEN)
    const v: (string | number)[][] = []
    for (const s of sockets) {
      const vis = s.deserializeAttachment() as Visitor | null
      if (vis?.p && v.length < MAX_SHOWN) v.push([vis.id, ...vis.p])
    }
    const msg = JSON.stringify({ n: sockets.length, v })
    for (const s of sockets) {
      try { s.send(msg) } catch { /* closing */ }
    }
  }
}
