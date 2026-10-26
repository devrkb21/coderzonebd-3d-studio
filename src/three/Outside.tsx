// The street outside the front windows: sky, buildings, street lights and passing cars.
// Everything follows Bangladesh time (see time.ts): day, dusk, night and dawn.
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ROOM } from './layout'
import { StreetLife } from './Street'
import { usePhase, type Phase } from './time'

const { halfD } = ROOM
const SIDEWALK = { z0: halfD, z1: halfD + 3.2 }
const ROAD = { z0: halfD + 3.2, z1: halfD + 10.4 }
const FAR_WALK = { z0: ROAD.z1, z1: ROAD.z1 + 2.4 }
const BUILD_Z = FAR_WALK.z1 + 2

export const SKY: Record<Phase, { top: string; bottom: string; ground: string; bg: string }> = {
  day: { top: '#5FA8E8', bottom: '#D8ECFA', ground: '#8DA36E', bg: '#CFE6F7' },
  dawn: { top: '#7C8FC4', bottom: '#F6C9A0', ground: '#6E7E58', bg: '#E9C6A9' },
  dusk: { top: '#3B3F7A', bottom: '#F49A5A', ground: '#5A6448', bg: '#C9805A' },
  night: { top: '#070B1E', bottom: '#1C2550', ground: '#1E2418', bg: '#0C1230' },
}

function canvasTex(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  draw(c.getContext('2d')!)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function skyTexture(phase: Phase) {
  const s = SKY[phase]
  return canvasTex(64, 512, (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, 512)
    g.addColorStop(0, s.top)
    g.addColorStop(1, s.bottom)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 64, 512)
    if (phase === 'night') {
      ctx.fillStyle = '#ffffff'
      for (let i = 0; i < 70; i++) {
        const x = (i * 37.3) % 64
        const y = (i * 91.7) % 330
        ctx.globalAlpha = 0.35 + ((i * 13) % 10) / 16
        ctx.fillRect(x, y, 1, 1)
      }
      ctx.globalAlpha = 1
    }
  })
}

/** A facade: concrete with a grid of windows; at night a share of them are lit. */
function facadeTexture(seed: number, night: boolean, tone: string) {
  return canvasTex(128, 256, (ctx) => {
    ctx.fillStyle = tone
    ctx.fillRect(0, 0, 128, 256)
    for (let row = 0; row < 16; row++) {
      for (let col = 0; col < 6; col++) {
        const lit = ((seed * 31 + row * 7 + col * 13) % 10) < 4
        ctx.fillStyle = night ? (lit ? '#FFD98A' : '#1A2030') : (row + col + seed) % 5 === 0 ? '#9DB4C8' : '#6F8499'
        ctx.fillRect(8 + col * 20, 8 + row * 15.5, 12, 9)
      }
    }
  })
}

const rand = (i: number) => { const x = Math.sin(i * 127.1) * 43758.5453; return x - Math.floor(x) }

