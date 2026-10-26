// Other live visitors as soft translucent figures standing where their camera is.
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { sendPosition, usePresence } from '../ai/presence'
import { ROOM } from './layout'

const coarse = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
const MAX_GHOSTS = coarse ? 8 : 16
/** Ghosts closer than this to our own camera fade out, so a visitor at the same stop never blocks the view. */
const NEAR = 3
const OPACITY = 0.32
const SEND_EVERY = 0.5
/** Resend a still camera now and then, so visitors who joined later still see us. */
const RESEND = 8

const noHit = () => null

function Ghost({ id, mat }: { id: string; mat: THREE.Material }) {
  const ref = useRef<THREE.Group>(null)
  const material = useMemo(() => mat.clone() as THREE.MeshStandardMaterial, [mat])
  const camera = useThree((s) => s.camera)
  const first = useRef(true)
  useFrame((_, dt) => {
    const g = ref.current
    const v = usePresence.getState().others.get(id)
    if (!g || !v) return
    // Stand on the floor under their camera, inside the room.
    const x = THREE.MathUtils.clamp(v[0], -ROOM.halfW + 0.6, ROOM.halfW - 0.6)
    const z = THREE.MathUtils.clamp(v[2], -ROOM.halfD + 0.6, ROOM.halfD - 0.6)
    const d = Math.min(dt, 0.05)
    if (first.current) { g.position.set(x, 0, z); g.rotation.y = v[3]; first.current = false }
    g.position.x = THREE.MathUtils.damp(g.position.x, x, 3, d)
    g.position.z = THREE.MathUtils.damp(g.position.z, z, 3, d)
    const turn = Math.atan2(Math.sin(v[3] - g.rotation.y), Math.cos(v[3] - g.rotation.y))
    g.rotation.y += turn * Math.min(1, d * 4)
    g.position.y = Math.sin(performance.now() / 700 + x) * 0.04
    const near = Math.hypot(camera.position.x - g.position.x, camera.position.z - g.position.z)
    const target = near < NEAR ? 0 : OPACITY * Math.min(1, (near - NEAR) / 2)
    material.opacity = THREE.MathUtils.damp(material.opacity, target, 4, d)
    g.visible = material.opacity > 0.01
  })
  return (
    <group ref={ref} visible={false}>
      <mesh position-y={0.85} material={material} raycast={noHit}><capsuleGeometry args={[0.24, 0.9, 6, 14]} /></mesh>
      <mesh position-y={1.62} material={material} raycast={noHit}><sphereGeometry args={[0.17, 16, 12]} /></mesh>
    </group>
  )
}

/** Sends our camera ~2× a second while it moves and draws everyone else. */
export function Ghosts() {
  const ids = usePresence((s) => [...s.others.keys()].slice(0, MAX_GHOSTS).join(','))
  const camera = useThree((s) => s.camera)
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#BFD4FF', emissive: '#6E8FD8', emissiveIntensity: 0.6, transparent: true, opacity: 0, depthWrite: false }), [])
  const clock = useRef(0)
  const last = useRef('')
  const since = useRef(0)
  const dir = useRef(new THREE.Vector3())
  useFrame((_, dt) => {
    clock.current += dt
    since.current += dt
    if (clock.current < SEND_EVERY) return
    clock.current = 0
    camera.getWorldDirection(dir.current)
    const v: [number, number, number, number] = [camera.position.x, camera.position.y, camera.position.z, Math.atan2(dir.current.x, dir.current.z)]
    const key = v.map((n) => n.toFixed(2)).join()
    if (key === last.current && since.current < RESEND) return
    last.current = key
    since.current = 0
    sendPosition(v)
  })
  return <>{ids ? ids.split(',').map((id) => <Ghost key={id} id={id} mat={mat} />) : null}</>
}
