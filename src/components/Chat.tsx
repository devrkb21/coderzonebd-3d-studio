// The AI chat: the front-desk receptionist and the two founders' assistants.
import { useEffect, useRef, useState } from 'react'
import { SERVICES, STOPS, tr, type L, type Lang } from '../content'
import { useStore, type Persona } from '../store'
import { useDemo } from '../ai/demo'
import { AI_ENABLED, runTool, streamChat, waHref, type ApiError, type ChatTurn } from '../ai/client'
import { CloseIcon } from './icons'

interface Msg {
  role: 'user' | 'assistant'
  content: string
  /** Lines describing what the assistant did in the site (added to quote, moved the camera). */
  notes?: string[]
  wa?: string
  /** A local notice (error, fallback), never sent back to the model. */
  local?: boolean
}

const PEOPLE: Record<Persona, { name: L; role: L; initials: string; hello: L; chips: string[] }> = {
  receptionist: {
    name: { en: 'Front desk', bn: 'রিসেপশন' },
    role: { en: 'AI receptionist · Coder Zone BD', bn: 'AI রিসেপশনিস্ট · কোডার জোন বিডি' },
    initials: 'CZ',
    hello: {
      en: "Hi, welcome to Coder Zone BD! I'm the AI front desk. What would you like to build?",
      bn: 'কোডার জোন বিডি-তে স্বাগতম! আমি AI রিসেপশন। কী বানাতে চান, বলুন?',
    },
    chips: ['What does a website cost?', 'আমার দোকানের জন্য কী লাগবে?', 'Show me your work'],
  },
  ceo: {
    name: { en: "Rakib's assistant", bn: 'রাকিবের অ্যাসিস্ট্যান্ট' },
    role: { en: 'AI · Office of the CEO · CTO', bn: 'AI · CEO · CTO অফিস' },
    initials: 'RU',
    hello: {
      en: "Hi! I'm the AI assistant in Rakib Uddin's office. Ask me anything technical: stack, architecture, integrations or timelines.",
      bn: 'হাই! আমি রাকিব উদ্দিনের অফিসের AI অ্যাসিস্ট্যান্ট। টেক স্ট্যাক, আর্কিটেকচার, ইন্টিগ্রেশন বা সময় নিয়ে যা জানতে চান, জিজ্ঞেস করুন।',
    },
    chips: ['How long does a custom web app take?', 'Which stack fits my app?', 'বিকাশ পেমেন্ট যুক্ত করা যাবে?'],
  },
  cmo: {
    name: { en: "Barek's assistant", bn: 'বারেকের অ্যাসিস্ট্যান্ট' },
    role: { en: 'AI · Office of the CMO · CFO', bn: 'AI · CMO · CFO অফিস' },
    initials: 'BM',
    hello: {
      en: "Hi! I'm the AI assistant in Barek Mian's office. Ask me about prices, packages, payment or marketing.",
      bn: 'হাই! আমি বারেক মিয়ার অফিসের AI অ্যাসিস্ট্যান্ট। দাম, প্যাকেজ, পেমেন্ট বা মার্কেটিং নিয়ে জিজ্ঞেস করুন।',
    },
    chips: ['What does a website cost?', 'How do payments work?', 'CZ Commerce-এর প্ল্যানগুলো কী?'],
  },
}

