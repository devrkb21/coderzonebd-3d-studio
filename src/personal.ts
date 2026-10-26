// Personalised visits for outreach: `?for=<business name>&type=<kind>&lang=bn` greets a
// prospect by name at the storefront and shows a mock-up of their own online store inside.
import type { L, Lang } from './content'

export const SHOP_TYPES = ['fashion', 'food', 'electronics', 'cosmetics', 'grocery', 'other'] as const
export type ShopType = (typeof SHOP_TYPES)[number]

export const SHOP_TYPE_LABEL: Record<ShopType, L> = {
  fashion: { bn: 'ফ্যাশন', en: 'Fashion' },
  food: { bn: 'খাবার', en: 'Food' },
  electronics: { bn: 'ইলেকট্রনিক্স', en: 'Electronics' },
  cosmetics: { bn: 'কসমেটিকস', en: 'Cosmetics' },
  grocery: { bn: 'গ্রোসারি', en: 'Grocery' },
  other: { bn: 'অন্যান্য', en: 'Other' },
}

export const NAME_MAX = 32

/**
 * Cleans a visitor-supplied name: no control or bidi-override characters, single spaces,
 * at most NAME_MAX characters. It is only ever drawn on canvas or set as text, never as HTML.
 */
export function sanitizeName(raw: string | null | undefined): string | null {
  if (!raw) return null
  // eslint-disable-next-line no-control-regex
  const clean = raw.replace(/\s+/g, ' ').replace(/[\u0000-\u001F\u007F-\u009F\u200B\u200E\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, '').replace(/ {2,}/g, ' ').trim()
  const cut = Array.from(clean).slice(0, NAME_MAX).join('').trim()
  return cut || null
}

/** A sensible guess from the name when no `type` is given ("Rahim Fashion House" → fashion). */
function guessType(name: string): ShopType {
  const n = name.toLowerCase()
  if (/fashion|cloth|boutique|wear|style|saree|sari|panjabi|shoe|bag|ফ্যাশন|পোশাক/.test(n)) return 'fashion'
  if (/food|kitchen|cafe|café|restaurant|bakery|cake|biryani|pizza|burger|খাবার|রান্না/.test(n)) return 'food'
  if (/electr|gadget|mobile|phone|computer|tech|digital|ইলেকট্রনিক/.test(n)) return 'electronics'
  if (/beauty|cosmetic|skin|glow|makeup|care|বিউটি|কসমেটিক/.test(n)) return 'cosmetics'
  if (/grocery|bazar|bazaar|mart|super ?shop|store|বাজার|মুদি/.test(n)) return 'grocery'
  return 'other'
}

export interface Personal { name: string; type: ShopType }

function read(): Personal | null {
  if (typeof window === 'undefined') return null
  const q = new URLSearchParams(location.search)
  const name = sanitizeName(q.get('for'))
  if (!name) return null
  const t = q.get('type')?.toLowerCase() as ShopType | undefined
  return { name, type: t && SHOP_TYPES.includes(t) ? t : guessType(name) }
}

/** The prospect this visit is for, or null on a normal visit. */
export const PERSONAL = read()

export const welcomeLine = (name: string, lang: Lang) => (lang === 'bn' ? `স্বাগতম, ${name}` : `Welcome, ${name}`)

/** The shareable link for a prospect (used by the internal link maker at `?make-link`). */
export function personalLink(site: string, name: string, type: ShopType, lang: Lang) {
  const q = new URLSearchParams({ for: name, type })
  if (lang === 'bn') q.set('lang', 'bn')
  return `${site}?${q.toString()}`
}