export function Outside() {
  const phase = usePhase()
  const night = phase === 'night'
  const s = SKY[phase]

  const mats = useMemo(() => ({
    sky: new THREE.MeshBasicMaterial({ map: skyTexture(phase), depthWrite: false, fog: false }),
    ground: new THREE.MeshBasicMaterial({ color: s.ground }),
    walk: new THREE.MeshBasicMaterial({ color: night ? '#4A4C52' : '#B9B6AE' }),
    road: new THREE.MeshBasicMaterial({ color: night ? '#1B1C20' : '#3B3D42' }),
    paint: new THREE.MeshBasicMaterial({ color: night ? '#9A9A88' : '#F2F0E6' }),
    pole: new THREE.MeshBasicMaterial({ color: '#3A3D44' }),
    lamp: new THREE.MeshBasicMaterial({ color: night || phase === 'dusk' ? '#FFE3A1' : '#D9D9D2' }),
    glow: new THREE.MeshBasicMaterial({ color: '#FFD98A', transparent: true, opacity: night ? 0.22 : 0, depthWrite: false }),
    tree: new THREE.MeshBasicMaterial({ color: night ? '#22361F' : '#4F7D43' }),
    trunk: new THREE.MeshBasicMaterial({ color: '#5B4430' }),
    disc: new THREE.MeshBasicMaterial({ color: night ? '#F4F1E6' : phase === 'day' ? '#FFF6C9' : '#FFB46B', fog: false }),
  }), [phase, night, s.ground])

  const facades = useMemo(() => ['#C9C4BA', '#A9B1BB', '#D8CDBE', '#9AA3A9'].map((tone, i) => facadeTexture(i + 1, night, night ? '#2A2E38' : tone)), [night])

  const buildings = useMemo(() => Array.from({ length: 16 }, (_, i) => {
    const w = 7 + rand(i) * 6
    const h = 9 + rand(i + 50) * 24
    const d = 6 + rand(i + 90) * 4
    const x = -64 + i * 8.6 + rand(i + 20) * 2
    return { x, w, h, d, z: BUILD_Z + d / 2 + rand(i + 70) * 6, tex: i % facades.length }
  }), [facades.length])

  return (
    <group>
      {/* sky and sun / moon */}
      <mesh position={[0, 32, 95]} rotation-y={Math.PI} material={mats.sky}>
        <planeGeometry args={[320, 110]} />
      </mesh>
      <mesh position={[phase === 'dawn' ? 30 : phase === 'dusk' ? -30 : -12, phase === 'day' ? 40 : phase === 'night' ? 34 : 9, 92]} rotation-y={Math.PI} material={mats.disc}>
        <circleGeometry args={[phase === 'night' ? 2.6 : 3.4, 32]} />
      </mesh>

      {/* ground, sidewalks, road and lane markings */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.02, halfD + 45]} material={mats.ground}>
        <planeGeometry args={[320, 90]} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, (SIDEWALK.z0 + SIDEWALK.z1) / 2]} material={mats.walk}>
        <planeGeometry args={[320, SIDEWALK.z1 - SIDEWALK.z0]} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.0, (ROAD.z0 + ROAD.z1) / 2]} material={mats.road}>
        <planeGeometry args={[320, ROAD.z1 - ROAD.z0]} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, (FAR_WALK.z0 + FAR_WALK.z1) / 2]} material={mats.walk}>
        <planeGeometry args={[320, FAR_WALK.z1 - FAR_WALK.z0]} />
      </mesh>
      {Array.from({ length: 40 }, (_, i) => (
        <mesh key={i} rotation-x={-Math.PI / 2} position={[-156 + i * 8, 0.015, (ROAD.z0 + ROAD.z1) / 2]} material={mats.paint}>
          <planeGeometry args={[3, 0.18]} />
        </mesh>
      ))}

      {/* buildings across the street */}
      {buildings.map((b, i) => <Building key={i} {...b} map={facades[b.tex]} />)}

      {/* street lights and trees along the near sidewalk */}
      {Array.from({ length: 9 }, (_, i) => {
        const x = -40 + i * 10
        return (
          <group key={i} position={[x, 0, SIDEWALK.z1 - 0.4]}>
            <mesh position-y={2.6} material={mats.pole}><cylinderGeometry args={[0.07, 0.09, 5.2, 8]} /></mesh>
            <mesh position={[0, 5.15, 0.6]} material={mats.pole}><boxGeometry args={[0.08, 0.08, 1.2]} /></mesh>
            <mesh position={[0, 5.05, 1.15]} material={mats.lamp}><boxGeometry args={[0.5, 0.12, 0.3]} /></mesh>
            <mesh rotation-x={-Math.PI / 2} position={[0, 0.03, 1.4]} material={mats.glow}><circleGeometry args={[2.4, 24]} /></mesh>
            {i % 2 === 0 && (
              <group position={[5, 0, -0.9]}>
                <mesh position-y={1.2} material={mats.trunk}><cylinderGeometry args={[0.12, 0.16, 2.4, 8]} /></mesh>
                <mesh position-y={3.1} material={mats.tree}><icosahedronGeometry args={[1.5, 1]} /></mesh>
              </group>
            )}
          </group>
        )
      })}

      <Traffic night={night} />
      <StreetLife night={night} />
    </group>
  )
}

function Building({ x, w, h, d, z, map }: { x: number; w: number; h: number; d: number; z: number; map: THREE.Texture }) {
  const mat = useMemo(() => {
    const t = map.clone()
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(Math.max(1, Math.round(w / 6)), Math.max(1, Math.round(h / 9)))
    t.needsUpdate = true
    return new THREE.MeshBasicMaterial({ map: t })
  }, [map, w, h])
  return (
    <mesh position={[x, h / 2, z]} material={mat}>
      <boxGeometry args={[w, h, d]} />
    </mesh>
  )
}

