// The personalised store preview (`?for=` visits), opened from the welcome stand in the room.
import { useCallback, useMemo } from 'react'
import { COMPANY, tr, waLink } from '../content'
import { storeMockup } from '../mockup'
import { PERSONAL, SHOP_TYPE_LABEL, welcomeLine } from '../personal'
import { useStore } from '../store'
import { WaIcon } from './details'
import { Modal } from './Modal'

export function WelcomeCard() {
  const open = useStore((s) => s.welcomeOpen)
  const lang = useStore((s) => s.lang)
  const close = useCallback(() => useStore.getState().setWelcomeOpen(false), [])
  const src = useMemo(() => (PERSONAL && open ? storeMockup(PERSONAL.name, PERSONAL.type, lang).toDataURL('image/jpeg', 0.88) : ''), [open, lang])
  if (!open || !PERSONAL) return null
  const bn = lang === 'bn'
  const { name, type } = PERSONAL
  const getStore = () => {
    const s = useStore.getState()
    if (!s.quote.includes('ecommerce')) s.toggleQuote('ecommerce')
    s.setWelcomeOpen(false)
    s.setQuoteOpen(true)
  }
  const message = bn
    ? `আসসালামু আলাইকুম, ${COMPANY.name}। আমি ${name} থেকে বলছি। 3D স্টুডিওতে আমাদের স্টোরের প্রিভিউ দেখলাম — CZ Commerce দিয়ে এরকম একটা অনলাইন স্টোর চাই (${tr(SHOP_TYPE_LABEL[type], lang)})।`
    : `Hi ${COMPANY.name}, this is ${name}. I saw our store preview in the 3D studio and would like an online store like it with CZ Commerce (${tr(SHOP_TYPE_LABEL[type], lang)}).`
  return (
    <Modal title={welcomeLine(name, lang)} onClose={close} className="welcome-card">
      <p className="welcome-sub">{bn ? 'CZ Commerce দিয়ে আপনার অনলাইন স্টোর দেখতে এরকম হতে পারে।' : 'This is how your online store could look with CZ Commerce.'}</p>
      <img className="welcome-mock" src={src} alt={bn ? `${name}-এর অনলাইন স্টোরের নমুনা` : `A sample online store for ${name}`} />
      <div className="actions">
        <button className="btn primary" onClick={getStore}>{bn ? 'এই স্টোরটা চাই' : 'Get this store'}</button>
        <a className="btn wa" href={waLink(message)} target="_blank" rel="noopener noreferrer"><WaIcon /> WhatsApp</a>
      </div>
    </Modal>
  )
}
