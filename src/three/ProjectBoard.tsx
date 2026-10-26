// Client rooms (`?client=`): the "Your project" board on the right wall's back corner. One
// canvas texture (redrawn only when the project or the language changes), so phones stay smooth.
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { PROCESS, tr, type Lang } from '../content'
import { CLIENT_TEXT as T, dayLine, fmtDate, num, PHASE_INDEX, useClient, type ClientProject } from '../clientRoom'
import { useStore } from '../store'
import { Hot } from './Hot'
import { PROJECT_BOARD, ROOM, yawOf } from './layout'
import { BRAND, INK, drawLogo } from './textures'

const W = 1300
const H = Math.round((W * PROJECT_BOARD.h) / PROJECT_BOARD.w)
const FONT = '"Anek Bangla Variable", system-ui, sans-serif'
const font = (weight: number, size: number) => `${weight} ${size}px ${FONT}`
const GREY = '#9AA0AE'
const DIM = '#3A3F4D'
const GREEN = '#36E07A'
type Ctx = CanvasRenderingContext2D

function wrap(ctx: Ctx, text: string, maxW: number, maxLines: number) {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let line = ''
  for (const w of words) {
    const next = line ? `${line} ${w}` : w
    if (ctx.measureText(next).width <= maxW || !line) line = next
    else { lines.push(line); line = w }
  }
  if (line) lines.push(line)
  if (lines.length > maxLines) {
    lines.length = maxLines
    let last = lines[maxLines - 1]
    while (last.length > 1 && ctx.measureText(`${last}…`).width > maxW) last = last.slice(0, -1)
    lines[maxLines - 1] = `${last}…`
  }
  return lines
}

function fit(ctx: Ctx, text: string, maxW: number, weight: number, size: number, min: number) {
  let s = size
  do { ctx.font = font(weight, s); s -= 2 } while (ctx.measureText(text).width > maxW && s > min)
  if (ctx.measureText(text).width > maxW) return wrap(ctx, text, maxW, 1)[0]
  return text
}