const T = {
  placeholder: { en: 'Type a message…', bn: 'মেসেজ লিখুন…' },
  send: { en: 'Send', bn: 'পাঠান' },
  talk: { en: 'Hold to talk', bn: 'চেপে ধরে বলুন' },
  listening: { en: 'Listening…', bn: 'শুনছি…' },
  speakOn: { en: 'Read replies aloud', bn: 'উত্তর পড়ে শোনান' },
  speakOff: { en: 'Stop reading replies aloud', bn: 'পড়ে শোনানো বন্ধ' },
  wa: { en: 'Message the team on WhatsApp', bn: 'WhatsApp-এ টিমকে মেসেজ দিন' },
  openQuote: { en: 'Open quote list', bn: 'কোট লিস্ট খুলুন' },
  added: { en: 'Added to your quote', bn: 'কোটে যোগ হয়েছে' },
  went: { en: 'Took you to', bn: 'নিয়ে গেলাম' },
  book: { en: 'Book a 15-min call', bn: '১৫ মিনিটের কল বুক করুন' },
  booked: { en: 'Opened the booking form', bn: 'বুকিং ফর্ম খোলা হয়েছে' },
  notConfigured: {
    en: 'Our AI desk is still being set up. Please message the team on WhatsApp, they usually reply quickly.',
    bn: 'আমাদের AI ডেস্ক এখনো চালু হচ্ছে। WhatsApp-এ টিমকে মেসেজ দিন, সাধারণত দ্রুত উত্তর দেয়।',
  },
  failed: {
    en: 'Sorry, something went wrong. Please try again, or message the team on WhatsApp.',
    bn: 'দুঃখিত, কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন, অথবা WhatsApp-এ টিমকে মেসেজ দিন।',
  },
  waHello: { en: 'Hi Coder Zone BD! I was chatting on your 3D site and would like to talk to the team.', bn: 'হাই কোডার জোন বিডি! আপনাদের 3D সাইটে চ্যাট করছিলাম, টিমের সাথে কথা বলতে চাই।' },
  ai: { en: 'AI can make mistakes. The team confirms every price and plan.', bn: 'AI ভুল করতে পারে। দাম ও প্ল্যান টিম নিশ্চিত করবে।' },
  chat: { en: 'Chat with us', bn: 'চ্যাট করুন' },
} satisfies Record<string, L>

// ── voice ─────────────────────────────────────────

type Recognition = {
  lang: string; interimResults: boolean; continuous: boolean
  start: () => void; stop: () => void; abort: () => void
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null
  onend: (() => void) | null; onerror: (() => void) | null
}
const RecognitionImpl = typeof window === 'undefined' ? undefined
  : ((window as unknown as { SpeechRecognition?: new () => Recognition }).SpeechRecognition
    ?? (window as unknown as { webkitSpeechRecognition?: new () => Recognition }).webkitSpeechRecognition)
const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window
const BANGLA = /[ঀ-৿]/

/** Speaks a reply: a Bangla voice (bn-BD, then bn-IN) for Bangla text, otherwise English. */
function speak(text: string) {
  if (!canSpeak) return
  const synth = window.speechSynthesis
  synth.cancel()
  const voices = synth.getVoices()
  const bangla = BANGLA.test(text)
  const voice = bangla
    ? voices.find((v) => v.lang.replace('_', '-') === 'bn-BD') ?? voices.find((v) => v.lang.startsWith('bn'))
    : voices.find((v) => v.lang.startsWith('en') && v.localService) ?? voices.find((v) => v.lang.startsWith('en'))
  if (bangla && !voice) return
  const u = new SpeechSynthesisUtterance(text)
  if (voice) { u.voice = voice; u.lang = voice.lang }
  synth.speak(u)
}

// ── history, kept for the browser session ─────────

const key = (p: Persona) => `cz3d-chat-${p}`
function loadHistory(p: Persona): Msg[] {
  try { return JSON.parse(sessionStorage.getItem(key(p)) ?? '[]') as Msg[] } catch { return [] }
}
function saveHistory(p: Persona, msgs: Msg[]) {
  try { sessionStorage.setItem(key(p), JSON.stringify(msgs.slice(-40))) } catch { /* storage unavailable */ }
}

const serviceName = (id: string, lang: Lang) => { const s = SERVICES.find((x) => x.id === id); return s ? tr(s.title, lang) : id }

function errorMessage(error: ApiError, lang: Lang): Msg {
  const text = error.kind === 'rate_limited' ? error.message[lang] : error.kind === 'not_configured' ? tr(T.notConfigured, lang) : tr(T.failed, lang)
  return { role: 'assistant', content: text, wa: waHref(tr(T.waHello, lang)), local: true }
}

/** Opens a chat with the receptionist from anywhere: a floating button. */
function Launcher() {
  const lang = useStore((s) => s.lang)
  const mode = useStore((s) => s.mode)
  const ready = useStore((s) => s.ready)
  const intro = useStore((s) => s.intro)
  const covered = useStore((s) => !!s.focusId || s.projectOpen || s.quoteOpen || !!s.chat)
  const demoOpen = useDemo((d) => d.open)
  const hidden = covered || demoOpen
  if (mode === '3d' && (!ready || intro)) return null
  return (
    <button className={`chat-fab ${hidden ? 'hide' : ''}`} onClick={() => useStore.getState().openChat('receptionist')} aria-label={tr(T.chat, lang)}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
      </svg>
      <span>{tr(T.chat, lang)}</span>
    </button>
  )
}

