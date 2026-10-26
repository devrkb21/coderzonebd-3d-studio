// The entrance: a reception counter just inside the door, staffed by a realistic receptionist in
// office hours (she waves as a visitor comes through the door), with a screen that opens the AI receptionist
// chat at any hour, an open/closed sign hanging on the door, and the night guard's chair.
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { Lang } from '../content'
import { reopens, useSchedule, type Schedule } from '../schedule'
import { useStore } from '../store'
import { Hot } from './Hot'
import { GUARD_SEAT, RECEPTION, ROOM } from './layout'
import { noHit } from './Life'
import { Avatar, type Actor } from './People'
import { doorSignTexture, receptionTexture } from './PeopleScreens'
import { BRAND, INK } from './textures'

const { halfD } = ROOM
const TIP = { en: 'Chat with our AI receptionist', bn: 'আমাদের AI রিসেপশনিস্টের সাথে কথা বলুন' }

/** "Back at 10 AM" (today), "Back tomorrow at 10 AM", or "Back on Saturday at 10 AM" after a Friday. */
export function backText(s: Schedule, lang: Lang) {
  const when = reopens(s)
  if (lang === 'bn') return when === 'today' ? 'সকাল ১০টায় খুলব' : when === 'tomorrow' ? 'আগামীকাল সকাল ১০টায় খুলব' : 'শনিবার সকাল ১০টায় খুলব'
  return when === 'today' ? 'Back at 10 AM' : when === 'tomorrow' ? 'Back tomorrow at 10 AM' : 'Back on Saturday at 10 AM'
}

function useReceptionMaterials() {
  return useMemo(() => ({
    front: new THREE.MeshLambertMaterial({ color: '#F4F1EA' }),
    slat: new THREE.MeshLambertMaterial({ color: '#B48A5E' }),
    top: new THREE.MeshLambertMaterial({ color: '#FFFFFF' }),
    ink: new THREE.MeshLambertMaterial({ color: INK }),
    brand: new THREE.MeshBasicMaterial({ color: BRAND }),
    metal: new THREE.MeshLambertMaterial({ color: '#8A8F99' }),
    hit: new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false }),
  }), [])
}
type Mats = ReturnType<typeof useReceptionMaterials>

export function Reception() {
  const m = useReceptionMaterials()
  const sched = useSchedule()
  const lang = useStore((s) => s.lang)
  return (
    <>
      <group position={[RECEPTION.x, 0, RECEPTION.z]} rotation-y={RECEPTION.yaw}>
        <Hot tip={TIP} onPick={() => useStore.getState().openChat('receptionist')}>
          <Counter m={m} />
          <VisitorScreen open={sched.open} back={backText(sched, lang)} lang={lang} />
          {/* she catches clicks through an invisible box, not her skinned mesh */}
          <mesh position={[0, 0.9, -0.55]} material={m.hit}><boxGeometry args={[0.7, 1.8, 0.5]} /></mesh>
        </Hot>
        {sched.open && <Receptionist />}
      </group>
      <DoorSign open={sched.open} back={backText(sched, lang)} lang={lang} />
      <GuardChair m={m} />
    </>
  )
}

/** Curved-front counter in white with oak slats and a brand stripe; a lower work top behind. */
function Counter({ m }: { m: Mats }) {
  const slats = useMemo(() => Array.from({ length: 15 }, (_, i) => -1.05 + i * 0.15), [])
  return (
    <group>
      <mesh position={[0, 0.54, 0.18]} material={m.front}><boxGeometry args={[2.3, 1.08, 0.08]} /></mesh>
      {slats.map((x) => <mesh key={x} position={[x, 0.5, 0.235]} material={m.slat}><boxGeometry args={[0.07, 0.9, 0.03]} /></mesh>)}
      <mesh position={[0, 0.98, 0.252]} material={m.brand}><boxGeometry args={[2.3, 0.04, 0.01]} /></mesh>
      <mesh position={[0, 1.1, 0.1]} material={m.top}><boxGeometry args={[2.4, 0.04, 0.34]} /></mesh>
      {[-1.12, 1.12].map((x) => <mesh key={x} position={[x, 0.54, -0.12]} material={m.front}><boxGeometry args={[0.08, 1.08, 0.6]} /></mesh>)}
      <mesh position={[0, 0.74, -0.18]} material={m.top}><boxGeometry args={[2.2, 0.04, 0.6]} /></mesh>
      {/* her own monitor and keyboard */}
      <group position={[0.55, 0.76, -0.12]} rotation-y={Math.PI + 0.3}>
        <mesh position-y={0.13} material={m.metal}><boxGeometry args={[0.04, 0.26, 0.04]} /></mesh>
        <mesh position-y={0.38} material={m.ink}><boxGeometry args={[0.62, 0.38, 0.03]} /></mesh>
      </group>
      <mesh position={[0.35, 0.77, -0.3]} material={m.ink}><boxGeometry args={[0.45, 0.02, 0.15]} /></mesh>
    </group>
  )
}

