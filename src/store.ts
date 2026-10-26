import { create } from 'zustand'
import { SERVICES, STOPS, type Lang, type StopId } from './content'
import { itemById, itemsAt } from './items'

export type Mode = '3d' | '2d'

interface State {
  lang: Lang
  mode: Mode
  ready: boolean
  stop: StopId
  focusId: string | null
  hoveredId: string | null
  /** Service ids the visitor wants a quote for. */
  quote: string[]
  quoteOpen: boolean
  toast: string | null
  /** Whole-room view from the entrance (Esc from a section). */
  overview: boolean
  touring: boolean
  lightsOn: boolean
  helpOpen: boolean
  /** Label shown next to the pointer while hovering something in the room. */
  tip: string | null
  setLang: (lang: Lang) => void
  setMode: (mode: Mode) => void
  /** A visitor's explicit choice; remembered, and it disables the automatic 2D switch. */
  chooseMode: (mode: Mode) => void
  setReady: () => void
  goTo: (stop: StopId) => void
  focus: (id: string | null) => void
  step: (dir: 1 | -1) => void
  hover: (id: string | null) => void
  toggleQuote: (serviceId: string) => void
  removeQuote: (serviceId: string) => void
  setQuoteOpen: (open: boolean) => void
  showToast: (msg: string | null) => void
  setOverview: (on: boolean) => void
  nextStop: (dir: 1 | -1) => void
  setTouring: (on: boolean) => void
  toggleLights: () => void
  setHelpOpen: (open: boolean) => void
  setTip: (tip: string | null) => void
}

const read = (k: string) => { try { return localStorage.getItem(k) } catch { return null } }
const write = (k: string, v: string) => { try { localStorage.setItem(k, v) } catch { /* storage unavailable */ } }

function initialQuote(): string[] {
  try {
    const ids = JSON.parse(read('cz3d-quote') ?? '[]') as string[]
    return ids.filter((id) => SERVICES.some((s) => s.id === id))
  } catch { return [] }
}

/** 3D unless the device asks for less: Save-Data, little memory, or no fast WebGL. */
function initialMode(): Mode {
  const q = new URLSearchParams(location.search)
  if (q.has('2d')) return '2d'
  if (q.has('3d')) return '3d'
  const saved = read('cz3d-mode')
  if (saved === '2d' || saved === '3d') return saved
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } }
  if (nav.connection?.saveData) return '2d'
  if (nav.deviceMemory && nav.deviceMemory < 3) return '2d'
  try {
    const c = document.createElement('canvas')
    const opts = { failIfMajorPerformanceCaveat: true }
    const gl = (c.getContext('webgl2', opts) ?? c.getContext('webgl', opts)) as WebGLRenderingContext | null
    if (!gl) return '2d'
    gl.getExtension('WEBGL_lose_context')?.loseContext()
  } catch { return '2d' }
  return '3d'
}

export const userChose3d = () => typeof window !== 'undefined' && (new URLSearchParams(location.search).has('3d') || read('cz3d-mode') === '3d')

function initialLang(): Lang {
  const q = new URLSearchParams(location.search).get('lang')
  if (q === 'en' || q === 'bn') return q
  return read('cz3d-lang') === 'bn' ? 'bn' : 'en'
}

export const useStore = create<State>((set, get) => ({
  lang: typeof window === 'undefined' ? 'en' : initialLang(),
  mode: typeof window === 'undefined' ? '2d' : initialMode(),
  ready: false,
  stop: 'home',
  focusId: null,
  hoveredId: null,
  quote: typeof window === 'undefined' ? [] : initialQuote(),
  quoteOpen: false,
  toast: null,
  overview: false,
  touring: false,
  lightsOn: true,
  helpOpen: false,
  tip: null,

  setLang: (lang) => {
    write('cz3d-lang', lang)
    document.documentElement.lang = lang
    set({ lang })
  },
  setMode: (mode) => set({ mode, focusId: null, ready: mode === '2d' ? get().ready : false }),
  chooseMode: (mode) => {
    write('cz3d-mode', mode)
    set({ mode, focusId: null, ready: false })
  },
  setReady: () => set({ ready: true }),
  goTo: (stop) => set({ stop, focusId: null, quoteOpen: false, overview: false }),
  focus: (id) => {
    if (!id) return set({ focusId: null })
    const item = itemById(id)
    if (item) set({ focusId: id, stop: item.stop, quoteOpen: false, overview: false })
  },
  step: (dir) => {
    const item = get().focusId ? itemById(get().focusId!) : null
    if (!item) return
    const list = itemsAt(item.stop)
    const i = list.findIndex((x) => x.id === item.id)
    set({ focusId: list[(i + dir + list.length) % list.length].id })
  },
  hover: (hoveredId) => set({ hoveredId }),
  toggleQuote: (id) => {
    const q = get().quote
    const quote = q.includes(id) ? q.filter((x) => x !== id) : [...q, id]
    write('cz3d-quote', JSON.stringify(quote))
    set({ quote })
  },
  removeQuote: (id) => {
    const quote = get().quote.filter((x) => x !== id)
    write('cz3d-quote', JSON.stringify(quote))
    set({ quote })
  },
  setQuoteOpen: (quoteOpen) => set({ quoteOpen }),
  showToast: (toast) => set({ toast }),
  setOverview: (overview) => set({ overview, focusId: overview ? null : get().focusId }),
  nextStop: (dir) => {
    const s = get()
    const i = STOPS.findIndex((x) => x.id === s.stop)
    const next = s.overview ? (dir > 0 ? 0 : STOPS.length - 1) : (i + dir + STOPS.length) % STOPS.length
    set({ stop: STOPS[next].id, focusId: null, overview: false, quoteOpen: false })
  },
  setTouring: (touring) => set({ touring }),
  toggleLights: () => set({ lightsOn: !get().lightsOn }),
  setHelpOpen: (helpOpen) => set({ helpOpen }),
  setTip: (tip) => set({ tip }),
}))
