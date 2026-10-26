// Things that move in the office: the team at work, ceiling fans, the AC, coffee steam, a
// router's lights and a live digital clock. Nothing here catches clicks.
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store'
import { ROOM } from './layout'
import { BRAND, INK } from './textures'

const { halfD } = ROOM

/** Ref callback: let clicks pass straight through a group (people, fans, props). */
export const noHit = (g: THREE.Object3D | null) => g?.traverse((o) => { o.raycast = () => {} })

// ── people ─────────────────────────────────────────────────────

export interface Look { shirt: string; pants: string; skin: string; hair: string }

export const TEAM: Look[] = [
  { shirt: BRAND, pants: '#2B2F3A', skin: '#A8714A', hair: '#17120F' },
  { shirt: '#F4F4F2', pants: '#3A4256', skin: '#8E5B3A', hair: '#1C1612' },
  { shirt: '#1F3A5F', pants: '#2A2A2E', skin: '#B9845C', hair: '#221A14' },
]


export interface Rig {
  root: THREE.Group | null
  hips: THREE.Group | null
  torso: THREE.Group | null
  head: THREE.Group | null
  legL: THREE.Group | null
  legR: THREE.Group | null
  kneeL: THREE.Group | null
  kneeR: THREE.Group | null
  armL: THREE.Group | null
  armR: THREE.Group | null
  elbowL: THREE.Group | null
  elbowR: THREE.Group | null
}

const THIGH = 0.44
const SHIN = 0.44
const HIP_STAND = THIGH + SHIN + 0.06

/**
 * A simple low-poly person built from capsules, posed from code. Faces +z.
 * `drive` runs every frame and poses the rig (time in seconds).
 */
