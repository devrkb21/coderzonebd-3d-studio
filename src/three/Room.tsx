import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshReflectorMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { SERVICES, type StopId } from '../content'
import { useStore } from '../store'
import {
  KIOSK_NORMAL, KIOSK_POS, PRODUCT_BOX, PRODUCT_SHELF, PROCESS_BOARD, ROOM, SERVICE_CARD, SERVICE_RAIL_Y, STOP_FRAMES, yawOf,
} from './layout'
import { Hot } from './Hot'
import { BRAND, deskTexture, floorTexture, frontWallTexture, microcementTexture, panelTexture, plasterTexture, signboardTexture, signTexture } from './textures'
import { usePhase } from './time'
import { useWeather } from '../weather'
import { WelcomeBanner } from './Welcome'

const { halfW, halfD, height } = ROOM

/** A copy of a tiling texture with its own repeat, so each wall keeps the pattern at real scale. */
const tiled = (t: THREE.Texture, rx: number, ry: number) => {
  const c = t.clone()
  c.repeat.set(rx, ry)
  c.needsUpdate = true
  return c
}

function useMaterials() {
  return useMemo(() => ({
    wall: new THREE.MeshLambertMaterial({ map: tiled(plasterTexture(), 12, 3.5) }),
    feature: new THREE.MeshLambertMaterial({ map: tiled(microcementTexture(), 14, 3) }),
    panel: new THREE.MeshLambertMaterial({ map: tiled(panelTexture(), (halfD * 2) / 1.8, 1) }),
    ceiling: new THREE.MeshLambertMaterial({ color: '#F8F9FB' }),
    floor: new THREE.MeshLambertMaterial({ map: floorTexture() }),
    white: new THREE.MeshLambertMaterial({ color: '#ffffff' }),
    ink: new THREE.MeshLambertMaterial({ color: '#12141C' }),
    blue: new THREE.MeshLambertMaterial({ color: BRAND }),
    oak: new THREE.MeshLambertMaterial({ color: '#C9A77C' }),
    light: new THREE.MeshBasicMaterial({ color: '#ffffff' }),
    ao: new THREE.MeshBasicMaterial({ map: gradient(), transparent: true, depthWrite: false }),
    plant: new THREE.MeshLambertMaterial({ color: '#4C7A55' }),
    walnut: new THREE.MeshLambertMaterial({ color: '#3A2C22' }),
    metal: new THREE.MeshLambertMaterial({ color: '#9AA0A8' }),
  }), [])
}
type Mats = ReturnType<typeof useMaterials>

