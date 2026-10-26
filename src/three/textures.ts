// Everything with text in the room is drawn on a <canvas> at runtime, per
// language. Only the six project screenshots are image files.
import * as THREE from 'three'
import {
  COMPANY, CONTACT, COURIER, PROCESS, PRODUCTS, SERVICES, STOPS, TECH, WORK, tr, UI,
  type Lang, type ProductInfo, type Service, type StopId, type WorkItem,
} from '../content'

export const BLUE = '#2B3FD6'
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

/** The CZ mark from the favicon (44×44 viewBox). */
export function drawLogo(ctx: Ctx, x: number, y: number, size: number, bg = BLUE, fg = '#ffffff') {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(size / 44, size / 44)
  ctx.fillStyle = bg
  rr(ctx, 0, 0, 44, 44, 10)
  ctx.fill()
  ctx.translate(1.25, 0)
  ctx.strokeStyle = fg
  ctx.lineWidth = 4.2
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.stroke(new Path2D('M19.3 16.2A7.6 7.6 0 1 0 19.3 27.8'))
  ctx.stroke(new Path2D('M24.6 14.8h9.2l-9.2 14.4h9.6'))
  ctx.restore()
}

// ── home wall ────────────────────────────────────────────────
export function homeWallTexture(lang: Lang) {
  return make(`home|${lang}`, 1600, 900, (ctx, w, h) => {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = BLUE
    ctx.fillRect(0, h - 14, w, 14)
    drawLogo(ctx, 90, 80, 120)
    ctx.fillStyle = INK
    ctx.font = font(700, 64)
    ctx.textBaseline = 'middle'
    ctx.fillText(COMPANY.name, 236, 128)
    ctx.fillStyle = MUTED
    ctx.font = font(500, 32)
    ctx.fillText(lang === 'bn' ? 'খুলনা · ২০২৪ থেকে' : 'Khulna · since 2024', 240, 182)
    ctx.textBaseline = 'alphabetic'
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
      ctx.fillStyle = BLUE
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
    ctx.fillStyle = BLUE
    rr(ctx, 0, 0, w, 150, 22)
    ctx.fill()
    ctx.fillRect(0, 120, w, 30)
    // hang hole
    ctx.fillStyle = '#ffffff'
    ctx.beginPath(); ctx.arc(w / 2, 26, 9, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.22)'
    ctx.font = font(700, 130)
    ctx.textAlign = 'right'
    ctx.fillText(s.letter.toUpperCase(), w - 22, 140)
    ctx.textAlign = 'left'
    ctx.fillStyle = '#ffffff'
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
    ctx.fillStyle = BLUE
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
    drawLogo(ctx, 32, 32, 64, '#ffffff', p.color)
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
      ctx.strokeStyle = 'rgba(43,63,214,0.12)'
      ctx.lineWidth = 2
      for (let x = 0; x < w; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 320); ctx.stroke() }
      for (let y = 0; y < 320; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke() }
      ctx.fillStyle = INK
      ctx.font = font(700, 44)
      const y = wrap(ctx, wk.name, 36, 120, w - 72, 50, 3)
      ctx.fillStyle = BLUE
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
    ctx.fillStyle = BLUE
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
    ctx.fillStyle = BLUE
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
    let x = 30
    let y = 180
    ctx.font = font(600, 22)
    for (const c of COURIER.couriers) {
      const tw = ctx.measureText(c).width + 32
      if (x + tw > w - 30) { x = 30; y += 50 }
      ctx.fillStyle = 'rgba(255,255,255,0.1)'
      rr(ctx, x, y - 30, tw, 40, 20)
      ctx.fill()
      ctx.fillStyle = '#ffffff'
      ctx.fillText(c, x + 16, y - 3)
      x += tw + 10
    }
    ctx.fillStyle = BLUE
    rr(ctx, 30, h - 92, w - 60, 62, 14)
    ctx.fill()
    ctx.fillStyle = '#ffffff'
    ctx.font = font(700, 28)
    ctx.textAlign = 'center'
    ctx.fillText(`${tr(COURIER.cta, lang)} →`, w / 2, h - 51)
    ctx.textAlign = 'left'
  })
}

// ── contact sign ─────────────────────────────────────────────
export function contactTexture(lang: Lang) {
  return make(`contact|${lang}`, 800, 490, (ctx, w, h) => {
    ctx.fillStyle = BLUE
    rr(ctx, 0, 0, w, h, 20)
    ctx.fill()
    drawLogo(ctx, 40, 40, 72, '#ffffff', BLUE)
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
      ctx.fillStyle = 'rgba(255,255,255,0.7)'
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
    ctx.fillStyle = BLUE
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
      rr(ctx, x, y, tw, 108, 14)
      ctx.fill()
      ctx.fillStyle = i % 3 === 0 ? BLUE : INK
      ctx.font = font(700, 30)
      ctx.textAlign = 'center'
      ctx.fillText(t, x + tw / 2, y + 66)
      ctx.textAlign = 'left'
    })
  })
}

export function signTexture(stop: StopId, lang: Lang) {
  const label = tr(STOPS.find((s) => s.id === stop)!.label, lang)
  return make(`sign|${stop}|${lang}`, 512, 128, (ctx, w, h) => {
    ctx.fillStyle = INK
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = BLUE
    ctx.fillRect(0, h - 10, w, 10)
    ctx.fillStyle = '#ffffff'
    ctx.font = font(700, 58)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, w / 2, h / 2)
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
  await loadWorkThumbs(base)
  onProgress(0.45)
  const jobs: (() => unknown)[] = [
    floorTexture, () => homeWallTexture(lang), () => kioskTexture(lang), () => contactTexture(lang), () => deskTexture(lang), () => techBoardTexture(lang),
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
