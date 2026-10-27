// The CZ Commerce launchpad: a booth in the middle of the studio, facing the entrance, so it's the
// first thing a visitor walks up to. The screen itself is a clickable item (Items.tsx); this file
// builds the counter, the frame, the floating logo badge and a phone showing a store.
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { storeMockup } from '../mockup'
import { useStore } from '../store'
import { noHit } from './Life'
import { CZ_BOOTH } from './layout'
import { drawCzLogo } from './textures'

const BLUE = '#2B3FD6'

function badgeTexture() {
  const c = document.createElement('canvas')
  c.width = 640
  c.height = 200
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#0B0E24'
  ctx.beginPath()
  ctx.roundRect(0, 0, 640, 200, 100)
  ctx.fill()
  drawCzLogo(ctx, 70, 44, 112)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

export function CzBooth() {
  const lang = useStore((s) => s.lang)
  const badge = useRef<THREE.Group>(null)
  const glow = useRef<THREE.MeshBasicMaterial>(null)
  const m = useMemo(() => ({
    blue: new THREE.MeshLambertMaterial({ color: BLUE }),
    white: new THREE.MeshLambertMaterial({ color: '#F7F7F4' }),
    ink: new THREE.MeshLambertMaterial({ color: '#15171E' }),
    steel: new THREE.MeshLambertMaterial({ color: '#B8BCC6' }),
    badge: new THREE.MeshBasicMaterial({ map: badgeTexture(), transparent: true, toneMapped: false }),
  }), [])
  const phone = useMemo(() => {
    const t = new THREE.CanvasTexture(storeMockup(lang === 'bn' ? 'আপনার স্টোর' : 'Your Store', 'fashion', lang))
    t.colorSpace = THREE.SRGBColorSpace
    return new THREE.MeshBasicMaterial({ map: t, toneMapped: false })
  }, [lang])
  const S = CZ_BOOTH.screen

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (badge.current) {
      badge.current.position.y = S.y + S.h / 2 + 0.55 + Math.sin(t * 1.4) * 0.06
      badge.current.rotation.y = Math.sin(t * 0.6) * 0.25
    }
    // the light strip under the counter breathes
    if (glow.current) glow.current.opacity = 0.55 + Math.sin(t * 2.2) * 0.25
  })

  return (
    <group ref={noHit} position={[0, 0, CZ_BOOTH.z]}>
      {/* counter: CZ blue body, white top, a glowing strip at the floor */}
      <mesh position-y={0.5} material={m.blue}><boxGeometry args={[3.0, 1.0, 0.9]} /></mesh>
      <mesh position-y={1.03} material={m.white}><boxGeometry args={[3.12, 0.06, 1.0]} /></mesh>
      <mesh position={[0, 0.06, 0.46]}>
        <boxGeometry args={[3.0, 0.03, 0.02]} />
        <meshBasicMaterial ref={glow} color="#8EA2FF" transparent toneMapped={false} />
      </mesh>
      {/* screen frame on two posts */}
      {[-0.7, 0.7].map((x) => <mesh key={x} position={[x, (1.06 + S.y - S.h / 2) / 2, -0.15]} material={m.steel}><boxGeometry args={[0.07, S.y - S.h / 2 - 1.06, 0.07]} /></mesh>)}
      <mesh position={[0, S.y, 0.0]} material={m.ink}><boxGeometry args={[S.w + 0.12, S.h + 0.12, 0.08]} /></mesh>
      {/* floating logo badge */}
      <group ref={badge} position={[0, S.y + S.h / 2 + 0.55, 0.05]}>
        <mesh material={m.badge}><planeGeometry args={[1.5, 1.5 * 200 / 640]} /></mesh>
        <mesh position-z={-0.01} rotation-y={Math.PI} material={m.badge}><planeGeometry args={[1.5, 1.5 * 200 / 640]} /></mesh>
      </group>
      {/* a phone on the counter showing a store built with it */}
      <group position={[1.15, 1.06, 0.18]} rotation={[-0.35, -0.35, 0]}>
        <mesh position-y={0.17} material={m.ink}><boxGeometry args={[0.22, 0.34, 0.02]} /></mesh>
        <mesh position={[0, 0.17, 0.011]} material={phone}><planeGeometry args={[0.2, 0.31]} /></mesh>
      </group>
    </group>
  )
}
