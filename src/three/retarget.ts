// Plays the Rocketbox (3ds Max Biped) clips on an Avaturn / Mixamo-style skeleton, such as a
// founder's photo avatar. Every frame, each limb of the target is turned so it points the same
// way as the matching source limb, so different rest poses (A-pose vs T-pose) and bone axes
// between the two rigs don't matter.
import * as THREE from 'three'
import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js'

/** Avaturn / Mixamo bone → Rocketbox bone, as GLTFLoader names them (spaces become underscores). */
const MAP: Record<string, string> = {
  Hips: 'Bip01_Pelvis', Spine: 'Bip01_Spine', Spine1: 'Bip01_Spine1', Spine2: 'Bip01_Spine2', Neck: 'Bip01_Neck', Head: 'Bip01_Head',
}
/** Bone → the child it points at; that direction is what gets copied. */
const AIM: Record<string, string> = { Spine: 'Spine1', Spine1: 'Spine2', Spine2: 'Neck', Neck: 'Head' }
for (const [side, s] of [['Left', 'L'], ['Right', 'R']] as const) {
  Object.assign(MAP, {
    [`${side}Shoulder`]: `Bip01_${s}_Clavicle`, [`${side}Arm`]: `Bip01_${s}_UpperArm`, [`${side}ForeArm`]: `Bip01_${s}_Forearm`, [`${side}Hand`]: `Bip01_${s}_Hand`,
    [`${side}HandMiddle1`]: `Bip01_${s}_Finger2`,
    [`${side}UpLeg`]: `Bip01_${s}_Thigh`, [`${side}Leg`]: `Bip01_${s}_Calf`, [`${side}Foot`]: `Bip01_${s}_Foot`, [`${side}ToeBase`]: `Bip01_${s}_Toe0`,
  })
  Object.assign(AIM, {
    [`${side}Shoulder`]: `${side}Arm`, [`${side}Arm`]: `${side}ForeArm`, [`${side}ForeArm`]: `${side}Hand`, [`${side}Hand`]: `${side}HandMiddle1`,
    [`${side}UpLeg`]: `${side}Leg`, [`${side}Leg`]: `${side}Foot`, [`${side}Foot`]: `${side}ToeBase`,
  })
}

/** True when a model already uses the Rocketbox skeleton (no retargeting needed). */
export const isBiped = (model: THREE.Object3D) => !!model.getObjectByName('Bip01_Pelvis')

/** The orientation of a body given its up and left-right directions. */
function basis(up: THREE.Vector3, side: THREE.Vector3) {
  const x = side.clone().normalize()
  const y = up.clone().addScaledVector(x, -up.dot(x)).normalize()
  const z = new THREE.Vector3().crossVectors(x, y)
  return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z))
}

/**
 * Re-bakes `clips` (animating `rig`, the Rocketbox clip pack's scene) for `target`'s skeleton.
 * The target must be in its rest pose; the clip set needs an 'idle' (standing) clip, which
 * calibrates the pack's space and leg length.
 */
