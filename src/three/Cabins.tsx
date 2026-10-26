// The founders' private cabins in the front-left corner: glass walls with nameplates, an
// executive desk and chair, a shelf, a plant, a monitor, the founder at work in office hours,
// and their AI assistant on a desk screen (always on: clicking it opens that founder's chat).
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { LEADERSHIP, type L, type Lang } from '../content'
import { useSchedule } from '../schedule'
import { useStore } from '../store'
import { Hot } from './Hot'
import { CABIN, CABINS, ROOM } from './layout'
import { noHit } from './Life'
import { Model } from './Models'
import { Avatar, type Actor } from './People'
import { assistantTexture, nameplateTexture } from './PeopleScreens'
import { BRAND, INK } from './textures'

const { halfD } = ROOM
const D = halfD - CABIN.z0
/** Desk centre, measured from the cabin's open front. */
const DESK_Z = 1.25
const DOOR_W = 1.05

function useCabinMaterials() {
  return useMemo(() => ({
    glass: new THREE.MeshBasicMaterial({ color: '#D6E9F5', transparent: true, opacity: 0.13, depthWrite: false, side: THREE.DoubleSide }),
    frost: new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.45, depthWrite: false, side: THREE.DoubleSide }),
    frame: new THREE.MeshLambertMaterial({ color: '#1A1C22' }),
    walnut: new THREE.MeshLambertMaterial({ color: '#5A3B26' }),
    top: new THREE.MeshLambertMaterial({ color: '#2B2420' }),
    leather: new THREE.MeshLambertMaterial({ color: '#16171B' }),
    metal: new THREE.MeshLambertMaterial({ color: '#8A8F99' }),
    rug: new THREE.MeshLambertMaterial({ color: '#4A4E58' }),
    bezel: new THREE.MeshLambertMaterial({ color: '#111216' }),
    screen: new THREE.MeshBasicMaterial({ color: '#2A3550' }),
    books: ['#FF931E', '#2C3E50', '#E9DCC6', '#C0392B', '#16A085', '#7F8C8D'].map((c) => new THREE.MeshLambertMaterial({ color: c })),
    brand: new THREE.MeshBasicMaterial({ color: BRAND }),
    hit: new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false }),
  }), [])
}
type Mats = ReturnType<typeof useCabinMaterials>

export function Cabins() {
  const m = useCabinMaterials()
  const { open } = useSchedule()
  return (
    <group>
      {CABINS.map((c, i) => {
        const f = LEADERSHIP.founders.find((x) => x.who === c.who)!
        return (
          <group key={c.who} position={[c.x, 0, CABIN.z0]}>
            <Shell m={m} />
            <Nameplate name={f.name} role={f.role} />
            <Desk m={m} who={c.who} name={f.name} role={f.role} />
            <BookScreen m={m} who={c.who} name={f.name} />
            {i === 0 ? <TallShelf m={m} /> : <Credenza m={m} />}
            <Model name="potted_plant_02" position={[(i === 0 ? -1 : 1) * (CABIN.w / 2 - 0.45), 0, D - 0.45]} scale={1.45} rotation-y={i * 2} />
            {open && <Founder who={c.who} seed={i * 3} />}
          </group>
        )
      })}
    </group>
  )
}

