// The office's daily rhythm, in Bangladesh time: open Saturday–Thursday 10:00–19:00, lunch at
// the coffee corner around 13:30, Friday off, a night guard by the door from 22:00 to 07:00.
// `?hour=0-23` (and `?day=fri`) preview any moment.
import { useEffect, useState } from 'react'
import { dhakaHours } from './three/time'

export type Period = 'work' | 'lunch' | 'closed'

export const OPEN_H = 10
export const CLOSE_H = 19
const LUNCH = [13.5, 14.25]
const GUARD = [22, 7]
const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
const FRIDAY = 5

export interface Moment {
  /** Day of the week in Dhaka, 0 = Sunday. */
  day: number
  /** Hours since midnight, fractional. */
  hour: number
}

export interface Schedule extends Moment {
  period: Period
  open: boolean
  guard: boolean
}

function query() {
  if (typeof location === 'undefined') return { hour: null, day: null }
  const q = new URLSearchParams(location.search)
  const h = Number(q.get('hour'))
  const d = DAYS.indexOf((q.get('day') ?? '').slice(0, 3).toLowerCase())
  return { hour: q.has('hour') && h >= 0 && h < 24 ? h : null, day: d >= 0 ? d : null }
}

/** The current moment in Dhaka, or the one forced from the URL. */
export function dhakaMoment(now = Date.now()): Moment {
  const q = query()
  const day = new Date(now + 6 * 3600_000).getUTCDay()
  return { day: q.day ?? day, hour: q.hour ?? dhakaHours(now) }
}

/** The hour forced with `?hour=`, if any (also drives the sky). */
export const forcedHour = () => query().hour

export function scheduleAt({ day, hour }: Moment): Schedule {
  const workday = day !== FRIDAY
  const open = workday && hour >= OPEN_H && hour < CLOSE_H
  const period: Period = !open ? 'closed' : hour >= LUNCH[0] && hour < LUNCH[1] ? 'lunch' : 'work'
  const guard = hour >= GUARD[0] || hour < GUARD[1]
  return { day, hour, period, open, guard }
}

export const scheduleNow = () => scheduleAt(dhakaMoment())

/** The schedule, re-checked every 30 seconds. */
export function useSchedule(): Schedule {
  const [s, setS] = useState(scheduleNow)
  useEffect(() => {
    const t = setInterval(() => {
      const n = scheduleNow()
      setS((p) => (p.period === n.period && p.guard === n.guard && p.day === n.day ? p : n))
    }, 30_000)
    return () => clearInterval(t)
  }, [])
  return s
}

/** When the doors open next, for the closed sign: "10 AM" today/tomorrow, or Saturday after a Friday. */
export function reopens({ day, hour }: Moment): 'today' | 'tomorrow' | 'saturday' {
  if (day !== FRIDAY && hour < OPEN_H) return 'today'
  const next = (day + 1) % 7
  return next === FRIDAY ? 'saturday' : 'tomorrow'
}
