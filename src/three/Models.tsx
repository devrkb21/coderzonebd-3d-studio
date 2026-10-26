// Real 3D models: CC0 furniture and props from Poly Haven, and the CC0 "RobotExpressive"
// receptionist by Tomás Laulhé (Quaternius). Files live in public/models (meshopt-compressed).
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useAnimations, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../store'
import { AI_ENABLED } from '../ai/client'
import { LOUNGE_X, ROOM } from './layout'
import { noHit } from './Life'

const { halfW, halfD, height } = ROOM
const url = (name: string) => `${import.meta.env.BASE_URL}models/${name}.glb`

export const MODEL_NAMES = [
  'sofa_03', 'modern_arm_chair_01', 'modern_coffee_table_01', 'side_table_01', 'potted_plant_02', 'potted_plant_04',
  'ceiling_fan', 'desk_lamp_arm_01', 'hanging_picture_frame_01', 'hanging_picture_frame_02', 'security_camera_01',
]

/** One placed copy of a model; never catches clicks. */
export function Model({ name, ...props }: JSX.IntrinsicElements['group'] & { name: string }) {
  const { scene } = useGLTF(url(name))
  const copy = useMemo(() => {
    const c = scene.clone(true)
    c.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh) return
      const mat = mesh.material as THREE.MeshStandardMaterial
      // the room has no environment map: keep materials from going dark and mirror-like
      if (mat && 'metalness' in mat) mat.envMapIntensity = 0
    })
    noHit(c)
    return c
  }, [scene])
  return <group {...props}><primitive object={copy} /></group>
}

/** Ceiling fan model on a down-rod; spins down when the switch is off. */
function FanModel({ x, z }: { x: number; z: number }) {
  const rotor = useRef<THREE.Group>(null)
  const speed = useRef(4.5)
  useFrame((_, dt) => {
    const d = Math.min(dt, 0.05)
    speed.current = THREE.MathUtils.damp(speed.current, useStore.getState().lightsOn ? 4.5 : 0, 0.8, d)
    if (rotor.current) rotor.current.rotation.y += speed.current * d
  })
  const rod = useMemo(() => new THREE.MeshLambertMaterial({ color: '#BDB8AE' }), [])
  return (
    <group position={[x, height, z]}>
      <mesh ref={noHit} position-y={-0.2} material={rod}><cylinderGeometry args={[0.02, 0.02, 0.4, 8]} /></mesh>
      <group ref={rotor} position-y={-0.38}>
        <Model name="ceiling_fan" scale={1.15} />
      </group>
    </group>
  )
}

export function OfficeModels() {
  return (
    <group>
      {/* lounge in the front-right corner: sofa against the front wall, armchair, coffee table, side table */}
      <Model name="sofa_03" position={[LOUNGE_X, 0, halfD - 0.75]} rotation-y={Math.PI} />
      <Model name="modern_coffee_table_01" position={[LOUNGE_X, 0, halfD - 2.2]} rotation-y={Math.PI / 2} scale={1.15} />
      <Model name="modern_arm_chair_01" position={[LOUNGE_X - 2.3, 0, halfD - 2.9]} rotation-y={Math.PI / 2 - 0.35} />
      <Model name="side_table_01" position={[halfW - 1.2, 0, halfD - 0.6]} />
      <Model name="potted_plant_04" position={[halfW - 1.2, 0.55, halfD - 0.6]} scale={1.4} />
      {/* big plants by the entrance and in the corners */}
      <Model name="potted_plant_02" position={[-3.4, 0, halfD - 0.65]} scale={1.75} rotation-y={0.6} />
      <Model name="potted_plant_02" position={[3.4, 0, halfD - 0.65]} scale={1.75} rotation-y={2.2} />
      <Model name="potted_plant_02" position={[halfW - 0.8, 0, -halfD + 0.8]} scale={1.9} rotation-y={1.2} />
      <Model name="potted_plant_02" position={[-halfW + 0.9, 0, 3.6]} scale={1.8} rotation-y={-0.4} />
      <Model name="potted_plant_02" position={[halfW - 0.9, 0, 2.0]} scale={1.8} rotation-y={2.8} />
      {/* desks: a succulent and an arm lamp */}
      <Model name="potted_plant_04" position={[4.45, 0.77, 7.05]} scale={1.2} />
      <Model name="potted_plant_04" position={[9.55, 0.77, 7.05]} scale={1.2} />
      <Model name="desk_lamp_arm_01" position={[7.65, 0.77, 7.55]} rotation-y={Math.PI + 0.6} scale={0.9} />
      {/* ceiling fans */}
      <FanModel x={LOUNGE_X} z={halfD - 2.2} />
      <FanModel x={7} z={5.3} />
      {/* framed art either side of the windows, above the CEO's cabin and the lounge */}
      <Model name="hanging_picture_frame_01" position={[-14.2, 3.35, halfD - 0.02]} rotation-y={Math.PI} scale={1.5} />
      <Model name="hanging_picture_frame_02" position={[14.2, 3.2, halfD - 0.04]} rotation-y={Math.PI} scale={1.6} />
      {/* CCTV in the corner, watching the room */}
      <Model name="security_camera_01" position={[halfW - 0.15, height - 0.35, halfD - 0.15]} rotation={[0, -Math.PI * 0.75, 0]} scale={1.1} />
    </group>
  )
}

// ── robot receptionist ─────────────────────────────────────────

/**
 * CZ Bot stands by the quote desk. It waves when a visitor arrives at Contact or hovers it,
 * gives a thumbs-up when something is added to the quote, and idles otherwise.
 */
export function Robot() {
  const group = useRef<THREE.Group>(null)
  const { scene, animations } = useGLTF(url('robot'))
  const { actions } = useAnimations(animations, group)
  const current = useRef<string>('')
  const play = (name: string, once = false) => {
    const next = actions[name]
    if (!next || current.current === name) return
    const prev = current.current ? actions[current.current] : null
    next.reset()
    next.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, Infinity)
    next.clampWhenFinished = once
    next.fadeIn(0.3).play()
    prev?.fadeOut(0.3)
    current.current = name
    if (once) {
      const back = () => { if (current.current === name) play('Idle') }
      setTimeout(back, (next.getClip().duration + 0.2) * 1000)
    }
  }

  useEffect(() => {
    play('Idle')
    const unsub = useStore.subscribe((s, prev) => {
      if (s.stop === 'contact' && prev.stop !== 'contact' && !s.focusId) setTimeout(() => play('Wave', true), 700)
      if (s.quote.length > prev.quote.length) play('ThumbsUp', true)
    })
    return unsub
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actions, scene])

  return (
    <group
      ref={group}
      position={[halfW - 1.05, 0, 3.55]}
      rotation-y={-Math.PI / 2 + 0.35}
      scale={0.32}
      onPointerOver={(e) => {
        e.stopPropagation()
        document.body.style.cursor = 'pointer'
        const s = useStore.getState()
        s.setTip(s.lang === 'bn' ? 'হাই! আমি CZ Bot 👋' : "Hi! I'm CZ Bot 👋")
        play('Wave', true)
      }}
      onPointerOut={() => { document.body.style.cursor = ''; useStore.getState().setTip(null) }}
      onClick={(e) => {
        e.stopPropagation()
        if (e.delta > 6) return
        const s = useStore.getState()
        play('Yes', true)
        if (AI_ENABLED) s.openChat('receptionist'); else s.focus('contact')
      }}
    >
      <primitive object={scene} />
    </group>
  )
}

export function preloadModels() {
  MODEL_NAMES.forEach((n) => useGLTF.preload(url(n)))
  useGLTF.preload(url('robot'))
}
