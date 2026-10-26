// Khulna's live weather outside the windows (see weather.ts): drifting clouds, falling rain,
// drops running down the glass, fog over the far buildings and lightning in a storm.
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store'
import { followWeather, strike, useWeather, type Weather as Kind } from '../weather'
import { ROOM } from './layout'
import { noHit } from './Life'
import { FOG_GREY, OVERCAST } from './Outside'
import { DOOR, WIN } from './Room'
import { usePhase, type Phase } from './time'

const { halfD } = ROOM
const coarse = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
const rand = (i: number) => { const x = Math.sin(i * 91.7 + 3.1) * 43758.5453; return x - Math.floor(x) }

/** Everything the weather adds to the scene. Decor only: nothing here catches clicks. */
export function Weather() {
  const kind = useWeather((w) => w.kind)
  const phase = usePhase()
  useEffect(followWeather, [])
  const wet = kind === 'rain' || kind === 'storm'
  return (
    <group ref={noHit} key={kind}>
      {kind !== 'clear' && kind !== 'fog' && <Clouds kind={kind} phase={phase} />}
      {wet && <Rain night={phase === 'night'} heavy={kind === 'storm'} />}
      {wet && <WindowDrops />}
      {(wet || kind === 'fog') && <Haze kind={kind} phase={phase} />}
      {kind === 'storm' && <Lightning />}
    </group>
  )
}

// ── clouds ─────────────────────────────────────────────────────

