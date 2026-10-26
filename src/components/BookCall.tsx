// "Book a 15-min call" with a founder: pick a day and a slot (Dhaka time), add name, phone and
// topic, and the request opens in WhatsApp for the team to confirm. Nothing is stored.
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { tr, waLink, type L } from '../content'
import { bookingMessage, bookingSlots, dayLabel, dhakaTime, founderOf, localTime, type SlotDay } from '../booking'
import { useStore } from '../store'
import { WaIcon } from './details'
import { Modal } from './Modal'

const T = {
  title: { en: 'Book a 15-min call', bn: '১৫ মিনিটের কল বুক করুন' },
  with: { en: 'with', bn: 'যাঁর সাথে:' },
  day: { en: 'Day', bn: 'দিন' },
  time: { en: 'Time (Dhaka time, GMT+6)', bn: 'সময় (ঢাকা সময়, GMT+6)' },
  yours: { en: 'Your time', bn: 'আপনার সময়' },
  name: { en: 'Your name', bn: 'আপনার নাম' },
  phone: { en: 'Phone / WhatsApp', bn: 'ফোন / WhatsApp' },
  topic: { en: 'What would you like to talk about?', bn: 'কী নিয়ে কথা বলতে চান?' },
  send: { en: 'Send request on WhatsApp', bn: 'WhatsApp-এ অনুরোধ পাঠান' },
  note: {
    en: 'Office hours: Saturday–Thursday, 10 AM–7 PM Dhaka time (Friday off). The team confirms your slot on WhatsApp. We don’t store anything here.',
    bn: 'অফিস সময়: শনি–বৃহস্পতিবার, সকাল ১০টা–সন্ধ্যা ৭টা, ঢাকা সময় (শুক্রবার বন্ধ)। টিম WhatsApp-এ সময় নিশ্চিত করবে। এখানে কিছুই সংরক্ষণ করা হয় না।',
  },
  pickSlot: { en: 'Please pick a time.', bn: 'একটা সময় বেছে নিন।' },
  fill: { en: 'Please add your name, a valid phone number and a topic.', bn: 'নাম, সঠিক ফোন নম্বর আর বিষয় লিখুন।' },
  today: { en: 'Today', bn: 'আজ' },
  tomorrow: { en: 'Tomorrow', bn: 'আগামীকাল' },
  sent: { en: 'Opened WhatsApp with your request. The team will confirm the time.', bn: 'WhatsApp-এ আপনার অনুরোধ খোলা হয়েছে। টিম সময় নিশ্চিত করবে।' },
} satisfies Record<string, L>

const PHONE = /^\+?[0-9][0-9 ()-]{6,18}[0-9]$/
const todayIso = () => new Date(Date.now() + 6 * 3_600_000).toISOString().slice(0, 10)
const tomorrowIso = () => new Date(Date.now() + 30 * 3_600_000).toISOString().slice(0, 10)

export function BookCall() {
  const who = useStore((s) => s.booking)
  const lang = useStore((s) => s.lang)
  const close = useCallback(() => useStore.getState().closeBooking(), [])
  const [days, setDays] = useState<SlotDay[]>([])
  const [dayIdx, setDayIdx] = useState(0)
  const [slot, setSlot] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [topic, setTopic] = useState('')
  const [error, setError] = useState<L | null>(null)

  useEffect(() => {
    if (!who) return
    let live = true
    setDays([]); setDayIdx(0); setSlot(null); setError(null)
    bookingSlots(who).then((d) => { if (live) setDays(d) })
    return () => { live = false }
  }, [who])

  if (!who) return null
  const f = founderOf(who)
  const day = days[dayIdx]
  const local = slot !== null ? localTime(slot, lang) : null

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!day || slot === null) return setError(T.pickSlot)
    const req = { who, day, slot, name: name.trim().slice(0, 60), phone: phone.trim().slice(0, 24), topic: topic.trim().replace(/\s+/g, ' ').slice(0, 300) }
    if (req.name.length < 2 || !PHONE.test(req.phone) || req.topic.length < 2) return setError(T.fill)
    setError(null)
    window.open(waLink(bookingMessage(req, lang)), '_blank', 'noopener,noreferrer')
    useStore.getState().showToast(tr(T.sent, lang))
    close()
  }

  const chip = (d: SlotDay) => {
    const l = dayLabel(d, lang)
    return d.date === todayIso() ? tr(T.today, lang) : d.date === tomorrowIso() ? tr(T.tomorrow, lang) : l.weekday
  }

  return (
    <Modal title={tr(T.title, lang)} onClose={close} className="book-card">
      <p className="welcome-sub">{tr(T.with, lang)} <strong>{f.name}</strong> · {f.role}</p>
      <form className="quote-form book-form" onSubmit={submit} noValidate>
        <fieldset className="book-days">
          <legend>{tr(T.day, lang)}</legend>
          <div role="radiogroup" aria-label={tr(T.day, lang)}>
            {days.map((d, i) => (
              <button type="button" key={d.date} role="radio" aria-checked={i === dayIdx} className={i === dayIdx ? 'on' : ''}
                onClick={() => { setDayIdx(i); setSlot(null) }}>
                <b>{chip(d)}</b><small>{dayLabel(d, lang).date}</small>
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="book-slots">
          <legend>{tr(T.time, lang)}</legend>
          <div role="radiogroup" aria-label={tr(T.time, lang)}>
            {day?.slots.map((t) => (
              <button type="button" key={t} role="radio" aria-checked={slot === t} className={slot === t ? 'on' : ''} onClick={() => setSlot(t)}>
                {dhakaTime(t, lang)}
              </button>
            ))}
          </div>
          {local && <p className="book-local">{tr(T.yours, lang)}: <strong>{local}</strong></p>}
        </fieldset>
        <label>{tr(T.name, lang)}<input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={60} required /></label>
        <label>{tr(T.phone, lang)}<input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" inputMode="tel" autoComplete="tel" maxLength={24} placeholder="01XXXXXXXXX" required /></label>
        <label>{tr(T.topic, lang)}<textarea value={topic} onChange={(e) => setTopic(e.target.value)} rows={2} maxLength={300} required /></label>
        {error && <p className="form-error" role="alert">{tr(error, lang)}</p>}
        <button type="submit" className="btn wa big"><WaIcon /> {tr(T.send, lang)}</button>
        <p className="sub book-note">{tr(T.note, lang)}</p>
      </form>
    </Modal>
  )
}
