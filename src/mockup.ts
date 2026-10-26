// A believable mock-up of a prospect's own online store home page (`?for=` visits), drawn on
// canvas: their name as the logo, a palette and illustrated product tiles that fit their trade.
// Shown on the welcome stand in the room and in the welcome card.
import { tr, type L, type Lang } from './content'
import { welcomeLine, type ShopType } from './personal'

type Ctx = CanvasRenderingContext2D
type Shape = 'shirt' | 'dress' | 'bag' | 'shoe' | 'burger' | 'cake' | 'cup' | 'pizza' | 'phone' | 'headphones' | 'laptop' | 'watch'
  | 'lipstick' | 'serum' | 'jar' | 'perfume' | 'fruit' | 'sack' | 'milk' | 'basket' | 'gift' | 'box' | 'tag' | 'star'

interface Kit { primary: string; soft: string; dark: string; hero: L; heroShape: Shape; items: [L, number, Shape][] }

const KITS: Record<ShopType, Kit> = {
  fashion: {
    primary: '#B83280', soft: '#FDE8F1', dark: '#3B1730', heroShape: 'dress',
    hero: { bn: 'নতুন সিজনের কালেকশন', en: 'New season collection' },
    items: [[{ bn: 'পাঞ্জাবি', en: 'Panjabi' }, 1850, 'shirt'], [{ bn: 'শাড়ি', en: 'Saree' }, 3200, 'dress'], [{ bn: 'হ্যান্ডব্যাগ', en: 'Handbag' }, 1450, 'bag'], [{ bn: 'স্নিকার্স', en: 'Sneakers' }, 2600, 'shoe']],
  },
  food: {
    primary: '#E4572E', soft: '#FFF1E6', dark: '#3A1F12', heroShape: 'burger',
    hero: { bn: 'গরম গরম, দরজায় পৌঁছে', en: 'Hot & fresh, delivered' },
    items: [[{ bn: 'বিফ বার্গার', en: 'Beef burger' }, 280, 'burger'], [{ bn: 'চকলেট কেক', en: 'Chocolate cake' }, 950, 'cake'], [{ bn: 'কফি', en: 'Coffee' }, 180, 'cup'], [{ bn: 'পিৎজা', en: 'Pizza' }, 650, 'pizza']],
  },
  electronics: {
    primary: '#2563EB', soft: '#E8F0FF', dark: '#0F1B3D', heroShape: 'headphones',
    hero: { bn: 'নতুন গ্যাজেট, সেরা দামে', en: 'Latest gadgets, best price' },
    items: [[{ bn: 'স্মার্টফোন', en: 'Smartphone' }, 18500, 'phone'], [{ bn: 'হেডফোন', en: 'Headphones' }, 2400, 'headphones'], [{ bn: 'ল্যাপটপ', en: 'Laptop' }, 62000, 'laptop'], [{ bn: 'স্মার্টওয়াচ', en: 'Smartwatch' }, 3900, 'watch']],
  },
  cosmetics: {
    primary: '#C26D7E', soft: '#FBEDEF', dark: '#40232A', heroShape: 'perfume',
    hero: { bn: 'প্রতিদিন উজ্জ্বল ত্বক', en: 'Glow every day' },
    items: [[{ bn: 'লিপস্টিক', en: 'Lipstick' }, 650, 'lipstick'], [{ bn: 'ফেস সিরাম', en: 'Face serum' }, 1200, 'serum'], [{ bn: 'নাইট ক্রিম', en: 'Night cream' }, 890, 'jar'], [{ bn: 'পারফিউম', en: 'Perfume' }, 2100, 'perfume']],
  },
  grocery: {
    primary: '#2E9E5B', soft: '#E8F7EE', dark: '#123A24', heroShape: 'basket',
    hero: { bn: 'প্রতিদিনের বাজার, ঘরে বসে', en: 'Daily groceries, delivered home' },
    items: [[{ bn: 'আম (১ কেজি)', en: 'Mango (1 kg)' }, 180, 'fruit'], [{ bn: 'মিনিকেট চাল (৫ কেজি)', en: 'Miniket rice (5 kg)' }, 420, 'sack'], [{ bn: 'দুধ (১ লিটার)', en: 'Milk (1 L)' }, 95, 'milk'], [{ bn: 'সবজির ঝুড়ি', en: 'Veg basket' }, 320, 'basket']],
  },
  other: {
    primary: '#6D4AFF', soft: '#EFEBFF', dark: '#221A47', heroShape: 'gift',
    hero: { bn: 'আমাদের সেরা পণ্যগুলো', en: 'Shop our best sellers' },
    items: [[{ bn: 'গিফট বক্স', en: 'Gift box' }, 1200, 'gift'], [{ bn: 'বেস্ট সেলার', en: 'Best seller' }, 850, 'star'], [{ bn: 'নতুন পণ্য', en: 'New arrival' }, 990, 'tag'], [{ bn: 'কম্বো প্যাক', en: 'Combo pack' }, 1500, 'box']],
  },
}

