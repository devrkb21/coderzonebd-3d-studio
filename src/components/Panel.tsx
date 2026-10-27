import { useEffect, useState } from 'react'
import { COMPANY, COURIER, PROCESS, PRODUCTS, SERVICES, STOPS, tr, UI, WORK } from '../content'
import { itemById, itemsAt } from '../items'
import { useStore } from '../store'
import { inertUnless } from './inert'
import {
  ContactDetails, CourierDetails, HomeDetails, LeadershipDetails, ProcessDetails, ProductDetails, ServiceDetails, TechDetails, WorkDetails, CzCommerceDetails,
} from './details'
import { ChevronLeft, ChevronRight, CloseIcon } from './icons'

/** Side panel (bottom sheet on phones) for the focused item in the 3D room. */
export function Panel() {
  const lang = useStore((s) => s.lang)
  const focusId = useStore((s) => s.focusId)
  const focus = useStore((s) => s.focus)
  const step = useStore((s) => s.step)
  const setQuoteOpen = useStore((s) => s.setQuoteOpen)

  // Keep showing the last item while the panel slides out.
  const [shownId, setShownId] = useState(focusId)
  useEffect(() => { if (focusId) setShownId(focusId) }, [focusId])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!useStore.getState().focusId) return
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return
      if (e.key === 'Escape') { e.preventDefault(); focus(null) }
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [focus, step])

  const item = shownId ? itemById(shownId) : undefined
  if (!item) return null
  const list = itemsAt(item.stop)
  const index = list.findIndex((i) => i.id === item.id)
  const stopLabel = tr(STOPS.find((s) => s.id === item.stop)!.label, lang)

  let title = ''
  let body = null
  switch (item.kind) {
    case 'home':
      title = tr(UI.about, lang)
      body = <HomeDetails lang={lang} />
      break
    case 'cz':
      title = 'CZ Commerce'
      body = <CzCommerceDetails lang={lang} />
      break
    case 'service': {
      const s = SERVICES.find((x) => x.id === item.ref)!
      title = tr(s.title, lang)
      body = <ServiceDetails service={s} lang={lang} />
      break
    }
    case 'product': {
      const p = PRODUCTS.find((x) => x.id === item.ref)!
      title = p.name
      body = <ProductDetails product={p} lang={lang} />
      break
    }
    case 'work': {
      const w = WORK.find((x) => x.id === item.ref)!
      title = w.name
      body = <WorkDetails work={w} lang={lang} />
      break
    }
    case 'tech':
      title = lang === 'bn' ? 'আমাদের টেক স্ট্যাক' : 'Our tech stack'
      body = <TechDetails lang={lang} />
      break
    case 'courier':
      title = tr(COURIER.title, lang)
      body = <CourierDetails lang={lang} />
      break
    case 'process': {
      const i = PROCESS.findIndex((x) => x.id === item.ref)
      title = `${i + 1}. ${tr(PROCESS[i].title, lang)}`
      body = <ProcessDetails index={i} lang={lang} />
      break
    }
    case 'contact':
      title = tr(UI.contactTitle, lang)
      body = <ContactDetails lang={lang} onQuote={() => setQuoteOpen(true)} />
      break
    case 'leadership':
      title = tr(STOPS.find((s) => s.id === 'leadership')!.label, lang)
      body = <LeadershipDetails lang={lang} onAsk={(who) => useStore.getState().openChat(who)} onBook={(who) => useStore.getState().openBooking(who)} />
      break
  }

  return (
    <aside className={`panel ${focusId ? 'open' : ''}`} aria-hidden={!focusId} aria-label={title} {...inertUnless(!!focusId)}>
      <div className="grabber" aria-hidden />
      <div className="panel-head">
        <span className="eyebrow">{stopLabel}{list.length > 1 ? ` · ${index + 1} / ${list.length}` : ''}</span>
        <div className="panel-nav">
          {list.length > 1 && (
            <>
              <button className="icon-btn sm" onClick={() => step(-1)} aria-label={tr(UI.prev, lang)}><ChevronLeft /></button>
              <button className="icon-btn sm" onClick={() => step(1)} aria-label={tr(UI.next, lang)}><ChevronRight /></button>
            </>
          )}
          <button className="icon-btn sm" onClick={() => focus(null)} aria-label={tr(UI.close, lang)}><CloseIcon /></button>
        </div>
      </div>
      <div className="panel-body" key={item.id}>
        <h2>{title}</h2>
        {item.kind === 'home' && <p className="sub">{COMPANY.name}</p>}
        {body}
      </div>
    </aside>
  )
}
