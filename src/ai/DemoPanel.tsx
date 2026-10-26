// The form and actions for "Build my site live"; the mock-up itself plays on the 3D screen.
import { useEffect, useState } from 'react'
import { tr, type L } from '../content'
import { useStore } from '../store'
import { CloseIcon } from '../components/icons'
import { waHref } from './client'
import { safeDoc, tidyHtml, useDemo } from './demo'

const T = {
  title: { en: 'Build my site live', bn: 'লাইভ সাইট বানিয়ে দেখুন' },
  lead: {
    en: 'Tell us about your business. Our AI designs an online-shop home page for it on the big screen, in about a minute.',
    bn: 'আপনার ব্যবসার কথা বলুন। আমাদের AI বড় স্ক্রিনে এক মিনিটের মধ্যে আপনার অনলাইন শপের হোম পেজ ডিজাইন করবে।',
  },
  name: { en: 'Business name', bn: 'ব্যবসার নাম' },
  type: { en: 'What do you sell?', bn: 'কী বিক্রি করেন?' },
  typeHint: { en: 'e.g. clothing, cakes, gadgets', bn: 'যেমন: পোশাক, কেক, গ্যাজেট' },
  about: { en: 'Anything else? (optional)', bn: 'আর কিছু? (ঐচ্ছিক)' },
  aboutHint: { en: 'Style, customers, colours you like…', bn: 'স্টাইল, কাস্টমার, পছন্দের রং…' },
  build: { en: 'Build it', bn: 'বানাও' },
  building: { en: 'Writing your site', bn: 'আপনার সাইট লেখা হচ্ছে' },
  lines: { en: 'lines', bn: 'লাইন' },
  stop: { en: 'Stop', bn: 'থামান' },
  done: { en: 'Your demo is ready. Like it?', bn: 'আপনার ডেমো তৈরি। পছন্দ হয়েছে?' },
  real: { en: 'Make this real', bn: 'এটা বাস্তবে বানাই' },
  wa: { en: 'Talk on WhatsApp', bn: 'WhatsApp-এ কথা বলুন' },
  full: { en: 'Open full size', bn: 'পুরো সাইজে দেখুন' },
  again: { en: 'Build another', bn: 'আরেকটা বানাই' },
  close: { en: 'Close', bn: 'বন্ধ করুন' },
  notConfigured: {
    en: "The live builder isn't switched on yet. Tell us about your shop on WhatsApp and we'll send you a mock-up.",
    bn: 'লাইভ বিল্ডার এখনো চালু হয়নি। WhatsApp-এ আপনার দোকানের কথা বলুন, আমরা একটা মক-আপ পাঠাব।',
  },
  failed: { en: 'Something went wrong while building. Please try again.', bn: 'বানানোর সময় সমস্যা হয়েছে। আবার চেষ্টা করুন।' },
  note: { en: 'A quick AI mock-up, not the final design.', bn: 'এটা AI-এর দ্রুত মক-আপ, ফাইনাল ডিজাইন নয়।' },
} satisfies Record<string, L>

const waText = (name: string, type: string, lang: 'en' | 'bn') => lang === 'bn'
  ? `হাই কোডার জোন বিডি! আপনাদের 3D সাইটে "${name}" (${type})-এর জন্য একটা ডেমো সাইট বানালাম। এটা বাস্তবে বানাতে চাই।`
  : `Hi Coder Zone BD! I built a demo site for "${name}" (${type}) on your 3D studio and would like to make it real.`

