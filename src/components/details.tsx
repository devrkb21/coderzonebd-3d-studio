// Detail views shared by the 3D side panel and the 2D / SEO page.
import {
  COMPANY, CONTACT, COURIER, FAQ, LEADERSHIP, PROCESS, priceText, TECH, TECH_LOGOS, tr, UI, waLink, workById,
  type Lang, type ProductInfo, type Service, type WorkItem,
} from '../content'
import { useStore } from '../store'

const BASE = import.meta.env.BASE_URL

export function AddToQuote({ service, lang }: { service: Service; lang: Lang }) {
  const inQuote = useStore((s) => s.quote.includes(service.id))
  const toggle = useStore((s) => s.toggleQuote)
  return (
    <button type="button" className={`btn primary ${inQuote ? 'done' : ''}`} onClick={() => toggle(service.id)} aria-pressed={inQuote}>
      {inQuote ? `✓ ${tr(UI.inQuote, lang)}` : `+ ${tr(UI.addToQuote, lang)}`}
    </button>
  )
}

export function WhatsAppButton({ text, lang }: { text: string; lang: Lang }) {
  return (
    <a className="btn wa" href={waLink(text)} target="_blank" rel="noopener noreferrer">
      <WaIcon /> {tr(UI.whatsapp, lang)}
    </a>
  )
}

export function HomeDetails({ lang }: { lang: Lang }) {
  return (
    <>
      <p className="lead">{tr(COMPANY.intro, lang)}</p>
      <ul className="stats">
        {COMPANY.stats.map((s) => (
          <li key={s.value}><strong>{s.value}</strong><span>{tr(s.label, lang)}</span></li>
        ))}
      </ul>
      <h3>{tr(UI.whyUs, lang)}</h3>
      <ul className="checks">
        {COMPANY.why.map((w) => <li key={w.en}>{tr(w, lang)}</li>)}
      </ul>
    </>
  )
}

export function TechDetails({ lang }: { lang: Lang }) {
  return (
    <>
      <p className="lead">{lang === 'bn'
        ? 'যে টুল দিয়ে আমরা প্রতিদিন কাজ করি — ওয়েব, মোবাইল, ব্যাকএন্ড, পেমেন্ট আর হোস্টিং।'
        : 'The tools we build with every day: web, mobile, backend, payments and hosting.'}</p>
      <TechGrid />
    </>
  )
}

export function TechGrid() {
  return (
    <ul className="tech-grid">
      {TECH.map((t) => (
        <li key={t}><img src={`${BASE}${TECH_LOGOS[t]}`} alt="" loading="lazy" height={36} />{t}</li>
      ))}
    </ul>
  )
}

export function ServiceDetails({ service: s, lang, actions = true }: { service: Service; lang: Lang; actions?: boolean }) {
  const proof = s.proof.map(workById).filter(Boolean) as WorkItem[]
  return (
    <>
      <p className="lead">{tr(s.desc, lang)}</p>
      <h3>{tr(UI.whatYouGet, lang)}</h3>
      <ul className="checks">{s.gets.map((g) => <li key={g.en}>{tr(g, lang)}</li>)}</ul>
      <dl className="facts">
        <div><dt>{tr(UI.price, lang)}</dt><dd>{priceText(s, lang)}</dd></div>
        {s.duration && <div><dt>{tr(UI.duration, lang)}</dt><dd>{tr(s.duration, lang)}</dd></div>}
      </dl>
      {proof.length > 0 && (
        <>
          <h3>{tr(UI.proof, lang)}</h3>
          <ul className="chips">
            {proof.map((w) => (
              <li key={w.id}>{w.url ? <a href={w.url} target="_blank" rel="noopener noreferrer">{w.name}</a> : <span>{w.name}</span>}</li>
            ))}
          </ul>
        </>
      )}
      {actions && (
        <div className="actions">
          <AddToQuote service={s} lang={lang} />
          <WhatsAppButton lang={lang} text={lang === 'bn' ? `আসসালামু আলাইকুম, "${s.title.bn}" নিয়ে জানতে চাই।` : `Hi, I'd like to know more about "${s.title.en}".`} />
        </div>
      )}
    </>
  )
}

export function ProductDetails({ product: p, lang }: { product: ProductInfo; lang: Lang }) {
  return (
    <>
      <img className="product-logo" src={`${BASE}${p.logo}`} alt={p.name} height={48} loading="lazy" />
      {p.comingSoon && <span className="badge-soon">{tr(UI.comingSoon, lang)}</span>}
      <p className="lead">{tr(p.desc, lang)}</p>
      {p.features.length > 0 && <ul className="checks">{p.features.map((f) => <li key={f.en}>{tr(f, lang)}</li>)}</ul>}
      {p.tiers.length > 0 && (
        <>
          <h3>{tr(UI.pricing, lang)}</h3>
          <ul className="tiers">
            {p.tiers.map((t) => <li key={t.name}><span>{t.name}</span><strong>{tr(t.price, lang)}</strong></li>)}
          </ul>
        </>
      )}
      {p.note && <p className="note">{tr(p.note, lang)}</p>}
      {p.links.length > 0 && (
        <div className="actions">
          {p.links.map((l, i) => (
            <a key={l.url} className={`btn ${i === 0 ? 'primary' : ''}`} href={l.url} target="_blank" rel="noopener noreferrer">{tr(l.label, lang)} ↗</a>
          ))}
        </div>
      )}
    </>
  )
}

