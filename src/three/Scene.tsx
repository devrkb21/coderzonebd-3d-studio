import { useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { UI, tr } from '../content'
import { useStore, userChose3d } from '../store'
import { CameraRig } from './CameraRig'
import { Items, DRAG_PX } from './Items'
import { Room } from './Room'
import { prepareTextures } from './textures'

const coarse = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

/** The whole 3D room. Loaded lazily, so 2D visitors never download three.js. */
export default function Scene({ onProgress }: { onProgress: (p: number) => void }) {
  const lang = useStore((s) => s.lang)
  const [prepared, setPrepared] = useState(false)
  const down = useRef({ x: 0, y: 0 })

  useEffect(() => {
    prepareTextures(useStore.getState().lang, import.meta.env.BASE_URL, onProgress).then(() => setPrepared(true))
  }, [onProgress])

  if (!prepared) return null
  return (
    <Canvas
      className="scene"
      flat
      dpr={[1, coarse ? 1.5 : 1.75]}
      gl={{ antialias: true, powerPreference: 'high-performance', stencil: false }}
      camera={{ fov: 50, near: 0.1, far: 120, position: [0, 6, 24] }}
      aria-label={tr(UI.hint, lang)}
      onPointerDown={(e) => { down.current = { x: e.clientX, y: e.clientY } }}
      onPointerMissed={(e) => {
        const moved = Math.hypot(e.clientX - down.current.x, e.clientY - down.current.y)
        if (moved < DRAG_PX && useStore.getState().focusId) useStore.getState().focus(null)
      }}
      onCreated={() => requestAnimationFrame(() => requestAnimationFrame(() => useStore.getState().setReady()))}
    >
      {/* Sustained low frame rate on a phone: switch to the 2D page instead of stuttering. */}
      {!userChose3d() && (
        <PerformanceMonitor
          flipflops={2}
          onFallback={() => {
            const s = useStore.getState()
            s.setMode('2d')
            s.showToast(tr(UI.slowSwitched, s.lang))
          }}
        />
      )}
      <color attach="background" args={['#E3E6EE']} />
      <ambientLight intensity={1.6} />
      <hemisphereLight args={['#ffffff', '#c8b190', 0.8]} />
      <directionalLight position={[4, 9, 6]} intensity={1} />
      <Room />
      <Items />
      <CameraRig />
    </Canvas>
  )
}
