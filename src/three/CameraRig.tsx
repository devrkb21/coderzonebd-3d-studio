import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { CameraControls } from '@react-three/drei'
import CameraControlsImpl from 'camera-controls'
import * as THREE from 'three'
import type { StopId } from '../content'
import { useStore } from '../store'
import { fitFrame, frameForItem, ROOM, STOP_FRAMES, type Insets } from './layout'

const { ACTION } = CameraControlsImpl

/** Matches the CSS breakpoint where the side panel turns into a bottom sheet. */
export const MOBILE_BREAKPOINT = 760
export const PANEL_WIDTH = 420

const CROPPABLE = new Set<StopId>(['services', 'products', 'work', 'process'])

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** How far the camera can back away from a frame before it reaches the opposite wall. */
function roomDepthAlong(frame: { center: THREE.Vector3; normal: THREE.Vector3 }) {
  const { halfW, halfD } = ROOM
  const n = frame.normal
  const c = frame.center
  const tx = n.x > 1e-6 ? (halfW - c.x) / n.x : n.x < -1e-6 ? (-halfW - c.x) / n.x : Infinity
  const tz = n.z > 1e-6 ? (halfD - c.z) / n.z : n.z < -1e-6 ? (-halfD - c.z) / n.z : Infinity
  return Math.min(tx, tz)
}

/** Flies the camera between stops and items; drag gives a small look-around. */
export function CameraRig() {
  const ref = useRef<CameraControls>(null)
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const size = useThree((s) => s.size)
  const ready = useStore((s) => s.ready)
  const stop = useStore((s) => s.stop)
  const focusId = useStore((s) => s.focusId)
  const introPlayed = useRef(false)
  const moveId = useRef(0)

  useEffect(() => {
    const c = ref.current
    if (!c) return
    c.mouseButtons.left = ACTION.ROTATE
    c.mouseButtons.right = ACTION.NONE
    c.mouseButtons.middle = ACTION.NONE
    c.mouseButtons.wheel = ACTION.NONE
    c.touches.one = ACTION.TOUCH_ROTATE
    c.touches.two = ACTION.NONE
    c.touches.three = ACTION.NONE
    // Negative speeds = "grab the room and drag it", like Street View.
    c.azimuthRotateSpeed = -0.35
    c.polarRotateSpeed = -0.35
    c.draggingSmoothTime = 0.15
  }, [])

  useEffect(() => {
    const c = ref.current
    if (!c || !ready) return
    const vw = size.width
    const vh = size.height
    const mobile = vw < MOBILE_BREAKPOINT
    const itemFrame = focusId ? frameForItem(focusId) : null

    let insets: Insets
    let margin: number
    if (itemFrame) {
      insets = mobile ? { top: 64, right: 0, bottom: Math.round(vh * 0.55) } : { top: 76, right: PANEL_WIDTH + 24, bottom: 40 }
      margin = mobile ? 1.12 : 1.3
    } else {
      insets = { top: 76, right: 0, bottom: mobile ? 84 : 96 }
      margin = 1.12
    }
    const frame = itemFrame ?? STOP_FRAMES[stop]
    // On phones a wide display wall would push the camera far back; crop it instead and let
    // prev/next walk the items. Single-piece stops (home wall, kiosk, desk) are always shown whole.
    const cropped = mobile && !itemFrame && CROPPABLE.has(stop)
    // Never back the camera through the opposite wall: it has to stay inside the room to look around.
    const maxDist = Math.min(cropped ? 13 : 24, roomDepthAlong(frame) - 0.8)
    const { position: p, target: t } = fitFrame(frame, camera.fov, vw, vh, insets, margin, maxDist)

    c.minAzimuthAngle = -Infinity
    c.maxAzimuthAngle = Infinity
    c.minPolarAngle = 0
    c.maxPolarAngle = Math.PI
    const id = ++moveId.current
    const animate = !reducedMotion()

    if (!introPlayed.current) {
      introPlayed.current = true
      c.smoothTime = 1.2
      if (animate) c.setLookAt(p.x, p.y + 2.5, p.z + 9, t.x, t.y + 0.6, t.z, false)
    } else {
      c.smoothTime = 0.6
    }
    c.setLookAt(p.x, p.y, p.z, t.x, t.y, t.z, animate).then(() => {
      if (id !== moveId.current) return
      c.smoothTime = 0.6
      // Look-around: move the orbit pivot to just in front of the camera, so a drag turns the
      // head in place instead of swinging the camera around the wall. The view doesn't change.
      const ahead = t.clone().sub(p).normalize()
      const pivot = p.clone().addScaledVector(ahead, 0.05)
      c.setLookAt(p.x, p.y, p.z, pivot.x, pivot.y, pivot.z, false)
      c.minAzimuthAngle = -Infinity
      c.maxAzimuthAngle = Infinity
      // Polar is measured from the pivot to the camera (pointing backwards): keep the
      // horizon in view, no flipping to the floor or the ceiling.
      c.minPolarAngle = Math.PI / 2 - 0.55
      c.maxPolarAngle = Math.PI / 2 + 0.45
    })
  }, [ready, stop, focusId, size.width, size.height, camera])

  return <CameraControls ref={ref} makeDefault />
}
