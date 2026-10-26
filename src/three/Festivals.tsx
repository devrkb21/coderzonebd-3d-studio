// Bangladeshi festivals, picked by today's date in Bangladesh (UTC+6): Pohela Boishakh, both Eids,
// Amar Ekushe, Independence and Victory Day, and New Year's Day. `?fest=boishakh|eid|ekushe|
// victory|independence|newyear` forces one. Decor only: nothing here catches clicks or blocks a view.
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { FESTIVAL_TEXT as T, tr, type Lang } from '../content'
import { useStore } from '../store'
import { ROOM } from './layout'
import { noHit } from './Life'
import { DOOR, WIN } from './Room'

export type Festival = 'boishakh' | 'eid' | 'ekushe' | 'victory' | 'independence' | 'newyear'
const FESTIVALS: Festival[] = ['boishakh', 'eid', 'ekushe', 'victory', 'independence', 'newyear']

const { halfW, halfD, height } = ROOM
const coarse = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
const DAY = 86_400_000

/** Today's date in Bangladesh, as a Date whose UTC fields read as Dhaka's. */
const dhakaToday = (now = Date.now()) => new Date(now + 6 * 3_600_000)

/** True on Eid ul-Fitr (Shawwal 1–3) or Eid ul-Adha (Dhul Hijjah 10–12), give or take a day for moon sighting. */
function isEid(d: Date) {
  try {
    const fmt = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', { month: 'numeric', day: 'numeric', timeZone: 'UTC' })
    return [-1, 0, 1].some((off) => {
      const parts = fmt.formatToParts(new Date(d.getTime() + off * DAY))
      const m = Number(parts.find((p) => p.type === 'month')?.value)
      const day = Number(parts.find((p) => p.type === 'day')?.value)
      return (m === 10 && day >= 1 && day <= 3) || (m === 12 && day >= 10 && day <= 12)
    })
  } catch { return false }
}

export function festivalToday(): Festival | null {
  if (typeof location !== 'undefined') {
    const f = new URLSearchParams(location.search).get('fest') as Festival | null
    if (f && FESTIVALS.includes(f)) return f
  }
  const d = dhakaToday()
  const md = (d.getUTCMonth() + 1) * 100 + d.getUTCDate()
  if (md === 414) return 'boishakh'
  if (md === 221) return 'ekushe'
  if (md === 326) return 'independence'
  if (md === 1216) return 'victory'
  if (md === 101) return 'newyear'
  return isEid(d) ? 'eid' : null
}

const BN_DIGITS = '০১২৩৪৫৬৭৮৯'
const bnNum = (n: number) => String(n).replace(/\d/g, (c) => BN_DIGITS[Number(c)])

/** The festivals' palettes: [banner ground, title, accent]. */
const LOOK: Record<Festival, [string, string, string]> = {
  boishakh: ['#FFFFFF', '#C8102E', '#C8102E'],
  eid: ['#0E4B37', '#F3D27A', '#F3D27A'],
  ekushe: ['#16171B', '#F2F2EE', '#B3262E'],
  victory: ['#006A4E', '#FFFFFF', '#F42A41'],
  independence: ['#006A4E', '#FFFFFF', '#F42A41'],
  newyear: ['#12141C', '#F3D27A', '#FF931E'],
}

function bannerLines(f: Festival, lang: Lang): [string, string] {
  const d = dhakaToday()
  const y = d.getUTCFullYear()
  switch (f) {
    case 'boishakh': {
      const by = y - (d.getUTCMonth() * 100 + d.getUTCDate() >= 314 ? 593 : 594)
      return [T.boishakh.bn, lang === 'bn' ? `${T.boishakhSub.bn} ${bnNum(by)}` : `${T.boishakhSub.en} ${by}`]
    }
    case 'eid': return [tr(T.eid, lang), lang === 'bn' ? T.eid.en : T.eid.bn]
    case 'ekushe': return [T.ekushe.bn, tr(T.ekusheSub, lang)]
    case 'victory': return [tr(T.victory, lang), tr(T.victorySub, lang)]
    case 'independence': return [tr(T.independence, lang), tr(T.independenceSub, lang)]
    case 'newyear': {
      const ny = d.getUTCMonth() === 0 ? y : y + 1
      return [tr(T.newyear, lang), lang === 'bn' ? bnNum(ny) : String(ny)]
    }
  }
}

