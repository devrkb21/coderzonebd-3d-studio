import { Suspense, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, PerformanceMonitor } from '@react-three/drei'
import { UI, tr } from '../content'
import { useSchedule } from '../schedule'
import { useStore } from '../store'
import { CameraRig } from './CameraRig'
import { Items, DRAG_PX } from './Items'
import { Office } from './Office'
import { OfficeModels, Robot } from './Models'
import { Cabins } from './Cabins'
import { PeopleCast } from './PeopleCast'
import { Reception } from './Reception'
import { Outside, SKY } from './Outside'
import { Room } from './Room'
import { prepareTextures } from './textures'
import { usePhase } from './time'

/**
 * Soft shadows under and around everything that stands on the floor (furniture, plinths, the
 * kiosk, people, the robot), rendered from below and blurred. On phones they're baked once.
 */
function FloorShadows() {
  return (
    <ContactShadows position={[0, 0.02, 0]} scale={[32, 20]} resolution={1024} far={2.4} blur={2.2} opacity={0.62} color="#2A2018" frames={coarse ? 1 : Infinity} />
  )
}

/** Office lights, dimmed by the switch by the door; daylight through the windows stays. */
function Lights() {
  const phase = usePhase()
  // after hours the office is a little dimmer (the switch still turns everything off)
  const dim = useSchedule().open ? 1 : 0.72
  const amb = useRef<THREE.AmbientLight>(null)
  const hemi = useRef<THREE.HemisphereLight>(null)
  const sun = useRef<THREE.DirectionalLight>(null)
  useFrame((_, dt) => {
    const on = useStore.getState().lightsOn
    const day = phase === 'day' ? 1 : phase === 'night' ? 0 : 0.5
    const d = Math.min(dt, 0.05)
    const go = (l: THREE.Light | null, onI: number, offI: number) => {
      if (l) l.intensity = THREE.MathUtils.damp(l.intensity, on ? onI : offI, 4, d)
    }
    go(amb.current, 1.6 * dim, 0.22 + 0.9 * day)
    go(hemi.current, 0.8 * dim, 0.12 + 0.4 * day)
    go(sun.current, dim, 0.08 + 0.5 * day)
  })
  return (
    <>
      <ambientLight ref={amb} intensity={1.6} />
      <hemisphereLight ref={hemi} args={['#ffffff', '#c8b190', 0.8]} />
      <directionalLight ref={sun} position={[4, 9, 6]} intensity={1} />
    </>
  )
}

const coarse = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
const MAX_DPR = coarse ? 1.5 : 1.75
const MIN_DPR = 1

/** The whole 3D room. Loaded lazily, so 2D visitors never download three.js. */
export default function Scene({ onProgress }: { onProgress: (p: number) => void }) {
  const lang = useStore((s) => s.lang)
  const phase = usePhase()
  const [prepared, setPrepared] = useState(false)
  const down = useRef({ x: 0, y: 0 })
  // Render resolution adapts to the frame rate instead of switching the visitor to 2D.
  const [dpr, setDpr] = useState(Math.min(MAX_DPR, typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1))
  // If the GPU drops the context and the browser doesn't hand it back, rebuild the canvas.
  const [canvasKey, setCanvasKey] = useState(0)
  const lostTimer = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => () => clearTimeout(lostTimer.current), [])

  useEffect(() => {
    prepareTextures(useStore.getState().lang, import.meta.env.BASE_URL, onProgress).then(() => setPrepared(true))
  }, [onProgress])

  if (!prepared) return null
  return (
    <Canvas
      key={canvasKey}
      className="scene"
      flat
      dpr={dpr}
      gl={{ antialias: true, powerPreference: 'high-performance', stencil: false }}
      camera={{ fov: 50, near: 0.1, far: 220, position: [0, 6, 24] }}
      aria-label={tr(UI.hint, lang)}
      onPointerDown={(e) => { down.current = { x: e.clientX, y: e.clientY } }}
      onPointerMissed={(e) => {
        const moved = Math.hypot(e.clientX - down.current.x, e.clientY - down.current.y)
        if (moved < DRAG_PX && useStore.getState().focusId) useStore.getState().focus(null)
      }}
      onCreated={({ gl }) => {
        const el = gl.domElement
        el.addEventListener('webglcontextlost', (e) => {
          e.preventDefault()
          clearTimeout(lostTimer.current)
          lostTimer.current = setTimeout(() => setCanvasKey((k) => k + 1), 2500)
        })
        el.addEventListener('webglcontextrestored', () => clearTimeout(lostTimer.current))
        requestAnimationFrame(() => requestAnimationFrame(() => useStore.getState().setReady()))
      }}
    >
      {/* Slow frames lower the render resolution a step; smooth frames raise it again. */}
      <PerformanceMonitor
        bounds={() => [40, 58]}
        flipflops={Infinity}
        onDecline={() => setDpr((d) => Math.max(MIN_DPR, Math.round((d - 0.25) * 100) / 100))}
        onIncline={() => setDpr((d) => Math.min(MAX_DPR, Math.round((d + 0.25) * 100) / 100))}
      />
      <color attach="background" args={[SKY[phase].bg]} />
      <Lights />
      <Room />
      <Office />
      <Items />
      <Outside />
      {/* Real models stream in after the room is up; the floor shadows render once they're in. */}
      <Suspense fallback={null}>
        <OfficeModels />
        <Robot />
        <PeopleCast />
        <Reception />
        <Cabins />
        <FloorShadows />
      </Suspense>
      <CameraRig />
    </Canvas>
  )
}