export function Person({ look, drive, mug, ...props }: JSX.IntrinsicElements['group'] & { look: Look; drive: (r: Rig, t: number) => void; mug?: boolean }) {
  const m = useMemo(() => ({
    shirt: new THREE.MeshLambertMaterial({ color: look.shirt }),
    pants: new THREE.MeshLambertMaterial({ color: look.pants }),
    skin: new THREE.MeshLambertMaterial({ color: look.skin }),
    hair: new THREE.MeshLambertMaterial({ color: look.hair }),
    shoe: new THREE.MeshLambertMaterial({ color: '#15161A' }),
    mug: new THREE.MeshLambertMaterial({ color: '#ffffff' }),
  }), [look])
  const r = useRef<Rig>({ root: null, hips: null, torso: null, head: null, legL: null, legR: null, kneeL: null, kneeR: null, armL: null, armR: null, elbowL: null, elbowR: null })
  const set = <K extends keyof Rig>(k: K) => (g: THREE.Group | null) => { r.current[k] = g }
  useFrame(({ clock }) => drive(r.current, clock.elapsedTime))
  const leg = (side: 1 | -1) => (
    <group ref={set(side < 0 ? 'legL' : 'legR')} position-x={side * 0.1}>
      <mesh position-y={-THIGH / 2} material={m.pants}><capsuleGeometry args={[0.085, THIGH - 0.1, 4, 10]} /></mesh>
      <group ref={set(side < 0 ? 'kneeL' : 'kneeR')} position-y={-THIGH}>
        <mesh position-y={-SHIN / 2} material={m.pants}><capsuleGeometry args={[0.07, SHIN - 0.08, 4, 10]} /></mesh>
        <mesh position={[0, -SHIN - 0.02, 0.06]} material={m.shoe}><boxGeometry args={[0.11, 0.07, 0.25]} /></mesh>
      </group>
    </group>
  )
  const arm = (side: 1 | -1) => (
    <group ref={set(side < 0 ? 'armL' : 'armR')} position={[side * 0.25, 0.47, 0]}>
      <mesh position-y={-0.15} material={m.shirt}><capsuleGeometry args={[0.06, 0.2, 4, 8]} /></mesh>
      <group ref={set(side < 0 ? 'elbowL' : 'elbowR')} position-y={-0.3}>
        <mesh position-y={-0.13} material={m.skin}><capsuleGeometry args={[0.048, 0.2, 4, 8]} /></mesh>
        {mug && side > 0 && <mesh position={[0, -0.3, 0.04]} material={m.mug}><cylinderGeometry args={[0.045, 0.04, 0.1, 10]} /></mesh>}
      </group>
    </group>
  )
  return (
    <group ref={(g) => { r.current.root = g; noHit(g) }} {...props}>
      <group ref={set('hips')} position-y={HIP_STAND}>
        {leg(-1)}
        {leg(1)}
        <group ref={set('torso')}>
          <mesh position-y={0.27} material={m.shirt}><capsuleGeometry args={[0.19, 0.3, 4, 12]} /></mesh>
          <mesh position-y={0.56} material={m.skin}><cylinderGeometry args={[0.05, 0.06, 0.08, 8]} /></mesh>
          <group ref={set('head')} position-y={0.7}>
            <mesh material={m.skin}><sphereGeometry args={[0.12, 16, 12]} /></mesh>
            <mesh position={[0, 0.03, -0.01]} scale={[1.05, 0.85, 1.08]} material={m.hair}><sphereGeometry args={[0.122, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} /></mesh>
          </group>
          {arm(-1)}
          {arm(1)}
        </group>
      </group>
    </group>
  )
}

/** Sitting at a desk and typing; now and then glances aside and stretches. */
export function typing(seed: number) {
  return (r: Rig, t: number) => {
    if (!r.hips) return
    r.hips.position.y = 0.55
    r.legL!.rotation.x = r.legR!.rotation.x = -Math.PI / 2
    r.kneeL!.rotation.x = r.kneeR!.rotation.x = Math.PI / 2
    const cycle = (t + seed * 7) % 14
    const stretch = cycle > 12 ? Math.sin(((cycle - 12) / 2) * Math.PI) : 0
    r.torso!.rotation.x = 0.12 - stretch * 0.25
    r.torso!.scale.y = 1 + Math.sin(t * 1.6 + seed) * 0.012
    r.head!.rotation.y = cycle > 8 && cycle < 9.6 ? Math.sin(((cycle - 8) / 1.6) * Math.PI) * 0.5 : Math.sin(t * 0.7 + seed) * 0.05
    r.head!.rotation.x = 0.08 + Math.sin(t * 0.9 + seed) * 0.03
    const k = 1 - stretch
    r.armL!.rotation.x = -0.75 * k - 2.6 * stretch
    r.armR!.rotation.x = -0.75 * k - 2.6 * stretch
    r.armL!.rotation.z = 0.12
    r.armR!.rotation.z = -0.12
    r.elbowL!.rotation.x = (-0.95 + Math.max(0, Math.sin(t * 17 + seed)) * 0.12) * k
    r.elbowR!.rotation.x = (-0.95 + Math.max(0, Math.sin(t * 15 + seed + 1.7)) * 0.12) * k
  }
}

/** One step of the walk cycle at `phase` radians, `amp` 0 (standing) … 1 (walking). */
export function walkPose(r: Rig, phase: number, amp: number) {
  if (!r.hips) return
  const s = Math.sin(phase)
  r.hips.position.y = HIP_STAND - Math.abs(Math.cos(phase)) * 0.03 * amp
  r.legL!.rotation.x = s * 0.5 * amp
  r.legR!.rotation.x = -s * 0.5 * amp
  r.kneeL!.rotation.x = (0.08 + Math.max(0, -Math.cos(phase)) * 0.55) * amp
  r.kneeR!.rotation.x = (0.08 + Math.max(0, Math.cos(phase)) * 0.55) * amp
  r.armL!.rotation.x = -s * 0.4 * amp
  r.armR!.rotation.x = s * 0.4 * amp
  r.armL!.rotation.z = 0.06
  r.armR!.rotation.z = -0.06
  r.elbowL!.rotation.x = -0.25
  r.elbowR!.rotation.x = -0.25
  r.torso!.rotation.x = 0.03 * amp
  r.torso!.rotation.y = s * 0.06 * amp
  r.head!.rotation.y = 0
  r.head!.rotation.x = 0
}

/** Walks a path back and forth, pausing at each end (sips from the mug at the coffee end). */
export function patrol(points: [number, number][], speed: number, pause: number, mugHand = false) {
  const segs = points.slice(1).map((p, i) => Math.hypot(p[0] - points[i][0], p[1] - points[i][1]))
  const L = segs.reduce((a, b) => a + b, 0)
  const leg = L / speed
  const T = 2 * (leg + pause)
  let heading = 0
  return (r: Rig, t: number) => {
    if (!r.root) return
    const c = t % T
    let d: number
    let moving = true
    let fwd = true
    if (c < pause) { d = 0; moving = false }
    else if (c < pause + leg) d = (c - pause) * speed
    else if (c < 2 * pause + leg) { d = L; moving = false }
    else { d = L - (c - 2 * pause - leg) * speed; fwd = false }
    let i = 0
    let rem = d
    while (i < segs.length - 1 && rem > segs[i]) { rem -= segs[i]; i++ }
    const a = points[i]
    const b = points[i + 1]
    const k = segs[i] ? Math.min(1, rem / segs[i]) : 0
    r.root.position.set(a[0] + (b[0] - a[0]) * k, 0, a[1] + (b[1] - a[1]) * k)
    if (moving) {
      const target = fwd ? Math.atan2(b[0] - a[0], b[1] - a[1]) : Math.atan2(a[0] - b[0], a[1] - b[1])
      let diff = target - heading
      diff = Math.atan2(Math.sin(diff), Math.cos(diff))
      heading += diff * 0.15
    }
    r.root.rotation.y = heading
    walkPose(r, d * 5.2, moving ? 1 : 0)
    if (!moving && mugHand && r.armR && r.elbowR) {
      // a sip now and then
      const sip = Math.max(0, Math.sin(t * 1.3)) ** 4
      r.armR.rotation.x = -0.35 - sip * 0.5
      r.elbowR.rotation.x = -0.6 - sip * 1.6
    } else if (mugHand && r.elbowR) {
      r.elbowR.rotation.x = -1.2
      r.armR!.rotation.x = -0.15
    }
  }
}

export function Team() {
  const walk = useMemo(() => patrol([[13.1, 8.2], [10.2, 5.4], [-3.8, 5.4], [-5.6, 6.0]], 1.15, 3.5, true), [])
  return (
    <group>
      <Person look={TEAM[0]} position={[5.4, 0, 6.42]} drive={typing(0)} />
      <Person look={TEAM[1]} position={[8.6, 0, 6.42]} drive={typing(3)} />
      <Person look={TEAM[2]} drive={walk} mug />
    </group>
  )
}

// ── ceiling fans, AC, steam, router ────────────────────────────

function acTexture() {
  const c = document.createElement('canvas')
  c.width = 128
  c.height = 48
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#10141A'
  ctx.fillRect(0, 0, 128, 48)
  ctx.fillStyle = '#7FE3FF'
  ctx.font = '700 30px ui-monospace, Consolas, monospace'
  ctx.textBaseline = 'middle'
  ctx.fillText('24°C', 14, 26)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

/** Split AC above the window, louver sweeping. */
export function AirCon({ position }: { position: [number, number, number] }) {
  const flap = useRef<THREE.Mesh>(null)
  const led = useMemo(() => new THREE.MeshBasicMaterial({ color: '#36E07A' }), [])
  const body = useMemo(() => new THREE.MeshLambertMaterial({ color: '#F6F6F3' }), [])
  const vent = useMemo(() => new THREE.MeshLambertMaterial({ color: '#D9D9D4' }), [])
  const screen = useMemo(() => new THREE.MeshBasicMaterial({ map: acTexture() }), [])
  useFrame(({ clock }) => {
    const on = useStore.getState().lightsOn
    if (flap.current) flap.current.rotation.x = on ? 0.5 + Math.sin(clock.elapsedTime * 0.6) * 0.35 : 0
    led.color.set(on ? '#36E07A' : '#E04A3A')
  })
  return (
    <group ref={noHit} position={position} rotation-y={Math.PI}>
      <mesh material={body}><boxGeometry args={[1.8, 0.5, 0.3]} /></mesh>
      <mesh position={[0, -0.22, 0.13]} material={vent}><boxGeometry args={[1.6, 0.06, 0.06]} /></mesh>
      <mesh ref={flap} position={[0, -0.25, 0.16]} material={body}><boxGeometry args={[1.6, 0.02, 0.12]} /></mesh>
      <mesh position={[0.55, 0.02, 0.152]} material={screen}><planeGeometry args={[0.26, 0.1]} /></mesh>
      <mesh position={[0.75, 0.02, 0.152]} material={led}><circleGeometry args={[0.014, 10]} /></mesh>
    </group>
  )
}

/** Wisps of steam rising from a cup. */
export function Steam({ position }: { position: [number, number, number] }) {
  const puffs = useRef<THREE.Mesh[]>([])
  const mats = useMemo(() => Array.from({ length: 6 }, () => new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0, depthWrite: false })), [])
  useFrame(({ clock }) => {
    puffs.current.forEach((p, i) => {
      if (!p) return
      const k = ((clock.elapsedTime + i * 0.45) % 2.7) / 2.7
      p.position.set(Math.sin(k * 6 + i) * 0.04, k * 0.55, Math.cos(k * 5 + i) * 0.03)
      p.scale.setScalar(0.4 + k * 1.4)
      mats[i].opacity = Math.sin(k * Math.PI) * 0.35
    })
  })
  return (
    <group ref={noHit} position={position}>
      {mats.map((m, i) => (
        <mesh key={i} ref={(el) => { if (el) puffs.current[i] = el }} material={m}><sphereGeometry args={[0.04, 8, 6]} /></mesh>
      ))}
    </group>
  )
}