/** The Bangladesh flag: bottle green, a red disc a little towards the hoist, 10:6. */
function drawFlag(ctx: CanvasRenderingContext2D, x: number, y: number, w: number) {
  const h = w * 0.6
  ctx.fillStyle = '#006A4E'
  ctx.fillRect(x, y, w, h)
  ctx.fillStyle = '#F42A41'
  ctx.beginPath()
  ctx.arc(x + w * 0.45, y + h / 2, w * 0.2, 0, Math.PI * 2)
  ctx.fill()
}

function canvasTexture(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  draw(c.getContext('2d')!)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

const FONT = '"Anek Bangla Variable", system-ui, sans-serif'

function bannerTexture(f: Festival, lang: Lang) {
  const [ground, ink, accent] = LOOK[f]
  const [title, sub] = bannerLines(f, lang)
  return canvasTexture(1024, 320, (ctx) => {
    ctx.fillStyle = ground
    ctx.fillRect(0, 0, 1024, 320)
    ctx.strokeStyle = accent
    ctx.lineWidth = 8
    ctx.strokeRect(14, 14, 996, 292)
    if (f === 'boishakh') {
      // a row of red alpona dots and petals along both edges
      ctx.fillStyle = accent
      for (let x = 40; x < 1000; x += 44) {
        for (const y of [38, 282]) {
          ctx.beginPath()
          ctx.ellipse(x, y, 12, 6, 0, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }
    if (f === 'eid') {
      // crescent and star
      ctx.fillStyle = accent
      ctx.beginPath()
      ctx.arc(110, 160, 62, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = ground
      ctx.beginPath()
      ctx.arc(136, 146, 56, 0, Math.PI * 2)
      ctx.fill()
      star(ctx, 168, 126, 16, accent)
    }
    if (f === 'victory' || f === 'independence') drawFlag(ctx, 54, 100, 200)
    if (f === 'ekushe') {
      ctx.fillStyle = accent
      ctx.beginPath()
      ctx.arc(120, 160, 46, 0, Math.PI * 2)
      ctx.fill()
    }
    const left = f === 'boishakh' || f === 'newyear' ? 512 : 600
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = ink
    ctx.font = `700 ${title.length > 16 ? 82 : 100}px ${FONT}`
    ctx.fillText(title, left, 136, 680)
    ctx.font = `500 54px ${FONT}`
    ctx.fillStyle = f === 'boishakh' ? '#333' : ink
    ctx.globalAlpha = 0.9
    ctx.fillText(sub, left, 236, 760)
  })
}

function star(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.fillStyle = color
  ctx.beginPath()
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5 - Math.PI / 2
    const rr = i % 2 ? r * 0.45 : r
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr)
  }
  ctx.fill()
}

/** The day's decorations. */
export function Festivals() {
  const fest = useMemo(festivalToday, [])
  if (!fest) return null
  return (
    <group ref={noHit}>
      <Banners fest={fest} />
      {fest === 'boishakh' && <><Alpona /><Bunting colors={['#C8102E', '#FFFFFF']} /></>}
      {fest === 'eid' && <FairyLights />}
      {fest === 'ekushe' && <ShaheedMinar />}
      {(fest === 'victory' || fest === 'independence') && <><Bunting colors={['#006A4E', '#F42A41']} /><FlagPole /></>}
      {fest === 'newyear' && <Bunting colors={['#F3D27A', '#C9CDD6', '#FF931E']} />}
    </group>
  )
}

/** The greeting over the door inside, and again above the canopy outside for the street. */
function Banners({ fest }: { fest: Festival }) {
  const lang = useStore((s) => s.lang)
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ map: bannerTexture(fest, lang) }), [fest, lang])
  const top = WIN.y1 - 0.06
  const bottom = DOOR.h + 0.2
  const h = top - bottom
  return (
    <>
      <mesh position={[0, (top + bottom) / 2, halfD - 0.03]} rotation-y={Math.PI} material={mat}>
        <planeGeometry args={[h * 3.2, h]} />
      </mesh>
      <mesh position={[0, DOOR.h + 0.95, halfD + 0.19]} material={mat}>
        <planeGeometry args={[2.72, 0.85]} />
      </mesh>
    </>
  )
}

// ── garlands: bunting and fairy lights share the same swags ──────

type Swag = { a: THREE.Vector3; b: THREE.Vector3; sag: number }

/** Scalloped swags hung between two points, `span` metres each. */
function swags(a: THREE.Vector3, b: THREE.Vector3, span: number, sag: number): Swag[] {
  const n = Math.max(1, Math.round(a.distanceTo(b) / span))
  return Array.from({ length: n }, (_, i) => ({ a: a.clone().lerp(b, i / n), b: a.clone().lerp(b, (i + 1) / n), sag }))
}

function along(s: Swag, u: number) {
  const p = s.a.clone().lerp(s.b, u)
  p.y -= s.sag * 4 * u * (1 - u)
  return p
}

