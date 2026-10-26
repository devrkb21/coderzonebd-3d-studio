import { useEffect, useMemo, useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useCursor } from '@react-three/drei'
import * as THREE from 'three'
import { PROCESS, PRODUCTS, SERVICES, WORK, type Lang } from '../content'
import { useStore } from '../store'
import { PLACEMENTS, yawOf, type Placement } from './layout'
import {
  contactTexture, homeWallTexture, kioskTexture, processTexture, productFrontTexture, serviceCardTexture, workPosterTexture,
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
    case 'courier': return kioskTexture(lang)
    case 'process': return processTexture(PROCESS.findIndex((p) => p.id === ref), lang)
    case 'contact': return contactTexture(lang)
  }
}

export function Items() {
  return <>{PLACEMENTS.map((pl) => <ItemMesh key={pl.item.id} pl={pl} />)}</>
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
  const isWall = pl.item.kind === 'home'
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
  useFrame((_, dt) => {
    const g = group.current
    if (!g) return
    const d = Math.min(dt, 0.05)
    const o = THREE.MathUtils.damp(front.opacity, focusId && !focused && !isWall ? 0.25 : 1, 7, d)
    front.opacity = o
    side.opacity = o
    if (isWall) return
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, focused ? 1.03 : hovered ? 1.06 : 1, 10, d))
    tmp.copy(pl.position).addScaledVector(pl.normal, focused ? 0.08 : hovered ? 0.05 : 0)
    g.position.lerp(tmp, 1 - Math.exp(-10 * d))
  })

  const handlers = {
    onPointerOver: (e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); hover(id) },
    onPointerOut: () => { if (useStore.getState().hoveredId === id) hover(null) },
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
        <mesh material={front} {...handlers}>
          <planeGeometry args={[pl.width, pl.height]} />
        </mesh>
      )}
    </group>
  )
}