function gradient() {
  const c = document.createElement('canvas')
  c.width = 4
  c.height = 64
  const ctx = c.getContext('2d')!
  const g = ctx.createLinearGradient(0, 64, 0, 0)
  g.addColorStop(0, 'rgba(40,45,70,0.28)')
  g.addColorStop(1, 'rgba(40,45,70,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 4, 64)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

const glossy = typeof window !== 'undefined' && !window.matchMedia('(pointer: coarse)').matches

/** Satin-finished oak: on desktops it softly reflects the displays and the lights. */
function Floor({ m }: { m: Mats }) {
  if (!glossy) {
    return (
      <mesh rotation-x={-Math.PI / 2} material={m.floor}>
        <planeGeometry args={[halfW * 2, halfD * 2]} />
      </mesh>
    )
  }
  return (
    <mesh rotation-x={-Math.PI / 2}>
      <planeGeometry args={[halfW * 2, halfD * 2]} />
      <MeshReflectorMaterial
        map={m.floor.map}
        resolution={512}
        blur={[400, 120]}
        mixBlur={1}
        mixStrength={0.9}
        mixContrast={1}
        mirror={0.4}
        depthScale={0.6}
        minDepthThreshold={0.6}
        maxDepthThreshold={1.3}
        roughness={0.85}
        metalness={0}
      />
    </mesh>
  )
}

export function Room() {
  const m = useMaterials()
  return (
    <group>
      <Floor m={m} />
      <mesh rotation-x={Math.PI / 2} position-y={height} material={m.ceiling}>
        <planeGeometry args={[halfW * 2, halfD * 2]} />
      </mesh>
      {/* the back wall is a dark feature wall, so the white displays stand out like in a gallery */}
      <mesh position={[0, height / 2, -halfD]} material={m.feature}>
        <planeGeometry args={[halfW * 2, height]} />
      </mesh>
      <mesh position={[-halfW, height / 2, 0]} rotation-y={Math.PI / 2} material={m.wall}>
        <planeGeometry args={[halfD * 2, height]} />
      </mesh>
      <mesh position={[halfW, height / 2, 0]} rotation-y={-Math.PI / 2} material={m.wall}>
        <planeGeometry args={[halfD * 2, height]} />
      </mesh>
      <Wainscot m={m} />
      {/* Front wall, so a full look-around never shows the void. It faces inward only:
          from outside (the intro fly-in) it is invisible. */}
      <FrontWall m={m} />
      {/* contact shadows + a brand-orange skirting line */}
      {([[0, -halfD + 0.01, 0, halfW * 2], [-halfW + 0.01, 0, Math.PI / 2, halfD * 2], [halfW - 0.01, 0, -Math.PI / 2, halfD * 2], [0, halfD - 0.01, Math.PI, halfW * 2]] as const).map(([x, z, r, len], i) => (
        <group key={i} position={[x, 0, z]} rotation-y={r}>
          <mesh position-y={0.45} material={m.ao}><planeGeometry args={[len, 0.9]} /></mesh>
          <mesh position={[0, 0.06, 0.005]} material={m.blue}><planeGeometry args={[len, 0.12]} /></mesh>
        </group>
      ))}
      <CeilingLights m={m} />
      <CornerShade m={m} />
      <SunPatches />
      <DoorMat m={m} />

      <ServiceRail m={m} />
      <ProductPlinth m={m} />
      <WorkWallBacking m={m} />
      <Kiosk m={m} />
      <ProcessArrows m={m} />
      <ContactDesk m={m} />
      {(['services', 'products', 'work', 'tech', 'process'] as StopId[]).map((s) => <HangingSign key={s} stop={s} m={m} />)}
    </group>
  )
}

function ServiceRail({ m }: { m: Mats }) {
  const F = STOP_FRAMES.services
  const len = SERVICES.length * SERVICE_CARD.gap + 0.6
  const x = -halfW + 0.55
  return (
    <group position={[x, 0, F.center.z]}>
      <mesh position-y={SERVICE_RAIL_Y} rotation-x={Math.PI / 2} material={m.ink}>
        <cylinderGeometry args={[0.03, 0.03, len, 10]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[-0.27, SERVICE_RAIL_Y, (s * len) / 2]} material={m.ink}>
          <boxGeometry args={[0.55, 0.05, 0.05]} />
        </mesh>
      ))}
      {/* hanging wires from the rail to each card */}
      {SERVICES.map((_, i) => {
        const z = -((i - (SERVICES.length - 1) / 2) * SERVICE_CARD.gap)
        return (
          <mesh key={i} position={[0, SERVICE_RAIL_Y - 0.14, z]} material={m.ink}>
            <boxGeometry args={[0.01, 0.28, 0.01]} />
          </mesh>
        )
      })}
    </group>
  )
}

function ProductPlinth({ m }: { m: Mats }) {
  return (
    <group position={[-10, 0, -halfD]}>
      <mesh position={[0, PRODUCT_BOX.plinthTop / 2, 0.75]} material={m.white}>
        <boxGeometry args={[PRODUCT_SHELF, PRODUCT_BOX.plinthTop, 1.3]} />
      </mesh>
      <mesh position={[0, PRODUCT_BOX.plinthTop - 0.02, 1.405]} material={m.blue}>
        <boxGeometry args={[PRODUCT_SHELF, 0.04, 0.01]} />
      </mesh>
      <mesh position={[0, 3.3, 0.02]} material={m.white}>
        <boxGeometry args={[PRODUCT_SHELF + 0.2, 0.06, 0.04]} />
      </mesh>
    </group>
  )
}

function WorkWallBacking({ m }: { m: Mats }) {
  return (
    <mesh position={[10, 3.3, -halfD + 0.015]} material={m.white}>
      <boxGeometry args={[10.4, 4.7, 0.03]} />
    </mesh>
  )
}

