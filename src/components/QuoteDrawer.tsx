import { useEffect, useState, type FormEvent } from 'react'
import { COMPANY, CONTACT, priceText, SERVICES, tr, UI, waLink } from '../content'
import { useStore } from '../store'
import { inertUnless } from './inert'
import { CloseIcon, TrashIcon } from './icons'
import { WaIcon } from './details'

/** The quote list from "Add to quote", plus a short form that opens WhatsApp (or email) prefilled. */
export function QuoteDrawer() {
  const lang = useStore((s) => s.lang)
  const open = useStore((s) => s.quoteOpen)
  const quote = useStore((s) => s.quote)
  const mode = useStore((s) => s.mode)
  const setOpen = useStore((s) => s.setQuoteOpen)
  const removeQuote = useStore((s) => s.removeQuote)
  const goTo = useStore((s) => s.goTo)
  const [form, setForm] = useState({ name: '', phone: '', budget: 0, note: '' })
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && useStore.getState().quoteOpen) { e.preventDefault(); setOpen(false) } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, setOpen])

  const services = quote.map((id) => SERVICES.find((s) => s.id === id)!).filter(Boolean)

  const message = () => {
    const bn = lang === 'bn'
    const lines = [
      bn ? `আসসালামু আলাইকুম, ${COMPANY.name}। আমি একটা কোট চাই।` : `Hi ${COMPANY.name}, I'd like a quote.`,
      '',
      ...(services.length
        ? [bn ? 'সার্ভিস:' : 'Services:', ...services.map((s) => `• ${tr(s.title, lang)} (${priceText(s, lang)})`), '']
        : []),
      `${bn ? 'নাম' : 'Name'}: ${form.name.trim()}`,
      `${bn ? 'ফোন' : 'Phone'}: ${form.phone.trim()}`,
      `${bn ? 'বাজেট' : 'Budget'}: ${tr(UI.budgets[form.budget], lang)}`,
      ...(form.note.trim() ? [`${bn ? 'নোট' : 'Note'}: ${form.note.trim()}`] : []),
    ]
    return lines.join('\n')
  }

  const valid = () => {
    const ok = form.name.trim().length > 1 && form.phone.replace(/\D/g, '').length >= 10
    setError(!ok)
    return ok
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!valid()) return
    window.open(waLink(message()), '_blank', 'noopener')
  }

  const mailto = () => {
    if (!valid()) return
    const subject = lang === 'bn' ? 'কোটের অনুরোধ' : 'Quote request'
    location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message())}`
  }

  return (
    <>
      <div className={`scrim ${open ? 'on' : ''}`} onClick={() => setOpen(false)} aria-hidden />
      <aside className={`drawer ${open ? 'open' : ''}`} aria-hidden={!open} aria-label={tr(UI.quote, lang)} {...inertUnless(open)}>
        <div className="drawer-head">
          <h2>{tr(UI.quote, lang)} <span>({services.length})</span></h2>
          <button className="icon-btn sm" onClick={() => setOpen(false)} aria-label={tr(UI.close, lang)}><CloseIcon /></button>
        </div>
        <div className="drawer-body">
          {services.length === 0 ? (
            <div className="empty">
              <p>{tr(UI.emptyQuote, lang)}</p>
              <button
                className="btn"
                onClick={() => {
                  setOpen(false)
                  if (mode === '3d') goTo('services')
                  else document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                {tr(UI.browseServices, lang)}
              </button>
            </div>
          ) : (
            <ul className="quote-lines">
              {services.map((s) => (
                <li key={s.id}>
                  <div>
                    <strong>{tr(s.title, lang)}</strong>
                    <small>{priceText(s, lang)}</small>
                  </div>
                  <button className="icon-btn sm ghost" onClick={() => removeQuote(s.id)} aria-label={`${lang === 'bn' ? 'বাদ দিন' : 'Remove'} ${tr(s.title, lang)}`}><TrashIcon /></button>
                </li>
              ))}
            </ul>
          )}

          <form className="quote-form" onSubmit={submit} noValidate>
            <label>
              {tr(UI.name, lang)}
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" required />
            </label>
            <label>
              {tr(UI.phone, lang)}
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} type="tel" inputMode="tel" autoComplete="tel" placeholder="01XXXXXXXXX" required />
            </label>
            <label>
              {tr(UI.budget, lang)}
              <select value={form.budget} onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })}>
                {UI.budgets.map((b, i) => <option key={b.en} value={i}>{tr(b, lang)}</option>)}
              </select>
            </label>
            <label>
              {tr(UI.note, lang)}
              <textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} rows={3} />
            </label>
            {error && <p className="form-error" role="alert">{tr(UI.required, lang)}</p>}
            <button className="btn wa big" type="submit"><WaIcon /> {tr(UI.sendWa, lang)}</button>
            <button className="btn big" type="button" onClick={mailto}>{tr(UI.sendMail, lang)}</button>
          </form>
        </div>
      </aside>
    </>
  )
}
