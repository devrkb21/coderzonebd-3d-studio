// Office life in the front half of the room (behind every camera stop, so nothing blocks a
// display): a Bangladesh-time wall clock, two workstations, a lounge, a bookshelf, a coffee corner.
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store'
import { Hot } from './Hot'
import { ROOM } from './layout'
import { BRAND, INK } from './textures'
import { dhakaHours } from './time'
import { OfficeLife } from './Life'

const { halfW, halfD } = ROOM

function useOfficeMaterials() {
  return useMemo(() => ({
    desk: new THREE.MeshLambertMaterial({ color: '#E9DCC6' }),
    leg: new THREE.MeshLambertMaterial({ color: '#2A2D35' }),
    screen: new THREE.MeshBasicMaterial({ map: screenTexture() }),
    bezel: new THREE.MeshLambertMaterial({ color: '#16181E' }),
    chair: new THREE.MeshLambertMaterial({ color: '#2C2F38' }),
    seat: new THREE.MeshLambertMaterial({ color: BRAND }),
    sofa: new THREE.MeshLambertMaterial({ color: '#3C4150' }),
    cushion: new THREE.MeshLambertMaterial({ color: '#FFB25C' }),
    rug: new THREE.MeshLambertMaterial({ color: '#D9CBB5' }),
    wood: new THREE.MeshLambertMaterial({ color: '#B48A5E' }),
    white: new THREE.MeshLambertMaterial({ color: '#F7F7F5' }),
    metal: new THREE.MeshLambertMaterial({ color: '#8A8F99' }),
    plant: new THREE.MeshLambertMaterial({ color: '#4C7A55' }),
    pot: new THREE.MeshLambertMaterial({ color: INK }),
    books: ['#FF931E', '#2C3E50', '#E9DCC6', '#C0392B', '#16A085', '#7F8C8D'].map((c) => new THREE.MeshLambertMaterial({ color: c })),
    lamp: new THREE.MeshBasicMaterial({ color: '#FFE7B0' }),
  }), [])
}
type Mats = ReturnType<typeof useOfficeMaterials>

/** A code editor on the monitors; the texture is tall and scrolls (see ScrollingCode). */
function screenTexture() {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 1024
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#12141C'
  ctx.fillRect(0, 0, 256, 1024)
  const cols = ['#FF931E', '#7FB2FF', '#9BE29B', '#E6E6E6', '#C792EA', '#E6E6E6']
  for (let i = 0; i < 88; i++) {
    const indent = ((i * 7) % 5) % 4 * 12
    const y = 10 + i * 11.5
    ctx.fillStyle = '#3A3F52'
    ctx.fillRect(4, y, 8, 5)
    let x = 18 + indent
    const words = 1 + ((i * 13) % 4)
    for (let w = 0; w < words; w++) {
      const len = 14 + ((i * 31 + w * 17) % 50)
      ctx.fillStyle = cols[(i + w * 2) % cols.length]
      ctx.fillRect(x, y, len, 5)
      x += len + 6
    }
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapT = THREE.RepeatWrapping
  t.repeat.set(1, 0.16)
  return t
}

/** Scrolls the editor on every monitor, a few lines at a time, like someone reading code. */
function ScrollingCode({ tex }: { tex: THREE.Texture }) {
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    tex.offset.y = -(Math.floor(t * 1.6) * 0.0115 + (t % 0.625) * 0.004)
  })
  return null
}