/** Glass front (with an open doorway near the reception side) and glass right wall; the left is the room wall or the neighbour's glass. */
function Shell({ m }: { m: Mats }) {
  const w = CABIN.w
  const h = CABIN.h
  const front = w - DOOR_W
  const fx = -w / 2 + front / 2
  return (
    <group ref={noHit}>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.006, D / 2 + 0.1]} material={m.rug}><planeGeometry args={[w - 0.6, D - 0.9]} /></mesh>
      {/* front glass with a frosted privacy band, and a header over the doorway */}
      <mesh position={[fx, h / 2, 0]} material={m.glass}><planeGeometry args={[front, h]} /></mesh>
      <mesh position={[fx, 1.55, 0.003]} material={m.frost}><planeGeometry args={[front, 0.12]} /></mesh>
      <mesh position={[w / 2, h / 2, D / 2]} rotation-y={Math.PI / 2} material={m.glass}><planeGeometry args={[D, h]} /></mesh>
      <mesh position={[w / 2, 1.55, D / 2]} rotation-y={Math.PI / 2} material={m.frost}><planeGeometry args={[D, 0.12]} /></mesh>
      {/* slim black frame */}
      <mesh position={[0, h, 0]} material={m.frame}><boxGeometry args={[w, 0.06, 0.06]} /></mesh>
      <mesh position={[w / 2, h, D / 2]} material={m.frame}><boxGeometry args={[0.06, 0.06, D]} /></mesh>
      {[fx + front / 2, w / 2].map((x) => <mesh key={x} position={[x, h / 2, 0]} material={m.frame}><boxGeometry args={[0.06, h, 0.06]} /></mesh>)}
      <mesh position={[w / 2, h / 2, D - 0.03]} material={m.frame}><boxGeometry args={[0.06, h, 0.06]} /></mesh>
    </group>
  )
}

function Nameplate({ name, role }: { name: string; role: string }) {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ map: nameplateTexture(name, role) }), [name, role])
  const w = CABIN.w
  return (
    <mesh ref={noHit} position={[w / 2 - DOOR_W - 0.8, 2.05, -0.012]} rotation-y={Math.PI} material={mat}>
      <planeGeometry args={[1.36, 0.34]} />
    </mesh>
  )
}

/** Executive desk with a monitor for the founder and the AI-assistant screen facing visitors. */
function Desk({ m, who, name, role }: { m: Mats; who: 'ceo' | 'cmo'; name: string; role: string }) {
  const lang = useStore((s) => s.lang)
  const ai = useMemo(() => new THREE.MeshBasicMaterial({ map: assistantTexture(name, role, lang), toneMapped: false }), [name, role, lang])
  const tip: L = { en: `Ask ${name.split(' ')[0]}'s AI assistant`, bn: `${name}-এর AI সহকারীকে জিজ্ঞেস করুন` }
  return (
    <Hot tip={tip} onPick={() => useStore.getState().openChat(who)}>
      <group position={[0, 0, DESK_Z]}>
        <mesh position-y={0.74} material={m.top}><boxGeometry args={[1.9, 0.05, 0.85]} /></mesh>
        {/* walnut pedestals and a modesty panel facing the room */}
        {[-0.72, 0.72].map((x) => <mesh key={x} position={[x, 0.36, 0]} material={m.walnut}><boxGeometry args={[0.42, 0.72, 0.8]} /></mesh>)}
        <mesh position={[0, 0.45, -0.38]} material={m.walnut}><boxGeometry args={[1.0, 0.5, 0.03]} /></mesh>
        <mesh position={[0, 0.2, -0.4]} material={m.brand}><boxGeometry args={[1.86, 0.02, 0.01]} /></mesh>
        {/* the founder's monitor, to one side and angled towards the chair */}
        <group position={[0.68, 0.77, 0.12]} rotation-y={-0.8}>
          <mesh position-y={0.14} material={m.metal}><boxGeometry args={[0.04, 0.28, 0.04]} /></mesh>
          <mesh position-y={0.42} material={m.bezel}><boxGeometry args={[0.7, 0.42, 0.03]} /></mesh>
          <mesh position={[0, 0.42, 0.017]} material={m.screen}><planeGeometry args={[0.66, 0.38]} /></mesh>
        </group>
        {/* the AI assistant: a screen on a stand at the front corner, facing whoever walks in */}
        <group position={[-0.62, 0.77, -0.22]} rotation-y={Math.PI + 0.3}>
          <mesh position-y={0.12} material={m.metal}><boxGeometry args={[0.04, 0.24, 0.04]} /></mesh>
          <mesh position={[0, 0.36, -0.012]} material={m.bezel}><boxGeometry args={[0.66, 0.43, 0.02]} /></mesh>
          <mesh position-y={0.36} material={ai}><planeGeometry args={[0.62, 0.39]} /></mesh>
        </group>
        <ExecChair m={m} />
        {/* the founder catches clicks through an invisible box, not the skinned mesh */}
        <mesh position={[0, 0.95, 0.68]} material={m.hit}><boxGeometry args={[0.7, 1.0, 0.5]} /></mesh>
      </group>
    </Hot>
  )
}