/** Wi-Fi router with blinking activity lights. */
export function Router({ position }: { position: [number, number, number] }) {
  const leds = useMemo(() => Array.from({ length: 4 }, () => new THREE.MeshBasicMaterial({ color: '#3BE37A' })), [])
  const black = useMemo(() => new THREE.MeshLambertMaterial({ color: '#16181D' }), [])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    leds.forEach((m, i) => {
      const on = i === 0 || Math.sin(t * (7 + i * 5.3) + i * 2) > (i === 3 ? 0.6 : -0.2)
      m.color.set(on ? '#3BE37A' : '#0E2A17')
    })
  })
  return (
    <group ref={noHit} position={position} rotation-y={Math.PI}>
      <mesh position-y={0.04} material={black}><boxGeometry args={[0.42, 0.07, 0.26]} /></mesh>
      {[-0.17, 0.17].map((x) => <mesh key={x} position={[x, 0.24, -0.1]} rotation-z={x > 0 ? -0.15 : 0.15} material={black}><cylinderGeometry args={[0.012, 0.014, 0.36, 6]} /></mesh>)}
      {leds.map((m, i) => <mesh key={i} position={[-0.12 + i * 0.07, 0.045, 0.131]} material={m}><circleGeometry args={[0.009, 8]} /></mesh>)}
    </group>
  )
}