const CAR_COLORS = ['#C0392B', '#F5F5F0', '#2C3E50', '#F1C40F', '#2E86C1', '#7F8C8D', '#16A085']
const LANE_A = ROAD.z0 + 1.9 // nearer lane, driving +x
const LANE_B = ROAD.z1 - 1.9 // far lane, driving -x
const SPAN = 150

function Traffic({ night }: { night: boolean }) {
  const cars = useMemo(() => Array.from({ length: 8 }, (_, i) => ({
    dir: i % 2 === 0 ? 1 : -1,
    speed: 7 + rand(i + 5) * 6,
    offset: rand(i + 11) * SPAN,
    color: CAR_COLORS[i % CAR_COLORS.length],
    bus: i === 3,
  })), [])
  return <>{cars.map((c, i) => <Car key={i} {...c} night={night} />)}</>
}

function Car({ dir, speed, offset, color, bus, night }: { dir: number; speed: number; offset: number; color: string; bus: boolean; night: boolean }) {
  const ref = useRef<THREE.Group>(null)
  const mats = useMemo(() => ({
    body: new THREE.MeshBasicMaterial({ color: night ? new THREE.Color(color).multiplyScalar(0.35) : new THREE.Color(color).multiplyScalar(0.92) }),
    glass: new THREE.MeshBasicMaterial({ color: night ? '#0E1320' : '#2B3A4A' }),
    tyre: new THREE.MeshBasicMaterial({ color: '#141414' }),
    head: new THREE.MeshBasicMaterial({ color: night ? '#FFF6D0' : '#E8E8E0' }),
    tail: new THREE.MeshBasicMaterial({ color: night ? '#FF2A2A' : '#9E2B2B' }),
    beam: new THREE.MeshBasicMaterial({ color: '#FFF1B8', transparent: true, opacity: night ? 0.16 : 0, depthWrite: false }),
  }), [color, night])
  const len = bus ? 9 : 4.2
  const hgt = bus ? 2.6 : 0.8
  useFrame(({ clock }) => {
    const g = ref.current
    if (!g) return
    const t = (clock.elapsedTime * speed + offset) % SPAN
    g.position.x = dir > 0 ? -SPAN / 2 + t : SPAN / 2 - t
  })
  return (
    <group ref={ref} position={[0, 0, dir > 0 ? LANE_A : LANE_B]} rotation-y={dir > 0 ? 0 : Math.PI}>
      <mesh position-y={0.35 + hgt / 2} material={mats.body}><boxGeometry args={[len, hgt, 1.8]} /></mesh>
      {bus ? (
        <mesh position={[0, 0.35 + hgt * 0.62, 0]} material={mats.glass}><boxGeometry args={[len - 0.4, hgt * 0.32, 1.82]} /></mesh>
      ) : (
        <mesh position={[-0.2, 0.35 + hgt + 0.32, 0]} material={mats.glass}><boxGeometry args={[2.2, 0.64, 1.6]} /></mesh>
      )}
      {[-1, 1].flatMap((sx) => [-1, 1].map((sz) => (
        <mesh key={`${sx}${sz}`} position={[sx * (len / 2 - 0.8), 0.35, sz * 0.86]} rotation-x={Math.PI / 2} material={mats.tyre}>
          <cylinderGeometry args={[0.35, 0.35, 0.25, 12]} />
        </mesh>
      )))}
      {[-0.6, 0.6].map((z) => (
        <group key={z}>
          <mesh position={[len / 2 + 0.01, 0.75, z]} rotation-y={Math.PI / 2} material={mats.head}><planeGeometry args={[0.32, 0.16]} /></mesh>
          <mesh position={[-len / 2 - 0.01, 0.75, z]} rotation-y={-Math.PI / 2} material={mats.tail}><planeGeometry args={[0.3, 0.14]} /></mesh>
        </group>
      ))}
      <mesh rotation-x={-Math.PI / 2} position={[len / 2 + 3.2, 0.02, 0]} material={mats.beam}><planeGeometry args={[6, 2.2]} /></mesh>
    </group>
  )
}
