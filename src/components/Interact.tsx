// Keyboard shortcuts, the auto tour, the hover label and the "how to explore" overlay.
import { useEffect, useRef, useState } from 'react'
import { STOPS, tr, UI } from '../content'
import { useStore } from '../store'
import { CloseIcon } from './icons'

const isTyping = (t: EventTarget | null) =>
  t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement || t instanceof HTMLSelectElement

/**
 * Esc steps back one level (help → quote → panel → whole-studio overview). Arrows walk the
 * sections, 1–8 jump to one, T starts/stops the tour, L flips the lights, ? opens help.
 * The panel and the quote drawer handle their own Esc first and mark it handled.
 */
export function Shortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return
      const s = useStore.getState()
      if (s.mode !== '3d' || !s.ready) return
      if (e.key === 'Escape') {
        if (e.defaultPrevented) return
        if (s.helpOpen) return s.setHelpOpen(false)
        if (s.touring) return s.setTouring(false)
        if (!s.focusId && !s.quoteOpen && !s.overview) s.setOverview(true)
        return
      }
      if (s.focusId || s.quoteOpen || s.helpOpen) return
      if (e.key === 'ArrowRight') { s.setTouring(false); s.nextStop(1) }
      else if (e.key === 'ArrowLeft') { s.setTouring(false); s.nextStop(-1) }
      else if (/^[1-9]$/.test(e.key) && STOPS[Number(e.key) - 1]) { s.setTouring(false); s.goTo(STOPS[Number(e.key) - 1].id) }
      else if (e.key === 't' || e.key === 'T') s.setTouring(!s.touring)
      else if (e.key === 'l' || e.key === 'L') s.toggleLights()
      else if (e.key === '?' || e.key === '/' || e.key === 'h' || e.key === 'H') s.setHelpOpen(true)
      else if (e.key === 'o' || e.key === 'O') s.setOverview(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  return null
}

/** Walks every section on its own; any press, drag, scroll or key stops it. */
export function TourRunner() {
  const touring = useStore((s) => s.touring)
  useEffect(() => {
    if (!touring) return
    const s = useStore.getState()
    s.nextStop(1)
    const t = setInterval(() => useStore.getState().nextStop(1), 5500)
    const stop = (e: Event) => {
      if (e instanceof KeyboardEvent && (e.key === 't' || e.key === 'T')) return
      if ((e.target as HTMLElement | null)?.closest?.('.tour-btn')) return
      useStore.getState().setTouring(false)
    }
    const opts = { capture: true }
    window.addEventListener('pointerdown', stop, opts)
    window.addEventListener('wheel', stop, opts)
    window.addEventListener('keydown', stop, opts)
    return () => {
      clearInterval(t)
      window.removeEventListener('pointerdown', stop, opts)
      window.removeEventListener('wheel', stop, opts)
      window.removeEventListener('keydown', stop, opts)
    }
  }, [touring])
  return null
}

/** A small label that follows the pointer while it is over something clickable. */
export function Tooltip() {
  const tip = useStore((s) => s.tip)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || !ref.current) return
      ref.current.style.transform = `translate(${e.clientX + 16}px, ${e.clientY + 18}px)`
    }
    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  }, [])
  return <div ref={ref} className={`tooltip ${tip ? 'on' : ''}`} aria-hidden>{tip}</div>
}

const coarse = () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