/** Points every `step` metres along a set of swags. */
function sample(list: Swag[], step: number) {
  const pts: THREE.Vector3[] = []
  for (const s of list) {
    const n = Math.max(2, Math.round(s.a.distanceTo(s.b) / step))
    for (let i = 0; i < n; i++) pts.push(along(s, i / n))
  }
  return pts
}

/** Along the top of the back wall (leaving the digital clock clear) and the front wall. */
function wallTops(): Swag[] {
  const y = height - 0.12
  const back = -halfD + 0.06
  const front = halfD - 0.08
  const v = (x: number, z: number) => new THREE.Vector3(x, y, z)
  return [
    ...swags(v(-halfW + 0.4, back), v(-1.7, back), 2.4, 0.28),
    ...swags(v(1.7, back), v(halfW - 0.4, back), 2.4, 0.28),
    ...swags(v(-halfW + 0.4, front), v(halfW - 0.4, front), 2.4, 0.28),
  ]
}

function Wire({ list }: { list: Swag[] }) {
  const geo = useMemo(() => {
    const pos: number[] = []
    for (const s of list) {
      for (let i = 0; i < 12; i++) {
        const p = along(s, i / 12)
        const q = along(s, (i + 1) / 12)
        pos.push(p.x, p.y, p.z, q.x, q.y, q.z)
      }
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    return g
  }, [list])
  return <lineSegments geometry={geo}><lineBasicMaterial color="#2A2A2E" /></lineSegments>
}

/** Triangular paper flags on a string, in the festival's colours. */
function Bunting({ colors }: { colors: string[] }) {
  const list = useMemo(wallTops, [])
  const pts = useMemo(() => sample(list, 0.42), [list])
  const ref = useRef<THREE.InstancedMesh | null>(null)
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute([-0.12, 0, 0, 0.12, 0, 0, 0, -0.3, 0], 3))
    g.computeVertexNormals()
    return g
  }, [])
  const mat = useMemo(() => new THREE.MeshLambertMaterial({ side: THREE.DoubleSide }), [])
  const init = (m: THREE.InstancedMesh | null) => {
    if (!m || ref.current === m) return
    ref.current = m
    const o = new THREE.Object3D()
    const c = new THREE.Color()
    pts.forEach((p, i) => {
      o.position.copy(p)
      o.rotation.set(0, 0, Math.sin(i * 2.3) * 0.06)
      o.updateMatrix()
      m.setMatrixAt(i, o.matrix)
      m.setColorAt(i, c.set(colors[i % colors.length]))
    })
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  }
  return (
    <>
      <instancedMesh ref={init} args={[geo, mat, pts.length]} frustumCulled={false} />
      <Wire list={list} />
    </>
  )
}

const BULBS = ['#FFE7A8', '#FF4D4D', '#58E06B', '#5AA8FF', '#FFC53D', '#FF7FD1']

/** Morich bati: strings of tiny coloured bulbs along the front wall, the windows and the door, twinkling. */
function FairyLights() {
  const list = useMemo(() => {
    const z = halfD - 0.1
    const v = (x: number, y: number) => new THREE.Vector3(x, y, z)
    const out: Swag[] = [...wallTops()]
    for (const sx of [-1, 1]) {
      const x0 = sx * WIN.x0
      const x1 = sx * WIN.x1
      out.push(...swags(v(x0, WIN.y1 + 0.12), v(x1, WIN.y1 + 0.12), 1.6, 0.16))
      out.push({ a: v(x0, WIN.y1 + 0.12), b: v(x0, WIN.y0 + 0.1), sag: 0 }, { a: v(x1, WIN.y1 + 0.12), b: v(x1, WIN.y0 + 0.1), sag: 0 })
    }
    const dx = DOOR.w / 2 + 0.14
    out.push({ a: v(-dx, 0.2), b: v(-dx, DOOR.h + 0.16), sag: 0 }, ...swags(v(-dx, DOOR.h + 0.16), v(dx, DOOR.h + 0.16), 0.95, 0.1), { a: v(dx, DOOR.h + 0.16), b: v(dx, 0.2), sag: 0 })
    return out
  }, [])
  const pts = useMemo(() => sample(list, coarse ? 0.3 : 0.17), [list])
  const seeds = useMemo(() => pts.map((_, i) => ({ c: new THREE.Color(BULBS[i % BULBS.length]), speed: 1.5 + ((i * 37) % 17) / 6, phase: (i * 1.7) % 6.28 })), [pts])
  const ref = useRef<THREE.InstancedMesh | null>(null)
  const tmp = useMemo(() => new THREE.Color(), [])
  const frame = useRef(0)
  const init = (m: THREE.InstancedMesh | null) => {
    if (!m || ref.current === m) return
    ref.current = m
    const o = new THREE.Object3D()
    pts.forEach((p, i) => {
      o.position.copy(p)
      o.updateMatrix()
      m.setMatrixAt(i, o.matrix)
      m.setColorAt(i, seeds[i].c)
    })
    m.instanceMatrix.needsUpdate = true
  }
  useFrame(({ clock }) => {
    const m = ref.current
    if (!m || !m.instanceColor || (coarse && frame.current++ % 3)) return
    const t = clock.elapsedTime
    seeds.forEach((s, i) => {
      // a slow chase along the string, with each bulb flickering on its own
      const chase = 0.5 + 0.5 * Math.sin(t * 2.2 - i * 0.35)
      const k = 0.25 + 0.75 * Math.max(chase, 0.5 + 0.5 * Math.sin(t * s.speed + s.phase)) ** 2
      m.setColorAt(i, tmp.copy(s.c).multiplyScalar(k))
    })
    m.instanceColor.needsUpdate = true
  })
  return (
    <>
      <instancedMesh ref={init} args={[undefined, undefined, pts.length]} frustumCulled={false}>
        <sphereGeometry args={[0.032, 6, 4]} />
        <meshBasicMaterial />
      </instancedMesh>
      <Wire list={list} />
    </>
  )
}