function cloudTexture(seed: number) {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 128
  const ctx = c.getContext('2d')!
  for (let i = 0; i < 9; i++) {
    const x = 50 + rand(seed + i) * 156
    const y = 58 + (rand(seed + i + 20) - 0.5) * 34
    const r = 26 + rand(seed + i + 40) * 30
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, 'rgba(255,255,255,0.9)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 256, 128)
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

const CLOUD_TONE: Record<Phase, string> = { day: '#E9ECF0', dawn: '#D9C3BC', dusk: '#8C7F8A', night: '#2A2F3C' }
const CLOUD_SPAN = 280

/** Grey clouds drifting slowly across the sky; darker and thicker in rain. */
function Clouds({ kind, phase }: { kind: Kind; phase: Phase }) {
  const n = coarse ? 7 : 12
  const mats = useMemo(() => {
    const tone = new THREE.Color(CLOUD_TONE[phase]).multiplyScalar(kind === 'cloudy' ? 0.92 : kind === 'rain' ? 0.72 : 0.55)
    return [1, 2, 3].map((s) => new THREE.MeshBasicMaterial({ map: cloudTexture(s * 17), color: tone, transparent: true, depthWrite: false, fog: false }))
  }, [kind, phase])
  const clouds = useMemo(() => Array.from({ length: n }, (_, i) => ({
    x: rand(i + 3) * CLOUD_SPAN,
    y: 16 + rand(i + 9) * 26,
    z: 78 + rand(i + 13) * 12,
    w: 34 + rand(i + 5) * 40,
    speed: 0.6 + rand(i + 7) * 1.2,
  })), [n])
  const refs = useRef<THREE.Mesh[]>([])
  useFrame(({ clock }) => {
    clouds.forEach((c, i) => {
      const m = refs.current[i]
      if (m) m.position.x = ((c.x + clock.elapsedTime * c.speed) % CLOUD_SPAN) - CLOUD_SPAN / 2
    })
  })
  return (
    <>
      {clouds.map((c, i) => (
        <mesh key={i} ref={(m) => { if (m) refs.current[i] = m }} position={[0, c.y, c.z]} rotation-y={Math.PI} material={mats[i % 3]}>
          <planeGeometry args={[c.w, c.w * 0.42]} />
        </mesh>
      ))}
    </>
  )
}

// ── rain ───────────────────────────────────────────────────────

const RAIN_H = 18

/** Rain streaks over the street, moved entirely on the GPU. */
function Rain({ night, heavy }: { night: boolean; heavy: boolean }) {
  const n = Math.round((coarse ? 520 : 1500) * (heavy ? 1.35 : 1))
  const geo = useMemo(() => {
    const pos = new Float32Array(n * 6)
    const top = new Float32Array(n * 2)
    const speed = new Float32Array(n * 2)
    for (let i = 0; i < n; i++) {
      const x = (rand(i + 1) - 0.5) * 90
      const y = rand(i + 2) * RAIN_H
      const z = halfD + 0.5 + Math.pow(rand(i + 3), 1.6) * 34
      const s = 13 + rand(i + 4) * 5
      pos.set([x, y, z, x, y, z], i * 6)
      top.set([0, 1], i * 2)
      speed.set([s, s], i * 2)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aTop', new THREE.BufferAttribute(top, 1))
    g.setAttribute('aSpeed', new THREE.BufferAttribute(speed, 1))
    return g
  }, [n])
  const mat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(night ? '#7F8CA3' : '#D2DCE6') },
      uOpacity: { value: night ? 0.5 : heavy ? 0.68 : 0.6 },
      uSlant: { value: heavy ? 0.22 : 0.1 },
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uSlant;
      attribute float aTop;
      attribute float aSpeed;
      varying float vTop;
      void main() {
        vec3 p = position;
        p.y = mod(position.y - uTime * aSpeed, ${RAIN_H.toFixed(1)}) + aTop * 0.8;
        p.x += aTop * uSlant;
        vTop = aTop;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uOpacity;
      varying float vTop;
      void main() { gl_FragColor = vec4(uColor, uOpacity * (0.35 + 0.65 * vTop)); }`,
    transparent: true,
    depthWrite: false,
  }), [night, heavy])
  useFrame(({ clock }) => { mat.uniforms.uTime.value = clock.elapsedTime })
  return <lineSegments geometry={geo} material={mat} frustumCulled={false} />
}

/** Raindrops running down the outside of the windows and the glass doors, drawn in a shader. */
function WindowDrops() {
  const mat = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec2 vP;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vP = w.xy;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      varying vec2 vP;
      float h(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      void main() {
        // beads that come and go
        vec2 g = vP / 0.075;
        vec2 id = floor(g);
        vec2 f = fract(g) - 0.5;
        float r = h(id);
        vec2 o = (vec2(h(id + 3.1), h(id + 7.7)) - 0.5) * 0.5;
        float life = fract(uTime * 0.12 + r * 7.0);
        float bead = smoothstep(0.17, 0.07, length(f - o)) * step(0.7, r) * smoothstep(0.0, 0.08, life) * smoothstep(1.0, 0.7, life);
        // drops sliding down in columns, leaving a thin trail
        float cw = 0.12;
        float col = floor(vP.x / cw);
        float cr = h(vec2(col, 1.7));
        float speed = 0.18 + cr * 0.45;
        float period = 0.9 + cr * 1.5;
        float d = vP.y + uTime * speed + cr * 9.0;
        float k = floor(d / period);
        d = mod(d, period);
        float on = step(0.45, h(vec2(col, k)));
        float dx = (fract(vP.x / cw) - 0.5) * cw + sin(vP.y * 11.0 + cr * 6.0) * 0.008;
        float head = smoothstep(0.013, 0.006, length(vec2(dx, (d - 0.012) * 0.75)));
        float trail = smoothstep(0.0035, 0.001, abs(dx)) * smoothstep(0.4, 0.02, d) * step(0.012, d) * 0.6;
        float a = max(bead * 0.7, (head + trail) * on);
        gl_FragColor = vec4(mix(vec3(0.82, 0.88, 0.95), vec3(1.0), head), a * 0.8);
      }`,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  }), [])
  const door = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    mat.uniforms.uTime.value = clock.elapsedTime
    if (door.current) door.current.visible = !useStore.getState().doorOpen
  })
  const w = WIN.x1 - WIN.x0
  const h = WIN.y1 - WIN.y0
  return (
    <group position-z={halfD + 0.035}>
      {[-1, 1].map((sx) => (
        <mesh key={sx} position={[sx * (WIN.x0 + WIN.x1) / 2, (WIN.y0 + WIN.y1) / 2, 0]} material={mat}>
          <planeGeometry args={[w, h]} />
        </mesh>
      ))}
      <mesh ref={door} position={[0, DOOR.h / 2, 0.02]} material={mat}>
        <planeGeometry args={[DOOR.w, DOOR.h]} />
      </mesh>
    </group>
  )
}