/** "Book a 15-min call": a small tablet on the desk's other front corner, next to the AI screen. */
function bookTexture(name: string, lang: Lang) {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 320
  const ctx = c.getContext('2d')!
  const g = ctx.createLinearGradient(0, 0, 0, c.height)
  g.addColorStop(0, '#1B1F2B')
  g.addColorStop(1, '#0E1016')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, c.width, c.height)
  const font = (w: number, s: number) => `${w} ${s}px "Anek Bangla Variable", system-ui, sans-serif`
  // a little calendar
  ctx.strokeStyle = BRAND
  ctx.lineWidth = 7
  ctx.beginPath(); ctx.roundRect(36, 44, 92, 84, 12); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(36, 72); ctx.lineTo(128, 72); ctx.stroke()
  ctx.fillStyle = BRAND
  for (let i = 0; i < 6; i++) ctx.fillRect(50 + (i % 3) * 24, 84 + Math.floor(i / 3) * 20, 14, 12)
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#ffffff'
  ctx.font = font(700, lang === 'bn' ? 38 : 40)
  ctx.fillText(lang === 'bn' ? '১৫ মিনিটের কল' : '15-min call', 152, 70)
  ctx.fillStyle = '#9AA0AE'
  ctx.font = font(500, 28)
  ctx.fillText(lang === 'bn' ? `${name}-এর সাথে` : `with ${name.split(' ')[0]}`, 152, 114)
  ctx.fillStyle = BRAND
  ctx.beginPath(); ctx.roundRect(36, 190, c.width - 72, 84, 42); ctx.fill()
  ctx.fillStyle = INK
  ctx.font = font(700, 36)
  ctx.textAlign = 'center'
  ctx.fillText(lang === 'bn' ? 'কল বুক করুন →' : 'Book a call →', c.width / 2, 234)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

function BookScreen({ m, who, name }: { m: Mats; who: 'ceo' | 'cmo'; name: string }) {
  const lang = useStore((s) => s.lang)
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ map: bookTexture(name, lang), toneMapped: false }), [name, lang])
  useEffect(() => () => { mat.map?.dispose(); mat.dispose() }, [mat])
  const tip: L = { en: `Book a 15-min call with ${name.split(' ')[0]}`, bn: `${name}-এর সাথে ১৫ মিনিটের কল বুক করুন` }
  return (
    <Hot tip={tip} onPick={() => useStore.getState().openBooking(who)}>
      <group position={[0.4, 0.77, DESK_Z - 0.3]} rotation-y={Math.PI - 0.25}>
        <mesh position={[0, 0.08, 0.03]} rotation-x={-0.35} material={m.metal}><boxGeometry args={[0.03, 0.18, 0.03]} /></mesh>
        <mesh position={[0, 0.17, -0.006]} rotation-x={-0.18} material={m.bezel}><boxGeometry args={[0.46, 0.3, 0.015]} /></mesh>
        <mesh position={[0, 0.17, 0.003]} rotation-x={-0.18} material={mat}><planeGeometry args={[0.43, 0.27]} /></mesh>
      </group>
    </Hot>
  )
}