// ── digital clock ──────────────────────────────────────────────

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

/** LED wall clock above the home wall: Dhaka time, seconds ticking, colon blinking. */
export function DigitalClock({ position }: { position: [number, number, number] }) {
  const { tex, draw } = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 1024
    c.height = 256
    const ctx = c.getContext('2d')!
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 4
    const draw = (now: number, blink: boolean) => {
      const d = new Date(now + 6 * 3600_000)
      const h = d.getUTCHours()
      const h12 = ((h + 11) % 12) + 1
      const p2 = (n: number) => String(n).padStart(2, '0')
      ctx.fillStyle = '#0B0D12'
      ctx.fillRect(0, 0, 1024, 256)
      ctx.textBaseline = 'middle'
      ctx.font = '700 150px ui-monospace, "Cascadia Mono", Consolas, monospace'
      ctx.textAlign = 'left'
      // unlit segments behind the digits, like a real LED panel
      ctx.fillStyle = 'rgba(255,147,30,0.07)'
      ctx.fillText('88:88', 40, 118)
      ctx.shadowColor = BRAND
      ctx.shadowBlur = 24
      ctx.fillStyle = BRAND
      ctx.fillText(`${p2(h12)}${blink ? ':' : ' '}${p2(d.getUTCMinutes())}`, 40, 118)
      ctx.font = '700 70px ui-monospace, "Cascadia Mono", Consolas, monospace'
      ctx.fillStyle = 'rgba(255,147,30,0.07)'
      ctx.shadowBlur = 0
      ctx.fillText('88', 520, 100)
      ctx.shadowBlur = 16
      ctx.fillStyle = '#FFB25C'
      ctx.fillText(p2(d.getUTCSeconds()), 520, 100)
      ctx.shadowBlur = 0
      ctx.textAlign = 'right'
      ctx.font = '700 64px ui-monospace, Consolas, monospace'
      ctx.fillStyle = '#ffffff'
      ctx.fillText(h < 12 ? 'AM' : 'PM', 980, 70)
      ctx.font = '600 40px ui-monospace, Consolas, monospace'
      ctx.fillStyle = '#9AA0AE'
      ctx.fillText(`${DAYS[d.getUTCDay()]} ${p2(d.getUTCDate())} ${MONTHS[d.getUTCMonth()]}`, 980, 150)
      ctx.fillStyle = BRAND
      ctx.font = '600 30px ui-monospace, Consolas, monospace'
      ctx.fillText('DHAKA · GMT+6', 980, 205)
      ctx.textAlign = 'left'
      ctx.fillStyle = '#5A6070'
      ctx.fillText('CODER ZONE BD · LIVE', 44, 215)
      t.needsUpdate = true
    }
    return { tex: t, draw }
  }, [])
  const last = useRef('')
  useEffect(() => { draw(Date.now(), true) }, [draw])
  useFrame(() => {
    const now = Date.now()
    const key = `${Math.floor(now / 500)}`
    if (key === last.current) return
    last.current = key
    draw(now, Math.floor(now / 500) % 2 === 0)
  })
  const face = useMemo(() => new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }), [tex])
  const bezel = useMemo(() => new THREE.MeshLambertMaterial({ color: INK }), [])
  const W = 2.5
  const H = W / 4
  return (
    <group ref={noHit} position={position}>
      <mesh position-z={0.02} material={bezel}><boxGeometry args={[W + 0.1, H + 0.1, 0.06]} /></mesh>
      <mesh position-z={0.052} material={face}><planeGeometry args={[W, H]} /></mesh>
    </group>
  )
}

export function OfficeLife() {
  return (
    <>
      <Team />
      <AirCon position={[-8, 5.75, halfD - 0.17]} />
      <Steam position={[14.0, 1.06, halfD - 0.65]} />
      <Router position={[-14.2, 2.1, halfD - 0.35]} />
      <DigitalClock position={[0, 6.36, -halfD + 0.02]} />
    </>
  )
}
