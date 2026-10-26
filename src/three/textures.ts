// Everything with text in the room is drawn on a <canvas> at runtime, per
// language. Only the six project screenshots are image files.
import * as THREE from 'three'
import {
  COMPANY, CONTACT, COURIER, PROCESS, PRODUCTS, SERVICES, STOPS, TECH, TECH_LOGOS, WORK, tr, UI,
  type Lang, type ProductInfo, type Service, type StopId, type WorkItem,
} from '../content'

/** Coder Zone BD orange (from the logo) and its darker tone for text on light grounds. */
export const BRAND = '#FF931E'
export const BRAND_TEXT = '#D46A00'
export const INK = '#12141C'
export const PAGE = '#F6F7FA'
const MUTED = '#5B6070'
const FONT = '"Anek Bangla Variable", system-ui, sans-serif'
const font = (weight: number, size: number) => `${weight} ${size}px ${FONT}`

type Ctx = CanvasRenderingContext2D
const cache = new Map<string, THREE.CanvasTexture>()

function make(key: string, w: number, h: number, draw: (ctx: Ctx, w: number, h: number) => void) {
  const hit = cache.get(key)
  if (hit) return hit
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!
  draw(ctx, w, h)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  cache.set(key, tex)
  return tex
}

function rr(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

/** Draws wrapped text; returns the y below the last line. */
function wrap(ctx: Ctx, text: string, x: number, y: number, maxW: number, lineH: number, maxLines = 6) {
  const words = text.split(' ')
  let line = ''
  let lines = 0
  for (let i = 0; i < words.length; i++) {
    const test = line ? `${line} ${words[i]}` : words[i]
    if (ctx.measureText(test).width > maxW && line) {
      if (lines === maxLines - 1) { ctx.fillText(`${line}…`, x, y); return y + lineH }
      ctx.fillText(line, x, y)
      line = words[i]
      y += lineH
      lines++
    } else line = test
  }
  if (line) ctx.fillText(line, x, y)
  return y + lineH
}

// ── real logos (files under public/logos) ───────────────────
export const MARK = 'logos/coderzone-mark.png'
export const WORDMARK = 'logos/coderzone-wordmark.png'
const images = new Map<string, HTMLImageElement>()

function loadImage(base: string, path: string) {
  return new Promise<void>((resolve) => {
    if (images.has(path)) return resolve()
    const img = new Image()
    img.onload = () => { images.set(path, img); resolve() }
    img.onerror = () => resolve()
    img.src = `${base}${path}`
  })
}

export function loadLogos(base: string) {
  const paths = new Set<string>([MARK, WORDMARK, ...Object.values(TECH_LOGOS), ...Object.values(COURIER.logos), ...PRODUCTS.map((p) => p.logo)])
  return Promise.all([...paths].map((p) => loadImage(base, p)))
}

/** Draws a logo file to fit inside the box, keeping its aspect ratio; returns the drawn width (0 if not loaded). */
export function drawImg(ctx: Ctx, path: string, x: number, y: number, w: number, h: number, align: 'left' | 'center' = 'center') {
  const img = images.get(path)
  if (!img) return 0
  const iw = img.naturalWidth || img.width
  const ih = img.naturalHeight || img.height
  const k = Math.min(w / iw, h / ih)
  const dw = iw * k
  const dh = ih * k
  ctx.drawImage(img, align === 'center' ? x + (w - dw) / 2 : x, y + (h - dh) / 2, dw, dh)
  return dw
}

/** The Coder Zone BD mark. */
export function drawLogo(ctx: Ctx, x: number, y: number, size: number) {
  drawImg(ctx, MARK, x, y, size, size)
}

// ── home wall ────────────────────────────────────────────────
export function homeWallTexture(lang: Lang) {
  return make(`home|${lang}`, 1600, 900, (ctx, w, h) => {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = BRAND
    ctx.fillRect(0, h - 14, w, 14)
    if (!drawImg(ctx, WORDMARK, 90, 56, 640, 162, 'left')) {
      ctx.fillStyle = INK
      ctx.font = font(700, 64)
      ctx.fillText(COMPANY.name, 90, 160)
    }
    ctx.fillStyle = MUTED
    ctx.font = font(500, 32)
    ctx.textAlign = 'right'
    ctx.fillText(lang === 'bn' ? 'খুলনা · ২০২৪ থেকে' : 'Khulna · since 2024', w - 90, 150)
    ctx.textAlign = 'left'
    ctx.fillStyle = INK
    ctx.font = font(700, lang === 'bn' ? 76 : 80)
    wrap(ctx, tr(COMPANY.headline, lang), 90, 340, w - 180, lang === 'bn' ? 100 : 94, 3)
    const n = COMPANY.stats.length
    const gap = 28
    const bw = (w - 180 - gap * (n - 1)) / n
    COMPANY.stats.forEach((s, i) => {
      const x = 90 + i * (bw + gap)
      ctx.fillStyle = PAGE
      rr(ctx, x, 600, bw, 200, 14)
      ctx.fill()
      ctx.fillStyle = BRAND_TEXT
      ctx.font = font(700, 72)
      ctx.fillText(s.value, x + 30, 690)
      ctx.fillStyle = MUTED
      ctx.font = font(500, 30)
      wrap(ctx, tr(s.label, lang), x + 30, 744, bw - 50, 36, 2)
    })
  })
}

// ── service cards ────────────────────────────────────────────
export function serviceCardTexture(s: Service, lang: Lang) {
  return make(`svc|${s.id}|${lang}`, 384, 520, (ctx, w, h) => {
    ctx.fillStyle = '#ffffff'
    rr(ctx, 0, 0, w, h, 22)
    ctx.fill()
    ctx.fillStyle = BRAND
    rr(ctx, 0, 0, w, 150, 22)
    ctx.fill()
    ctx.fillRect(0, 120, w, 30)
    // hang hole
    ctx.fillStyle = '#ffffff'
    ctx.beginPath(); ctx.arc(w / 2, 26, 9, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = 'rgba(18,20,28,0.13)'
    ctx.font = font(700, 130)
    ctx.textAlign = 'right'
    ctx.fillText(s.letter.toUpperCase(), w - 22, 140)
    ctx.textAlign = 'left'
    ctx.fillStyle = INK
    ctx.font = font(600, 22)
    ctx.fillText(lang === 'bn' ? 'সার্ভিস' : 'SERVICE', 28, 74)
    ctx.fillStyle = INK
    ctx.font = font(700, 38)
    let y = wrap(ctx, tr(s.title, lang), 28, 208, w - 56, 44, 3)
    ctx.fillStyle = MUTED
    ctx.font = font(500, 25)
    y = wrap(ctx, tr(s.card, lang), 28, y + 6, w - 56, 32, 3)
    ctx.fillStyle = PAGE
    rr(ctx, 20, h - 104, w - 40, 80, 12)
    ctx.fill()
    ctx.fillStyle = BRAND_TEXT
    ctx.font = font(700, 30)
    const price = s.price ? (lang === 'bn' ? `${s.price.bn} থেকে` : `from ${s.price.en}`) : (lang === 'bn' ? 'আলোচনা সাপেক্ষে' : 'On discussion')
    ctx.fillText(price, 38, h - 54)
  })
}

// ── product boxes ────────────────────────────────────────────
export function productFrontTexture(p: ProductInfo, lang: Lang) {
  return make(`prod|${p.id}|${lang}`, 384, 480, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w, h)
    g.addColorStop(0, p.color)
    g.addColorStop(1, new THREE.Color(p.color).lerp(new THREE.Color('#000'), 0.35).getStyle())
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'
    ctx.lineWidth = 2
    for (let i = -h; i < w; i += 34) { ctx.beginPath(); ctx.moveTo(i, h); ctx.lineTo(i + h, 0); ctx.stroke() }
    ctx.fillStyle = '#ffffff'
    rr(ctx, 32, 32, 96, 96, 20)
    ctx.fill()
    drawImg(ctx, p.logo, 44, 44, 72, 72)
    ctx.fillStyle = '#ffffff'
    ctx.font = font(700, 50)
    wrap(ctx, p.name, 32, 220, w - 64, 56, 2)
    ctx.font = font(500, 26)
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    wrap(ctx, tr(p.tagline, lang), 32, 300, w - 64, 34, 3)
    if (p.comingSoon) {
      ctx.fillStyle = '#FFC93C'
      rr(ctx, 32, h - 88, 230, 52, 26)
      ctx.fill()
      ctx.fillStyle = INK
      ctx.font = font(700, 26)
      ctx.fillText(tr(UI.comingSoon, lang), 52, h - 52)
    } else if (p.tiers[0]) {
      ctx.fillStyle = 'rgba(255,255,255,0.95)'
      ctx.font = font(600, 26)
      ctx.fillText(p.tiers.map((t) => tr(t.price, lang).replace(/\/(মাস|mo)/, '')).slice(0, 2).join(' · ') + (p.tiers.length > 2 ? ' …' : ''), 32, h - 48)
    }
  })
}