function clockFaceTexture() {
  const c = document.createElement('canvas')
  c.width = c.height = 512
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#ffffff'
  ctx.beginPath(); ctx.arc(256, 256, 250, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = INK
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '700 54px "Anek Bangla Variable", system-ui, sans-serif'
  for (let n = 1; n <= 12; n++) {
    const a = (n / 12) * Math.PI * 2
    ctx.fillText(String(n), 256 + Math.sin(a) * 190, 256 - Math.cos(a) * 190)
  }
  for (let m = 0; m < 60; m++) {
    if (m % 5 === 0) continue
    const a = (m / 60) * Math.PI * 2
    ctx.fillRect(256 + Math.sin(a) * 232 - 2, 256 - Math.cos(a) * 232 - 2, 4, 4)
  }
  ctx.fillStyle = BRAND
  ctx.font = '700 30px "Anek Bangla Variable", system-ui, sans-serif'
  ctx.fillText('CODER ZONE', 256, 330)
  ctx.fillStyle = '#868B99'
  ctx.font = '500 24px "Anek Bangla Variable", system-ui, sans-serif'
  ctx.fillText('Dhaka · GMT+6', 256, 366)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

export function Office() {
  const m = useOfficeMaterials()
  return (
    <group>
      <Hot tip={{ bn: 'ঢাকার এখনকার সময়', en: 'Time in Dhaka' }} onPick={tellTime}>
        <WallClock position={[8, 5.65, halfD - 0.06]} />
      </Hot>
      <Hot tip={{ bn: 'আমাদের কাজ দেখুন →', en: 'See our work →' }} onPick={() => useStore.getState().goTo('work')}>
        <Workstation m={m} position={[5.4, 0, 7.4]} />
        <Workstation m={m} position={[8.6, 0, 7.4]} />
      </Hot>
      <Lounge m={m} />
      <Bookshelf m={m} position={[-14.2, 0, halfD - 0.35]} />
      <Hot tip={{ bn: 'এক কাপ চা/কফিতে কথা হোক ☕', en: "Let's talk over coffee ☕" }} onPick={coffee}>
        <CoffeeCorner m={m} position={[14.2, 0, halfD - 0.55]} />
      </Hot>
      <Pot m={m} position={[-2.2, 0, halfD - 0.6]} />
      <Pot m={m} position={[2.2, 0, halfD - 0.6]} />
      <Pot m={m} position={[halfW - 0.8, 0, -halfD + 0.8]} />
      <ScrollingCode tex={m.screen.map!} />
      <OfficeLife />
    </group>
  )
}

function tellTime() {
  const s = useStore.getState()
  const h = dhakaHours()
  const hh = Math.floor(h)
  const mm = String(Math.floor((h % 1) * 60)).padStart(2, '0')
  const h12 = ((hh + 11) % 12) + 1
  const ampm = hh < 12 ? 'AM' : 'PM'
  s.showToast(s.lang === 'bn'
    ? `ঢাকায় এখন ${h12}:${mm} ${ampm}। আমরা সাধারণত ১৫ মিনিটের মধ্যে রিপ্লাই দিই।`
    : `It's ${h12}:${mm} ${ampm} in Dhaka. We usually reply within 15 minutes.`)
}

function coffee() {
  const s = useStore.getState()
  s.goTo('contact')
  s.showToast(s.lang === 'bn' ? 'চা রেডি ☕ নিচে আমাদের সাথে যোগাযোগের সব উপায়।' : 'Coffee is ready ☕ Here is how to reach us.')
}

/** Analog clock on the front wall, set to Bangladesh time. */
function WallClock({ position }: { position: [number, number, number] }) {
  const face = useMemo(() => new THREE.MeshBasicMaterial({ map: clockFaceTexture() }), [])
  const ink = useMemo(() => new THREE.MeshBasicMaterial({ color: INK }), [])
  const brand = useMemo(() => new THREE.MeshBasicMaterial({ color: BRAND }), [])
  const rim = useMemo(() => new THREE.MeshLambertMaterial({ color: '#1C1E26' }), [])
  const hour = useRef<THREE.Group>(null)
  const minute = useRef<THREE.Group>(null)
  const second = useRef<THREE.Group>(null)
  useFrame(() => {
    const h = dhakaHours()
    const mins = (h % 1) * 60
    const secs = (mins % 1) * 60
    // Negative rotation about the face's own z axis = clockwise as seen from the room.
    if (hour.current) hour.current.rotation.z = -((h % 12) / 12) * Math.PI * 2
    if (minute.current) minute.current.rotation.z = -(mins / 60) * Math.PI * 2
    if (second.current) second.current.rotation.z = -(Math.floor(secs) / 60) * Math.PI * 2
  })
  const R = 0.62
  return (
    <group position={position} rotation-y={Math.PI}>
      <mesh rotation-x={Math.PI / 2} material={rim}><cylinderGeometry args={[R + 0.06, R + 0.06, 0.08, 48]} /></mesh>
      <mesh position-z={0.045} material={face}><circleGeometry args={[R, 48]} /></mesh>
      <group ref={hour} position-z={0.06}><mesh position-y={0.15} material={ink}><boxGeometry args={[0.045, 0.32, 0.01]} /></mesh></group>
      <group ref={minute} position-z={0.07}><mesh position-y={0.22} material={ink}><boxGeometry args={[0.03, 0.46, 0.01]} /></mesh></group>
      <group ref={second} position-z={0.08}><mesh position-y={0.2} material={brand}><boxGeometry args={[0.012, 0.5, 0.01]} /></mesh></group>
      <mesh position-z={0.09} material={brand}><circleGeometry args={[0.03, 16]} /></mesh>
    </group>
  )
}

function Workstation({ m, position }: { m: Mats; position: [number, number, number] }) {
  return (
    <group position={position} rotation-y={Math.PI}>
      {/* desk */}
      <mesh position-y={0.74} material={m.desk}><boxGeometry args={[2.4, 0.05, 1.1]} /></mesh>
      {[-1.12, 1.12].map((x) => (
        <mesh key={x} position={[x, 0.37, 0]} material={m.leg}><boxGeometry args={[0.06, 0.74, 1]} /></mesh>
      ))}
      {/* two monitors with code */}
      {[-0.5, 0.5].map((x) => (
        <group key={x} position={[x, 0.77, -0.3]}>
          <mesh position-y={0.18} material={m.leg}><boxGeometry args={[0.05, 0.36, 0.05]} /></mesh>
          <mesh position-y={0.52} material={m.bezel}><boxGeometry args={[0.92, 0.56, 0.04]} /></mesh>
          <mesh position={[0, 0.52, 0.025]} material={m.screen}><planeGeometry args={[0.86, 0.5]} /></mesh>
        </group>
      ))}
      {/* keyboard and mug */}
      <mesh position={[0, 0.78, 0.15]} material={m.bezel}><boxGeometry args={[0.7, 0.02, 0.22]} /></mesh>
      <mesh position={[0.75, 0.82, 0.2]} material={m.white}><cylinderGeometry args={[0.05, 0.045, 0.1, 12]} /></mesh>
      {/* chair */}
      <group position={[0, 0, 0.85]}>
        <mesh position-y={0.48} material={m.seat}><boxGeometry args={[0.55, 0.08, 0.55]} /></mesh>
        <mesh position={[0, 0.85, 0.25]} material={m.chair}><boxGeometry args={[0.55, 0.65, 0.07]} /></mesh>
        <mesh position-y={0.24} material={m.metal}><cylinderGeometry args={[0.03, 0.03, 0.44, 8]} /></mesh>
        <mesh position-y={0.04} material={m.chair}><cylinderGeometry args={[0.32, 0.32, 0.04, 16]} /></mesh>
      </group>
    </group>
  )
}

function Lounge({ m }: { m: Mats }) {
  return (
    <group position={[-8.6, 0, 7.6]}>
      <mesh rotation-x={-Math.PI / 2} position-y={0.012} material={m.rug}><planeGeometry args={[4.6, 3]} /></mesh>
      {/* sofa against the front wall, facing the room */}
      <group position={[0, 0, 1.6]} rotation-y={Math.PI}>
        <mesh position-y={0.25} material={m.sofa}><boxGeometry args={[3.2, 0.5, 0.95]} /></mesh>
        <mesh position={[0, 0.72, 0.38]} material={m.sofa}><boxGeometry args={[3.2, 0.6, 0.2]} /></mesh>
        {[-1.5, 1.5].map((x) => <mesh key={x} position={[x, 0.55, 0]} material={m.sofa}><boxGeometry args={[0.2, 0.6, 0.95]} /></mesh>)}
        {[-0.8, 0.8].map((x) => <mesh key={x} position={[x, 0.68, 0.22]} rotation-x={-0.25} material={m.cushion}><boxGeometry args={[0.5, 0.42, 0.12]} /></mesh>)}
      </group>
      {/* coffee table with a laptop */}
      <mesh position={[0, 0.4, 0]} material={m.wood}><boxGeometry args={[1.6, 0.06, 0.8]} /></mesh>
      {[[-0.7, -0.32], [0.7, -0.32], [-0.7, 0.32], [0.7, 0.32]].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 0.2, z]} material={m.leg}><boxGeometry args={[0.05, 0.4, 0.05]} /></mesh>
      ))}
      <mesh position={[0.2, 0.44, 0]} material={m.metal}><boxGeometry args={[0.5, 0.02, 0.34]} /></mesh>
      {/* floor lamp */}
      <group position={[2.1, 0, 1.4]}>
        <mesh position-y={0.8} material={m.leg}><cylinderGeometry args={[0.025, 0.025, 1.6, 8]} /></mesh>
        <mesh position-y={1.65} material={m.lamp}><cylinderGeometry args={[0.18, 0.26, 0.32, 16, 1, true]} /></mesh>
        <mesh position-y={0.02} material={m.leg}><cylinderGeometry args={[0.2, 0.2, 0.04, 16]} /></mesh>
      </group>
    </group>
  )
}