function ExecChair({ m }: { m: Mats }) {
  return (
    <group ref={noHit} position={[0, 0, 0.78]}>
      <mesh position-y={0.47} material={m.leather}><boxGeometry args={[0.6, 0.1, 0.56]} /></mesh>
      <mesh position={[0, 0.98, 0.3]} rotation-x={-0.12} material={m.leather}><boxGeometry args={[0.58, 0.9, 0.1]} /></mesh>
      {[-0.32, 0.32].map((x) => <mesh key={x} position={[x, 0.66, 0.02]} material={m.leather}><boxGeometry args={[0.06, 0.05, 0.42]} /></mesh>)}
      <mesh position-y={0.24} material={m.metal}><cylinderGeometry args={[0.035, 0.035, 0.42, 8]} /></mesh>
      <mesh position-y={0.04} material={m.leather}><cylinderGeometry args={[0.34, 0.34, 0.04, 16]} /></mesh>
    </group>
  )
}

function useBooks(width: number, shelves: number, seed: number) {
  return useMemo(() => {
    const out: { x: number; s: number; h: number; mat: number }[] = []
    for (let s = 0; s < shelves; s++) {
      let x = -width / 2 + 0.06
      let i = 0
      while (x < width / 2 - (s % 2 ? 0.5 : 0.15)) {
        const w = 0.06 + ((s * 7 + i * 3 + seed) % 4) * 0.015
        out.push({ x: x + w / 2, s, h: 0.24 + ((s + i + seed) % 3) * 0.04, mat: (s * 5 + i + seed) % 6 })
        x += w + 0.008
        i++
      }
    }
    return out
  }, [width, shelves, seed])
}

/** Tall walnut shelf against the room's left wall (CEO). */
function TallShelf({ m }: { m: Mats }) {
  const books = useBooks(1.3, 4, 1)
  return (
    <group ref={noHit} position={[-CABIN.w / 2 + 0.22, 0, D / 2 + 0.2]} rotation-y={Math.PI / 2}>
      {[0, 1, 2, 3, 4].map((s) => <mesh key={s} position={[0, 0.06 + s * 0.48, 0]} material={m.walnut}><boxGeometry args={[1.4, 0.04, 0.34]} /></mesh>)}
      {[-0.7, 0.7].map((x) => <mesh key={x} position={[x, 1.0, 0]} material={m.walnut}><boxGeometry args={[0.04, 2.0, 0.34]} /></mesh>)}
      {books.map((b, i) => <mesh key={i} position={[b.x, 0.08 + b.s * 0.48 + b.h / 2, 0.02]} material={m.books[b.mat]}><boxGeometry args={[0.06, b.h, 0.22]} /></mesh>)}
    </group>
  )
}

/** Low credenza under the window behind the CMO's chair, with books and a trophy-like brand block. */
function Credenza({ m }: { m: Mats }) {
  const books = useBooks(1.0, 1, 4)
  return (
    <group ref={noHit} position={[0.1, 0, D - 0.25]} rotation-y={Math.PI}>
      <mesh position-y={0.36} material={m.walnut}><boxGeometry args={[1.9, 0.72, 0.38]} /></mesh>
      {books.map((b, i) => <mesh key={i} position={[b.x - 0.35, 0.72 + b.h / 2, 0]} material={m.books[b.mat]}><boxGeometry args={[0.06, b.h, 0.22]} /></mesh>)}
      <mesh position={[0.6, 0.84, 0]} material={m.brand}><boxGeometry args={[0.16, 0.24, 0.16]} /></mesh>
    </group>
  )
}

/** The founder at the desk, facing the room: working, and now and then looking up. */
function Founder({ who, seed }: { who: 'ceo' | 'cmo'; seed: number }) {
  const actor = useRef<Actor | null>(null)
  useLookUp(actor, seed)
  return <Avatar who={who} clip="type" seed={seed} actor={actor} position={[0, 0, DESK_Z + 0.62]} rotation-y={Math.PI} />
}

/** Every 14–24 s a seated worker glances around, then gets back to work. */
export function useLookUp(actor: React.MutableRefObject<Actor | null>, seed: number) {
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>
    const next = () => {
      t = setTimeout(() => { actor.current?.play('look', true); next() }, 14000 + ((seed * 3571) % 10000))
    }
    next()
    return () => clearTimeout(t)
  }, [actor, seed])
}
