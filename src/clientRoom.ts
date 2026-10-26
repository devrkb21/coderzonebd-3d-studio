// Client project rooms: `?client=<token>` shows that client's live project progress on a board
// in the studio. The token is read once, kept for this tab only, and stripped from the address
// bar at once, so it never ends up in shared links, screenshots of the URL or analytics.
import { create } from 'zustand'
import type { L, Lang } from './content'
import { API } from './ai/client'

export const PHASES = ['discover', 'build', 'launch', 'support'] as const
export type Phase = (typeof PHASES)[number]

export interface ClientProject {
  name: string
  project: L
  startDate: string
  dueDate: string
  percent: number
  phase: Phase
  milestones: { title: L; done: boolean; date?: string }[]
  updates: { date: string; text: L }[]
  manager: string
  demo?: boolean
  commits?: { message: string; date: string }[]
}

const TOKEN = /^[A-Za-z0-9_-]{22}$/
const KEY = 'cz3d-client'

function readToken(): string | null {
  if (typeof window === 'undefined') return null
  const raw = new URLSearchParams(location.search).get('client')
  if (raw !== null) {
    // drop only `client=…`, leaving the other parameters exactly as they were
    const rest = location.search.slice(1).split('&').filter((kv) => kv && !/^client(=|$)/.test(kv)).join('&')
    history.replaceState(history.state, '', `${location.pathname}${rest ? `?${rest}` : ''}${location.hash}`)
  }
  if (raw !== null) {
    const t = raw.trim()
    try { if (TOKEN.test(t)) sessionStorage.setItem(KEY, t); else sessionStorage.removeItem(KEY) } catch { /* storage unavailable */ }
    // a malformed token still gets the polite "link not valid" note
    return t || 'invalid'
  }
  // a reload in the same tab keeps the room
  try { return sessionStorage.getItem(KEY) } catch { return null }
}

/** The token from this visit's link (or this tab's earlier one), or null on a normal visit. */
export const CLIENT_TOKEN = readToken()

export type ClientStatus = 'none' | 'loading' | 'ok' | 'invalid' | 'error'

interface ClientState {
  status: ClientStatus
  project: ClientProject | null
  /** The "link not valid" note was dismissed. */
  noteDone: boolean
  load: () => void
  dismissNote: () => void
}

export const useClient = create<ClientState>((set, get) => ({
  status: CLIENT_TOKEN ? 'loading' : 'none',
  project: null,
  noteDone: false,
  load: () => {
    const token = CLIENT_TOKEN
    if (!token || get().project) return
    if (!API || !TOKEN.test(token)) { set({ status: 'invalid' }); return }
    set({ status: 'loading' })
    fetch(`${API}/project/${token}`, { headers: { Accept: 'application/json' }, referrerPolicy: 'no-referrer', cache: 'no-store' })
      .then(async (res) => {
        if (res.status === 404) {
          try { sessionStorage.removeItem(KEY) } catch { /* storage unavailable */ }
          return set({ status: 'invalid' })
        }
        if (!res.ok) return set({ status: 'error' })
        const project = (await res.json()) as ClientProject
        set({ status: project?.name ? 'ok' : 'invalid', project: project?.name ? project : null })
      })
      .catch(() => set({ status: 'error' }))
  },
  dismissNote: () => set({ noteDone: true }),
}))

// ── dates and numbers ──────────────────────────

const BN_DIGITS = '০১২৩৪৫৬৭৮৯'
export const num = (n: number | string, lang: Lang) => (lang === 'bn' ? String(n).replace(/\d/g, (d) => BN_DIGITS[Number(d)]) : String(n))

const DAY = 86_400_000
const dayIndex = (iso: string) => Math.floor(Date.parse(`${iso}T00:00:00Z`) / DAY)
/** Today's date in Dhaka (GMT+6) as a day number. */
const todayIndex = (now = Date.now()) => Math.floor((now + 6 * 3_600_000) / DAY)

/** "Day 12 of 30": day 1 is the start date; before the start it says when it starts. */
export function projectDay(p: ClientProject, now = Date.now()) {
  if (!p.startDate || !p.dueDate) return null
  const total = Math.max(1, dayIndex(p.dueDate) - dayIndex(p.startDate))
  const day = todayIndex(now) - dayIndex(p.startDate) + 1
  return { day: Math.min(Math.max(day, 0), total), total, started: day >= 1 }
}