function Kiosk({ m }: { m: Mats }) {
  return (
    <group position={[KIOSK_POS.x, 0, KIOSK_POS.z]} rotation-y={yawOf(KIOSK_NORMAL)}>
      <mesh position-y={0.02} material={m.ink}>
        <cylinderGeometry args={[0.45, 0.5, 0.04, 24]} />
      </mesh>
      <mesh position-y={0.55} material={m.ink}>
        <boxGeometry args={[0.16, 1.1, 0.16]} />
      </mesh>
      <mesh position={[0, 1.55, 0.04]} material={m.ink}>
        <boxGeometry args={[1.42, 1.06, 0.12]} />
      </mesh>
      <mesh position={[0, 2.35, 0.04]} material={m.blue}>
        <boxGeometry args={[1.42, 0.3, 0.1]} />
      </mesh>
      <HangingSignInline stop="courier" position={[0, 2.35, 0.1]} />
    </group>
  )
}

function ProcessArrows({ m }: { m: Mats }) {
  const F = STOP_FRAMES.process
  return (
    <group>
      {[0, 1, 2].map((i) => {
        const z = F.center.z + (i - 1) * PROCESS_BOARD.gap
        return (
          <mesh key={i} position={[halfW - 0.05, 2.6, z]} rotation-x={Math.PI / 2} material={m.blue}>
            <coneGeometry args={[0.13, 0.26, 3]} />
          </mesh>
        )
      })}
    </group>
  )
}

function ContactDesk({ m }: { m: Mats }) {
  const lang = useStore((s) => s.lang)
  const front = useMemo(() => new THREE.MeshBasicMaterial({ map: deskTexture(lang) }), [lang])
  return (
    <group position={[halfW - 1.3, 0, 5.5]} rotation-y={-Math.PI / 2}>
      <mesh position-y={0.5} material={m.white}>
        <boxGeometry args={[2.8, 1, 0.9]} />
      </mesh>
      <mesh position-y={1.03} material={m.oak}>
        <boxGeometry args={[3, 0.06, 1.05]} />
      </mesh>
      <mesh position={[0, 0.55, 0.455]} material={front}>
        <planeGeometry args={[2.4, 0.94]} />
      </mesh>
    </group>
  )
}

export const WIN = { x0: 4, x1: 12, y0: 1, y1: 4.2 }

function Window({ m, cx }: { m: Mats; cx: number }) {
  const glass = useMemo(() => new THREE.MeshBasicMaterial({ color: '#CFE4F2', transparent: true, opacity: 0.1, depthWrite: false }), [])
  const w = WIN.x1 - WIN.x0
  const h = WIN.y1 - WIN.y0
  const cy = (WIN.y0 + WIN.y1) / 2
  return (
    <group position={[cx, 0, 0]}>
      <mesh position={[0, cy, -0.02]} material={glass}><planeGeometry args={[w, h]} /></mesh>
      {/* frame, mullions and sill */}
      {[WIN.y0, WIN.y1].map((y) => <mesh key={y} position={[0, y, 0.03]} material={m.ink}><boxGeometry args={[w + 0.12, 0.1, 0.08]} /></mesh>)}
      {[-w / 2, -w / 4, 0, w / 4, w / 2].map((x) => <mesh key={x} position={[x, cy, 0.03]} material={m.ink}><boxGeometry args={[0.08, h, 0.08]} /></mesh>)}
      <mesh position={[0, WIN.y0 - 0.04, 0.12]} material={m.white}><boxGeometry args={[w + 0.3, 0.06, 0.26]} /></mesh>
    </group>
  )
}