function draw(p: ClientProject, lang: Lang) {
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')!
  ctx.textBaseline = 'alphabetic'
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#1B1F2B')
  bg.addColorStop(1, '#0E1016')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = BRAND
  ctx.fillRect(0, 0, W, 12)
  const P = 56

  // header: eyebrow (+ demo badge), the project, the client
  ctx.fillStyle = BRAND
  ctx.font = font(700, 30)
  const eyebrow = tr(T.yourProject, lang).toUpperCase()
  ctx.fillText(eyebrow, P, 82)
  if (p.demo) {
    const x = P + ctx.measureText(eyebrow).width + 18
    ctx.font = font(700, 24)
    const label = tr(T.demo, lang).toUpperCase()
    const w = ctx.measureText(label).width + 28
    ctx.fillStyle = '#FFC93C'
    ctx.beginPath(); ctx.roundRect(x, 56, w, 34, 17); ctx.fill()
    ctx.fillStyle = INK
    ctx.fillText(label, x + 14, 81)
  }
  drawLogo(ctx, W - P - 64, 40, 64)
  ctx.fillStyle = '#ffffff'
  const title = fit(ctx, tr(p.project, lang), W - P * 2 - 90, 700, 66, 40)
  ctx.fillText(title, P, 160)
  ctx.fillStyle = GREY
  ctx.font = font(500, 34)
  ctx.fillText(fit(ctx, p.name, W - P * 2, 500, 34, 24), P, 210)
  ctx.fillStyle = DIM
  ctx.fillRect(P, 240, W - P * 2, 2)

  // left: the progress ring, the day count, due date and manager
  const cx = 250
  const cy = 440
  const r = 150
  ctx.lineCap = 'round'
  ctx.lineWidth = 30
  ctx.strokeStyle = '#2A2E3A'
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke()
  if (p.percent > 0) {
    ctx.strokeStyle = BRAND
    ctx.shadowColor = BRAND
    ctx.shadowBlur = 24
    ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * p.percent) / 100); ctx.stroke()
    ctx.shadowBlur = 0
  }
  ctx.textAlign = 'center'
  ctx.fillStyle = '#ffffff'
  ctx.font = font(700, 104)
  ctx.fillText(`${num(p.percent, lang)}%`, cx, cy + 30)
  ctx.fillStyle = GREY
  ctx.font = font(500, 30)
  ctx.fillText(tr(T.progress, lang), cx, cy + 76)
  ctx.fillStyle = '#ffffff'
  ctx.font = font(700, 40)
  ctx.fillText(dayLine(p, lang), cx, cy + r + 90)
  ctx.fillStyle = GREY
  ctx.font = font(500, 28)
  if (p.dueDate) ctx.fillText(`${tr(T.due, lang)}: ${fmtDate(p.dueDate, lang)}`, cx, cy + r + 134)
  if (p.manager) ctx.fillText(fit(ctx, `${tr(T.manager, lang)}: ${p.manager}`, 400, 500, 26, 18), cx, cy + r + 174)
  ctx.textAlign = 'left'

  // left, bottom: recent commits, when the repo is connected
  if (p.commits?.length) {
    let y = cy + r + 236
    ctx.fillStyle = BRAND
    ctx.font = font(700, 26)
    ctx.fillText(tr(T.commits, lang), P, y)
    ctx.font = '500 22px ui-monospace, Consolas, monospace'
    for (const cm of p.commits.slice(0, 3)) {
      y += 36
      if (y > H - 30) break
      ctx.fillStyle = GREEN
      ctx.fillText('●', P, y)
      ctx.fillStyle = '#C9CDD6'
      ctx.fillText(wrap(ctx, cm.message, 380, 1)[0], P + 24, y)
    }
  }

  // right: the four-step process, milestones, latest updates
  const x0 = 520
  const x1 = W - P
  const phase = PHASE_INDEX(p.phase)
  ctx.fillStyle = BRAND
  ctx.font = font(700, 28)
  ctx.fillText(tr(T.phase, lang), x0, 296)
  const step = (x1 - x0 - 60) / 3
  const sy = 352
  for (let i = 0; i < 4; i++) {
    const x = x0 + 30 + i * step
    if (i < 3) {
      ctx.strokeStyle = i < phase ? BRAND : DIM
      ctx.lineWidth = 6
      ctx.beginPath(); ctx.moveTo(x + 26, sy); ctx.lineTo(x + step - 26, sy); ctx.stroke()
    }
    ctx.lineWidth = 6
    if (i < phase) {
      ctx.fillStyle = BRAND
      ctx.beginPath(); ctx.arc(x, sy, 22, 0, Math.PI * 2); ctx.fill()
      ctx.strokeStyle = INK
      ctx.lineWidth = 5
      ctx.beginPath(); ctx.moveTo(x - 9, sy); ctx.lineTo(x - 2, sy + 8); ctx.lineTo(x + 11, sy - 8); ctx.stroke()
    } else if (i === phase) {
      ctx.fillStyle = INK
      ctx.strokeStyle = BRAND
      ctx.shadowColor = BRAND
      ctx.shadowBlur = 22
      ctx.beginPath(); ctx.arc(x, sy, 22, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
      ctx.shadowBlur = 0
      ctx.fillStyle = BRAND
      ctx.beginPath(); ctx.arc(x, sy, 9, 0, Math.PI * 2); ctx.fill()
    } else {
      ctx.strokeStyle = DIM
      ctx.beginPath(); ctx.arc(x, sy, 20, 0, Math.PI * 2); ctx.stroke()
    }
    ctx.textAlign = 'center'
    ctx.fillStyle = i === phase ? '#ffffff' : i < phase ? '#C9CDD6' : GREY
    ctx.font = font(i === phase ? 700 : 500, 24)
    ctx.fillText(wrap(ctx, tr(PROCESS[i].title, lang), step - 8, 1)[0], x, sy + 58)
    ctx.textAlign = 'left'
  }

  let y = 478
  ctx.fillStyle = BRAND
  ctx.font = font(700, 28)
  ctx.fillText(tr(T.milestones, lang), x0, y)
  ctx.font = font(500, 27)
  const ms = p.milestones.slice(0, 6)
  if (!ms.length) { y += 42; ctx.fillStyle = GREY; ctx.fillText(tr(T.none, lang), x0, y) }
  for (const m of ms) {
    y += 42
    ctx.lineWidth = 3
    if (m.done) {
      ctx.fillStyle = GREEN
      ctx.beginPath(); ctx.roundRect(x0, y - 24, 28, 28, 6); ctx.fill()
      ctx.strokeStyle = INK
      ctx.lineWidth = 4
      ctx.beginPath(); ctx.moveTo(x0 + 6, y - 10); ctx.lineTo(x0 + 12, y - 4); ctx.lineTo(x0 + 22, y - 17); ctx.stroke()
    } else {
      ctx.strokeStyle = GREY
      ctx.beginPath(); ctx.roundRect(x0 + 1.5, y - 22.5, 25, 25, 6); ctx.stroke()
    }
    const date = m.date ? fmtDate(m.date, lang, false) : ''
    ctx.font = font(500, 22)
    const dw = date ? ctx.measureText(date).width : 0
    ctx.fillStyle = GREY
    if (date) ctx.fillText(date, x1 - dw, y)
    ctx.font = font(m.done ? 500 : 600, 27)
    ctx.fillStyle = m.done ? '#C9CDD6' : '#ffffff'
    ctx.fillText(wrap(ctx, tr(m.title, lang), x1 - x0 - 50 - dw - 16, 1)[0], x0 + 44, y)
  }

  y = Math.max(y + 70, 760)
  ctx.fillStyle = BRAND
  ctx.font = font(700, 28)
  ctx.fillText(tr(T.updates, lang), x0, y)
  if (!p.updates.length) { ctx.fillStyle = GREY; ctx.font = font(500, 26); ctx.fillText(tr(T.none, lang), x0, y + 42) }
  for (const u of p.updates.slice(0, 2)) {
    if (y + 40 > H - 30) break
    y += 40
    ctx.fillStyle = GREY
    ctx.font = font(600, 22)
    ctx.fillText(fmtDate(u.date, lang), x0, y)
    ctx.fillStyle = '#E6E8EE'
    ctx.font = font(500, 25)
    for (const line of wrap(ctx, tr(u.text, lang), x1 - x0, 2)) {
      y += 34
      if (y > H - 24) break
      ctx.fillText(line, x0, y)
    }
  }

  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

export function ProjectBoard() {
  const lang = useStore((s) => s.lang)
  const project = useClient((c) => c.project)
  const tex = useMemo(() => (project ? draw(project, lang) : null), [project, lang])
  useEffect(() => () => tex?.dispose(), [tex])
  const mats = useMemo(() => ({
    frame: new THREE.MeshLambertMaterial({ color: '#1A1C22' }),
    brand: new THREE.MeshBasicMaterial({ color: BRAND }),
  }), [])
  if (!project || !tex) return null
  const { w, h, y, z } = PROJECT_BOARD
  return (
    <group position={[ROOM.halfW - 0.05, 0, z]} rotation-y={yawOf(new THREE.Vector3(-1, 0, 0))}>
      <mesh position={[0, y, -0.02]} material={mats.frame}><boxGeometry args={[w + 0.12, h + 0.12, 0.05]} /></mesh>
      <mesh position={[0, y - h / 2 - 0.07, 0.006]} material={mats.brand}><boxGeometry args={[w + 0.12, 0.025, 0.02]} /></mesh>
      <Hot tip={T.view} onPick={() => useStore.getState().setProjectOpen(true)}>
        <mesh position={[0, y, 0.01]}>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
      </Hot>
    </group>
  )
}
