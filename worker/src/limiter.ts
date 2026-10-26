import { DurableObject } from 'cloudflare:workers'

interface Bucket { window: number; count: number }

/**
 * Fixed-window counters. One instance per visitor (named by a hash of their IP) for the
 * hourly limits, and one named "global" for the daily caps that protect the API credit.
 */
export class Limiter extends DurableObject {
  /** Counts one hit against `kind`; refuses once `limit` hits were made in the current window. */
  async hit(kind: string, limit: number, windowMs: number): Promise<{ ok: boolean; retryAfter: number }> {
    const now = Date.now()
    const window = Math.floor(now / windowMs)
    const b = (await this.ctx.storage.get<Bucket>(kind)) ?? { window, count: 0 }
    if (b.window !== window) { b.window = window; b.count = 0 }
    const retryAfter = Math.ceil(((window + 1) * windowMs - now) / 1000)
    if (b.count >= limit) return { ok: false, retryAfter }
    b.count++
    await this.ctx.storage.put(kind, b)
    // Forget idle visitors: clear storage once the window has passed.
    await this.ctx.storage.setAlarm((window + 2) * windowMs)
    return { ok: true, retryAfter }
  }

  async alarm() {
    await this.ctx.storage.deleteAll()
  }
}