/** Frosted "etched glass" band across the door leaves. */
function etchTexture() {
  const c = document.createElement('canvas')
  c.width = 1024
  c.height = 96
  const ctx = c.getContext('2d')!
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.fillRect(0, 0, 1024, 96)
  ctx.globalCompositeOperation = 'destination-out'
  ctx.font = '700 44px "Anek Bangla Variable", system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.letterSpacing = '14px'
  ctx.fillText('CODER ZONE BD', 512, 50)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

export const DOOR = { w: 2.8, h: 3.1 }

/** Glass double doors in slim black frames with tall brand-orange pulls: the street shows through. */
function GlassDoor({ m }: { m: Mats }) {
  const glass = useMemo(() => new THREE.MeshBasicMaterial({ color: '#D6E9F5', transparent: true, opacity: 0.08, depthWrite: false, side: THREE.DoubleSide }), [])
  const sheen = useMemo(() => new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.08, depthWrite: false, side: THREE.DoubleSide }), [])
  const etch = useMemo(() => new THREE.MeshBasicMaterial({ map: etchTexture(), transparent: true, depthWrite: false, side: THREE.DoubleSide }), [])
  const steel = useMemo(() => new THREE.MeshLambertMaterial({ color: '#1A1C22' }), [])
  const leaf = DOOR.w / 2
  return (
    <Hot tip={{ bn: 'পুরো স্টুডিও দেখুন', en: 'See the whole studio' }} onPick={() => useStore.getState().setOverview(true)}>
      <group>
        {[-1, 1].map((side) => (
          <Hinge key={side} side={side} x={side * DOOR.w / 2}>
          <group position={[-side * leaf / 2, 0, 0]}>
            <mesh position-y={DOOR.h / 2} material={glass}><planeGeometry args={[leaf - 0.08, DOOR.h - 0.08]} /></mesh>
            {/* a diagonal reflection streak, so the glass reads as glass */}
            <mesh position={[side * -0.15, DOOR.h * 0.55, 0.005]} rotation-z={0.5} material={sheen}><planeGeometry args={[0.18, 2.2]} /></mesh>
            <mesh position={[0, 1.55, 0.006]} material={etch}><planeGeometry args={[leaf - 0.1, 0.16]} /></mesh>
            {/* slim frame */}
            {[0.02, DOOR.h - 0.02].map((y) => <mesh key={y} position={[0, y, 0]} material={steel}><boxGeometry args={[leaf, 0.06, 0.06]} /></mesh>)}
            {[-leaf / 2, leaf / 2].map((x) => <mesh key={x} position={[x, DOOR.h / 2, 0]} material={steel}><boxGeometry args={[0.05, DOOR.h, 0.06]} /></mesh>)}
            {/* tall pull handle by the meeting edge */}
            <group position={[-side * (leaf / 2 - 0.16), 1.15, 0.09]}>
              <mesh material={m.blue}><cylinderGeometry args={[0.022, 0.022, 1.3, 12]} /></mesh>
              {[-0.55, 0.55].map((y) => <mesh key={y} position={[0, y, -0.045]} rotation-x={Math.PI / 2} material={m.blue}><cylinderGeometry args={[0.012, 0.012, 0.09, 8]} /></mesh>)}
            </group>
          </group>
          </Hinge>
        ))}
        {/* header and floor threshold */}
        <mesh position={[0, DOOR.h + 0.06, 0]} material={steel}><boxGeometry args={[DOOR.w + 0.16, 0.12, 0.14]} /></mesh>
        <mesh position={[0, 0.005, 0]} material={m.metal}><boxGeometry args={[DOOR.w + 0.16, 0.01, 0.2]} /></mesh>
      </group>
    </Hot>
  )
}

/** A door leaf on its hinge at the outer edge; swings into the room when the door opens. */
function Hinge({ side, x, children }: { side: number; x: number; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (!ref.current) return
    const open = useStore.getState().doorOpen
    ref.current.rotation.y = THREE.MathUtils.damp(ref.current.rotation.y, open ? side * 1.45 : 0, 2.6, Math.min(dt, 0.05))
  })
  return <group ref={ref} position-x={x}>{children}</group>
}