function Bookshelf({ m, position }: { m: Mats; position: [number, number, number] }) {
  const books = useMemo(() => {
    const out: { x: number; y: number; h: number; mat: number }[] = []
    for (let shelf = 0; shelf < 4; shelf++) {
      let x = -0.72
      let i = 0
      while (x < 0.65) {
        const w = 0.07 + ((shelf * 7 + i * 3) % 4) * 0.015
        out.push({ x: x + w / 2, y: 0.2 + shelf * 0.5, h: 0.28 + ((shelf + i) % 3) * 0.05, mat: (shelf * 5 + i) % 6 })
        x += w + 0.01
        i++
      }
    }
    return out
  }, [])
  return (
    <group position={position} rotation-y={Math.PI}>
      <mesh position-y={1.05} material={m.wood}><boxGeometry args={[1.6, 2.1, 0.4]} /></mesh>
      {[0, 1, 2, 3].map((s) => (
        <mesh key={s} position={[0, 0.2 + s * 0.5 + 0.12, 0.05]} material={m.white}><boxGeometry args={[1.5, 0.44, 0.32]} /></mesh>
      ))}
      {books.map((b, i) => (
        <mesh key={i} position={[b.x, b.y + b.h / 2 - 0.08, 0.1]} material={m.books[b.mat]}><boxGeometry args={[0.07, b.h, 0.24]} /></mesh>
      ))}
    </group>
  )
}

