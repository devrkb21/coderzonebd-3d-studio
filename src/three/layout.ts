// Room geometry: where each stop is and where every clickable item sits.
// Camera framing is computed from these frames, so it adapts to any screen.
import * as THREE from 'three'
import { PROCESS, PRODUCTS, SERVICES, WORK, type StopId } from '../content'
import { ITEMS, type Item } from '../items'

// The front of the room (z > 8) is the reception and the founders' cabins, behind every display.
export const ROOM = { halfW: 16, halfD: 13, height: 7 }
const { halfW, halfD } = ROOM

const UP = new THREE.Vector3(0, 1, 0)
const BACK = new THREE.Vector3(0, 0, 1)
const LEFT = new THREE.Vector3(1, 0, 0)
const RIGHT = new THREE.Vector3(-1, 0, 0)
const FRONT = new THREE.Vector3(0, 0, -1)
export const KIOSK_NORMAL = new THREE.Vector3(0.35, 0, 1).normalize()
export const KIOSK_POS = new THREE.Vector3(-3.4, 0, 3)
/** Tech-stack board on the left wall, near the entrance. */
export const TECH_Z = 6.6
export const TECH_BOARD = { w: 5, h: 2.64, y: 2.7 }

/** The founders' glass cabins, side by side in the front-left corner, open to the room at z0 (the CEO's reads first from inside). */
export const CABIN = { w: 4.1, z0: halfD - 3.2, h: 2.75 }
export const CABINS = [
  { who: 'cmo' as const, x: -halfW + CABIN.w / 2 + 0.05 },
  { who: 'ceo' as const, x: -halfW + CABIN.w * 1.5 + 0.1 },
]
/** Front-zone furniture: the lounge in the front-right corner, the coffee corner right of the door. */
export const LOUNGE_X = 12.4
export const COFFEE_X = 5.6
/** The reception counter a few steps inside the entrance, on the right, facing whoever walks in (seen through the door in the intro). */
export const RECEPTION = { x: 2.6, z: halfD - 4.2, yaw: -0.46 }
/** The night guard's chair, left of the door, looking into the room. */
export const GUARD_SEAT = { x: -2.4, z: halfD - 1.3, yaw: 2.6 }

export interface Frame {
  center: THREE.Vector3
  /** Direction from the display towards the viewer. */
  normal: THREE.Vector3
  width: number
  height: number
}

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)

export const STOP_FRAMES: Record<StopId, Frame> = {
  // tall enough to take in the digital clock above the home wall
  home: { center: v(0, 3.8, -halfD), normal: BACK, width: 9, height: 5.7 },
  services: { center: v(-halfW, 2.9, -3), normal: LEFT, width: 11.6, height: 3.6 },
  products: { center: v(-10, 2.1, -halfD), normal: BACK, width: 8, height: 3.6 },
  work: { center: v(10, 3.3, -halfD), normal: BACK, width: 9.8, height: 4.7 },
  tech: { center: v(-halfW, 2.75, TECH_Z), normal: LEFT, width: 5.6, height: 3.2 },
  courier: { center: v(KIOSK_POS.x, 1.45, KIOSK_POS.z), normal: KIOSK_NORMAL, width: 2.4, height: 2.6 },
  process: { center: v(halfW, 2.6, -4), normal: RIGHT, width: 9.8, height: 3.4 },
  contact: { center: v(halfW, 2.3, 5.5), normal: RIGHT, width: 4.6, height: 4.4 },
  // framed on the front wall behind the cabins, so the cabins in front still catch clicks
  leadership: { center: v((CABINS[0].x + CABINS[1].x) / 2, 1.9, halfD - 0.05), normal: FRONT, width: 13, height: 4.6 },
}

export const rightOf = (normal: THREE.Vector3) => new THREE.Vector3().crossVectors(UP, normal).normalize()
export const yawOf = (normal: THREE.Vector3) => Math.atan2(normal.x, normal.z)

export interface Placement {
  item: Item
  position: THREE.Vector3
  normal: THREE.Vector3
  width: number
  height: number
  /** Product boxes have depth; everything else is a flat panel. */
  depth?: number
}

/** Positions `count` items in a row along a wall, centred on `center`. */
function along(center: THREE.Vector3, normal: THREE.Vector3, i: number, count: number, gap: number, inset: number) {
  return center.clone()
    .addScaledVector(rightOf(normal), (i - (count - 1) / 2) * gap)
    .addScaledVector(normal, inset)
}

export const SERVICE_RAIL_Y = 3.95
export const SERVICE_CARD = { w: 1.15, h: 1.55, gap: 1.38 }
export const PRODUCT_BOX = { w: 1.2, h: 1.5, d: 0.5, gap: 1.8, plinthTop: 1.0 }
export const WORK_POSTER = { w: 1.6, h: 1.25, gapX: 1.85, cols: 5, rowY: [4.7, 3.3, 1.9] }
export const PROCESS_BOARD = { w: 1.9, h: 2.4, gap: 2.35 }