/** The storefront seen from the street: dark cladding, a backlit sign, an orange canopy and the upper floors. */
function Exterior({ hw }: { hw: number }) {
  const m = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 256
    c.height = 128
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#CFC8BC'
    ctx.fillRect(0, 0, 256, 128)
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 8; col++) {
        ctx.fillStyle = (row + col) % 3 ? '#5D7286' : '#7F95A8'
        ctx.fillRect(10 + col * 31, 14 + row * 58, 20, 36)
        ctx.fillStyle = '#B9B1A4'
        ctx.fillRect(8 + col * 31, 50 + row * 58, 24, 4)
      }
    }
    const upper = new THREE.CanvasTexture(c)
    upper.colorSpace = THREE.SRGBColorSpace
    return {
      clad: new THREE.MeshLambertMaterial({ color: '#2B2E36' }),
      upper: new THREE.MeshLambertMaterial({ map: upper }),
      sign: new THREE.MeshBasicMaterial({ map: signboardTexture(), toneMapped: false }),
      canopy: new THREE.MeshLambertMaterial({ color: BRAND }),
      ink: new THREE.MeshLambertMaterial({ color: '#16181D' }),
    }
  }, [])
  const side = halfW - WIN.x1
  // Built in the front wall's own frame: local -z is the street side.
  const out = (x: number, y: number, w: number, h: number, mat: THREE.Material, key: string) => (
    <mesh key={key} position={[x, y, -0.14]} rotation-y={Math.PI} material={mat}><planeGeometry args={[w, h]} /></mesh>
  )
  return (
    <group>
      {[-1, 1].flatMap((sx) => [
        out(sx * (WIN.x0 + halfW) / 2, WIN.y0 / 2, halfW - WIN.x0, WIN.y0, m.clad, `b${sx}`),
        out(sx * (halfW - side / 2), (WIN.y0 + WIN.y1) / 2, side, WIN.y1 - WIN.y0, m.clad, `s${sx}`),
        out(sx * (hw + WIN.x0) / 2, WIN.y1 / 2, WIN.x0 - hw, WIN.y1, m.clad, `m${sx}`),
      ])}
      {out(0, (DOOR.h + 0.12 + WIN.y1) / 2, hw * 2, WIN.y1 - DOOR.h - 0.12, m.clad, 'top-door')}
      {out(0, (WIN.y1 + height) / 2, halfW * 2, height - WIN.y1, m.clad, 'band')}
      {out(0, height + 3, halfW * 2, 6, m.upper, 'upper')}
      {/* backlit sign and a slim orange canopy over the entrance */}
      <mesh position={[0, 5.45, -0.2]} rotation-y={Math.PI} material={m.sign}><planeGeometry args={[8, 1.6]} /></mesh>
      <mesh position={[0, 5.45, -0.17]} material={m.ink}><boxGeometry args={[8.2, 1.8, 0.04]} /></mesh>
      <mesh position={[0, DOOR.h + 0.32, -0.62]} rotation-x={-0.18} material={m.canopy}><boxGeometry args={[DOOR.w + 1.4, 0.06, 1.0]} /></mesh>
      <WelcomeBanner position={[0, 4.0, -0.2]} />
    </group>
  )
}

/** Oak panelling to waist height along both side walls, with a walnut cap rail. */
function Wainscot({ m }: { m: Mats }) {
  const H = 1.1
  return (
    <>
      {[-1, 1].map((sx) => (
        <group key={sx} position={[sx * (halfW - 0.015), 0, 0]} rotation-y={-sx * Math.PI / 2}>
          <mesh position-y={H / 2 + 0.12} material={m.panel}><planeGeometry args={[halfD * 2, H - 0.12]} /></mesh>
          <mesh position={[0, H + 0.02, 0.02]} material={m.walnut}><boxGeometry args={[halfD * 2, 0.05, 0.05]} /></mesh>
        </group>
      ))}
    </>
  )
}

