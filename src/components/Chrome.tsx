// Top bar, stop navigation, loader, hint and toast.
import { useEffect, useState } from 'react'
import { COMPANY, STOPS, tr, UI } from '../content'
import { useStore } from '../store'
import { CloseIcon, ListIcon } from './icons'

const BASE = import.meta.env.BASE_URL

/** The real Coder Zone BD logo: the full wordmark, or just the CZ mark. */
export function Logo({ size = 36, mark = false }: { size?: number; mark?: boolean }) {
  return mark
    ? <img className="logo-mark" src={`${BASE}logos/coderzone-mark.png`} width={size} height={size} alt="" />
    : <img className="logo-word" src={`${BASE}logos/coderzone-wordmark.png`} height={size} style={{ width: 'auto' }} alt="" />
}

export function TopBar() {
  const lang = useStore((s) => s.lang)
  const mode = useStore((s) => s.mode)
  const count = useStore((s) => s.quote.length)
  const setLang = useStore((s) => s.setLang)
  const chooseMode = useStore((s) => s.chooseMode)
  const goTo = useStore((s) => s.goTo)
  const setQuoteOpen = useStore((s) => s.setQuoteOpen)
  return (
    <header className="topbar">
      <a
        className="brand"
        href="#home"
        onClick={(e) => { if (mode === '3d') { e.preventDefault(); goTo('home') } }}
        aria-label={COMPANY.name}
      >
        <Logo size={34} />
        <Logo size={34} mark />
      </a>
      <div className="top-actions">
        <div className="seg" role="group" aria-label="Language">
          <button className={lang === 'bn' ? 'on' : ''} onClick={() => setLang('bn')} aria-pressed={lang === 'bn'} lang="bn">বাংলা</button>
          <button className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')} aria-pressed={lang === 'en'} lang="en">EN</button>
        </div>
        <button className="pill-btn" onClick={() => chooseMode(mode === '3d' ? '2d' : '3d')}>
          {mode === '3d' ? tr(UI.skip3d, lang) : tr(UI.view3d, lang)}
        </button>
        <button className="icon-btn quote-btn" onClick={() => setQuoteOpen(true)} aria-label={`${tr(UI.quote, lang)} (${count})`}>
          <ListIcon />
          {count > 0 && <span className="badge">{count}</span>}
        </button>
      </div>
    </header>
  )
}

export function NavPills() {
  const lang = useStore((s) => s.lang)
  const stop = useStore((s) => s.stop)
  const focused = useStore((s) => !!s.focusId)
  const goTo = useStore((s) => s.goTo)
  return (
    <nav className={`pills ${focused ? 'behind' : ''}`} aria-label={lang === 'bn' ? 'স্টুডিওর অংশ' : 'Studio sections'}>
      {STOPS.map((s) => (
        <button key={s.id} className={`pill ${stop === s.id && !focused ? 'active' : ''}`} aria-current={stop === s.id ? 'true' : undefined} onClick={() => goTo(s.id)}>
          {tr(s.label, lang)}
        </button>
      ))}
    </nav>
  )
}

export function Loader({ progress, done }: { progress: number; done: boolean }) {
  const lang = useStore((s) => s.lang)
  const [gone, setGone] = useState(false)
  useEffect(() => {
    if (!done) return setGone(false)
    const t = setTimeout(() => setGone(true), 900)
    return () => clearTimeout(t)
  }, [done])
  if (gone) return null
  return (
    <div className={`loader ${done ? 'done' : ''}`} role="status" aria-live="polite">
      <div className="loader-inner">
        <Logo size={72} mark />
        <strong>{COMPANY.name}</strong>
        <p>{tr(UI.loading, lang)}</p>
        <div className="bar" aria-hidden><span style={{ transform: `scaleX(${progress})` }} /></div>
        <small>{Math.round(progress * 100)}%</small>
      </div>
    </div>
  )
}

export function Hint() {
  const lang = useStore((s) => s.lang)
  const focused = useStore((s) => !!s.focusId)
  const [show, setShow] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setShow(false), 7000)
    return () => clearTimeout(t)
  }, [])
  useEffect(() => { if (focused) setShow(false) }, [focused])
  return <div className={`hint ${show ? '' : 'hide'}`} aria-hidden>{tr(UI.hint, lang)}</div>
}

export function Toast() {
  const toast = useStore((s) => s.toast)
  const lang = useStore((s) => s.lang)
  const showToast = useStore((s) => s.showToast)
  const chooseMode = useStore((s) => s.chooseMode)
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => showToast(null), 9000)
    return () => clearTimeout(t)
  }, [toast, showToast])
  if (!toast) return null
  return (
    <div className="toast" role="status">
      <span>{toast}</span>
      <button className="link" onClick={() => { chooseMode('3d'); showToast(null) }}>{tr(UI.view3d, lang)}</button>
      <button className="icon-btn sm ghost" onClick={() => showToast(null)} aria-label={tr(UI.close, lang)}><CloseIcon /></button>
    </div>
  )
}