function placeItem(item: Item): Placement {
  switch (item.kind) {
    case 'home':
      return { item, position: v(0, 3.5, -halfD + 0.1), normal: BACK, width: 8, height: 4.5 }
    case 'service': {
      const i = SERVICES.findIndex((s) => s.id === item.ref)
      const F = STOP_FRAMES.services
      const p = along(v(F.center.x, 0, F.center.z), LEFT, i, SERVICES.length, SERVICE_CARD.gap, 0.55)
      p.y = SERVICE_RAIL_Y - 0.25 - SERVICE_CARD.h / 2
      return { item, position: p, normal: LEFT, width: SERVICE_CARD.w, height: SERVICE_CARD.h }
    }
    case 'product': {
      const i = PRODUCTS.findIndex((s) => s.id === item.ref)
      const p = along(v(-10, 0, -halfD), BACK, i, PRODUCTS.length, PRODUCT_BOX.gap, 0.75)
      p.y = PRODUCT_BOX.plinthTop + PRODUCT_BOX.h / 2
      return { item, position: p, normal: BACK, width: PRODUCT_BOX.w, height: PRODUCT_BOX.h, depth: PRODUCT_BOX.d }
    }
    case 'work': {
      const i = WORK.findIndex((w) => w.id === item.ref)
      const row = Math.floor(i / WORK_POSTER.cols)
      const inRow = Math.min(WORK_POSTER.cols, WORK.length - row * WORK_POSTER.cols)
      const p = along(v(10, 0, -halfD), BACK, i % WORK_POSTER.cols, inRow, WORK_POSTER.gapX, 0.06)
      p.y = WORK_POSTER.rowY[row] ?? 1.9
      return { item, position: p, normal: BACK, width: WORK_POSTER.w, height: WORK_POSTER.h }
    }
    case 'tech':
      return { item, position: v(-halfW + 0.04, TECH_BOARD.y, TECH_Z), normal: LEFT, width: TECH_BOARD.w, height: TECH_BOARD.h }
    case 'courier': {
      const p = KIOSK_POS.clone().addScaledVector(KIOSK_NORMAL, 0.13)
      p.y = 1.55
      return { item, position: p, normal: KIOSK_NORMAL, width: 1.3, height: 0.95 }
    }
    case 'process': {
      const i = PROCESS.findIndex((s) => s.id === item.ref)
      const F = STOP_FRAMES.process
      const p = along(v(F.center.x, 0, F.center.z), RIGHT, i, PROCESS.length, PROCESS_BOARD.gap, 0.06)
      p.y = 2.6
      return { item, position: p, normal: RIGHT, width: PROCESS_BOARD.w, height: PROCESS_BOARD.h }
    }
    case 'contact':
      return { item, position: v(halfW - 0.06, 3.45, 5.5), normal: RIGHT, width: 3.6, height: 2.2 }
    case 'leadership':
      return { item, position: v(STOP_FRAMES.leadership.center.x, CABIN.h + 0.42, CABIN.z0 - 0.06), normal: FRONT, width: 2.4, height: 0.6 }
  }
}

export const PLACEMENTS: Placement[] = ITEMS.map(placeItem)
export const placementOf = (id: string) => PLACEMENTS.find((p) => p.item.id === id)

export interface Insets { top: number; right: number; bottom: number }

/**
 * Camera pose that fits `frame` inside the part of the screen not covered by
 * UI (insets, in px), looking straight along the frame normal.
 */
export function fitFrame(frame: Frame, fovDeg: number, vw: number, vh: number, insets: Insets, margin = 1.12, maxDist = 24) {
  const tanH = Math.tan(THREE.MathUtils.degToRad(fovDeg) / 2)
  const aspect = vw / vh
  const fw = Math.max(0.2, (vw - insets.right) / vw)
  const fh = Math.max(0.2, (vh - insets.top - insets.bottom) / vh)
  let d = Math.max((frame.height * margin) / (2 * tanH * fh), (frame.width * margin) / (2 * tanH * aspect * fw))
  d = Math.min(d, maxDist)

  const visH = 2 * d * tanH
  const visW = visH * aspect
  const right = rightOf(frame.normal)
  const up = new THREE.Vector3().crossVectors(frame.normal, right).normalize()
  const shift = new THREE.Vector3()
    .addScaledVector(right, (insets.right / 2 / vw) * visW)
    .addScaledVector(up, ((insets.top - insets.bottom) / 2 / vh) * visH)

  const target = frame.center.clone().add(shift)
  const position = target.clone().addScaledVector(frame.normal, d)
  return { position, target }
}

export function frameForItem(id: string): Frame | null {
  const pl = placementOf(id)
  if (!pl) return null
  const center = pl.position.clone()
  if (pl.depth) center.addScaledVector(pl.normal, pl.depth / 2)
  // The contact sign is framed together with the desk below it.
  if (pl.item.kind === 'contact') return { center: center.setY(2.5), normal: pl.normal, width: 4, height: 3.8 }
  // The leadership sign is framed with both cabins below it, nudged into the room so the side
  // panel never pushes the view past the left wall.
  if (pl.item.kind === 'leadership') return { center: v(center.x + 1.5, 1.75, CABIN.z0), normal: pl.normal, width: CABIN.w * 2 + 0.6, height: 3.3 }
  return { center, normal: pl.normal, width: pl.width * 1.05, height: pl.height * 1.05 }
}
