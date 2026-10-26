// Bangladesh time (UTC+6, no daylight saving) drives the sky, the street and the wall clock.
import { useEffect, useState } from 'react'

export type Phase = 'dawn' | 'day' | 'dusk' | 'night'

/** Hours since midnight in Dhaka, as a fraction (e.g. 13.5 = 1:30 PM). */
export function dhakaHours(now = Date.now()) {
  const secs = ((now / 1000 + 6 * 3600) % 86400 + 86400) % 86400
  return secs / 3600
}

export function phaseAt(h: number): Phase {
  if (h >= 5 && h < 6.5) return 'dawn'
  if (h >= 6.5 && h < 17.25) return 'day'
  if (h >= 17.25 && h < 19) return 'dusk'
  return 'night'
}

/** `?time=day|night|dusk|dawn` previews a phase; otherwise it follows the clock, checked each minute. */
export function usePhase(): Phase {
  const q = typeof location !== 'undefined' ? new URLSearchParams(location.search) : null
  // `?hour=` (the office schedule preview) also sets the sky
  const hour = q?.has('hour') ? Number(q.get('hour')) : NaN
  const forced = q?.get('time') ?? (hour >= 0 && hour < 24 ? phaseAt(hour) : null)
  const valid = (p: string | null): p is Phase => p === 'dawn' || p === 'day' || p === 'dusk' || p === 'night'
  const [phase, setPhase] = useState<Phase>(valid(forced) ? forced : phaseAt(dhakaHours()))
  useEffect(() => {
    if (valid(forced)) return
    const t = setInterval(() => setPhase(phaseAt(dhakaHours())), 60_000)
    return () => clearInterval(t)
  }, [forced])
  return phase
}