export function HelpOverlay() {
  const lang = useStore((s) => s.lang)
  const open = useStore((s) => s.helpOpen)
  const setOpen = useStore((s) => s.setHelpOpen)
  const [touch] = useState(coarse)
  if (!open) return null
  const bn = lang === 'bn'
  const rows: [string, string][] = touch
    ? [
        [bn ? 'এক আঙুলে টানুন' : 'Drag with one finger', bn ? 'চারপাশ ঘুরে দেখুন' : 'Look around'],
        [bn ? 'দুই আঙুলে চিমটি' : 'Pinch', bn ? 'জুম ইন / আউট' : 'Zoom in and out'],
        [bn ? 'ট্যাপ' : 'Tap', bn ? 'যেকোনো জিনিস বা সেকশন খুলুন' : 'Open anything, or fly to a section'],
      ]
    : [
        [bn ? 'মাউস টানুন' : 'Drag', bn ? 'চারপাশ ঘুরে দেখুন (৩৬০°)' : 'Look around, all 360°'],
        [bn ? 'স্ক্রল' : 'Scroll', bn ? 'জুম ইন / আউট' : 'Zoom in and out'],
        [bn ? 'ক্লিক' : 'Click', bn ? 'জিনিস খুলুন, বা সেকশনে চলে যান' : 'Open an item, or fly to a section'],
        ['Esc', bn ? 'এক ধাপ পেছনে: প্যানেল বন্ধ, তারপর পুরো স্টুডিও' : 'Step back: close the panel, then see the whole studio'],
        ['← →', bn ? 'আগের / পরের সেকশন' : 'Previous / next section'],
        ['1 – 8', bn ? 'সরাসরি কোনো সেকশনে' : 'Jump to a section'],
        ['T', bn ? 'অটো ট্যুর চালু / বন্ধ' : 'Start or stop the auto tour'],
        ['L', bn ? 'অফিসের লাইট অন / অফ' : 'Office lights on / off'],
      ]
  const extras = bn
    ? ['দেয়ালের ঘড়িতে ক্লিক করুন: ঢাকার সময়', 'দরজার পাশের সুইচ: লাইট অন / অফ', 'কফি মেশিন: চলুন কথা বলি', 'মনিটর: আমাদের কাজ দেখুন', 'জানালার বাইরে দিন-রাত চলে বাংলাদেশের আসল সময়ে', 'বাইরে রিকশা, সিএনজি আর মানুষ চলে; ভেতরে টিম কাজ করছে']
    : ['Click the wall clock for the time in Dhaka', 'The switch by the door turns the lights on and off', 'The coffee machine: let\'s talk', 'The monitors: see our work', 'Day and night outside follow the real time in Bangladesh', 'Rickshaws, CNGs and people pass outside; the team is at work inside']
  return (
    <div className="help" role="dialog" aria-modal="true" aria-label={tr(UI.help, lang)} onClick={() => setOpen(false)}>
      <div className="help-card" onClick={(e) => e.stopPropagation()}>
        <div className="help-head">
          <h2>{tr(UI.help, lang)}</h2>
          <button className="icon-btn sm" onClick={() => setOpen(false)} aria-label={tr(UI.close, lang)}><CloseIcon /></button>
        </div>
        <dl className="keys">
          {rows.map(([k, v]) => <div key={k}><dt><kbd>{k}</kbd></dt><dd>{v}</dd></div>)}
        </dl>
        <h3>{bn ? 'লুকানো মজা' : 'Things to find'}</h3>
        <ul className="checks">{extras.map((x) => <li key={x}>{x}</li>)}</ul>
        <div className="actions">
          <button className="btn primary" onClick={() => { setOpen(false); useStore.getState().setTouring(true) }}>▶ {tr(UI.tour, lang)}</button>
          <button className="btn" onClick={() => setOpen(false)}>{bn ? 'বুঝেছি' : 'Got it'}</button>
        </div>
      </div>
    </div>
  )
}

/** Starts and stops the synthesised ambience; a saved "on" waits for the first tap (autoplay rules). */
export function SoundSwitch() {
  const on = useStore((s) => s.soundOn)
  useEffect(() => {
    let saved: string | null = null
    try { saved = localStorage.getItem('cz3d-sound') } catch { /* storage unavailable */ }
    if (saved !== 'on') return
    const first = () => useStore.getState().setSoundOn(true)
    window.addEventListener('pointerdown', first, { once: true })
    return () => window.removeEventListener('pointerdown', first)
  }, [])
  useEffect(() => {
    let stop: (() => void) | undefined
    import('../audio').then((a) => {
      if (on) a.startSound()
      else a.stopSound()
      stop = a.stopSound
    })
    return () => { if (!on) stop?.() }
  }, [on])
  return null
}

/** Lower-third caption and a Skip button while the street-to-door intro plays. */
export function IntroOverlay() {
  const intro = useStore((s) => s.intro)
  const lang = useStore((s) => s.lang)
  const [line, setLine] = useState(0)
  useEffect(() => {
    if (!intro) return
    const skip = (e: Event) => {
      if (e instanceof KeyboardEvent && !['Escape', 'Enter', ' '].includes(e.key)) return
      useStore.getState().endIntro()
    }
    const t1 = setTimeout(() => setLine(1), 3600)
    window.addEventListener('keydown', skip)
    return () => { clearTimeout(t1); window.removeEventListener('keydown', skip) }
  }, [intro])
  if (!intro) return null
  const bn = lang === 'bn'
  const lines = bn
    ? ['কোডার জোন বিডি-তে স্বাগতম', 'খুলনার একটি সফটওয়্যার স্টুডিও · ভেতরে আসুন']
    : ['Welcome to Coder Zone BD', 'A software studio in Khulna · Come on in']
  return (
    <div className="intro">
      <p key={line} className="intro-line">{lines[line]}</p>
      <button className="intro-skip" onClick={() => useStore.getState().endIntro()}>{bn ? 'স্কিপ' : 'Skip intro'} ›</button>
    </div>
  )
}
