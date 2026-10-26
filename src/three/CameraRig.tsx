import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { CameraControls } from '@react-three/drei'
import CameraControlsImpl from 'camera-controls'
import * as THREE from 'three'
import type { StopId } from '../content'
import { useStore } from '../store'
import { fitFrame, frameForItem, PROJECT_FRAME, ROOM, STOP_FRAMES, type Insets } from './layout'

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
  const overview = useStore((s) => s.overview)
  const intro = useStore((s) => s.intro)
  const projectOpen = useStore((s) => s.projectOpen)
  const introPlayed = useRef(false)
  /** The current flight: a camera crane move along a curve from where we are to the next view. */
  const flight = useRef<{ p0: THREE.Vector3; t0: THREE.Vector3; ctrl: THREE.Vector3; p: THREE.Vector3; t: THREE.Vector3; start: number; dur: number } | null>(null)
  const pos = useRef(new THREE.Vector3())
  const tgt = useRef(new THREE.Vector3())

  /** Landed: switch to look-around in place and give the drag back. */
  const land = (c: CameraControls, p: THREE.Vector3, t: THREE.Vector3) => {
    c.smoothTime = 0.6
    // Move the orbit pivot to just in front of the camera, so a drag turns the head in place
    // instead of swinging the camera around the wall. The view doesn't change.
    const ahead = t.clone().sub(p).normalize()
    const pivot = p.clone().addScaledVector(ahead, 0.05)
    c.setLookAt(p.x, p.y, p.z, pivot.x, pivot.y, pivot.z, false)
    c.minAzimuthAngle = -Infinity
    c.maxAzimuthAngle = Infinity
    // Polar is measured from the pivot to the camera (pointing backwards): keep the
    // horizon in view, no flipping to the floor or the ceiling.
    c.minPolarAngle = Math.PI / 2 - 0.55
    c.maxPolarAngle = Math.PI / 2 + 0.45
    c.mouseButtons.left = ACTION.ROTATE
    c.touches.one = ACTION.TOUCH_ROTATE
  }

  // Fly: ease in and out along a gentle arc that rises mid-way, the gaze leading the move a
  // little, like a camera crane between sections. Land exactly at the end.
  useFrame(() => {
    const c = ref.current
    const f = flight.current
    if (!c || !f) return
    const k = Math.min(1, (performance.now() / 1000 - f.start) / f.dur)
    const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2
    const a = (1 - e) * (1 - e)
    const b = 2 * (1 - e) * e
    pos.current.set(0, 0, 0).addScaledVector(f.p0, a).addScaledVector(f.ctrl, b).addScaledVector(f.p, e * e)
    tgt.current.copy(f.t0).lerp(f.t, Math.min(1, e * 1.15))
    c.setLookAt(pos.current.x, pos.current.y, pos.current.z, tgt.current.x, tgt.current.y, tgt.current.z, false)
    if (k >= 1) {
      flight.current = null
      land(c, f.p, f.t)
    }
  })

  useEffect(() => {
    const c = ref.current
    if (!c) return
    c.mouseButtons.left = ACTION.ROTATE
    c.mouseButtons.right = ACTION.NONE
    c.mouseButtons.middle = ACTION.NONE
    // Scroll / pinch zooms the lens (never moves the camera, so it can't go through a wall).
    c.mouseButtons.wheel = ACTION.ZOOM
    c.touches.one = ACTION.TOUCH_ROTATE
    c.touches.two = ACTION.TOUCH_ZOOM
    c.minZoom = 1
    c.maxZoom = 3.5
    c.dollySpeed = 0.6
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
    // the client's project board is framed like an item, beside its panel
    const itemFrame = focusId ? frameForItem(focusId) : projectOpen ? PROJECT_FRAME : null

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
    c.zoomTo(1, !reducedMotion())
    // On phones a wide display wall would push the camera far back; crop it instead and let
    // prev/next walk the items. Single-piece stops (home wall, kiosk, desk) are always shown whole.
    const cropped = mobile && !itemFrame && CROPPABLE.has(stop)
    // Never back the camera through the opposite wall: it has to stay inside the room to look around.
    const maxDist = Math.min(cropped ? 13 : 24, roomDepthAlong(frame) - 0.8)
    const fit = fitFrame(frame, camera.fov, vw, vh, insets, margin, maxDist)
    // Overview: stand at the entrance, a little raised, and take in the whole studio.
    const p = overview && !itemFrame ? new THREE.Vector3(0, 5.6, ROOM.halfD - 1.2) : fit.position
    const t = overview && !itemFrame ? new THREE.Vector3(0, 2.2, -ROOM.halfD + 2) : fit.target
    // A wide frame above a tall bottom sheet can push the camera under the floor: raise it and look down.
    p.y = Math.max(p.y, 0.9)

    c.minAzimuthAngle = -Infinity
    c.maxAzimuthAngle = Infinity
    c.minPolarAngle = 0
    c.maxPolarAngle = Math.PI
    // A drag mid-flight would orbit the far target and swing the camera out of the room,
    // so look-around is off until the camera lands (see useFrame below).
    c.mouseButtons.left = ACTION.NONE
    c.touches.one = ACTION.NONE
    flight.current = null
    const animate = !reducedMotion()

    // First visit: start across the street, cross to the shop, the glass doors swing open,
    // walk in, then fly to the first stop. Skipping ends it early (endIntro re-runs this).
    if (intro && animate) {
      const H = ROOM.halfD
      let cancelled = false
      const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))
      ;(async () => {
        c.smoothTime = 0
        c.setLookAt(0, 3.1, H + 11.8, 0, 2.6, H, false)
        await wait(1700); if (cancelled) return
        c.smoothTime = 1.5
        c.setLookAt(0, 1.85, H + 3.4, 0, 2.1, H, true)
        await wait(2700); if (cancelled) return
        useStore.getState().setDoorOpen(true)
        await wait(900); if (cancelled) return
        c.smoothTime = 1.2
        c.setLookAt(0, 1.8, H - 2.6, 0, 2.2, -H, true)
        await wait(2100); if (cancelled) return
        useStore.getState().endIntro()
      })()
      return () => { cancelled = true }
    }
    introPlayed.current = true
    if (!animate) {
      c.setLookAt(p.x, p.y, p.z, t.x, t.y, t.z, false)
      land(c, p, t)
      return
    }
    // Start from exactly where the camera is and where it looks.
    const p0 = c.camera.position.clone()
    const dir = new THREE.Vector3()
    c.camera.getWorldDirection(dir)
    const t0 = p0.clone().addScaledVector(dir, Math.max(1, t.distanceTo(p)))
    const dist = p0.distanceTo(p)
    // Rise mid-way in proportion to the distance, but stay under the ceiling and inside the walls.
    const ctrl = p0.clone().lerp(p, 0.5)
    ctrl.y = Math.min(ROOM.height - 0.7, ctrl.y + Math.min(2.2, dist * (itemFrame ? 0.05 : 0.12)))
    if (Math.abs(p0.x) < ROOM.halfW && Math.abs(p0.z) < ROOM.halfD) {
      ctrl.x = THREE.MathUtils.clamp(ctrl.x, -ROOM.halfW + 0.6, ROOM.halfW - 0.6)
      ctrl.z = THREE.MathUtils.clamp(ctrl.z, -ROOM.halfD + 0.6, ROOM.halfD - 0.6)
    }
    const dur = THREE.MathUtils.clamp(0.75 + dist * 0.055, itemFrame ? 0.7 : 0.95, 2.1)
    flight.current = { p0, t0, ctrl, p: p.clone(), t: t.clone(), start: performance.now() / 1000, dur }
  }, [ready, intro, stop, focusId, overview, projectOpen, size.width, size.height, camera])

  return <CameraControls ref={ref} makeDefault />
}