/** Soft shading where walls meet each other and the ceiling, like baked ambient occlusion. */
function CornerShade({ m }: { m: Mats }) {
  const walls = [
    { pos: [0, 0, -halfD + 0.012] as const, rot: 0, len: halfW * 2 },
    { pos: [-halfW + 0.012, 0, 0] as const, rot: Math.PI / 2, len: halfD * 2 },
    { pos: [halfW - 0.012, 0, 0] as const, rot: -Math.PI / 2, len: halfD * 2 },
    { pos: [0, 0, halfD - 0.012] as const, rot: Math.PI, len: halfW * 2 },
  ]
  return (
    <group>
      {walls.map((w, i) => (
        <group key={i} position={w.pos as unknown as [number, number, number]} rotation-y={w.rot}>
          {/* ceiling line */}
          <mesh position-y={height - 0.6} rotation-z={Math.PI} material={m.ao}><planeGeometry args={[w.len, 1.2]} /></mesh>
          {/* both vertical corners */}
          {[-1, 1].map((sx) => (
            <mesh key={sx} position={[sx * (w.len / 2 - 0.55), height / 2, 0]} rotation-z={sx * Math.PI / 2} material={m.ao}><planeGeometry args={[height, 1.1]} /></mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

/** Sunlight through the front windows, falling on the floor; follows the sun in Dhaka. */
function SunPatches() {
  const phase = usePhase()
  // no sun on the floor when it's overcast, raining or foggy outside
  const sunny = useWeather((w) => w.kind === 'clear')
  const mat = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 512
    c.height = 128
    const ctx = c.getContext('2d')!
    ctx.filter = 'blur(6px)'
    ctx.fillStyle = '#ffffff'
    for (let i = 0; i < 4; i++) ctx.fillRect(16 + i * 124, 16, 108, 96)
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })
  }, [])
  const light = phase === 'day' ? { c: '#FFF1D2', o: 0.16, skew: -1.2 } : phase === 'dawn' ? { c: '#FFC48A', o: 0.12, skew: 2.2 } : phase === 'dusk' ? { c: '#FFA65C', o: 0.12, skew: -2.6 } : null
  if (!light || !sunny) return null
  mat.color.set(light.c)
  mat.opacity = light.o
  return (
    <group position-y={0.016}>
      {[-1, 1].map((sx) => (
        <mesh key={sx} position={[sx * (WIN.x0 + WIN.x1) / 2 + light.skew, 0, halfD - 2.4]} rotation-x={-Math.PI / 2} material={mat}>
          <planeGeometry args={[WIN.x1 - WIN.x0, 3.2]} />
        </mesh>
      ))}
    </group>
  )
}

/** Walnut backing with vertical oak slats: the entrance feature wall either side of the door. */
function SlatPanel({ m, x0, x1 }: { m: Mats; x0: number; x1: number }) {
  const w = x1 - x0
  const n = Math.floor(w / 0.2)
  return (
    <group position={[(x0 + x1) / 2, 0, 0]}>
      <mesh position-y={WIN.y1 / 2} material={m.walnut}><planeGeometry args={[w, WIN.y1]} /></mesh>
      {Array.from({ length: n }, (_, i) => (
        <mesh key={i} position={[-w / 2 + (i + 0.5) * (w / n), WIN.y1 / 2, 0.03]} material={m.oak}>
          <boxGeometry args={[0.075, WIN.y1, 0.05]} />
        </mesh>
      ))}
    </group>
  )
}

/** Brass light switch on the slats; flips every office light. */
function LightSwitch({ x }: { x: number }) {
  const lightsOn = useStore((s) => s.lightsOn)
  const brass = useMemo(() => new THREE.MeshLambertMaterial({ color: '#C9A24A' }), [])
  const rocker = useMemo(() => new THREE.MeshLambertMaterial({ color: '#F4EEE2' }), [])
  return (
    <Hot tip={lightsOn ? { bn: 'লাইট বন্ধ করুন (L)', en: 'Turn the lights off (L)' } : { bn: 'লাইট জ্বালান (L)', en: 'Turn the lights on (L)' }} onPick={() => useStore.getState().toggleLights()}>
      <group position={[x, 1.3, 0.07]}>
        <mesh material={brass}><boxGeometry args={[0.16, 0.24, 0.02]} /></mesh>
        <mesh position-z={0.015} rotation-x={lightsOn ? -0.18 : 0.18} material={rocker}><boxGeometry args={[0.07, 0.12, 0.02]} /></mesh>
      </group>
    </Hot>
  )
}

function FrontWall({ m }: { m: Mats }) {
  const lang = useStore((s) => s.lang)
  const sign = useMemo(() => new THREE.MeshBasicMaterial({ map: frontWallTexture(lang), transparent: true }), [lang])
  const hw = DOOR.w / 2 + 0.08
  const side = halfW - WIN.x1
  return (
    <group position={[0, 0, halfD]} rotation-y={Math.PI}>
      {/* wall around two big windows (|x| 4…12, y 1…4.2) and a glass entrance (|x| < 1.48) */}
      {[-1, 1].map((sx) => (
        <group key={sx}>
          <mesh position={[sx * (WIN.x0 + halfW) / 2, WIN.y0 / 2, 0]} material={m.wall}><planeGeometry args={[halfW - WIN.x0, WIN.y0]} /></mesh>
          <mesh position={[sx * (halfW - side / 2), (WIN.y0 + WIN.y1) / 2, 0]} material={m.wall}><planeGeometry args={[side, WIN.y1 - WIN.y0]} /></mesh>
          <Window m={m} cx={sx * (WIN.x0 + WIN.x1) / 2} />
          <SlatPanel m={m} x0={sx > 0 ? hw : -WIN.x0} x1={sx > 0 ? WIN.x0 : -hw} />
        </group>
      ))}
      <mesh position-y={(WIN.y1 + height) / 2} material={m.wall}><planeGeometry args={[halfW * 2, height - WIN.y1]} /></mesh>
      <mesh position={[0, (DOOR.h + 0.12 + WIN.y1) / 2, 0]} material={m.walnut}><planeGeometry args={[hw * 2, WIN.y1 - DOOR.h - 0.12]} /></mesh>
      <GlassDoor m={m} />
      <Exterior hw={hw} />
      <LightSwitch x={hw + 0.35} />
      <mesh position={[0, 5.45, 0.02]} material={sign}>
        <planeGeometry args={[7.2, 1.84]} />
      </mesh>
    </group>
  )
}

/** Entrance mat just inside the doors. */
function DoorMat({ m }: { m: Mats }) {
  return (
    <group position={[0, 0.008, halfD - 0.9]}>
      <mesh rotation-x={-Math.PI / 2} material={m.ink}><planeGeometry args={[2.6, 1.2]} /></mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.001, 0.52]} material={m.blue}><planeGeometry args={[2.6, 0.06]} /></mesh>
    </group>
  )
}

/** Recessed linear ceiling lights with a soft glow on the ceiling; they dim with the switch. */
function CeilingLights({ m }: { m: Mats }) {
  const glow = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 8
    c.height = 128
    const ctx = c.getContext('2d')!
    const g = ctx.createLinearGradient(0, 0, 0, 128)
    g.addColorStop(0, 'rgba(255,236,205,0)')
    g.addColorStop(0.5, 'rgba(255,236,205,0.55)')
    g.addColorStop(1, 'rgba(255,236,205,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 8, 128)
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })
  }, [])
  const ON = useMemo(() => new THREE.Color('#ffffff'), [])
  const OFF = useMemo(() => new THREE.Color('#5a5e68'), [])
  useFrame((_, dt) => {
    const on = useStore.getState().lightsOn
    const k = 1 - Math.exp(-4 * Math.min(dt, 0.05))
    m.light.color.lerp(on ? ON : OFF, k)
    glow.opacity = THREE.MathUtils.damp(glow.opacity, on ? 1 : 0, 4, Math.min(dt, 0.05))
  })
  return (
    <>
      {[-7, -3.5, 0, 3.5, 7].map((z) => (
        <group key={z} position={[0, height, z]}>
          <mesh position-y={-0.03} material={m.light}><boxGeometry args={[halfW * 1.6, 0.04, 0.2]} /></mesh>
          <mesh position-y={-0.012} rotation-x={Math.PI / 2} material={glow}><planeGeometry args={[halfW * 1.7, 1.6]} /></mesh>
        </group>
      ))}
    </>
  )
}

function HangingSign({ stop, m }: { stop: StopId; m: Mats }) {
  const F = STOP_FRAMES[stop]
  const pos = F.center.clone().addScaledVector(F.normal, 0.9)
  const y = stop === 'work' ? 6.2 : 5.5
  return (
    <group position={[pos.x, y, pos.z]} rotation-y={yawOf(F.normal)}>
      <HangingSignInline stop={stop} />
      {[-0.9, 0.9].map((x) => (
        <mesh key={x} position={[x, (height - y) / 2 + 0.15, 0]} material={m.ink}>
          <boxGeometry args={[0.012, height - y - 0.3, 0.012]} />
        </mesh>
      ))}
    </group>
  )
}

function HangingSignInline({ stop, position }: { stop: StopId; position?: [number, number, number] }) {
  const lang = useStore((s) => s.lang)
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ map: signTexture(stop, lang) }), [stop, lang])
  const small = stop === 'courier'
  return (
    <mesh position={position} material={mat}>
      <boxGeometry args={small ? [1.2, 0.3, 0.02] : [2.4, 0.6, 0.05]} />
    </mesh>
  )
}