export function dayLine(p: ClientProject, lang: Lang) {
  const d = projectDay(p)
  if (!d) return ''
  if (!d.started) return lang === 'bn' ? `শুরু ${fmtDate(p.startDate, lang)}` : `Starts ${fmtDate(p.startDate, lang)}`
  return lang === 'bn' ? `দিন ${num(d.day, lang)} / ${num(d.total, lang)}` : `Day ${d.day} of ${d.total}`
}

const MONTHS: Record<Lang, string[]> = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  bn: ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'],
}

/** "27 Oct 2026" / "২৭ অক্টো ২০২৬" from YYYY-MM-DD (or an ISO time, read in Dhaka time). */
export function fmtDate(iso: string, lang: Lang, year = true) {
  let y: number, m: number, d: number
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) [y, m, d] = iso.split('-').map(Number)
  else {
    const t = Date.parse(iso)
    if (Number.isNaN(t)) return ''
    const dh = new Date(t + 6 * 3_600_000)
    ;[y, m, d] = [dh.getUTCFullYear(), dh.getUTCMonth() + 1, dh.getUTCDate()]
  }
  return `${num(d, lang)} ${MONTHS[lang][m - 1]}${year ? ` ${num(y, lang)}` : ''}`
}

export const PHASE_INDEX = (p: Phase) => PHASES.indexOf(p)

export const CLIENT_TEXT = {
  yourProject: { en: 'Your project', bn: 'আপনার প্রজেক্ট' },
  demo: { en: 'Demo', bn: 'ডেমো' },
  demoNote: { en: 'A sample project to show how client rooms work. Not a real client.', bn: 'ক্লায়েন্ট রুম কেমন দেখায় তা দেখানোর জন্য একটি নমুনা প্রজেক্ট। আসল ক্লায়েন্ট নয়।' },
  progress: { en: 'complete', bn: 'সম্পন্ন' },
  timeline: { en: 'Timeline', bn: 'সময়সূচি' },
  due: { en: 'Due', bn: 'ডেলিভারি' },
  manager: { en: 'Project manager', bn: 'প্রজেক্ট ম্যানেজার' },
  phase: { en: 'Where we are', bn: 'আমরা এখন কোথায়' },
  milestones: { en: 'Milestones', bn: 'মাইলস্টোন' },
  updates: { en: 'Latest updates', bn: 'সর্বশেষ আপডেট' },
  commits: { en: 'Recent code changes', bn: 'সাম্প্রতিক কোড পরিবর্তন' },
  none: { en: 'Nothing yet.', bn: 'এখনো কিছু নেই।' },
  ask: { en: 'Ask about my project', bn: 'প্রজেক্ট নিয়ে জিজ্ঞেস করুন' },
  view: { en: 'View your project', bn: 'আপনার প্রজেক্ট দেখুন' },
  welcome: { en: 'Welcome back', bn: 'আবার স্বাগতম' },
  ready: { en: 'Your project room is ready · Come on in', bn: 'আপনার প্রজেক্ট রুম তৈরি · ভেতরে আসুন' },
  invalidTitle: { en: 'This project link isn’t active', bn: 'এই প্রজেক্ট লিংকটি সক্রিয় নেই' },
  invalid: {
    en: 'The link may have expired or been replaced. Please ask the team for a new one. Meanwhile, feel free to look around the studio.',
    bn: 'লিংকটির মেয়াদ শেষ হয়ে থাকতে পারে বা নতুন লিংক দেওয়া হয়েছে। টিমের কাছে নতুন লিংক চেয়ে নিন। ততক্ষণ স্টুডিও ঘুরে দেখুন।',
  },
  errorTitle: { en: 'Couldn’t load your project', bn: 'আপনার প্রজেক্ট লোড করা যায়নি' },
  error: { en: 'Please check your connection and reload the page, or message the team.', bn: 'ইন্টারনেট সংযোগ দেখে পেজটি আবার লোড করুন, অথবা টিমকে মেসেজ দিন।' },
  lookAround: { en: 'Look around', bn: 'স্টুডিও ঘুরে দেখুন' },
  askLink: { en: 'Hi Coder Zone BD, my project link isn’t working. Could you send me a new one?', bn: 'আসসালামু আলাইকুম, কোডার জোন বিডি। আমার প্রজেক্ট লিংকটি কাজ করছে না, নতুন লিংক পাঠাবেন?' },
} satisfies Record<string, L>
