// Realistic people: rigged Microsoft Rocketbox avatars (MIT) with Rocketbox motion-capture clips,
// converted to meshopt GLBs in public/models/people. Every avatar shares one skeleton, so one
// clip pack per body type (anims-m / anims-f) drives them all.
import { Suspense, useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useAnimations, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { noHit } from './Life'

export const AVATARS = {
  receptionist: 'f', dev1: 'm', dev2: 'm', walker: 'f', ceo: 'm', cmo: 'm', guard: 'm',
} as const
export type AvatarId = keyof typeof AVATARS
export type Clip = 'type' | 'sit' | 'look' | 'idle' | 'talk' | 'wave' | 'walk' | 'drink'

const url = (name: string) => `${import.meta.env.BASE_URL}models/people/${name}.glb`
const FADE = 0.45
/** Long clips trimmed in the pack loop back and forth so the seam never shows. */
const PINGPONG: Clip[] = ['type', 'talk', 'sit', 'drink']

export interface Actor {
  /** Cross-fades to `clip`; a `once` clip plays through and fades back to the previous one. */
  play: (clip: Clip, once?: boolean) => void
}

type AvatarProps = JSX.IntrinsicElements['group'] & {
  who: AvatarId
  clip: Clip
  seed?: number
  actor?: React.MutableRefObject<Actor | null>
}

/**
 * One avatar with its own skeleton and animation mixer. `clip` is the looping base action;
 * `seed` offsets it so two people never move in step. Streams in on its own, never catches clicks.
 */
export function Avatar(props: AvatarProps) {
  return <Suspense fallback={null}><AvatarModel {...props} /></Suspense>
}

function AvatarModel({ who, clip, seed = 0, actor, ...props }: AvatarProps) {
  const { scene, animations: own } = useGLTF(url(who))
  const { animations: shared } = useGLTF(url(`anims-${AVATARS[who]}`))
  // A swapped-in avatar on another rig (e.g. a founder's photo avatar) brings its own clips.
  const animations = own.length ? own : shared
  const model = useMemo(() => {
    const c = clone(scene)
    c.traverse((o) => {
      const mesh = o as THREE.SkinnedMesh
      if (!mesh.isMesh) return
      // the sitting and walking poses leave the bind-pose bounds
      mesh.frustumCulled = false
      const mat = mesh.material as THREE.MeshStandardMaterial
      mat.envMapIntensity = 0
    })
    noHit(c)
    return c
  }, [scene])
  const { actions, mixer } = useAnimations(animations, model)
  const base = useRef<Clip>(clip)
  const current = useRef<Clip | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>()

  const api = useMemo<Actor>(() => {
    const fadeTo = (name: Clip, once: boolean) => {
      const next = actions[name]
      if (!next) return
      const prev = current.current ? actions[current.current] : null
      if (prev === next && !once) return
      next.reset()
      next.setLoop(once ? THREE.LoopOnce : PINGPONG.includes(name) ? THREE.LoopPingPong : THREE.LoopRepeat, Infinity)
      next.clampWhenFinished = once
      if (!once && !prev) next.time = (seed * 3.7) % next.getClip().duration
      next.fadeIn(FADE).play()
      if (prev && prev !== next) prev.fadeOut(FADE)
      current.current = name
    }
    return {
      play: (name, once = false) => {
        clearTimeout(timer.current)
        fadeTo(name, once)
        if (once) {
          const ms = (actions[name]!.getClip().duration - FADE) * 1000
          timer.current = setTimeout(() => fadeTo(base.current, false), ms)
        }
      },
    }
  }, [actions, seed])

  useEffect(() => {
    base.current = clip
    api.play(clip)
  }, [api, clip])

  // Rocketbox has no seated typing clip: on top of the seated-at-a-table clip, the hands and
  // fingers tap away. Runs after the mixer (registered after useAnimations).
  const fingers = useMemo(() => {
    const bones: THREE.Object3D[] = []
    model.traverse((o) => { if (/^Bip01_[LR]_(Hand|Finger[1-4])$/.test(o.name)) bones.push(o) })
    return bones
  }, [model])
  useFrame(({ clock }) => {
    if (current.current !== 'type') return
    const t = clock.elapsedTime * 11 + seed * 5
    fingers.forEach((b, i) => {
      const hand = b.name.endsWith('Hand')
      const k = Math.max(0, Math.sin(t * (hand ? 0.5 : 1) + i * 1.7))
      b.rotateZ((hand ? 0.06 : 0.22) * k)
    })
  })
  useEffect(() => () => { clearTimeout(timer.current); mixer.stopAllAction() }, [mixer])
  useEffect(() => { if (actor) actor.current = api }, [actor, api])

  return <group {...props}><primitive object={model} /></group>
}

type Pt = [number, number]
export interface Leg { to: Pt[]; then: Clip; hold: number; face?: number }

/**
 * Walks a loop of legs: along each leg's points, then turns to `face` (yaw) and plays `then`
 * for `hold` seconds. Moves the group by its feet at the walk clip's pace.
 */
export function Walker({ who, start, legs, speed = 1.15, seed = 0 }: { who: AvatarId; start: Pt; legs: Leg[]; speed?: number; seed?: number }) {
  const group = useRef<THREE.Group>(null)
  const ref = useRef<Actor | null>(null)
  const st = useRef({ leg: 0, pt: 0, pos: new THREE.Vector2(...start), hold: legs[legs.length - 1].hold * 0.5, yaw: legs[legs.length - 1].face ?? 0, walking: false })
  useFrame((_, dt) => {
    const g = group.current
    const a = ref.current
    if (!g || !a) return
    const s = st.current
    const d = Math.min(dt, 0.05)
    const leg = legs[s.leg]
    if (s.hold > 0) {
      s.hold -= d
      if (s.hold <= 0) { s.pt = 0; s.walking = true; a.play('walk') }
    } else {
      const [tx, tz] = leg.to[s.pt]
      const dx = tx - s.pos.x
      const dz = tz - s.pos.y
      const dist = Math.hypot(dx, dz)
      const step = speed * d
      if (dist <= step) {
        s.pos.set(tx, tz)
        if (++s.pt >= leg.to.length) {
          s.walking = false
          s.hold = leg.hold
          a.play(leg.then)
          s.leg = (s.leg + 1) % legs.length
        }
      } else {
        s.pos.x += (dx / dist) * step
        s.pos.y += (dz / dist) * step
        s.yaw = turn(s.yaw, Math.atan2(dx, dz), d * 5)
      }
    }
    if (!s.walking && s.hold > 0) {
      const face = legs[(s.leg + legs.length - 1) % legs.length].face
      if (face !== undefined) s.yaw = turn(s.yaw, face, d * 3)
    }
    g.position.set(s.pos.x, 0, s.pos.y)
    g.rotation.y = s.yaw
  })
  return (
    <group ref={group} position={[start[0], 0, start[1]]}>
      <Avatar who={who} clip={legs[legs.length - 1].then} seed={seed} actor={ref} />
    </group>
  )
}

function turn(from: number, to: number, k: number) {
  const diff = Math.atan2(Math.sin(to - from), Math.cos(to - from))
  return from + diff * Math.min(1, k)
}