// ── work posters ─────────────────────────────────────────────
const thumbs = new Map<string, HTMLImageElement>()

export function loadWorkThumbs(base: string) {
  return Promise.all(WORK.filter((w) => w.shot).map((w) => new Promise<void>((resolve) => {
    const img = new Image()
    img.onload = () => { thumbs.set(w.id, img); resolve() }
    img.onerror = () => resolve()
    img.src = `${base}work/${w.id}-thumb.jpg`
  })))
}

export function workPosterTexture(wk: WorkItem, lang: Lang) {
  return make(`work|${wk.id}|${lang}`, 512, 400, (ctx, w, h) => {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, w, h)
    const img = thumbs.get(wk.id)
    if (img) {
      ctx.drawImage(img, 0, 0, w, 320)
    } else {
      // Neutral card for projects without a public site: name and stack only.
      ctx.fillStyle = '#E9ECF5'
      ctx.fillRect(0, 0, w, 320)
      ctx.strokeStyle = 'rgba(255,147,30,0.18)'
      ctx.lineWidth = 2
      for (let x = 0; x < w; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 320); ctx.stroke() }
      for (let y = 0; y < 320; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke() }
      ctx.fillStyle = INK
      ctx.font = font(700, 44)
      const y = wrap(ctx, wk.name, 36, 120, w - 72, 50, 3)
      ctx.fillStyle = BRAND_TEXT
      ctx.font = font(600, 26)
      wrap(ctx, wk.stack, 36, y + 10, w - 72, 32, 2)
    }
    ctx.fillStyle = INK
    ctx.font = font(700, 30)
    ctx.fillText(wk.name.length > 26 ? `${wk.name.slice(0, 25)}…` : wk.name, 20, 360)
    ctx.fillStyle = MUTED
    ctx.font = font(500, 22)
    ctx.fillText(tr(wk.type, lang), 20, 390)
  })
}