export function WorkDetails({ work: w, lang }: { work: WorkItem; lang: Lang }) {
  return (
    <>
      {w.shot ? (
        <img className="shot" src={`${BASE}work/${w.id}.jpg`} alt={`${w.name} — ${lang === 'bn' ? 'হোমপেজের স্ক্রিনশট' : 'homepage screenshot'}`} width={960} height={600} loading="lazy" decoding="async" />
      ) : (
        <div className="shot neutral" role="img" aria-label={w.name}>
          <strong>{w.name}</strong>
          <span>{w.stack}</span>
        </div>
      )}
      <dl className="facts">
        <div><dt>{lang === 'bn' ? 'ধরন' : 'Type'}</dt><dd>{tr(w.type, lang)}</dd></div>
        <div><dt>{lang === 'bn' ? 'টেক' : 'Stack'}</dt><dd>{w.stack}</dd></div>
      </dl>
      {!w.shot && <p className="note">{tr(UI.noPublic, lang)}</p>}
      {w.url && (
        <div className="actions">
          <a className="btn primary" href={w.url} target="_blank" rel="noopener noreferrer">{tr(UI.visit, lang)} ↗</a>
        </div>
      )}
    </>
  )
}

export function CourierDetails({ lang }: { lang: Lang }) {
  return (
    <>
      <p className="lead">{tr(COURIER.desc, lang)}</p>
      <ul className="logo-chips">
        {COURIER.couriers.map((c) => <li key={c}><img src={`${BASE}${COURIER.logos[c]}`} alt={c} title={c} loading="lazy" height={26} /></li>)}
      </ul>
      <div className="actions">
        <a className="btn primary" href={COURIER.url} target="_blank" rel="noopener noreferrer">{tr(COURIER.cta, lang)} ↗</a>
      </div>
    </>
  )
}

export function ProcessDetails({ index, lang }: { index: number; lang: Lang }) {
  const s = PROCESS[index]
  return (
    <>
      <p className="lead">{tr(s.desc, lang)}</p>
      <ol className="steps">
        {PROCESS.map((p, i) => <li key={p.id} className={i === index ? 'on' : ''}>{tr(p.title, lang)}</li>)}
      </ol>
    </>
  )
}

export function ContactDetails({ lang, onQuote }: { lang: Lang; onQuote?: () => void }) {
  return (
    <>
      <ul className="contact-list">
        <li><span>{lang === 'bn' ? 'ফোন' : 'Phone'}</span><a href={CONTACT.phoneHref}>{CONTACT.phone}</a></li>
        <li><span>WhatsApp</span><a href={`https://wa.me/${CONTACT.whatsappNumber}`} target="_blank" rel="noopener noreferrer">{CONTACT.whatsapp}</a></li>
        <li><span>{lang === 'bn' ? 'ইমেইল' : 'Email'}</span><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>
        <li><span>{lang === 'bn' ? 'ঠিকানা' : 'Address'}</span><address>{tr(CONTACT.address, lang)}</address></li>
        <li><span>{lang === 'bn' ? 'ক্লায়েন্ট পোর্টাল' : 'Client portal'}</span><a href={CONTACT.portal} target="_blank" rel="noopener noreferrer">portal.czbd.app</a></li>
        <li><span>GitHub</span><a href={CONTACT.github} target="_blank" rel="noopener noreferrer">github.com/coderzonebd</a></li>
      </ul>
      {onQuote && (
        <div className="actions">
          <button type="button" className="btn primary" onClick={onQuote}>{tr(UI.openQuote, lang)}</button>
        </div>
      )}
      <h3>{tr(UI.team, lang)}</h3>
      <ul className="team">
        {COMPANY.team.map((t) => <li key={t.name}><strong>{t.name}</strong><span>{t.role}</span></li>)}
      </ul>
      <h3>{tr(UI.faq, lang)}</h3>
      <div className="faq">
        {FAQ.map((f) => (
          <details key={f.q.en}>
            <summary>{tr(f.q, lang)}</summary>
            <p>{tr(f.a, lang)}</p>
          </details>
        ))}
      </div>
    </>
  )
}

/** The two founders; in the 3D room each has an AI assistant to chat with. */
export function LeadershipDetails({ lang, onAsk, onBook }: { lang: Lang; onAsk?: (who: 'ceo' | 'cmo') => void; onBook?: (who: 'ceo' | 'cmo') => void }) {
  return (
    <>
      <p className="lead">{tr(LEADERSHIP.intro, lang)}</p>
      <ul className="team">
        {LEADERSHIP.founders.map((f) => (
          <li key={f.who}>
            <strong>{f.name}</strong>
            <span>{f.role} · {tr(f.duty, lang)}</span>
            {onAsk && <button type="button" className="btn" onClick={() => onAsk(f.who)}>{tr(LEADERSHIP.ask, lang)}</button>}
            {onBook && <button type="button" className="btn" onClick={() => onBook(f.who)}>{lang === 'bn' ? '১৫ মিনিটের কল বুক করুন' : 'Book a 15-min call'}</button>}
          </li>
        ))}
      </ul>
      {onAsk && <p>{tr(LEADERSHIP.assistant, lang)}</p>}
    </>
  )
}

export const WaIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden fill="currentColor">
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 2.9 2.9 0 0 0-.9 2.2 5 5 0 0 0 1.1 2.7 11.5 11.5 0 0 0 4.4 3.9c1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.5-.2z" />
  </svg>
)
