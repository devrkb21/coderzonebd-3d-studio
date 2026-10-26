// Bangladesh street life outside the windows: cycle rickshaws, CNG auto-rickshaws,
// people on the pavements and birds crossing the sky. In the rain the rickshaws get plastic
// covers and people walk under umbrellas.
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useWeather } from '../weather'
import { ROOM } from './layout'
import { Person, walkPose, type Look, type Rig } from './Life'

const { halfD } = ROOM
// same street layout as Outside.tsx
const SIDEWALK = { z0: halfD, z1: halfD + 3.2 }
const ROAD = { z0: halfD + 3.2, z1: halfD + 10.4 }
const FAR_WALK = { z0: ROAD.z1, z1: ROAD.z1 + 2.4 }
const LANE_A = ROAD.z0 + 1.9
const LANE_B = ROAD.z1 - 1.9
const SPAN = 150

export function StreetLife({ night }: { night: boolean }) {
  const weather = useWeather((w) => w.kind)
  const wet = weather === 'rain' || weather === 'storm'
  return (
    <>
      <Rickshaws night={night} wet={wet} />
      <Pedestrians wet={wet} />
      {!night && !wet && weather !== 'fog' && <Birds />}
    </>
  )
}

const HOODS = ['#C0392B', '#1F6FB2', '#E2A21B', '#8E44AD']

function Rickshaws({ night, wet }: { night: boolean; wet: boolean }) {
  return (
    <>
      <Rickshaw dir={1} speed={3.2} offset={10} color={HOODS[0]} night={night} wet={wet} />
      <Rickshaw dir={-1} speed={2.8} offset={70} color={HOODS[1]} night={night} wet={wet} />
      <Rickshaw dir={1} speed={3.6} offset={95} color={HOODS[2]} night={night} wet={wet} />
      <Rickshaw dir={-1} speed={3.0} offset={130} color={HOODS[3]} night={night} wet={wet} />
      <Cng dir={1} speed={9} offset={40} night={night} />
      <Cng dir={-1} speed={8} offset={115} night={night} />
    </>
  )
}

function useLoop(dir: number, speed: number, offset: number, z: number) {
  const ref = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    const g = ref.current
    if (!g) return
    const t = (clock.elapsedTime * speed + offset) % SPAN
    g.position.set(dir > 0 ? -SPAN / 2 + t : SPAN / 2 - t, 0, z)
  })
  return ref
}

const RIDER: Look = { shirt: '#D9D4C7', pants: '#4A5A3A', skin: '#7A4E30', hair: '#141010' }