// ── process boards ───────────────────────────────────────────
export function processTexture(i: number, lang: Lang) {
  const s = PROCESS[i]
  return make(`proc|${s.id}|${lang}`, 384, 486, (ctx, w, h) => {
    ctx.fillStyle = '#ffffff'
    rr(ctx, 0, 0, w, h, 20)
    ctx.fill()
    ctx.fillStyle = BRAND
    ctx.font = font(700, 120)
    ctx.fillText(lang === 'bn' ? '০১০২০৩০৪'.slice(i * 2, i * 2 + 2) : `0${i + 1}`, 30, 140)
    ctx.fillStyle = MUTED
    ctx.font = font(600, 24)
    ctx.fillText(`${tr(UI.step, lang)} ${lang === 'bn' ? '১২৩৪'[i] : i + 1}`, 34, 182)
    ctx.fillStyle = INK
    ctx.font = font(700, 40)
    const y = wrap(ctx, tr(s.title, lang), 30, 250, w - 60, 46, 2)
    ctx.fillStyle = MUTED
    ctx.font = font(500, 27)
    wrap(ctx, tr(s.desc, lang), 30, y + 10, w - 60, 36, 5)
    ctx.fillStyle = BRAND
    ctx.fillRect(0, h - 10, w * ((i + 1) / PROCESS.length), 10)
  })
}