export function retargetFromBiped(target: THREE.Object3D, rig: THREE.Object3D, clips: THREE.AnimationClip[], fps = 24) {
  const tgt = clone(target)
  const src = clone(rig)
  tgt.updateMatrixWorld(true)
  src.updateMatrixWorld(true)
  const T = (name: string) => tgt.getObjectByName(name)
  const S = (name: string) => src.getObjectByName(MAP[name])
  const hips = T('Hips')
  if (!hips || !T('Head') || !T('LeftFoot') || !S('Hips') || !S('Head') || !S('LeftUpLeg') || !S('RightUpLeg') || !S('LeftFoot')) return []
  const p = (o: THREE.Object3D) => o.getWorldPosition(new THREE.Vector3())

  // target rest pose
  const bones: THREE.Object3D[] = []
  hips.traverse((o) => bones.push(o))
  const restQ = new Map(bones.map((b) => [b, b.getWorldQuaternion(new THREE.Quaternion())]))
  const restP = new Map(bones.map((b) => [b, p(b)]))
  const restL = new Map(bones.map((b) => [b, b.quaternion.clone()]))
  const above = hips.parent ? hips.parent.getWorldQuaternion(new THREE.Quaternion()) : new THREE.Quaternion()
  const tBodyInv = basis(restP.get(T('Head')!)!.clone().sub(restP.get(hips)!), restP.get(T('LeftUpLeg')!)!.clone().sub(restP.get(T('RightUpLeg')!)!)).invert()

  // calibrate on the pack's standing pose: its space → the target's, and leg length
  const mixer = new THREE.AnimationMixer(src)
  const idle = clips.find((c) => c.name === 'idle') ?? clips[0]
  mixer.clipAction(idle).play()
  mixer.setTime(0)
  src.updateMatrixWorld(true)
  const toT = tBodyInv.clone().invert().multiply(basis(p(S('Head')!).sub(p(S('Hips')!)), p(S('LeftUpLeg')!).sub(p(S('RightUpLeg')!))).invert())
  const sp = (name: string) => p(S(name)!).applyQuaternion(toT)
  const standHip = sp('Hips')
  const scale = restP.get(hips)!.distanceTo(restP.get(T('LeftFoot')!)!) / Math.max(0.01, sp('Hips').distanceTo(sp('LeftFoot')))
  mixer.stopAllAction()
  mixer.uncacheClip(idle)

  const animated = bones.filter((b) => b === hips || (AIM[b.name] && MAP[b.name]))
  const world = new Map<THREE.Object3D, THREE.Quaternion>()
  const out = clips.map((clip) => {
    const action = mixer.clipAction(clip)
    action.play()
    const frames = Math.max(2, Math.round(clip.duration * fps) + 1)
    const times = new Float32Array(frames)
    const rot = new Map(animated.map((b) => [b, new Float32Array(frames * 4)]))
    const hipPos = new Float32Array(frames * 3)
    for (let f = 0; f < frames; f++) {
      const t = Math.min(clip.duration, f / fps)
      times[f] = t
      mixer.setTime(t)
      src.updateMatrixWorld(true)
      world.clear()
      for (const b of bones) {
        const parent = b === hips ? above : world.get(b.parent!)!
        let w: THREE.Quaternion
        if (b === hips) {
          // the whole body: match the pelvis's up and left-right axes
          w = basis(sp('Head').sub(sp('Hips')), sp('LeftUpLeg').sub(sp('RightUpLeg'))).multiply(tBodyInv).multiply(restQ.get(b)!)
        } else {
          w = parent.clone().multiply(restL.get(b)!)
          if (AIM[b.name] && MAP[b.name]) {
            // a limb: swing it to point where the source limb points
            const want = sp(AIM[b.name]).sub(sp(b.name)).normalize()
            const now = T(AIM[b.name])!.position.clone().applyQuaternion(w).normalize()
            w = new THREE.Quaternion().setFromUnitVectors(now, want).multiply(w)
          }
        }
        world.set(b, w)
        const track = rot.get(b)
        if (track) parent.clone().invert().multiply(w).toArray(track, f * 4)
      }
      // hips follow the pelvis (sitting down, the walk's bob), scaled by leg length
      const hp = sp('Hips').sub(standHip).multiplyScalar(scale).add(restP.get(hips)!)
      ;(hips.parent ? hips.parent.worldToLocal(hp) : hp).toArray(hipPos, f * 3)
    }
    action.stop()
    mixer.uncacheAction(clip)
    const tracks: THREE.KeyframeTrack[] = animated.map((b) => new THREE.QuaternionKeyframeTrack(`${b.name}.quaternion`, times, rot.get(b)!))
    tracks.push(new THREE.VectorKeyframeTrack(`${hips.name}.position`, times, hipPos))
    return new THREE.AnimationClip(clip.name, clip.duration, tracks)
  })
  mixer.uncacheRoot(src)
  return out
}