/** A cycle rickshaw with a painted hood; the rider pedals and the wheels turn. */
function Rickshaw({ dir, speed, offset, color, night, wet }: { dir: number; speed: number; offset: number; color: string; night: boolean; wet: boolean }) {
  const ref = useLoop(dir, speed, offset, dir > 0 ? ROAD.z0 + 0.9 : ROAD.z1 - 0.9)
  const wheels = useRef<THREE.Group[]>([])
  const shade = night ? 0.4 : 1
  const m = useMemo(() => ({
    hood: new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(shade), side: THREE.DoubleSide }),
    trim: new THREE.MeshBasicMaterial({ color: new THREE.Color('#F2C230').multiplyScalar(shade) }),
    frame: new THREE.MeshBasicMaterial({ color: new THREE.Color('#2A2E36').multiplyScalar(shade) }),
    seat: new THREE.MeshBasicMaterial({ color: new THREE.Color('#2E7D4F').multiplyScalar(shade) }),
    tyre: new THREE.MeshBasicMaterial({ color: '#111111' }),
    plastic: new THREE.MeshBasicMaterial({ color: new THREE.Color('#BFD9EE').multiplyScalar(shade), transparent: true, opacity: 0.45, depthWrite: false, side: THREE.DoubleSide }),
    cape: new THREE.MeshBasicMaterial({ color: new THREE.Color('#2F6FB0').multiplyScalar(shade), transparent: true, opacity: 0.85, side: THREE.DoubleSide }),
  }), [color, shade])
  const pedal = useMemo(() => (r: Rig, t: number) => {
    if (!r.hips) return
    walkPose(r, 0, 0)
    r.hips.position.y = 0.98
    const ph = t * speed * 1.6
    r.legL!.rotation.x = -0.9 + Math.sin(ph) * 0.45
    r.legR!.rotation.x = -0.9 - Math.sin(ph) * 0.45
    r.kneeL!.rotation.x = 1.0 - Math.sin(ph) * 0.4
    r.kneeR!.rotation.x = 1.0 + Math.sin(ph) * 0.4
    r.torso!.rotation.x = 0.35
    r.armL!.rotation.x = r.armR!.rotation.x = -0.9
  }, [speed])
  useFrame((_, dt) => wheels.current.forEach((w) => { if (w) w.rotation.x -= (speed / 0.32) * Math.min(dt, 0.05) }))
  const wheel = (x: number, z: number, i: number) => (
    <group key={i} ref={(g) => { if (g) wheels.current[i] = g }} position={[x, 0.32, z]}>
      <mesh rotation-y={Math.PI / 2} material={m.tyre}><torusGeometry args={[0.3, 0.035, 6, 18]} /></mesh>
      <mesh material={m.frame}><boxGeometry args={[0.02, 0.58, 0.02]} /></mesh>
      <mesh material={m.frame}><boxGeometry args={[0.02, 0.02, 0.58]} /></mesh>
    </group>
  )
  // Built facing +z (like the people), then turned to drive along the street.
  return (
    <group ref={ref} rotation-y={dir > 0 ? Math.PI / 2 : -Math.PI / 2}>
      <mesh position={[0, 0.5, 0.45]} rotation-x={-0.2} material={m.frame}><boxGeometry args={[0.06, 0.06, 1.3]} /></mesh>
      <mesh position={[0, 0.78, -0.35]} material={m.seat}><boxGeometry args={[1.0, 0.16, 0.55]} /></mesh>
      <mesh position={[0, 1.05, -0.62]} material={m.seat}><boxGeometry args={[1.0, 0.5, 0.08]} /></mesh>
      {/* the painted half-round hood over the passenger seat */}
      <mesh position={[0, 1.15, -0.45]} rotation-z={Math.PI / 2} material={m.hood}>
        <cylinderGeometry args={[0.6, 0.6, 1.04, 14, 1, true, 0, Math.PI]} />
      </mesh>
      <mesh position={[0, 0.64, -0.35]} material={m.trim}><boxGeometry args={[1.06, 0.08, 0.6]} /></mesh>
      {wheel(-0.55, -0.35, 0)}
      {wheel(0.55, -0.35, 1)}
      {wheel(0, 1.15, 2)}
      <mesh position={[0, 0.98, 0.85]} material={m.frame}><boxGeometry args={[0.24, 0.06, 0.2]} /></mesh>
      <mesh position={[0, 1.15, 1.15]} material={m.frame}><boxGeometry args={[0.5, 0.03, 0.03]} /></mesh>
      <Person look={RIDER} position={[0, 0.02, 0.82]} drive={pedal} />
      {wet && (
        <>
          {/* clear plastic over the hood and drawn across the front of the passenger seat */}
          <mesh position={[0, 1.15, -0.45]} rotation-z={Math.PI / 2} material={m.plastic}>
            <cylinderGeometry args={[0.64, 0.64, 1.1, 14, 1, true, 0, Math.PI]} />
          </mesh>
          <mesh position={[0, 1.15, 0.17]} material={m.plastic}><circleGeometry args={[0.62, 14, 0, Math.PI]} /></mesh>
          <mesh position={[0, 0.92, 0.17]} material={m.plastic}><planeGeometry args={[1.24, 0.46]} /></mesh>
          {/* the rider's rain cape and hood, leaning forward with him */}
          <group position={[0, 1.0, 0.82]} rotation-x={0.35}>
            <mesh position-y={0.3} material={m.cape}><cylinderGeometry args={[0.13, 0.34, 0.62, 12, 1, true]} /></mesh>
            <mesh position={[0, 0.72, -0.02]} material={m.cape}><sphereGeometry args={[0.15, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.6]} /></mesh>
          </group>
        </>
      )}
    </group>
  )
}

/** A green CNG auto-rickshaw. */
function Cng({ dir, speed, offset, night }: { dir: number; speed: number; offset: number; night: boolean }) {
  const ref = useLoop(dir, speed, offset, dir > 0 ? LANE_A - 0.4 : LANE_B + 0.4)
  const shade = night ? 0.4 : 1
  const m = useMemo(() => ({
    body: new THREE.MeshBasicMaterial({ color: new THREE.Color('#1E8E3E').multiplyScalar(shade) }),
    cage: new THREE.MeshBasicMaterial({ color: new THREE.Color('#14582A').multiplyScalar(shade) }),
    glass: new THREE.MeshBasicMaterial({ color: night ? '#0E1320' : '#2B3A4A' }),
    tyre: new THREE.MeshBasicMaterial({ color: '#111111' }),
    head: new THREE.MeshBasicMaterial({ color: night ? '#FFF6D0' : '#E8E8E0' }),
  }), [shade, night])
  return (
    <group ref={ref} rotation-y={dir > 0 ? 0 : Math.PI}>
      <mesh position={[0.95, 0.68, 0]} scale={[0.6, 1, 1]} material={m.body}><sphereGeometry args={[0.6, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} /></mesh>
      <mesh position={[-0.15, 0.65, 0]} material={m.body}><boxGeometry args={[1.9, 0.6, 1.3]} /></mesh>
      <mesh position={[-0.15, 1.35, 0]} material={m.cage}><boxGeometry args={[1.9, 0.8, 1.32]} /></mesh>
      <mesh position={[0.8, 1.25, 0]} rotation-z={-0.2} material={m.glass}><boxGeometry args={[0.05, 0.6, 1.1]} /></mesh>
      <mesh position={[-0.15, 1.78, 0]} material={m.body}><boxGeometry args={[2.0, 0.06, 1.4]} /></mesh>
      {[[1.0, 0], [-0.8, 0.6], [-0.8, -0.6]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.28, z]} rotation-x={Math.PI / 2} material={m.tyre}><cylinderGeometry args={[0.28, 0.28, 0.2, 12]} /></mesh>
      ))}
      <mesh position={[1.31, 0.8, 0]} rotation-y={Math.PI / 2} material={m.head}><circleGeometry args={[0.1, 12]} /></mesh>
    </group>
  )
}