// ── courier kiosk screen ─────────────────────────────────────
export function kioskTexture(lang: Lang) {
  return make(`kiosk|${lang}`, 520, 380, (ctx, w, h) => {
    ctx.fillStyle = INK
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = '#ffffff'
    ctx.font = font(700, 42)
    ctx.fillText(tr(COURIER.title, lang), 30, 66)
    ctx.fillStyle = '#A9B0C6'
    ctx.font = font(500, 22)
    wrap(ctx, lang === 'bn' ? 'ফোন নম্বর দিয়ে ৫টি কুরিয়ারে ডেলিভারি হিস্ট্রি দেখুন — ফ্রি' : 'Delivery history across 5 couriers by phone number — free', 30, 104, w - 60, 30, 2)
    // courier logos on white chips: 3 on top, 2 below
    const cw = (w - 60 - 2 * 10) / 3
    COURIER.couriers.forEach((c, i) => {
      const x = 30 + (i % 3) * (cw + 10) + (i >= 3 ? (cw + 10) / 2 : 0)
      const y = 148 + Math.floor(i / 3) * 62
      ctx.fillStyle = '#ffffff'
      rr(ctx, x, y, cw, 52, 12)
      ctx.fill()
      if (!drawImg(ctx, COURIER.logos[c], x + 12, y + 8, cw - 24, 36)) {
        ctx.fillStyle = INK
        ctx.font = font(600, 22)
        ctx.textAlign = 'center'
        ctx.fillText(c, x + cw / 2, y + 34)
        ctx.textAlign = 'left'
      }
    })
    ctx.fillStyle = BRAND
    rr(ctx, 30, h - 92, w - 60, 62, 14)
    ctx.fill()
    ctx.fillStyle = INK
    ctx.font = font(700, 28)
    ctx.textAlign = 'center'
    ctx.fillText(`${tr(COURIER.cta, lang)} →`, w / 2, h - 51)
    ctx.textAlign = 'left'
  })
}

// ── contact sign ─────────────────────────────────────────────
export function contactTexture(lang: Lang) {
  return make(`contact|${lang}`, 800, 490, (ctx, w, h) => {
    ctx.fillStyle = INK
    rr(ctx, 0, 0, w, h, 20)
    ctx.fill()
    ctx.fillStyle = BRAND
    ctx.fillRect(0, h - 12, w, 12)
    ctx.fillStyle = '#ffffff'
    rr(ctx, 40, 40, 76, 76, 16)
    ctx.fill()
    drawLogo(ctx, 46, 46, 64)
    ctx.fillStyle = '#ffffff'
    ctx.font = font(700, 52)
    ctx.fillText(tr(UI.contactTitle, lang), 134, 96)
    ctx.font = font(600, 34)
    const rows = [
      [lang === 'bn' ? 'ফোন' : 'Phone', CONTACT.phone],
      ['WhatsApp', CONTACT.whatsapp],
      [lang === 'bn' ? 'ঠিকানা' : 'Address', tr(CONTACT.address, lang)],
    ]
    rows.forEach(([k, val], i) => {
      ctx.fillStyle = '#FFB25C'
      ctx.font = font(500, 26)
      ctx.fillText(k, 44, 196 + i * 84)
      ctx.fillStyle = '#ffffff'
      ctx.font = font(600, 34)
      ctx.fillText(val, 44, 234 + i * 84)
    })
  })
}

export function deskTexture(lang: Lang) {
  return make(`desk|${lang}`, 512, 200, (ctx, w, h) => {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = BRAND
    ctx.fillRect(0, 0, w, 10)
    ctx.fillStyle = INK
    ctx.font = font(700, 40)
    ctx.textAlign = 'center'
    ctx.fillText(lang === 'bn' ? 'কোট ডেস্ক' : 'Quote desk', w / 2, 100)
    ctx.fillStyle = MUTED
    ctx.font = font(500, 24)
    ctx.fillText(CONTACT.email, w / 2, 148)
  })
}

