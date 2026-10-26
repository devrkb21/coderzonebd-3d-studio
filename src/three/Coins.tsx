// Coin hunt: five spinning gold CZ coins hidden around the office. Click one to collect it;
// all five open the reward (see components/Coins.tsx).
import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store'
import { Hot } from './Hot'
import { COFFEE_X, KIOSK_NORMAL, KIOSK_POS, LOUNGE_X, ROOM } from './layout'

const { halfW, halfD } = ROOM
const coarse = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

/** Hiding places, next to the furniture in Office.tsx / Models.tsx. */
export const COINS: { id: string; pos: [number, number, number] }[] = [
  { id: 'shelf', pos: [halfW - 0.4, 2.26, 9] },
  { id: 'lounge', pos: [LOUNGE_X, 0.16, halfD - 2.2] },
  { id: 'coffee', pos: [COFFEE_X + 0.05, 1.1, halfD - 0.45] },
  { id: 'kiosk', pos: [KIOSK_POS.x - KIOSK_NORMAL.x * 0.6, 0.2, KIOSK_POS.z - KIOSK_NORMAL.z * 0.6] },
  { id: 'plant', pos: [-halfW + 1.6, 0.18, 3.0] },
]

function faceTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(54, 48, 6, 64, 64, 64)
  g.addColorStop(0, '#FFF0B0')
  g.addColorStop(0.55, '#F2C14E')
  g.addColorStop(1, '#C98F14')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  ctx.strokeStyle = '#A8740C'
  ctx.lineWidth = 5
  ctx.beginPath(); ctx.arc(64, 64, 52, 0, Math.PI * 2); ctx.stroke()
  ctx.fillStyle = '#8A5A00'
  ctx.font = '800 50px "Anek Bangla Variable", system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('CZ', 64, 68)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

export function Coins() {
  const mats = useMemo(() => {
    const face = new THREE.MeshLambertMaterial({ map: faceTexture(), emissive: '#3A2600', transparent: true })
    const edge = new THREE.MeshLambertMaterial({ color: '#D9A21B', emissive: '#4A3000', transparent: true })
    const hit = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false })
    return { face, edge, hit }
  }, [])
  return <group>{COINS.map((c) => <Coin key={c.id} id={c.id} pos={c.pos} mats={mats} />)}</group>
}

type CoinMats = { face: THREE.Material; edge: THREE.Material; hit: THREE.Material }

function Coin({ id, pos, mats }: { id: string; pos: [number, number, number]; mats: CoinMats }) {
  const found = useStore((s) => s.coins.includes(id))
  const spin = useRef<THREE.Group>(null)
  /** Seconds into the collect animation; -1 while the coin waits to be found. */
  const popT = useRef(-1)
  const [gone, setGone] = useState(false)
  const own = useMemo(() => ({ face: mats.face.clone(), edge: mats.edge.clone() }), [mats])
  const phase = useMemo(() => Math.random() * Math.PI * 2, [])
  useFrame(({ clock }, dt) => {
    const g = spin.current
    if (!g) return
    const d = Math.min(dt, 0.05)
    if (popT.current < 0) {
      g.rotation.y += d * 2.2
      g.position.y = Math.sin(clock.elapsedTime * 2 + phase) * 0.025
      return
    }
    // pop: jump up, spin fast, grow and fade
    popT.current += d
    const k = Math.min(1, popT.current / 0.55)
    g.rotation.y += d * 16
    g.position.y = 0.5 * k
    g.scale.setScalar(1 + k * 0.9)
    own.face.opacity = own.edge.opacity = 1 - k
    if (k >= 1 && !gone) setGone(true)
  })
  if (gone || (found && popT.current < 0)) return null
  return (
    <group position={pos}>
      <Hot
        tip={{ bn: 'একটা CZ কয়েন! তুলে নিন', en: 'A CZ coin! Collect it' }}
        onPick={() => {
          if (popT.current >= 0) return
          popT.current = 0
          document.body.style.cursor = ''
          const s = useStore.getState()
          s.setTip(null)
          s.collectCoin(id)
          const n = useStore.getState().coins.length
          const bn = (x: number) => String(x).replace(/\d/g, (c) => '০১২৩৪৫৬৭৮৯'[+c])
          if (n < COINS.length) s.showToast(s.lang === 'bn' ? `কয়েন পেয়েছেন! ${bn(n)}/${bn(COINS.length)}` : `Coin found! ${n}/${COINS.length}`)
        }}
      >
        <group ref={spin}>
          <mesh rotation-x={Math.PI / 2} material={own.edge}><cylinderGeometry args={[0.12, 0.12, 0.026, 28, 1, true]} /></mesh>
          {/* a face on each side, so "CZ" reads the right way round from both */}
          {[0, Math.PI].map((r) => (
            <mesh key={r} rotation-y={r} position-z={r ? -0.013 : 0.013} material={own.face}><circleGeometry args={[0.12, 28]} /></mesh>
          ))}
          <mesh material={mats.hit}><sphereGeometry args={[coarse ? 0.42 : 0.3, 8, 6]} /></mesh>
        </group>
      </Hot>
    </group>
  )
}
