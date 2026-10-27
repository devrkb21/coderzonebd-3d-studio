// The 2D version of the showroom: every word from the 3D room as plain,
// semantic HTML. It is prerendered into index.html for search engines, shown
// to phones that can't run 3D smoothly, and read by screen readers.
import {
  COMPANY, COURIER, PROCESS, PRODUCTS, SERVICES, SHOW_TESTIMONIALS, STOPS, TESTIMONIALS, tr, UI, WORK, type Lang,
} from '../content'
import { ContactDetails, CourierDetails, CzCommerceDetails, HomeDetails, LeadershipDetails, ProductDetails, ServiceDetails, TechDetails, WorkDetails } from '../components/details'
import { useStore } from '../store'

export function FlatSite({ lang, visible, onQuote }: { lang: Lang; visible: boolean; onQuote?: () => void }) {
  const title = (id: string) => tr(STOPS.find((s) => s.id === id)!.label, lang)
  return (
    <div className={`flat ${visible ? '' : 'offscreen'}`} lang={lang}>
      <nav className="flat-nav" aria-label={lang === 'bn' ? 'সেকশন' : 'Sections'}>
        {STOPS.map((s) => <a key={s.id} href={`#${s.id}`}>{tr(s.label, lang)}</a>)}
      </nav>
      <main id="content">
        <section id="home" className="flat-hero">
          <p className="eyebrow">{COMPANY.name} · {lang === 'bn' ? 'খুলনা' : 'Khulna'}</p>
          <h1>{tr(COMPANY.headline, lang)}</h1>
          <HomeDetails lang={lang} />
        </section>

        <section id="czcommerce" className="flat-cz">
          <h2>CZ Commerce</h2>
          <CzCommerceDetails lang={lang} />
        </section>

        <section id="services">
          <h2>{title('services')}</h2>
          <div className="grid">
            {SERVICES.map((s) => (
              <article key={s.id} className="card" id={`service-${s.id}`}>
                <h3 className="card-title">{tr(s.title, lang)}</h3>
                <ServiceDetails service={s} lang={lang} />
              </article>
            ))}
          </div>
        </section>

        <section id="products">
          <h2>{title('products')}</h2>
          <div className="grid">
            {PRODUCTS.map((p) => (
              <article key={p.id} className="card" id={`product-${p.id}`}>
                <h3 className="card-title">{p.name} <small>{tr(p.tagline, lang)}</small></h3>
                <ProductDetails product={p} lang={lang} />
              </article>
            ))}
          </div>
        </section>

        <section id="work">
          <h2>{title('work')}</h2>
          <div className="grid work">
            {WORK.map((w) => (
              <article key={w.id} className="card" id={`work-${w.id}`}>
                <h3 className="card-title">{w.name}</h3>
                <WorkDetails work={w} lang={lang} />
              </article>
            ))}
          </div>
        </section>

        <section id="tech">
          <h2>{title('tech')}</h2>
          <div className="card wide"><TechDetails lang={lang} /></div>
        </section>

        <section id="courier">
          <h2>{tr(COURIER.title, lang)}</h2>
          <div className="card wide"><CourierDetails lang={lang} /></div>
        </section>

        <section id="process">
          <h2>{title('process')}</h2>
          <ol className="process">
            {PROCESS.map((p, i) => (
              <li key={p.id} className="card">
                <span className="num">{i + 1}</span>
                <h3 className="card-title">{tr(p.title, lang)}</h3>
                <p>{tr(p.desc, lang)}</p>
              </li>
            ))}
          </ol>
        </section>

        {SHOW_TESTIMONIALS && TESTIMONIALS.length > 0 && (
          <section id="testimonials">
            <h2>{lang === 'bn' ? 'ক্লায়েন্টদের কথা' : 'What clients say'}</h2>
            {TESTIMONIALS.map((t) => (
              <blockquote key={t.name} className="card"><p>{tr(t.quote, lang)}</p><cite>{t.name}, {t.company}</cite></blockquote>
            ))}
          </section>
        )}

        <section id="contact">
          <h2>{tr(UI.contactTitle, lang)}</h2>
          <div className="card wide"><ContactDetails lang={lang} onQuote={onQuote} /></div>
        </section>

        <section id="leadership">
          <h2>{title('leadership')}</h2>
          <div className="card wide"><LeadershipDetails lang={lang} onBook={(who) => useStore.getState().openBooking(who)} /></div>
        </section>
      </main>
      <footer className="flat-foot">© {COMPANY.name} · {lang === 'bn' ? 'খুলনা, বাংলাদেশ' : 'Khulna, Bangladesh'}</footer>
    </div>
  )
}