/** The visitor-facing screen on the counter: welcome in office hours, "we're closed" after. */
function VisitorScreen({ open, back, lang }: { open: boolean; back: string; lang: Lang }) {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ toneMapped: false }), [])
  useEffect(() => {
    mat.map = receptionTexture(open, back, lang)
    mat.needsUpdate = true
  }, [mat, open, back, lang])
  const bezel = useMemo(() => new THREE.MeshLambertMaterial({ color: '#111216' }), [])
  return (
    <group position={[-0.62, 1.12, 0.12]} rotation-x={-0.22}>
      <mesh position={[0, 0.2, -0.012]} material={bezel}><boxGeometry args={[0.62, 0.41, 0.02]} /></mesh>
      <mesh position-y={0.2} material={mat}><planeGeometry args={[0.58, 0.37]} /></mesh>
    </group>
  )
}

/** The receptionist behind the counter: waves when a visitor arrives and when hovered. */
function Receptionist() {
  const actor = useRef<Actor | null>(null)
  const last = useRef(0)
  useEffect(() => {
    const wave = (delay: number) => setTimeout(() => {
      if (performance.now() - last.current < 4000) return
      last.current = performance.now()
      actor.current?.play('wave', true)
    }, delay)
    const s = useStore.getState()
    // first arrival: as the intro's glass doors open (she faces them), or once the room is up
    let t = s.ready && !s.intro ? wave(1200) : undefined
    const unsub = useStore.subscribe((now, prev) => {
      if (now.doorOpen && !prev.doorOpen) t = wave(700)
      if (!prev.ready && now.ready && !now.intro) t = wave(1200)
      if (now.tip && now.tip !== prev.tip && now.tip === TIP[now.lang]) t = wave(0)
    })
    return () => { unsub(); clearTimeout(t) }
  }, [])
  return <Avatar who="receptionist" clip="idle" actor={actor} position={[0, 0, -0.55]} />
}

/** A small sign hanging on chains from the door header, readable from the street and from inside. */
function DoorSign({ open, back, lang }: { open: boolean; back: string; lang: Lang }) {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ toneMapped: false }), [])
  useEffect(() => {
    mat.map = doorSignTexture(open, back, lang)
    mat.needsUpdate = true
  }, [mat, open, back, lang])
  const chain = useMemo(() => new THREE.MeshLambertMaterial({ color: '#2A2C33' }), [])
  const W = 0.5
  return (
    <group ref={noHit} position={[0, 2.62, halfD + 0.1]}>
      <mesh position-z={0.006} material={mat}><planeGeometry args={[W, W / 2]} /></mesh>
      <mesh position-z={-0.006} rotation-y={Math.PI} material={mat}><planeGeometry args={[W, W / 2]} /></mesh>
      <mesh material={chain}><boxGeometry args={[W + 0.02, W / 2 + 0.02, 0.01]} /></mesh>
      {[-0.18, 0.18].map((x) => <mesh key={x} position={[x, 0.33, 0]} material={chain}><cylinderGeometry args={[0.006, 0.006, 0.4, 4]} /></mesh>)}
    </group>
  )
}

/** A plain chair right of the door, where the night guard sits. */
function GuardChair({ m }: { m: Mats }) {
  return (
    <group ref={noHit} position={[GUARD_SEAT.x, 0, GUARD_SEAT.z]} rotation-y={GUARD_SEAT.yaw}>
      <mesh position-y={0.46} material={m.ink}><boxGeometry args={[0.5, 0.05, 0.48]} /></mesh>
      <mesh position={[0, 0.78, -0.23]} material={m.ink}><boxGeometry args={[0.5, 0.55, 0.04]} /></mesh>
      {[[-0.22, -0.2], [0.22, -0.2], [-0.22, 0.2], [0.22, 0.2]].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 0.22, z]} material={m.metal}><cylinderGeometry args={[0.015, 0.015, 0.44, 6]} /></mesh>
      ))}
    </group>
  )
}