const FONT = '"Anek Bangla Variable", system-ui, sans-serif'
const BN_DIGITS = '০১২৩৪৫৬৭৮৯'
const price = (n: number, lang: Lang) => {
  const s = n.toLocaleString('en-US')
  return `৳${lang === 'bn' ? s.replace(/\d/g, (d) => BN_DIGITS[+d]) : s}`
}

/** Sets the largest font (up to `size`) that fits `text` in `maxW`. */
function fit(ctx: Ctx, text: string, weight: number, size: number, maxW: number) {
  let s = size
  do { ctx.font = `${weight} ${s}px ${FONT}`; s -= 2 } while (ctx.measureText(text).width > maxW && s > 12)
}

function rr(ctx: Ctx, x: number, y: number, w: number, h: number, r: number, fill: string) {
  ctx.fillStyle = fill
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
  ctx.fill()
}

/** Simple flat product illustrations, centred on (x, y), about `s` px across. */
function shape(ctx: Ctx, kind: Shape, x: number, y: number, s: number, c: string, d: string) {
  const u = s / 100
  const R = (rx: number, ry: number, w: number, h: number, r: number, f: string) => rr(ctx, x + rx * u, y + ry * u, w * u, h * u, r * u, f)
  const C = (cx: number, cy: number, r: number, f: string) => { ctx.fillStyle = f; ctx.beginPath(); ctx.arc(x + cx * u, y + cy * u, r * u, 0, Math.PI * 2); ctx.fill() }
  const P = (f: string, pts: number[]) => { ctx.fillStyle = f; ctx.beginPath(); for (let i = 0; i < pts.length; i += 2) ctx.lineTo(x + pts[i] * u, y + pts[i + 1] * u); ctx.closePath(); ctx.fill() }
  switch (kind) {
    case 'shirt': P(c, [-20, -45, -50, -30, -42, -8, -28, -14, -28, 45, 28, 45, 28, -14, 42, -8, 50, -30, 20, -45, 0, -32]); P(d, [-8, -40, 0, -30, 8, -40]); break
    case 'dress': P(c, [-14, -45, 14, -45, 18, -12, 42, 45, -42, 45, -18, -12]); R(-18, -16, 36, 6, 3, d); break
    case 'bag': ctx.strokeStyle = d; ctx.lineWidth = 7 * u; ctx.beginPath(); ctx.arc(x, y - 18 * u, 20 * u, Math.PI, 0); ctx.stroke(); R(-40, -18, 80, 60, 12, c); R(-8, -2, 16, 10, 3, d); break
    case 'shoe': P(c, [-45, 5, -40, -25, -15, -25, 0, -8, 40, 0, 46, 18, -45, 18]); R(-46, 18, 92, 10, 5, d); break
    case 'burger': R(-42, -34, 84, 30, 30, '#E9A23B'); R(-46, -6, 92, 10, 5, '#5BAE4A'); R(-44, 4, 88, 14, 6, d); R(-42, 20, 84, 20, 10, '#E9A23B'); break
    case 'cake': P(c, [-40, 40, -40, -10, 40, -30, 40, 40]); P(d, [-40, -10, 40, -30, 40, -16, -40, 4]); C(30, -38, 7, '#E23B3B'); break
    case 'cup': R(-32, -28, 56, 66, 10, c); ctx.strokeStyle = c; ctx.lineWidth = 8 * u; ctx.beginPath(); ctx.arc(x + 26 * u, y + 2 * u, 14 * u, -Math.PI / 2, Math.PI / 2); ctx.stroke(); R(-40, 38, 72, 8, 4, d); break
    case 'pizza': P('#E9B04B', [0, 45, -45, -35, 45, -35]); P(c, [0, 32, -34, -26, 34, -26]); C(-8, -12, 6, d); C(12, -6, 6, d); C(0, 12, 6, d); break
    case 'phone': R(-24, -45, 48, 90, 10, d); R(-19, -36, 38, 68, 4, c); C(0, 38, 3, '#fff'); break
    case 'headphones': ctx.strokeStyle = d; ctx.lineWidth = 9 * u; ctx.beginPath(); ctx.arc(x, y + 5 * u, 36 * u, Math.PI, 0); ctx.stroke(); R(-46, 0, 20, 38, 8, c); R(26, 0, 20, 38, 8, c); break
    case 'laptop': R(-38, -36, 76, 52, 6, d); R(-32, -30, 64, 40, 3, c); P(d, [-48, 20, 48, 20, 42, 32, -42, 32]); break
    case 'watch': R(-12, -45, 24, 90, 6, d); R(-24, -24, 48, 48, 12, d); R(-18, -18, 36, 36, 9, c); break
    case 'lipstick': R(-14, -5, 28, 48, 4, d); R(-10, -18, 20, 14, 2, '#C9A24A'); P(c, [-10, -18, -10, -38, 10, -48, 10, -18]); break
    case 'serum': R(-22, -10, 44, 54, 10, c); R(-10, -24, 20, 14, 3, d); R(-6, -46, 12, 22, 6, d); break
    case 'jar': R(-38, -16, 76, 54, 14, c); R(-40, -30, 80, 16, 6, d); R(-24, 2, 48, 18, 4, '#ffffff'); break
    case 'perfume': R(-30, -14, 60, 58, 14, c); R(-8, -28, 16, 14, 2, d); R(-16, -44, 32, 16, 5, d); break
    case 'fruit': C(0, 6, 36, '#F2B321'); C(-6, -4, 12, '#F8D35E'); P('#4F9D3A', [0, -28, 18, -46, 28, -36, 8, -26]); break
    case 'sack': P(c, [-34, -30, 34, -30, 42, 44, -42, 44]); R(-38, -40, 76, 12, 4, d); R(-22, 2, 44, 20, 3, '#ffffff'); break
    case 'milk': P(c, [-24, -20, 0, -44, 24, -20, 24, 45, -24, 45]); R(-24, 0, 48, 22, 2, d); break
    case 'basket': C(-18, -14, 14, '#E23B3B'); C(10, -18, 14, '#F2B321'); C(26, -6, 12, '#5BAE4A'); P(c, [-46, -4, 46, -4, 36, 42, -36, 42]); R(-46, -8, 92, 10, 4, d); break
    case 'gift': R(-40, -18, 80, 60, 6, c); R(-44, -30, 88, 16, 4, c); R(-6, -30, 12, 72, 0, d); P(d, [0, -30, -22, -48, -12, -30]); P(d, [0, -30, 22, -48, 12, -30]); break
    case 'box': P(c, [-40, -20, 0, -40, 40, -20, 40, 26, 0, 46, -40, 26]); P(d, [0, 2, 40, -20, 40, 26, 0, 46]); break
    case 'tag': P(c, [-40, -30, 18, -30, 44, 0, 18, 30, -40, 30]); C(14, 0, 7, '#ffffff'); break
    case 'star': { const pts: number[] = []; for (let i = 0; i < 10; i++) { const r = i % 2 ? 20 : 46; const a = -Math.PI / 2 + (i * Math.PI) / 5; pts.push(Math.cos(a) * r, Math.sin(a) * r) } P(c, pts); break }
  }
}

