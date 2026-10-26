import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { CameraControls } from '@react-three/drei'
import CameraControlsImpl from 'camera-controls'
import * as THREE from 'three'
import type { StopId } from '../content'
import { useStore } from '../store'
import { fitFrame, frameForItem, STOP_FRAMES, type Insets } from './layout'

const { ACTION } = CameraControlsImpl

/** Matches the CSS breakpoint where the side panel turns into a bottom sheet. */
export const MOBILE_BREAKPOINT = 760
export const PANEL_WIDTH = 420

const CROPPABLE = new Set<StopId>(['services', 'products', 'work', 'process'])

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

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
    c.azimuthRotateSpeed = 0.3
    c.polarRotateSpeed = 0.3
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
    const { position: p, target: t } = fitFrame(frame, camera.fov, vw, vh, insets, margin, cropped ? 13 : 24)

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
      const dir = p.clone().sub(t).normalize()
      const az = Math.atan2(dir.x, dir.z)
      const pol = Math.acos(dir.y)
      const range = itemFrame ? 0.3 : 0.22
      c.minAzimuthAngle = az - range
      c.maxAzimuthAngle = az + range
      c.minPolarAngle = pol - 0.16
      c.maxPolarAngle = Math.min(pol + 0.16, Math.PI / 2 + 0.2)
    })
  }, [ready, stop, focusId, size.width, size.height, camera])

  return <CameraControls ref={ref} makeDefault />
}