const WALKERS: { look: Look; dir: number; speed: number; offset: number; z: number }[] = [
  { look: { shirt: '#6B2E4A', pants: '#2A2A2E', skin: '#9C6B48', hair: '#111111' }, dir: 1, speed: 1.15, offset: 0, z: SIDEWALK.z0 + 1.9 },
  { look: { shirt: '#E8E3D6', pants: '#3A4256', skin: '#A8714A', hair: '#1A1410' }, dir: -1, speed: 1.3, offset: 30, z: SIDEWALK.z0 + 1.1 },
  { look: { shirt: '#2E6B5A', pants: '#4A3C30', skin: '#8E5B3A', hair: '#141010' }, dir: 1, speed: 1.0, offset: 55, z: FAR_WALK.z0 + 1.2 },
  { look: { shirt: '#F2B134', pants: '#2B2F3A', skin: '#B9845C', hair: '#1C1612' }, dir: -1, speed: 1.2, offset: 75, z: FAR_WALK.z0 + 0.8 },
]
const WALK_SPAN = 90

const UMBRELLAS = ['#1A1B20', '#7A1F2B', '#1F3A6B', '#2E5E3A']

function Pedestrians({ wet }: { wet: boolean }) {
  return <>{WALKERS.map((w, i) => <Walker key={i} {...w} umbrella={wet ? UMBRELLAS[i % UMBRELLAS.length] : null} />)}</>
}

function Walker({ look, dir, speed, offset, z, umbrella }: { look: Look; dir: number; speed: number; offset: number; z: number; umbrella: string | null }) {
  const brolly = useRef<THREE.Group>(null)
  const m = useMemo(() => umbrella ? {
    canopy: new THREE.MeshBasicMaterial({ color: umbrella, side: THREE.DoubleSide }),
    stick: new THREE.MeshBasicMaterial({ color: '#2A2A2E' }),
  } : null, [umbrella])
  const drive = useMemo(() => (r: Rig, t: number) => {
    if (!r.root) return
    const d = (t * speed + offset) % WALK_SPAN
    r.root.position.set(dir > 0 ? -WALK_SPAN / 2 + d : WALK_SPAN / 2 - d, 0, z)
    r.root.rotation.y = dir > 0 ? Math.PI / 2 : -Math.PI / 2
    walkPose(r, t * speed * 5.2, 1)
    const b = brolly.current
    if (!b) return
    // the right hand holds the umbrella up in front of the chest
    r.armR!.rotation.x = -0.55
    r.armR!.rotation.z = -0.25
    r.elbowR!.rotation.x = -1.5
    b.position.copy(r.root.position)
    b.position.y = Math.abs(Math.cos(t * speed * 5.2)) * -0.02
    b.rotation.y = r.root.rotation.y
  }, [dir, speed, offset, z])
  return (
    <>
      <Person look={look} drive={drive} />
      {m && (
        <group ref={brolly}>
          <mesh position={[0.12, 1.72, 0.32]} material={m.stick}><cylinderGeometry args={[0.012, 0.012, 0.85, 6]} /></mesh>
          <mesh position={[0.12, 2.24, 0.28]} material={m.canopy}><coneGeometry args={[0.6, 0.28, 8, 1, true]} /></mesh>
        </group>
      )}
    </>
  )
}

/** A small flock crossing the sky, flapping. */
function Birds() {
  const flock = useRef<THREE.Group>(null)
  const birds = useRef<THREE.Group[]>([])
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#2A2A30', side: THREE.DoubleSide }), [])
  const spots = useMemo(() => Array.from({ length: 7 }, (_, i) => [-i * 1.6, Math.abs(i - 3) * 0.6, (i % 3) * 1.2] as [number, number, number]), [])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (flock.current) flock.current.position.set(((t * 4) % 180) - 90, 22 + Math.sin(t * 0.3) * 2, 55)
    birds.current.forEach((b, i) => {
      if (!b) return
      const flap = Math.sin(t * 9 + i * 1.3) * 0.7
      b.children[0].rotation.x = flap
      b.children[1].rotation.x = -flap
    })
  })
  return (
    <group ref={flock}>
      {spots.map((p, i) => (
        <group key={i} position={p} ref={(g) => { if (g) birds.current[i] = g }}>
          <group><mesh position-z={0.25} rotation-x={-Math.PI / 2} material={mat}><planeGeometry args={[0.25, 0.5]} /></mesh></group>
          <group><mesh position-z={-0.25} rotation-x={-Math.PI / 2} material={mat}><planeGeometry args={[0.25, 0.5]} /></mesh></group>
        </group>
      ))}
    </group>
  )
}
