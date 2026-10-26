// Internal outreach tool at `?make-link` (not linked anywhere): builds a personalised visit link.
import { useEffect, useState } from 'react'
import type { Lang } from '../content'
import { NAME_MAX, personalLink, sanitizeName, SHOP_TYPE_LABEL, SHOP_TYPES, type ShopType } from '../personal'
import { Logo } from './Chrome'

async function copy(text: string) {
  try { await navigator.clipboard.writeText(text); return true } catch {
    const t = document.createElement('textarea')
    t.value = text
    document.body.appendChild(t)
    t.select()
    const ok = document.execCommand('copy')
    t.remove()
    return ok
  }
}

export function LinkMaker() {
  const [name, setName] = useState('')
  const [type, setType] = useState<ShopType>('fashion')
  const [lang, setLang] = useState<Lang>('en')
  const [copied, setCopied] = useState('')
  useEffect(() => {
    document.title = 'Link maker · Coder Zone BD'
    const m = document.createElement('meta')
    m.name = 'robots'
    m.content = 'noindex, nofollow'
    document.head.appendChild(m)
  }, [])

  const clean = sanitizeName(name)
  const link = clean ? personalLink(`${location.origin}${import.meta.env.BASE_URL}`, clean, type, lang) : ''
  const message = !clean ? '' : lang === 'bn'
    ? `আসসালামু আলাইকুম! ${clean}-এর জন্য আমরা একটা ছোট্ট 3D সারপ্রাইজ বানিয়েছি — আমাদের স্টুডিওতে আপনার অনলাইন স্টোরের প্রিভিউ দেখুন: ${link}`
    : `Hi! We made a little 3D surprise for ${clean}: walk into our studio and see a preview of your online store: ${link}`
  const doCopy = async (what: string, text: string) => { if (await copy(text)) { setCopied(what); setTimeout(() => setCopied(''), 1800) } }

  return (
    <main className="link-maker">
      <Logo size={40} />
      <h1>Personal link maker</h1>
      <p className="lm-note">Internal tool for outreach. The link greets the business by name at the storefront and shows a mock-up of their store inside.</p>
      <form className="quote-form" onSubmit={(e) => e.preventDefault()}>
        <label>Business name
          <input value={name} maxLength={NAME_MAX} onChange={(e) => setName(e.target.value)} placeholder="Rahim Fashion House" autoFocus />
        </label>
        <label>Type of shop
          <select value={type} onChange={(e) => setType(e.target.value as ShopType)}>
            {SHOP_TYPES.map((t) => <option key={t} value={t}>{SHOP_TYPE_LABEL[t].en} · {SHOP_TYPE_LABEL[t].bn}</option>)}
          </select>
        </label>
        <fieldset className="lm-lang">
          <legend>Language</legend>
          <label><input type="radio" name="lang" checked={lang === 'en'} onChange={() => setLang('en')} /> English</label>
          <label><input type="radio" name="lang" checked={lang === 'bn'} onChange={() => setLang('bn')} /> বাংলা</label>
        </fieldset>
      </form>
      {link && (
        <section className="lm-out">
          <label>Link
            <input readOnly value={link} onFocus={(e) => e.target.select()} />
          </label>
          <div className="actions">
            <button className="btn primary" onClick={() => doCopy('link', link)}>{copied === 'link' ? 'Copied ✓' : 'Copy link'}</button>
            <a className="btn" href={link} target="_blank" rel="noopener noreferrer">Preview</a>
          </div>
          <label>Message to send
            <textarea readOnly rows={4} value={message} />
          </label>
          <div className="actions">
            <button className="btn" onClick={() => doCopy('msg', message)}>{copied === 'msg' ? 'Copied ✓' : 'Copy message'}</button>
          </div>
        </section>
      )}
    </main>
  )
}