// ── fog and haze ───────────────────────────────────────────────

/** Layers of soft haze between the street and the far buildings, so distance fades away. */
function Haze({ kind, phase }: { kind: Kind; phase: Phase }) {
  const fog = kind === 'fog'
  const mat = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 4
    c.height = 128
    const ctx = c.getContext('2d')!
    const g = ctx.createLinearGradient(0, 0, 0, 128)
    g.addColorStop(0, 'rgba(255,255,255,0.35)')
    g.addColorStop(0.6, 'rgba(255,255,255,1)')
    g.addColorStop(1, 'rgba(255,255,255,1)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 4, 128)
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    const tone = new THREE.Color(FOG_GREY[phase]).multiplyScalar(fog ? 1 : 0.85)
    return new THREE.MeshBasicMaterial({ map: t, color: tone, transparent: true, opacity: (fog ? 0.3 : 0.14) * OVERCAST[kind], depthWrite: false, fog: false })
  }, [fog, kind, phase])
  const layers = fog ? [6, 11, 15, 21, 30, 44] : [11, 20, 34]
  return (
    <>
      {layers.map((dz) => (
        <mesh key={dz} position={[0, 20, halfD + dz]} rotation-y={Math.PI} material={mat}>
          <planeGeometry args={[400, 40]} />
        </mesh>
      ))}
    </>
  )
}

// ── lightning ──────────────────────────────────────────────────

/** A jagged bolt from the clouds to the rooftops, as a flat ribbon. */
function boltGeometry(seed: number) {
  const pts: THREE.Vector2[] = []
  let x = 0
  for (let i = 0; i <= 12; i++) {
    pts.push(new THREE.Vector2(x, 34 - i * 2.4))
    x += (rand(seed + i) - 0.5) * 3.2
  }
  const pos: number[] = []
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i]
    const b = pts[i + 1]
    const w = 0.28 * (1 - i / pts.length) + 0.08
    pos.push(a.x - w, a.y, 0, a.x + w, a.y, 0, b.x + w, b.y, 0, a.x - w, a.y, 0, b.x + w, b.y, 0, b.x - w, b.y, 0)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  return g
}

/** Now and then the sky flashes two or three times and the room lights up for a split second. */
function Lightning() {
  const light = useRef<THREE.AmbientLight>(null)
  const bolt = useRef<THREE.Mesh>(null)
  const flash = useMemo(() => new THREE.MeshBasicMaterial({ color: '#DCE4FF', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false }), [])
  const boltMat = useMemo(() => new THREE.MeshBasicMaterial({ color: '#F4F6FF', transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, fog: false }), [])
  const bolts = useMemo(() => [11, 37, 73].map(boltGeometry), [])
  const s = useRef({ next: 4, start: -10, pulses: [0] as number[] })
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const st = s.current
    if (t > st.next) {
      st.start = t
      st.pulses = Math.random() < 0.6 ? [0, 0.14, 0.32] : [0, 0.2]
      st.next = t + 6 + Math.random() * 12
      if (bolt.current) {
        bolt.current.geometry = bolts[Math.floor(Math.random() * bolts.length)]
        bolt.current.position.x = (Math.random() - 0.5) * 120
      }
      strike()
    }
    let f = 0
    for (const p of st.pulses) {
      const dt = t - st.start - p
      if (dt >= 0 && dt < 0.22) f = Math.max(f, Math.exp(-dt * 16))
    }
    flash.opacity = f * 0.55
    boltMat.opacity = f
    if (light.current) light.current.intensity = f * 0.9
  })
  return (
    <>
      <ambientLight ref={light} color="#DCE4FF" intensity={0} />
      <mesh position={[0, 20, halfD + 0.6]} material={flash}><planeGeometry args={[260, 60]} /></mesh>
      <mesh ref={bolt} position={[0, 0, 88]} rotation-y={Math.PI} geometry={bolts[0]} material={boltMat} />
    </>
  )
}