// ── decor ────────────────────────────────────────────────────
export function techBoardTexture(lang: Lang) {
  return make(`tech|${lang}`, 1024, 540, (ctx, w, h) => {
    ctx.fillStyle = '#E9ECF5'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = 'rgba(18,20,28,0.18)'
    for (let y = 18; y < h; y += 36) for (let x = 18; x < w; x += 36) { ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill() }
    ctx.fillStyle = INK
    ctx.font = font(700, 40)
    ctx.fillText(lang === 'bn' ? 'আমাদের টেক স্ট্যাক' : 'Our tech stack', 40, 70)
    const cols = 5
    const tw = (w - 80 - (cols - 1) * 18) / cols
    TECH.forEach((t, i) => {
      const x = 40 + (i % cols) * (tw + 18)
      const y = 110 + Math.floor(i / cols) * 132
      ctx.fillStyle = '#ffffff'
      rr(ctx, x, y, tw, 116, 14)
      ctx.fill()
      const drew = drawImg(ctx, TECH_LOGOS[t], x + 20, y + 12, tw - 40, 58)
      ctx.fillStyle = INK
      ctx.font = font(700, drew ? 22 : 30)
      ctx.textAlign = 'center'
      ctx.fillText(t, x + tw / 2, drew ? y + 100 : y + 66)
      ctx.textAlign = 'left'
    })
  })
}

export function signTexture(stop: StopId, lang: Lang) {
  const label = tr(STOPS.find((s) => s.id === stop)!.label, lang)
  return make(`sign|${stop}|${lang}`, 512, 128, (ctx, w, h) => {
    ctx.fillStyle = INK
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = BRAND
    ctx.fillRect(0, h - 10, w, 10)
    ctx.fillStyle = '#ffffff'
    ctx.font = font(700, 58)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, w / 2, h / 2)
  })
}

/** Above the entrance, seen when you turn around: the wordmark and a thank-you line. */
export function frontWallTexture(lang: Lang) {
  return make(`front|${lang}`, 1400, 360, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h)
    drawImg(ctx, WORDMARK, 0, 10, w, 250)
    ctx.fillStyle = MUTED
    ctx.font = font(600, 40)
    ctx.textAlign = 'center'
    ctx.fillText(lang === 'bn' ? 'আসার জন্য ধন্যবাদ · coderzonebd.com' : 'Thanks for visiting · coderzonebd.com', w / 2, h - 30)
    ctx.textAlign = 'left'
  })
}

/** Soft cloudy mottling + fine grain, drawn wrapped so the texture tiles without seams. */
function mottle(ctx: Ctx, w: number, h: number, base: string, light: string, dark: string, seed: number, blobs = 70) {
  ctx.fillStyle = base
  ctx.fillRect(0, 0, w, h)
  const rnd = (i: number) => { const x = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453; return x - Math.floor(x) }
  for (let i = 0; i < blobs; i++) {
    const x = rnd(i) * w
    const y = rnd(i + 99) * h
    const r = 24 + rnd(i + 7) * 70
    for (const dx of [-w, 0, w]) {
      for (const dy of [-h, 0, h]) {
        const g = ctx.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, r)
        g.addColorStop(0, i % 2 ? light : dark)
        g.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = g
        ctx.fillRect(x + dx - r, y + dy - r, r * 2, r * 2)
      }
    }
  }
  const img = ctx.getImageData(0, 0, w, h)
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (rnd(i / 4 + 5) - 0.5) * 6
    img.data[i] += n
    img.data[i + 1] += n
    img.data[i + 2] += n
  }
  ctx.putImageData(img, 0, 0)
}

/** Warm limewash plaster for the walls. */
export function plasterTexture() {
  const t = make('plaster', 512, 512, (ctx, w, h) => mottle(ctx, w, h, '#F4EFE7', 'rgba(255,253,248,0.10)', 'rgba(170,150,120,0.05)', 1))
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  return t
}

/** Dark charcoal microcement for the feature wall behind the displays. */
export function microcementTexture() {
  const t = make('microcement', 512, 512, (ctx, w, h) => mottle(ctx, w, h, '#2C2F37', 'rgba(110,116,130,0.09)', 'rgba(8,10,14,0.10)', 2, 90))
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  return t
}