function CoffeeCorner({ m, position }: { m: Mats; position: [number, number, number] }) {
  return (
    <group position={position} rotation-y={Math.PI}>
      <mesh position-y={0.45} material={m.white}><boxGeometry args={[2, 0.9, 0.7]} /></mesh>
      <mesh position-y={0.92} material={m.wood}><boxGeometry args={[2.06, 0.05, 0.76]} /></mesh>
      {/* coffee machine */}
      <mesh position={[-0.5, 1.2, -0.05]} material={m.bezel}><boxGeometry args={[0.45, 0.5, 0.4]} /></mesh>
      <mesh position={[-0.5, 1.12, 0.16]} material={m.metal}><boxGeometry args={[0.2, 0.06, 0.04]} /></mesh>
      {/* cups */}
      {[0.2, 0.42, 0.64].map((x) => <mesh key={x} position={[x, 1.0, 0.1]} material={m.white}><cylinderGeometry args={[0.05, 0.04, 0.1, 12]} /></mesh>)}
      {/* water dispenser */}
      <group position={[1.4, 0, 0]}>
        <mesh position-y={0.55} material={m.white}><boxGeometry args={[0.4, 1.1, 0.4]} /></mesh>
        <mesh position-y={1.3} material={new THREE.MeshLambertMaterial({ color: '#9FD3F0', transparent: true, opacity: 0.8 })}><cylinderGeometry args={[0.16, 0.16, 0.4, 16]} /></mesh>
      </group>
    </group>
  )
}

function Pot({ m, position }: { m: Mats; position: [number, number, number] }) {
  const leaves = useRef<THREE.Group>(null)
  const seed = position[0] * 1.7 + position[2]
  // a gentle sway, as if the fan's air reaches it
  useFrame(({ clock }) => {
    if (!leaves.current) return
    const t = clock.elapsedTime
    leaves.current.rotation.z = Math.sin(t * 1.1 + seed) * 0.035
    leaves.current.rotation.x = Math.sin(t * 0.8 + seed * 2) * 0.025
  })
  return (
    <group position={position}>
      <mesh position-y={0.3} material={m.pot}><cylinderGeometry args={[0.28, 0.22, 0.6, 14]} /></mesh>
      <group ref={leaves} position-y={0.6}>
        {[[0, 0.35, 0, 0.42], [0.18, 0.65, 0.08, 0.3], [-0.16, 0.6, -0.08, 0.3]].map(([x, y, z, r], i) => (
          <mesh key={i} position={[x, y, z]} material={m.plant}><icosahedronGeometry args={[r, 1]} /></mesh>
        ))}
      </group>
    </group>
  )
}