const cache = new Map<string, HTMLCanvasElement>()

/** The stand's screen: a welcome line, the store mock-up and the CZ Commerce pitch (900×1400). */
export function storeMockup(name: string, type: ShopType, lang: Lang) {
  const key = `${name}|${type}|${lang}`
  const hit = cache.get(key)
  if (hit) return hit
  const k = KITS[type]
  const bn = lang === 'bn'
  const c = document.createElement('canvas')
  const W = (c.width = 900)
  const H = (c.height = 1400)
  const ctx = c.getContext('2d')!
  ctx.textBaseline = 'alphabetic'

  // welcome header
  ctx.fillStyle = '#12141C'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#FF931E'
  ctx.fillRect(0, 0, W, 10)
  ctx.textAlign = 'center'
  ctx.fillStyle = '#FF931E'
  fit(ctx, welcomeLine(name, lang), 700, 64, W - 80)
  ctx.fillText(welcomeLine(name, lang), W / 2, 100)
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.font = `500 28px ${FONT}`
  ctx.fillText(bn ? 'আপনার জন্য একটা অনলাইন স্টোর বানিয়ে রেখেছি' : 'We made a little preview of your online store', W / 2, 148)

  // browser frame
  const bx = 40, by = 185, bw = W - 80, bh = 905
  rr(ctx, bx, by, bw, bh, 22, '#ffffff')
  rr(ctx, bx, by, bw, 52, 22, '#E9EBF0')
  ctx.fillStyle = '#E9EBF0'
  ctx.fillRect(bx, by + 30, bw, 22)
  ;['#FF5F57', '#FEBC2E', '#28C840'].forEach((col, i) => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(bx + 30 + i * 24, by + 26, 8, 0, Math.PI * 2); ctx.fill() })
  rr(ctx, bx + 120, by + 12, bw - 160, 28, 14, '#ffffff')
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 22) || 'yourstore'
  ctx.fillStyle = '#5B6070'
  ctx.font = `500 18px ${FONT}`
  ctx.textAlign = 'left'
  ctx.fillText(`${slug}.com`, bx + 136, by + 32)

  // store nav: their name as the logo
  const nx = bx + 28, ny = by + 100
  ctx.fillStyle = k.primary
  ctx.beginPath(); ctx.arc(nx + 20, ny - 10, 20, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#ffffff'
  ctx.font = `700 22px ${FONT}`
  ctx.textAlign = 'center'
  ctx.fillText(Array.from(name)[0]?.toUpperCase() ?? '', nx + 20, ny - 2)
  ctx.textAlign = 'left'
  ctx.fillStyle = k.dark
  fit(ctx, name, 700, 30, bw - 220)
  ctx.fillText(name, nx + 52, ny)
  // cart icon with a count
  const cx = bx + bw - 60
  ctx.strokeStyle = k.dark
  ctx.lineWidth = 3
  ctx.beginPath(); ctx.moveTo(cx - 16, ny - 26); ctx.lineTo(cx - 10, ny - 26); ctx.lineTo(cx - 4, ny - 4); ctx.lineTo(cx + 16, ny - 4); ctx.lineTo(cx + 20, ny - 20); ctx.lineTo(cx - 8, ny - 20); ctx.stroke()
  ctx.fillStyle = k.primary
  ctx.beginPath(); ctx.arc(cx + 18, ny - 28, 10, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.font = `700 13px ${FONT}`
  ctx.textAlign = 'center'
  ctx.fillText(bn ? '২' : '2', cx + 18, ny - 23)

  // hero banner
  const hx = bx + 24, hy = by + 130, hw = bw - 48, hh = 260
  rr(ctx, hx, hy, hw, hh, 18, k.soft)
  ctx.textAlign = 'left'
  ctx.fillStyle = k.dark
  fit(ctx, tr(k.hero, lang), 700, 40, hw * 0.58)
  ctx.fillText(tr(k.hero, lang), hx + 30, hy + 86)
  ctx.fillStyle = '#5B6070'
  ctx.font = `500 21px ${FONT}`
  ctx.fillText(bn ? 'ক্যাশ অন ডেলিভারি · বিকাশ · সারাদেশে' : 'Cash on delivery · bKash · nationwide', hx + 30, hy + 128)
  rr(ctx, hx + 30, hy + 160, 190, 54, 27, k.primary)
  ctx.fillStyle = '#fff'
  ctx.font = `700 22px ${FONT}`
  ctx.textAlign = 'center'
  ctx.fillText(bn ? 'এখনই কিনুন' : 'Shop now', hx + 125, hy + 195)
  ctx.fillStyle = 'rgba(255,255,255,0.75)'
  ctx.beginPath(); ctx.arc(hx + hw - 130, hy + hh / 2, 105, 0, Math.PI * 2); ctx.fill()
  shape(ctx, k.heroShape, hx + hw - 130, hy + hh / 2, 150, k.primary, k.dark)

  // product tiles
  const gy = hy + hh + 30
  const tw = (hw - 24) / 2, th = 205
  k.items.forEach(([label, amount, kind], i) => {
    const tx = hx + (i % 2) * (tw + 24)
    const ty = gy + Math.floor(i / 2) * (th + 22)
    rr(ctx, tx, ty, tw, th, 16, '#F6F7FA')
    rr(ctx, tx + 14, ty + 14, 120, th - 28, 12, k.soft)
    shape(ctx, kind, tx + 74, ty + th / 2, 86, k.primary, k.dark)
    ctx.textAlign = 'left'
    ctx.fillStyle = '#12141C'
    fit(ctx, tr(label, lang), 600, 24, tw - 170)
    ctx.fillText(tr(label, lang), tx + 152, ty + 62)
    ctx.fillStyle = k.primary
    ctx.font = `700 28px ${FONT}`
    ctx.fillText(price(amount, lang), tx + 152, ty + 104)
    rr(ctx, tx + 152, ty + 128, tw - 172, 44, 22, k.dark)
    ctx.fillStyle = '#fff'
    fit(ctx, bn ? 'কার্টে যোগ করুন' : 'Add to cart', 600, 18, tw - 196)
    ctx.textAlign = 'center'
    ctx.fillText(bn ? 'কার্টে যোগ করুন' : 'Add to cart', tx + 152 + (tw - 172) / 2, ty + 157)
  })

  // the pitch
  ctx.textAlign = 'center'
  ctx.fillStyle = '#ffffff'
  const pitch = bn ? 'এটাই হতে পারে আপনার স্টোর' : 'This could be your store'
  fit(ctx, pitch, 700, 50, W - 80)
  ctx.fillText(pitch, W / 2, 1160)
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.font = `500 30px ${FONT}`
  ctx.fillText(bn ? 'CZ Commerce দিয়ে, বানিয়ে দেবে Coder Zone BD' : 'with CZ Commerce, built by Coder Zone BD', W / 2, 1208)
  rr(ctx, W / 2 - 210, 1250, 420, 84, 42, '#FF931E')
  ctx.fillStyle = '#12141C'
  ctx.font = `700 32px ${FONT}`
  ctx.fillText(bn ? 'এই স্টোরটা চাই →' : 'Get this store →', W / 2, 1303)

  cache.set(key, c)
  return c
}
