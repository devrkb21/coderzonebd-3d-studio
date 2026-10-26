// "Book a 15-min call" with a founder. The visitor picks a slot in office hours (Bangladesh
// time) and sends the request on WhatsApp; the team confirms it. Nothing is stored anywhere.
//
// `bookingSlots` is the one place slots come from. To use a real calendar later (Cal.com,
// Google Calendar appointment schedules), make it fetch that calendar's free slots and return
// them in the same shape; the dialog doesn't need to change.
import { LEADERSHIP, type Lang } from './content'
import { CLOSE_H, OPEN_H } from './schedule'
import type { Founder } from './store'

export const SLOT_MIN = 15
const DHAKA = 6 * 3_600_000
const DAY = 86_400_000
const FRIDAY = 5
/** Lunch at the studio: no calls (matches the office's day in src/schedule.ts). */
const LUNCH = [13.5, 14.25]
/** Earliest slot: at least this far ahead, so the team can see the request first. */
const LEAD = 90 * 60_000
export const BOOKING_DAYS = 7

export interface SlotDay {
  /** YYYY-MM-DD in Dhaka. */
  date: string
  /** 0 = Sunday, in Dhaka. */
  weekday: number
  /** Start of each free 15-minute slot, as a UTC timestamp. */
  slots: number[]
}

/** Free slots for the next BOOKING_DAYS working days (Saturday–Thursday; Friday off). */
export async function bookingSlots(_founder: Founder, now = Date.now()): Promise<SlotDay[]> {
  const days: SlotDay[] = []
  // midnight in Dhaka, as a UTC timestamp
  let midnight = Math.floor((now + DHAKA) / DAY) * DAY - DHAKA
  for (let guard = 0; days.length < BOOKING_DAYS && guard < 14; guard++, midnight += DAY) {
    const d = new Date(midnight + DHAKA)
    const weekday = d.getUTCDay()
    if (weekday === FRIDAY) continue
    const slots: number[] = []
    for (let h = OPEN_H; h < CLOSE_H; h += SLOT_MIN / 60) {
      if (h >= LUNCH[0] && h < LUNCH[1]) continue
      const t = midnight + h * 3_600_000
      if (t >= now + LEAD) slots.push(t)
    }
    if (slots.length) days.push({ date: d.toISOString().slice(0, 10), weekday, slots })
  }
  return days
}

// ── formatting ─────────────────────────────────

const BN_DIGITS = '০১২৩৪৫৬৭৮৯'
const bnNum = (s: string) => s.replace(/\d/g, (d) => BN_DIGITS[Number(d)])
const WEEKDAYS: Record<Lang, string[]> = {
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  bn: ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'],
}
const MONTHS: Record<Lang, string[]> = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  bn: ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'],
}

/** "Sat" / "শনি" and "31 Oct" for a day chip; long: "Saturday, 31 Oct 2026". */
export function dayLabel(day: SlotDay, lang: Lang, long = false) {
  const [y, m, d] = day.date.split('-').map(Number)
  const wd = WEEKDAYS[lang][day.weekday]
  const date = `${d} ${MONTHS[lang][m - 1]}${long ? ` ${y}` : ''}`
  if (lang === 'bn') return { weekday: long ? wd : wd.replace('বার', ''), date: bnNum(date) }
  return { weekday: long ? wd : wd.slice(0, 3), date }
}

/** A slot's time on the Dhaka clock: "4:15 PM" / "বিকাল ৪:১৫". */
export function dhakaTime(t: number, lang: Lang) {
  const d = new Date(t + DHAKA)
  const h = d.getUTCHours()
  const m = String(d.getUTCMinutes()).padStart(2, '0')
  const h12 = ((h + 11) % 12) + 1
  if (lang === 'en') return `${h12}:${m} ${h < 12 ? 'AM' : 'PM'}`
  const part = h < 12 ? 'সকাল' : h < 15 ? 'দুপুর' : h < 18 ? 'বিকাল' : 'সন্ধ্যা'
  return `${part} ${bnNum(`${h12}:${m}`)}`
}

/** The visitor's own clock for a slot, or null when they are on Dhaka time already. */
export function localTime(t: number, lang: Lang) {
  if (new Date(t).getTimezoneOffset() === -360) return null
  try {
    return new Intl.DateTimeFormat(lang === 'bn' ? 'bn-BD' : undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }).format(t)
  } catch { return null }
}

export const founderOf = (who: Founder) => LEADERSHIP.founders.find((f) => f.who === who)!

export interface BookingRequest { who: Founder; day: SlotDay; slot: number; name: string; phone: string; topic: string }

/** The WhatsApp message the team receives, in the visitor's language. */
export function bookingMessage(r: BookingRequest, lang: Lang) {
  const f = founderOf(r.who)
  const { weekday, date } = dayLabel(r.day, lang, true)
  const local = localTime(r.slot, lang)
  if (lang === 'bn') {
    return [
      `আসসালামু আলাইকুম, কোডার জোন বিডি। আমি ${f.name} (${f.role})-এর সাথে ১৫ মিনিটের একটি কল বুক করতে চাই।`,
      `তারিখ: ${weekday}, ${date}`,
      `সময়: ${dhakaTime(r.slot, lang)} (ঢাকা সময়, GMT+6)${local ? ` · আমার সময়: ${local}` : ''}`,
      `নাম: ${r.name}`,
      `ফোন: ${r.phone}`,
      `বিষয়: ${r.topic}`,
      'সময়টা নিশ্চিত করবেন। ধন্যবাদ!',
    ].join('\n')
  }
  return [
    `Hi Coder Zone BD! I'd like to book a 15-minute call with ${f.name} (${f.role}).`,
    `Date: ${weekday}, ${date}`,
    `Time: ${dhakaTime(r.slot, lang)} Dhaka time (GMT+6)${local ? ` · my time: ${local}` : ''}`,
    `Name: ${r.name}`,
    `Phone: ${r.phone}`,
    `Topic: ${r.topic}`,
    'Please confirm the time. Thank you!',
  ].join('\n')
}