/** Oak wall panelling: vertical boards with grooves and grain. */
export function panelTexture() {
  const t = make('panel', 512, 256, (ctx, w, h) => {
    const board = w / 6
    for (let i = 0; i < 6; i++) {
      const tone = 0.92 + ((i * 41) % 9) / 100
      ctx.fillStyle = new THREE.Color('#B98E62').multiplyScalar(tone).getStyle()
      ctx.fillRect(i * board, 0, board, h)
      ctx.strokeStyle = 'rgba(90,60,30,0.12)'
      for (let g = 0; g < 6; g++) {
        const x = i * board + 6 + g * (board / 6)
        ctx.beginPath(); ctx.moveTo(x, 0)
        for (let y = 0; y <= h; y += 16) ctx.lineTo(x + Math.sin((y + i * 40 + g * 17) / 30) * 1.6, y)
        ctx.stroke()
      }
      ctx.fillStyle = 'rgba(40,26,14,0.55)'
      ctx.fillRect(i * board, 0, 3, h)
      ctx.fillStyle = 'rgba(255,240,215,0.18)'
      ctx.fillRect(i * board + 3, 0, 2, h)
    }
  })
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  return t
}

/** Backlit storefront sign: the wordmark on a white light box. */
export function signboardTexture() {
  return make('signboard', 1600, 320, (ctx, w, h) => {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, w, h)
    drawImg(ctx, WORDMARK, 60, 30, w - 120, h - 60)
  })
}

export function floorTexture() {
  const tex = make('floor', 512, 512, (ctx, w, h) => {
    const plank = h / 8
    for (let i = 0; i < 8; i++) {
      const tone = 0.94 + ((i * 37) % 7) / 100
      ctx.fillStyle = new THREE.Color('#d9c3a3').multiplyScalar(tone).getStyle()
      ctx.fillRect(0, i * plank, w, plank)
      ctx.strokeStyle = 'rgba(120,90,55,0.10)'
      for (let g = 0; g < 5; g++) {
        const y = i * plank + 8 + g * (plank / 5)
        ctx.beginPath(); ctx.moveTo(0, y)
        for (let x = 0; x <= w; x += 32) ctx.lineTo(x, y + Math.sin((x + i * 50 + g * 13) / 40) * 2)
        ctx.stroke()
      }
      ctx.fillStyle = 'rgba(90,65,35,0.25)'
      ctx.fillRect(0, i * plank, w, 2)
      ctx.fillRect(((i * 173) % 400) + 50, i * plank, 2, plank)
    }
  })
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(5, 4)
  return tex
}

/** Fonts, screenshots, then every texture for the current language, yielding so the loader can update. */
export async function prepareTextures(lang: Lang, base: string, onProgress: (p: number) => void) {
  try {
    await Promise.race([
      Promise.all([
        document.fonts.load(font(700, 40), 'আমরা Aa'),
        document.fonts.load(font(500, 40), 'আমরা Aa'),
      ]),
      new Promise((r) => setTimeout(r, 4000)),
    ])
  } catch { /* fall back to system font */ }
  onProgress(0.2)
  await Promise.all([loadWorkThumbs(base), loadLogos(base)])
  onProgress(0.45)
  const jobs: (() => unknown)[] = [
    floorTexture, () => homeWallTexture(lang), () => frontWallTexture(lang), () => kioskTexture(lang), () => contactTexture(lang), () => deskTexture(lang), () => techBoardTexture(lang),
    ...STOPS.map((s) => () => signTexture(s.id, lang)),
    ...SERVICES.map((s) => () => serviceCardTexture(s, lang)),
    ...PRODUCTS.map((p) => () => productFrontTexture(p, lang)),
    ...WORK.map((wk) => () => workPosterTexture(wk, lang)),
    ...PROCESS.map((_, i) => () => processTexture(i, lang)),
  ]
  for (let i = 0; i < jobs.length; i++) {
    jobs[i]()
    if (i % 4 === 3) {
      onProgress(0.45 + (0.55 * (i + 1)) / jobs.length)
      await new Promise((r) => setTimeout(r, 0))
    }
  }
  onProgress(1)
}
