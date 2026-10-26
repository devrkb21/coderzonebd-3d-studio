// Top bar, stop navigation, loader, hint and toast.
import { useEffect, useState } from 'react'
import { COMPANY, STOPS, tr, UI } from '../content'
import { useStore } from '../store'
import { CloseIcon, ListIcon } from './icons'

export function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" aria-hidden>
      <rect width="44" height="44" rx="10" fill="var(--blue)" />
      <g fill="none" stroke="#fff" strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" transform="translate(1.25 0)">
        <path d="M19.3 16.2A7.6 7.6 0 1 0 19.3 27.8" />
        <path d="M24.6 14.8h9.2l-9.2 14.4h9.6" />
      </g>
    </svg>
  )
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
        <Logo />
        <span className="brand-text">
          <strong>{COMPANY.name}</strong>
          <small>{tr(UI.tagline, lang)}</small>
        </span>
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
        <Logo size={64} />
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
