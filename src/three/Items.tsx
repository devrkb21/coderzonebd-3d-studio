import { useEffect, useMemo, useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useCursor } from '@react-three/drei'
import * as THREE from 'three'
import { PROCESS, PRODUCTS, SERVICES, STOPS, tr, UI, WORK, type Lang, type StopId } from '../content'
import { useStore } from '../store'
import { PLACEMENTS, STOP_FRAMES, yawOf, type Placement } from './layout'
import {
  contactTexture, homeWallTexture, kioskTexture, processTexture, productFrontTexture, serviceCardTexture, techBoardTexture, workPosterTexture,
} from './textures'

/** Pointer movement (px) above which a press counts as a drag, not a click. */
export const DRAG_PX = 6

function textureFor(pl: Placement, lang: Lang) {
  const { kind, ref } = pl.item
  switch (kind) {
    case 'home': return homeWallTexture(lang)
    case 'service': return serviceCardTexture(SERVICES.find((s) => s.id === ref)!, lang)
    case 'product': return productFrontTexture(PRODUCTS.find((p) => p.id === ref)!, lang)
    case 'work': return workPosterTexture(WORK.find((w) => w.id === ref)!, lang)
    case 'tech': return techBoardTexture(lang)
    case 'courier': return kioskTexture(lang)
    case 'process': return processTexture(PROCESS.findIndex((p) => p.id === ref), lang)
    case 'contact': return contactTexture(lang)
  }
}

function labelFor(pl: Placement, lang: Lang) {
  const { kind, ref, stop } = pl.item
  switch (kind) {
    case 'service': return tr(SERVICES.find((s) => s.id === ref)!.title, lang)
    case 'product': return PRODUCTS.find((p) => p.id === ref)!.name
    case 'work': return WORK.find((w) => w.id === ref)!.name
    case 'process': return tr(PROCESS.find((p) => p.id === ref)!.title, lang)
    default: return tr(STOPS.find((s) => s.id === stop)!.label, lang)
  }
}

export function Items() {
  return (
    <>
      {STOPS.map((s) => <StopZone key={s.id} stop={s.id} />)}
      {PLACEMENTS.map((pl) => <ItemMesh key={pl.item.id} pl={pl} />)}
    </>
  )
}

/**
 * An invisible hit area over each section (a bit larger than its frame, just in front of the
 * wall and behind the items). Clicking a section's empty space flies there; items in front of
 * it still open their own panel because they catch the click first.
 */
function StopZone({ stop }: { stop: StopId }) {
  const F = STOP_FRAMES[stop]
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false }), [])
  const pos = useMemo(() => F.center.clone().addScaledVector(F.normal, 0.02), [F])
  return (
    <mesh
      position={pos}
      rotation-y={yawOf(F.normal)}
      material={mat}
      onPointerOver={(e) => {
        e.stopPropagation()
        document.body.style.cursor = 'pointer'
        const s = useStore.getState()
        s.setTip(s.stop === stop && !s.focusId && !s.overview ? null : `${tr(UI.go, s.lang)} ${tr(STOPS.find((x) => x.id === stop)!.label, s.lang)} →`)
      }}
      onPointerOut={() => { document.body.style.cursor = ''; useStore.getState().setTip(null) }}
      onClick={(e) => {
        e.stopPropagation()
        if (e.delta > DRAG_PX) return
        const s = useStore.getState()
        if (s.stop !== stop || s.focusId) s.goTo(stop)
      }}
    >
      <planeGeometry args={[F.width * 1.12, F.height * 1.25]} />
    </mesh>
  )
}

function ItemMesh({ pl }: { pl: Placement }) {
  const id = pl.item.id
  const group = useRef<THREE.Group>(null)
  const lang = useStore((s) => s.lang)
  const focusId = useStore((s) => s.focusId)
  const hovered = useStore((s) => s.hoveredId === id)
  const hover = useStore((s) => s.hover)
  const focus = useStore((s) => s.focus)
  const focused = focusId === id
  // The big home wall is a backdrop: it doesn't grow or dim like the smaller items.
  const isWall = pl.item.kind === 'home' || pl.item.kind === 'tech'
  useCursor(hovered)

  const front = useMemo(() => new THREE.MeshBasicMaterial({ transparent: true, toneMapped: false }), [])
  const side = useMemo(() => {
    const color = pl.item.kind === 'product' ? PRODUCTS.find((p) => p.id === pl.item.ref)!.color : '#ffffff'
    return new THREE.MeshLambertMaterial({ color: new THREE.Color(color).lerp(new THREE.Color('#000'), 0.2), transparent: true })
  }, [pl])
  const boxMats = useMemo(() => [side, side, side, side, front, side], [side, front])

  useEffect(() => {
    front.map = textureFor(pl, lang)
    front.needsUpdate = true
  }, [front, pl, lang])

  const tmp = useMemo(() => new THREE.Vector3(), [])
  const swing = useRef<THREE.Group>(null)
  const hangs = pl.item.kind === 'service'
  const seed = pl.position.z * 2.3 + pl.position.x
  // Physical boards: a thin backing panel behind every flat card, so they read as real objects.
  const backing = useMemo(() => new THREE.MeshLambertMaterial({ color: '#ffffff', transparent: true }), [])
  useFrame((_, dt) => {
    const g = group.current
    if (!g) return
    const d = Math.min(dt, 0.05)
    const o = THREE.MathUtils.damp(front.opacity, focusId && !focused && !isWall ? 0.25 : 1, 7, d)
    front.opacity = o
    side.opacity = o
    backing.opacity = o
    // service cards hang from wires and sway a little
    if (swing.current && hangs) {
      const t = performance.now() / 1000
      swing.current.rotation.x = focused || hovered ? THREE.MathUtils.damp(swing.current.rotation.x, 0, 8, d) : Math.sin(t * 1.25 + seed) * 0.035
    }
    if (isWall) return
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, focused ? 1.03 : hovered ? 1.06 : 1, 10, d))
    tmp.copy(pl.position).addScaledVector(pl.normal, focused ? 0.08 : hovered ? 0.05 : 0)
    g.position.lerp(tmp, 1 - Math.exp(-10 * d))
  })

  const handlers = {
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      hover(id)
      if (!isWall) useStore.getState().setTip(labelFor(pl, useStore.getState().lang))
    },
    onPointerOut: () => {
      if (useStore.getState().hoveredId === id) hover(null)
      useStore.getState().setTip(null)
    },
    onClick: (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      if (e.delta > DRAG_PX) return
      focus(id)
    },
  }

  return (
    <group ref={group} position={pl.position} rotation-y={yawOf(pl.normal)}>
      {pl.depth ? (
        <mesh material={boxMats} {...handlers}>
          <boxGeometry args={[pl.width, pl.height, pl.depth]} />
        </mesh>
      ) : (
        <group ref={swing} position-y={hangs ? pl.height / 2 : 0}>
          <group position-y={hangs ? -pl.height / 2 : 0}>
            <mesh material={front} {...handlers}>
              <planeGeometry args={[pl.width, pl.height]} />
            </mesh>
            {!isWall && (
              <mesh position-z={-0.022} material={backing}>
                <boxGeometry args={[pl.width + 0.04, pl.height + 0.04, 0.04]} />
              </mesh>
            )}
          </group>
        </group>
      )}
    </group>
  )
}
