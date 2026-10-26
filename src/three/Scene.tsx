import { useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { UI, tr } from '../content'
import { useStore } from '../store'
import { CameraRig } from './CameraRig'
import { Items, DRAG_PX } from './Items'
import { Office } from './Office'
import { Outside, SKY } from './Outside'
import { Room } from './Room'
import { prepareTextures } from './textures'
import { usePhase } from './time'

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
      <ambientLight intensity={1.6} />
      <hemisphereLight args={['#ffffff', '#c8b190', 0.8]} />
      <directionalLight position={[4, 9, 6]} intensity={1} />
      <Room />
      <Office />
      <Outside />
      <Items />
      <CameraRig />
    </Canvas>
  )
}