/** Alpona: white-and-red floor art just inside the entrance. */
function Alpona() {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({
    map: canvasTexture(512, 512, (ctx) => {
      const c = 256
      ctx.translate(c, c)
      ctx.fillStyle = '#B5121B'
      ctx.beginPath()
      ctx.arc(0, 0, 250, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#FFFFFF'
      ctx.fillStyle = '#FFFFFF'
      ctx.lineWidth = 6
      for (const r of [236, 150, 70]) { ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke() }
      // dotted border
      for (let i = 0; i < 48; i++) {
        const a = (i / 48) * Math.PI * 2
        ctx.beginPath()
        ctx.arc(Math.cos(a) * 218, Math.sin(a) * 218, 6, 0, Math.PI * 2)
        ctx.fill()
      }
      // outer ring of leaves, inner lotus petals
      const petal = (n: number, r0: number, r1: number, w: number, fill: boolean, rot = 0) => {
        for (let i = 0; i < n; i++) {
          ctx.save()
          ctx.rotate((i / n) * Math.PI * 2 + rot)
          ctx.beginPath()
          ctx.moveTo(0, r0)
          ctx.quadraticCurveTo(w, (r0 + r1) / 2, 0, r1)
          ctx.quadraticCurveTo(-w, (r0 + r1) / 2, 0, r0)
          if (fill) ctx.fill()
          else ctx.stroke()
          ctx.restore()
        }
      }
      ctx.lineWidth = 5
      petal(16, 156, 204, 18, false)
      petal(16, 162, 196, 7, true, Math.PI / 16)
      petal(8, 74, 146, 34, false)
      petal(8, 84, 136, 14, true)
      ctx.fillStyle = '#F2B61B'
      ctx.beginPath()
      ctx.arc(0, 0, 40, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#FFFFFF'
      petal(8, 8, 36, 9, true, Math.PI / 8)
    }),
    transparent: true,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
  }), [])
  return (
    <mesh position={[0, 0.014, halfD - 2.75]} rotation-x={-Math.PI / 2} material={mat}>
      <circleGeometry args={[1.15, 48]} />
    </mesh>
  )
}

/** A small, respectful Shaheed Minar beside the entrance, with flowers at its foot. */
function ShaheedMinar() {
  const lang = useStore((s) => s.lang)
  const m = useMemo(() => ({
    white: new THREE.MeshLambertMaterial({ color: '#F4F4F0' }),
    base: new THREE.MeshLambertMaterial({ color: '#BDBDB6' }),
    sun: new THREE.MeshLambertMaterial({ color: '#B3262E' }),
    red: new THREE.MeshLambertMaterial({ color: '#C62828' }),
    yellow: new THREE.MeshLambertMaterial({ color: '#F2B61B' }),
    leaf: new THREE.MeshLambertMaterial({ color: '#3E7A3A' }),
  }), [])
  const plaque = useMemo(() => new THREE.MeshBasicMaterial({
    map: canvasTexture(512, 160, (ctx) => {
      ctx.fillStyle = '#16171B'
      ctx.fillRect(0, 0, 512, 160)
      ctx.fillStyle = '#F2F2EE'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = `700 64px ${FONT}`
      ctx.fillText(T.ekushe.bn, 256, 62)
      ctx.font = `500 22px ${FONT}`
      ctx.fillText(tr(T.ekusheSub, lang), 256, 124, 480)
    }),
  }), [lang])
  // one grille frame: two posts and cross bars
  const frame = (w: number, h: number, key: string, props: JSX.IntrinsicElements['group']) => (
    <group key={key} {...props}>
      {[-w / 2, w / 2].map((x) => <mesh key={x} position={[x, h / 2, 0]} material={m.white}><boxGeometry args={[0.035, h, 0.035]} /></mesh>)}
      {Array.from({ length: Math.round(h / 0.16) }, (_, i) => (
        <mesh key={i} position={[0, 0.12 + i * 0.16, 0]} material={m.white}><boxGeometry args={[w, 0.018, 0.018]} /></mesh>
      ))}
    </group>
  )
  const x = -(DOOR.w / 2 + 2.3)
  return (
    <group position={[x, 0, halfD - 0.85]} rotation-y={Math.PI}>
      {/* stepped base */}
      <mesh position-y={0.05} material={m.base}><boxGeometry args={[1.5, 0.1, 0.62]} /></mesh>
      <mesh position={[0, 0.13, -0.05]} material={m.white}><boxGeometry args={[1.3, 0.06, 0.48]} /></mesh>
      <group position-y={0.16}>
        {/* the red sun behind the central column */}
        <mesh position={[0, 0.72, -0.16]} material={m.sun}><circleGeometry args={[0.3, 32]} /></mesh>
        {/* the tall centre, its top bowing forward, flanked by two shorter pairs */}
        {frame(0.36, 0.95, 'c', { position: [0, 0, -0.08] })}
        {frame(0.36, 0.34, 'ct', { position: [0, 0.95, -0.08], rotation: [0.6, 0, 0] })}
        {frame(0.22, 0.72, 'l1', { position: [-0.36, 0, -0.04], rotation: [0, 0.35, 0] })}
        {frame(0.22, 0.72, 'r1', { position: [0.36, 0, -0.04], rotation: [0, -0.35, 0] })}
        {frame(0.18, 0.56, 'l2', { position: [-0.6, 0, 0.06], rotation: [0, 0.6, 0] })}
        {frame(0.18, 0.56, 'r2', { position: [0.6, 0, 0.06], rotation: [0, -0.6, 0] })}
        {/* flowers laid at the foot */}
        {Array.from({ length: 11 }, (_, i) => (
          <mesh key={i} position={[(i - 5) * 0.09, 0.03, 0.14 + (i % 2) * 0.04]} material={i % 3 === 1 ? m.yellow : i % 3 === 2 ? m.leaf : m.red}>
            <sphereGeometry args={[0.035, 8, 6]} />
          </mesh>
        ))}
      </group>
      <mesh position={[0, 0.1, 0.33]} rotation-x={-0.5} material={plaque}><planeGeometry args={[0.72, 0.225]} /></mesh>
    </group>
  )
}

/** A Bangladesh flag flying from a pole on the pavement outside, seen through the window. */
function FlagPole() {
  const geo = useMemo(() => new THREE.PlaneGeometry(1.5, 0.9, 16, 6), [])
  const base = useMemo(() => Float32Array.from(geo.attributes.position.array), [geo])
  const mat = useMemo(() => new THREE.MeshLambertMaterial({ map: canvasTexture(500, 300, (ctx) => drawFlag(ctx, 0, 0, 500)), side: THREE.DoubleSide }), [])
  const pole = useMemo(() => new THREE.MeshLambertMaterial({ color: '#D9D9D4' }), [])
  useFrame(({ clock }) => {
    const pos = geo.attributes.position as THREE.BufferAttribute
    const t = clock.elapsedTime
    for (let i = 0; i < pos.count; i++) {
      const x = base[i * 3] + 0.75
      pos.setZ(i, Math.sin(x * 3.2 - t * 4) * 0.09 * x + Math.sin(x * 5 - t * 6.3) * 0.02 * x)
    }
    pos.needsUpdate = true
  })
  const x = WIN.x0 + 1.4
  return (
    <group position={[x, 0, halfD + 0.5]}>
      <mesh position-y={2.4} material={pole}><cylinderGeometry args={[0.035, 0.045, 4.8, 8]} /></mesh>
      <mesh position-y={4.82} material={pole}><sphereGeometry args={[0.06, 8, 6]} /></mesh>
      <mesh position={[0.77, 4.3, 0]} geometry={geo} material={mat} />
    </group>
  )
}
