// Personalised visits (`?for=`): a "Welcome, <name>" banner on the storefront and, inside by
// the entrance, a freestanding screen with a mock-up of the visitor's own online store.
import { useMemo } from 'react'
import * as THREE from 'three'
import { storeMockup } from '../mockup'
import { PERSONAL, welcomeLine } from '../personal'
import { useStore } from '../store'
import { Hot } from './Hot'
import { KIOSK_POS, ROOM } from './layout'
import { BRAND, INK } from './textures'

function bannerTexture(name: string, lang: 'bn' | 'en') {
  const c = document.createElement('canvas')
  c.width = 2048
  c.height = 180
  const ctx = c.getContext('2d')!
  ctx.fillStyle = BRAND
  ctx.fillRect(0, 0, c.width, c.height)
  ctx.strokeStyle = 'rgba(18,20,28,0.35)'
  ctx.lineWidth = 6
  ctx.strokeRect(14, 14, c.width - 28, c.height - 28)
  const text = welcomeLine(name, lang)
  let size = 112
  do { ctx.font = `700 ${size}px "Anek Bangla Variable", system-ui, sans-serif`; size -= 4 } while (ctx.measureText(text).width > c.width - 160 && size > 30)
  ctx.fillStyle = INK
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, c.width / 2, c.height / 2 + 6)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

/** Second banner under the storefront sign, facing the street (placed in the Exterior's frame). */
export function WelcomeBanner(props: JSX.IntrinsicElements['group']) {
  const lang = useStore((s) => s.lang)
  const mat = useMemo(() => PERSONAL && new THREE.MeshBasicMaterial({ map: bannerTexture(PERSONAL.name, lang), toneMapped: false }), [lang])
  if (!PERSONAL || !mat) return null
  return (
    <group {...props}>
      <mesh rotation-y={Math.PI} material={mat}><planeGeometry args={[7.2, 0.63]} /></mesh>
    </group>
  )
}

/** Opposite the courier kiosk, turned towards the entrance; behind every stop's camera. */
export const STAND_POS = new THREE.Vector3(-KIOSK_POS.x, 0, KIOSK_POS.z - 0.5)
const SCREEN = { w: 1.0, h: 1.0 * (1400 / 900), y: 1.3 }

export function WelcomeStand() {
  const lang = useStore((s) => s.lang)
  const mats = useMemo(() => {
    if (!PERSONAL) return null
    const tex = new THREE.CanvasTexture(storeMockup(PERSONAL.name, PERSONAL.type, lang))
    tex.colorSpace = THREE.SRGBColorSpace
    tex.anisotropy = 4
    return { screen: new THREE.MeshBasicMaterial({ map: tex }), body: new THREE.MeshLambertMaterial({ color: '#1A1C22' }), brand: new THREE.MeshLambertMaterial({ color: BRAND }) }
  }, [lang])
  if (!PERSONAL || !mats) return null
  const yaw = Math.atan2(0 - STAND_POS.x, ROOM.halfD - 1.2 - STAND_POS.z)
  return (
    <Hot tip={{ bn: 'আপনার স্টোরের প্রিভিউ দেখুন', en: 'See your store preview' }} onPick={() => useStore.getState().setWelcomeOpen(true)}>
      <group position={STAND_POS} rotation-y={yaw}>
        <mesh position-y={0.02} material={mats.body}><boxGeometry args={[0.9, 0.04, 0.5]} /></mesh>
        <mesh position-y={0.3} material={mats.body}><boxGeometry args={[0.12, 0.56, 0.12]} /></mesh>
        <mesh position-y={SCREEN.y} material={mats.body}><boxGeometry args={[SCREEN.w + 0.08, SCREEN.h + 0.08, 0.07]} /></mesh>
        <mesh position={[0, SCREEN.y, 0.037]} material={mats.screen}><planeGeometry args={[SCREEN.w, SCREEN.h]} /></mesh>
        <mesh position={[0, SCREEN.y - SCREEN.h / 2 - 0.05, 0.03]} material={mats.brand}><boxGeometry args={[SCREEN.w + 0.08, 0.025, 0.02]} /></mesh>
      </group>
    </Hot>
  )
}
