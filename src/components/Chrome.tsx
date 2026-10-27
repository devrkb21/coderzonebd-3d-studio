// Top bar, stop navigation, loader, hint and toast.
import { useEffect, useState } from 'react'
import { COMPANY, STOPS, tr, UI } from '../content'
import { useStore } from '../store'
import { CloseIcon, ListIcon } from './icons'
import { PostcardButton } from './Postcard'
import { ArButton } from './ArView'

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
  const setHelpOpen = useStore((s) => s.setHelpOpen)
  const soundOn = useStore((s) => s.soundOn)
  const setSoundOn = useStore((s) => s.setSoundOn)
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
        {mode === '3d' && (
          <button
            className={`icon-btn sound-btn ${soundOn ? 'on' : ''}`}
            onClick={() => setSoundOn(!soundOn)}
            aria-pressed={soundOn}
            aria-label={lang === 'bn' ? (soundOn ? 'শব্দ বন্ধ' : 'শব্দ চালু') : (soundOn ? 'Sound off' : 'Sound on')}
            title={lang === 'bn' ? 'অফিস আর রাস্তার শব্দ' : 'Office and street sound'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M4 9h4l5-4v14l-5-4H4z" />
              {soundOn ? <><path d="M16.5 8.5a5 5 0 0 1 0 7" /><path d="M19 6a8.5 8.5 0 0 1 0 12" /></> : <path d="M17 9l5 6M22 9l-5 6" />}
            </svg>
          </button>
        )}
        {mode === '3d' && <PostcardButton />}
        <ArButton />
        {mode === '3d' && (
          <button className="icon-btn help-btn" onClick={() => setHelpOpen(true)} aria-label={tr(UI.help, lang)} title={tr(UI.help, lang)}>?</button>
        )}
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
  const focused = useStore((s) => !!s.focusId || s.projectOpen)
  const overview = useStore((s) => s.overview)
  const touring = useStore((s) => s.touring)
  const goTo = useStore((s) => s.goTo)
  const setOverview = useStore((s) => s.setOverview)
  const setTouring = useStore((s) => s.setTouring)
  return (
    <nav className={`pills ${focused ? 'behind' : ''}`} aria-label={lang === 'bn' ? 'স্টুডিওর অংশ' : 'Studio sections'}>
      <button className={`pill pill-icon ${overview && !focused ? 'active' : ''}`} onClick={() => setOverview(true)} aria-label={tr(UI.overview, lang)} title={`${tr(UI.overview, lang)} (Esc)`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5" /></svg>
      </button>
      <span className="pill-sep" aria-hidden />
      {STOPS.map((s, i) => (
        <button key={s.id} className={`pill ${stop === s.id && !focused && !overview ? 'active' : ''}`} aria-current={stop === s.id ? 'true' : undefined} onClick={() => goTo(s.id)} title={`${tr(s.label, lang)} (${(i + 1) % 10})`}>
          {tr(s.label, lang)}
        </button>
      ))}
      <span className="pill-sep" aria-hidden />
      <button className={`pill tour-btn ${touring ? 'on' : ''}`} onClick={() => setTouring(!touring)} aria-pressed={touring} title={`${tr(UI.tour, lang)} (T)`}>
        {touring ? <span className="tour-dot" aria-hidden /> : <span aria-hidden>▶</span>}
        {touring ? tr(UI.stopTour, lang) : tr(UI.tour, lang)}
      </button>
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
  const focused = useStore((s) => !!s.focusId || s.projectOpen)
  const [show, setShow] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setShow(false), 7000)
    return () => clearTimeout(t)
  }, [])
  useEffect(() => { if (focused) setShow(false) }, [focused])
  const touch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
  return <div className={`hint ${show ? '' : 'hide'}`} aria-hidden>{tr(touch ? UI.hintTouch : UI.hint, lang)}</div>
}

export function Toast() {
  const toast = useStore((s) => s.toast)
  const lang = useStore((s) => s.lang)
  const showToast = useStore((s) => s.showToast)
  const chooseMode = useStore((s) => s.chooseMode)
  const mode = useStore((s) => s.mode)
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => showToast(null), mode === '3d' ? 4500 : 9000)
    return () => clearTimeout(t)
  }, [toast, showToast, mode])
  if (!toast) return null
  return (
    <div className="toast" role="status">
      <span>{toast}</span>
      {mode === '2d' && <button className="link" onClick={() => { chooseMode('3d'); showToast(null) }}>{tr(UI.view3d, lang)}</button>}
      <button className="icon-btn sm ghost" onClick={() => showToast(null)} aria-label={tr(UI.close, lang)}><CloseIcon /></button>
    </div>
  )
}