export function Chat() {
  const persona = useStore((s) => s.chat)
  if (!AI_ENABLED) return null
  return (
    <>
      <Launcher />
      {persona && <ChatPanel key={persona} persona={persona} />}
    </>
  )
}

function ChatPanel({ persona }: { persona: Persona }) {
  const lang = useStore((s) => s.lang)
  const closeChat = useStore((s) => s.closeChat)
  const who = PEOPLE[persona]
  const [msgs, setMsgs] = useState<Msg[]>(() => loadHistory(persona))
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [waiting, setWaiting] = useState(false)
  const [voiceOn, setVoiceOn] = useState(false)
  const [listening, setListening] = useState(false)
  const list = useRef<HTMLDivElement>(null)
  const field = useRef<HTMLTextAreaElement>(null)
  const abort = useRef<AbortController | null>(null)
  const rec = useRef<Recognition | null>(null)
  const pressedAt = useRef(0)

  useEffect(() => { saveHistory(persona, msgs) }, [persona, msgs])
  useEffect(() => { list.current?.scrollTo({ top: list.current.scrollHeight }) }, [msgs, waiting])
  useEffect(() => {
    if (!window.matchMedia('(pointer: coarse)').matches) field.current?.focus()
    return () => {
      abort.current?.abort()
      rec.current?.abort()
      if (canSpeak) window.speechSynthesis.cancel()
    }
  }, [])

  // Esc closes the chat before anything underneath reacts to it.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || useStore.getState().quoteOpen) return
      e.preventDefault()
      e.stopPropagation()
      closeChat()
    }
    window.addEventListener('keydown', onKey, { capture: true })
    return () => window.removeEventListener('keydown', onKey, { capture: true })
  }, [closeChat])

  const send = async (text: string) => {
    const content = text.trim().slice(0, 1000)
    if (!content || busy) return
    setInput('')
    const history: ChatTurn[] = [...msgs.filter((m) => !m.local && m.content), { role: 'user' as const, content }]
      .map((m) => ({ role: m.role, content: m.content }))
    const next: Msg[] = [...msgs, { role: 'user', content }]
    setMsgs(next)
    setBusy(true)
    setWaiting(true)
    abort.current = new AbortController()
    let reply: Msg = { role: 'assistant', content: '' }
    const show = () => setMsgs([...next, reply])
    const error = await streamChat(persona, lang, history, (e) => {
      if (e.t === 'text') {
        setWaiting(false)
        reply = { ...reply, content: reply.content + e.v }
        show()
      } else if (e.t === 'tool') {
        const { wa } = runTool(e.name, e.input)
        const notes = [...(reply.notes ?? [])]
        if (e.name === 'add_to_quote') notes.push(`${tr(T.added, lang)}: ${(e.input.serviceIds as string[]).map((id) => serviceName(id, lang)).join(', ')}`)
        if (e.name === 'go_to_section') notes.push(`${tr(T.went, lang)} ${tr(STOPS.find((s) => s.id === e.input.stop)!.label, lang)}`)
        if (e.name === 'book_call') notes.push(tr(T.booked, lang))
        reply = { ...reply, notes, wa: wa ?? reply.wa }
        show()
      }
    }, abort.current.signal)
    setWaiting(false)
    setBusy(false)
    if (abort.current.signal.aborted) return
    if (error) {
      setMsgs(reply.content ? [...next, reply, errorMessage(error, lang)] : [...next, errorMessage(error, lang)])
      return
    }
    if (voiceOn && reply.content) speak(reply.content)
  }

  const startListening = () => {
    if (!RecognitionImpl || listening) return
    const r = new RecognitionImpl()
    r.lang = lang === 'bn' ? 'bn-BD' : 'en-US'
    r.interimResults = true
    r.continuous = false
    let finalText = ''
    r.onresult = (e) => {
      let text = ''
      for (let i = 0; i < e.results.length; i++) {
        text += e.results[i][0].transcript
        if (e.results[i].isFinal) finalText = text
      }
      setInput(text)
    }
    r.onend = () => {
      setListening(false)
      rec.current = null
      if (finalText.trim()) send(finalText)
    }
    r.onerror = () => setListening(false)
    rec.current = r
    if (canSpeak) window.speechSynthesis.cancel()
    try { r.start(); setListening(true) } catch { setListening(false) }
  }

  const hasUser = msgs.some((m) => m.role === 'user')
  const quoteCount = useStore((s) => s.quote.length)

  return (
    <div className="chat" role="dialog" aria-label={tr(who.name, lang)}>
      <div className="grabber" aria-hidden />
      <header className="chat-head">
        <span className={`chat-avatar ${persona}`} aria-hidden>{who.initials}</span>
        <div className="chat-who">
          <strong>{tr(who.name, lang)}</strong>
          <span><i className="chat-online" aria-hidden />{tr(who.role, lang)}</span>
        </div>
        {canSpeak && (
          <button
            className={`icon-btn sm ${voiceOn ? 'on' : ''}`}
            onClick={() => { if (voiceOn) window.speechSynthesis.cancel(); setVoiceOn(!voiceOn) }}
            aria-pressed={voiceOn}
            aria-label={tr(voiceOn ? T.speakOff : T.speakOn, lang)}
            title={tr(voiceOn ? T.speakOff : T.speakOn, lang)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M4 9h4l5-4v14l-5-4H4z" />
              {voiceOn ? <path d="M16.5 8.5a5 5 0 0 1 0 7" /> : <path d="M17 9l5 6M22 9l-5 6" />}
            </svg>
          </button>
        )}
        <button className="icon-btn sm" onClick={closeChat} aria-label={tr({ en: 'Close', bn: 'বন্ধ করুন' }, lang)}><CloseIcon /></button>
      </header>

      {persona !== 'receptionist' && (
        <button className="chat-book" onClick={() => useStore.getState().openBooking(persona)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" />
          </svg>
          {tr(T.book, lang)}
        </button>
      )}

      <div className="chat-list" ref={list} aria-live="polite">
        <p className="chat-msg assistant">{tr(who.hello, lang)}</p>
        {msgs.map((m, i) => (
          <div key={i} className={`chat-msg ${m.role} ${m.local ? 'local' : ''}`}>
            {m.content && <p>{m.content}</p>}
            {m.notes?.map((n) => <small key={n} className="chat-note">✓ {n}</small>)}
            {m.notes?.some((n) => n.startsWith(tr(T.added, lang))) && (
              <button className="chat-link" onClick={() => { closeChat(); useStore.getState().setQuoteOpen(true) }}>
                {tr(T.openQuote, lang)} ({quoteCount})
              </button>
            )}
            {m.wa && <a className="btn wa chat-wa" href={m.wa} target="_blank" rel="noopener noreferrer">{tr(T.wa, lang)}</a>}
            {persona !== 'receptionist' && m.notes?.includes(tr(T.booked, lang)) && (
              <button className="chat-link" onClick={() => useStore.getState().openBooking(persona)}>{tr(T.book, lang)}</button>
            )}
          </div>
        ))}
        {waiting && <div className="chat-msg assistant typing" aria-label="…"><span /><span /><span /></div>}
      </div>

      {!hasUser && (
        <div className="chat-chips">
          {who.chips.map((c) => <button key={c} onClick={() => send(c)} lang={BANGLA.test(c) ? 'bn' : 'en'}>{c}</button>)}
        </div>
      )}

      <form className="chat-input" onSubmit={(e) => { e.preventDefault(); send(input) }}>
        <textarea
          ref={field}
          rows={1}
          value={input}
          maxLength={1000}
          placeholder={listening ? tr(T.listening, lang) : tr(T.placeholder, lang)}
          aria-label={tr(T.placeholder, lang)}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) } }}
        />
        {RecognitionImpl && (
          <button
            type="button"
            className={`chat-mic ${listening ? 'on' : ''}`}
            aria-label={tr(T.talk, lang)}
            title={tr(T.talk, lang)}
            aria-pressed={listening}
            onPointerDown={() => { pressedAt.current = performance.now(); if (listening) rec.current?.stop(); else startListening() }}
            onPointerUp={() => { if (performance.now() - pressedAt.current > 400) rec.current?.stop() }}
            onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) { e.preventDefault(); if (listening) rec.current?.stop(); else startListening() } }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
            </svg>
          </button>
        )}
        <button type="submit" className="chat-send" disabled={busy || !input.trim()} aria-label={tr(T.send, lang)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </form>
      <p className="chat-foot">{tr(T.ai, lang)}</p>
    </div>
  )
}
