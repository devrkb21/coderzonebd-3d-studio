// Canvas textures for the people's places: cabin nameplates, the founders' AI-assistant
// screens, the reception screen, the open/closed door sign and the monitors' screen saver.
import * as THREE from 'three'
import type { Lang } from '../content'
import { BRAND, INK, drawLogo } from './textures'

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
  ctx.textBaseline = 'middle'
  draw(ctx, w, h)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  cache.set(key, tex)
  return tex
}

function dot(ctx: Ctx, x: number, y: number, r: number, color: string) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()
}

/** Brushed-ink plaque on the cabin glass: name, then the roles in brand orange. */
export function nameplateTexture(name: string, role: string) {
  return make(`plate|${name}`, 768, 192, (ctx, w, h) => {
    ctx.fillStyle = INK
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = BRAND
    ctx.fillRect(0, 0, 12, h)
    ctx.fillStyle = '#ffffff'
    ctx.font = font(700, 72)
    ctx.fillText(name, 48, 74)
    ctx.fillStyle = BRAND
    ctx.font = font(600, 46)
    ctx.fillText(role, 48, 146)
  })
}

/** A founder's AI assistant, on a desk screen facing the visitor. */
export function assistantTexture(name: string, role: string, lang: Lang) {
  const initials = name.split(' ').map((p) => p[0]).join('')
  return make(`ai|${name}|${lang}`, 640, 400, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h)
    g.addColorStop(0, '#1B1F2B')
    g.addColorStop(1, '#0E1016')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
    // avatar ring with initials and a soft glow
    ctx.shadowColor = BRAND
    ctx.shadowBlur = 30
    ctx.strokeStyle = BRAND
    ctx.lineWidth = 8
    ctx.beginPath()
    ctx.arc(110, 130, 62, 0, Math.PI * 2)
    ctx.stroke()
    ctx.shadowBlur = 0
    ctx.fillStyle = '#ffffff'
    ctx.font = font(700, 54)
    ctx.textAlign = 'center'
    ctx.fillText(initials, 110, 134)
    ctx.textAlign = 'left'
    ctx.font = font(700, 40)
    ctx.fillText(lang === 'bn' ? 'AI সহকারী' : 'AI assistant', 200, 104)
    ctx.fillStyle = '#9AA0AE'
    ctx.font = font(500, 30)
    ctx.fillText(`${name} · ${role}`, 200, 152)
    dot(ctx, 214, 196, 9, '#36E07A')
    ctx.fillStyle = '#36E07A'
    ctx.font = font(600, 26)
    ctx.fillText(lang === 'bn' ? 'অনলাইন · ২৪/৭' : 'Online · 24/7', 232, 198)
    // the "ask" button
    ctx.fillStyle = BRAND
    ctx.beginPath()
    ctx.roundRect(40, 268, w - 80, 86, 43)
    ctx.fill()
    ctx.fillStyle = INK
    ctx.font = font(700, 38)
    ctx.textAlign = 'center'
    ctx.fillText(lang === 'bn' ? 'আমাকে জিজ্ঞেস করুন →' : 'Ask me anything →', w / 2, 313)
  })
}

/** The visitor-facing screen on the reception counter: a welcome, or closed with the AI still on. */
export function receptionTexture(open: boolean, back: string, lang: Lang) {
  return make(`reception|${open}|${back}|${lang}`, 640, 400, (ctx, w, h) => {
    ctx.fillStyle = '#12141C'
    ctx.fillRect(0, 0, w, h)
    drawLogo(ctx, 40, 34, 70)
    ctx.fillStyle = '#ffffff'
    ctx.font = font(700, 34)
    ctx.fillText('Coder Zone BD', 126, 70)
    ctx.font = font(700, 44)
    if (open) {
      ctx.fillText(lang === 'bn' ? 'স্বাগতম!' : 'Welcome!', 40, 170)
      ctx.fillStyle = '#C9CDD6'
      ctx.font = font(500, 32)
      ctx.fillText(lang === 'bn' ? 'আমাদের AI রিসেপশনিস্টকে' : 'Ask our AI receptionist', 40, 228)
      ctx.fillText(lang === 'bn' ? 'যেকোনো প্রশ্ন করুন।' : 'anything about us.', 40, 268)
    } else {
      ctx.fillStyle = '#FF6B5A'
      ctx.fillText(lang === 'bn' ? 'আমরা এখন বন্ধ।' : "We're closed.", 40, 160)
      ctx.fillStyle = '#ffffff'
      ctx.font = font(500, 32)
      ctx.fillText(lang === 'bn' ? 'তবে AI রিসেপশনিস্ট এখনও আছে।' : 'Our AI receptionist is still here.', 40, 214)
      ctx.fillStyle = '#9AA0AE'
      ctx.font = font(500, 28)
      ctx.fillText(back, 40, 262)
    }
    ctx.fillStyle = BRAND
    ctx.beginPath()
    ctx.roundRect(40, 308, w - 80, 64, 32)
    ctx.fill()
    ctx.fillStyle = INK
    ctx.font = font(700, 30)
    ctx.textAlign = 'center'
    ctx.fillText(lang === 'bn' ? 'চ্যাট শুরু করুন →' : 'Start a chat →', w / 2, 342)
  })
}

/** The hanging door sign: green "Open now", or red "Closed" with when we're back. */
export function doorSignTexture(open: boolean, back: string, lang: Lang) {
  return make(`door|${open}|${back}|${lang}`, 512, 256, (ctx, w, h) => {
    ctx.fillStyle = '#FBFAF6'
    ctx.beginPath()
    ctx.roundRect(0, 0, w, h, 28)
    ctx.fill()
    ctx.strokeStyle = open ? '#1E9E55' : '#D2402F'
    ctx.lineWidth = 12
    ctx.beginPath()
    ctx.roundRect(14, 14, w - 28, h - 28, 20)
    ctx.stroke()
    ctx.textAlign = 'center'
    ctx.fillStyle = open ? '#1E9E55' : '#D2402F'
    ctx.font = font(800, open ? 76 : 70)
    ctx.fillText(open ? (lang === 'bn' ? 'খোলা আছে' : 'OPEN NOW') : (lang === 'bn' ? 'বন্ধ' : 'CLOSED'), w / 2, open ? 104 : 92)
    ctx.fillStyle = INK
    ctx.font = font(600, 34)
    ctx.fillText(open ? (lang === 'bn' ? 'ভেতরে আসুন · শনি–বৃহঃ ১০–৭' : 'Come in · Sat–Thu 10–7') : back, w / 2, open ? 176 : 164)
    if (!open) {
      ctx.fillStyle = '#5B6070'
      ctx.font = font(500, 26)
      ctx.fillText(lang === 'bn' ? 'AI রিসেপশনিস্ট অনলাইনে আছে' : 'Our AI receptionist is online', w / 2, 210)
    }
  })
}

/** The workstation monitors after hours: a dim screen saver with the brand mark. */
export function sleepTexture() {
  return make('sleep', 256, 160, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w * 0.7)
    g.addColorStop(0, '#1A2030')
    g.addColorStop(1, '#07080C')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
    drawLogo(ctx, w / 2 - 22, h / 2 - 32, 44)
    ctx.fillStyle = 'rgba(255,255,255,0.35)'
    ctx.font = font(600, 16)
    ctx.textAlign = 'center'
    ctx.fillText('z z z', w / 2, h / 2 + 34)
  })
}