export function DemoPanel() {
  const lang = useStore((s) => s.lang)
  const { open, status, html, error, business, setOpen, build, reset } = useDemo()
  const [form, setForm] = useState(business)
  const [full, setFull] = useState(false)

  // Esc closes the full-size view, then the builder (after the chat and quote list had their turn).
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      const s = useStore.getState()
      if (e.key !== 'Escape' || s.chat || s.quoteOpen || s.helpOpen) return
      e.preventDefault()
      e.stopPropagation()
      if (full) setFull(false)
      else setOpen(false)
    }
    window.addEventListener('keydown', onKey, { capture: true })
    return () => window.removeEventListener('keydown', onKey, { capture: true })
  }, [open, full, setOpen])

  if (!open) return null
  const lines = html.split('\n').length
  const wa = waHref(waText(business.name || form.name, business.type || form.type, lang))

  return (
    <>
      <section className="demo-card" aria-label={tr(T.title, lang)}>
        <div className="grabber" aria-hidden />
        <header className="demo-head">
          <h2>{tr(T.title, lang)} <span className="demo-ai">AI</span></h2>
          <button className="icon-btn sm" onClick={() => setOpen(false)} aria-label={tr(T.close, lang)}><CloseIcon /></button>
        </header>

        {(status === 'idle' || status === 'error') && (
          <form
            className="quote-form demo-form"
            onSubmit={(e) => { e.preventDefault(); if (form.name.trim() && form.type.trim()) build({ name: form.name.trim(), type: form.type.trim(), description: form.description.trim() }) }}
          >
            <p className="lead">{tr(T.lead, lang)}</p>
            <label>{tr(T.name, lang)}
              <input value={form.name} maxLength={60} required onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label>{tr(T.type, lang)}
              <input value={form.type} maxLength={60} required placeholder={tr(T.typeHint, lang)} onChange={(e) => setForm({ ...form, type: e.target.value })} />
            </label>
            <label>{tr(T.about, lang)}
              <textarea value={form.description} maxLength={400} rows={2} placeholder={tr(T.aboutHint, lang)} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </label>
            {error && (
              <p className="form-error" role="alert">
                {error.kind === 'rate_limited' ? error.message[lang] : tr(error.kind === 'not_configured' ? T.notConfigured : T.failed, lang)}
              </p>
            )}
            <div className="actions">
              <button className="btn primary" type="submit">{tr(T.build, lang)}</button>
              {error && error.kind !== 'failed' && <a className="btn wa" href={wa} target="_blank" rel="noopener noreferrer">{tr(T.wa, lang)}</a>}
            </div>
          </form>
        )}

        {status === 'building' && (
          <div className="demo-progress" role="status">
            <span className="demo-spinner" aria-hidden />
            <span>{tr(T.building, lang)}… <small>{lines} {tr(T.lines, lang)}</small></span>
            <button className="btn" onClick={reset}>{tr(T.stop, lang)}</button>
          </div>
        )}

        {status === 'done' && (
          <div className="demo-done">
            <p className="lead">{tr(T.done, lang)}</p>
            <div className="actions">
              <button
                className="btn primary"
                onClick={() => {
                  const s = useStore.getState()
                  if (!s.quote.includes('ecommerce')) s.toggleQuote('ecommerce')
                  s.setQuoteOpen(true)
                }}
              >{tr(T.real, lang)}</button>
              <a className="btn wa" href={wa} target="_blank" rel="noopener noreferrer">{tr(T.wa, lang)}</a>
              <button className="btn" onClick={() => setFull(true)}>{tr(T.full, lang)}</button>
              <button className="btn" onClick={() => { setForm(business); reset() }}>{tr(T.again, lang)}</button>
            </div>
            <p className="sub">{tr(T.note, lang)}</p>
          </div>
        )}
      </section>

      {full && status === 'done' && (
        <div className="demo-full" role="dialog" aria-label={business.name}>
          <iframe title={business.name} sandbox="" srcDoc={safeDoc(tidyHtml(html))} />
          <button className="icon-btn demo-full-close" onClick={() => setFull(false)} aria-label={tr(T.close, lang)}><CloseIcon /></button>
        </div>
      )}
    </>
  )
}

/** Opens the builder; the 3D screen flies the camera over when it sees `open`. */
export function DemoLauncher() {
  const lang = useStore((s) => s.lang)
  const ready = useStore((s) => s.ready)
  const intro = useStore((s) => s.intro)
  const covered = useStore((s) => !!s.focusId || s.projectOpen || s.quoteOpen || !!s.chat)
  const open = useDemo((d) => d.open)
  if (!ready || intro) return null
  return (
    <button className={`demo-fab ${covered || open ? 'hide' : ''}`} onClick={() => useDemo.getState().setOpen(true)}>
      <span aria-hidden>✦</span> {tr(T.title, lang)}
    </button>
  )
}
