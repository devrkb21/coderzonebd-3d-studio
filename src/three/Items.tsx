import { useEffect, useMemo, useRef } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useCursor } from '@react-three/drei'
import * as THREE from 'three'
import { PROCESS, PRODUCTS, SERVICES, STOPS, tr, UI, WORK, type Lang, type StopId } from '../content'
import { itemsAt } from '../items'
import { useStore } from '../store'
import { PLACEMENTS, STOP_FRAMES, yawOf, type Placement } from './layout'
import { useHomeVideo } from './homeVideo'
import {
  contactTexture, homeWallTexture, kioskTexture, processTexture, productFrontTexture, serviceCardTexture, signTexture, techBoardTexture, workPosterTexture,
} from './textures'

/** Pointer movement (px) above which a press counts as a drag, not a click. */
export const DRAG_PX = 6

function textureFor(pl: Placement, lang: Lang) {
  const { kind, ref } = pl.item
  switch (kind) {
    // Static fallback; the looping film (useHomeVideo) replaces it once it plays.
    case 'home': return homeWallTexture(lang)
    case 'service': return serviceCardTexture(SERVICES.find((s) => s.id === ref)!, lang)
    case 'product': return productFrontTexture(PRODUCTS.find((p) => p.id === ref)!, lang)
    case 'work': return workPosterTexture(WORK.find((w) => w.id === ref)!, lang)
    case 'tech': return techBoardTexture(lang)
    case 'courier': return kioskTexture(lang)
    case 'process': return processTexture(PROCESS.findIndex((p) => p.id === ref), lang)
    case 'contact': return contactTexture(lang)
    case 'leadership': return signTexture('leadership', lang)
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

/** Corner radius of each card texture, as a share of its width (matches the canvas drawings). */
const CORNER: Partial<Record<Placement['item']['kind'], number>> = { service: 22 / 384, process: 20 / 384, contact: 20 / 800 }
/** Cards that stand off a wall and cast a soft shadow onto it. */
const WALL_SHADOW = new Set<Placement['item']['kind']>(['service', 'work', 'process', 'contact'])

function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape()
  const x = -w / 2
  const y = -h / 2
  s.moveTo(x + r, y)
  s.lineTo(x + w - r, y)
  s.quadraticCurveTo(x + w, y, x + w, y + r)
  s.lineTo(x + w, y + h - r)
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  s.lineTo(x + r, y + h)
  s.quadraticCurveTo(x, y + h, x, y + h - r)
  s.lineTo(x, y + r)
  s.quadraticCurveTo(x, y, x + r, y)
  return s
}

let fx: { sheen: THREE.Texture; glow: THREE.Texture; shadow: THREE.Texture } | null = null
/** Shared textures for the hover sheen, the brand glow and the soft wall shadow. */
function effects() {
  if (fx) return fx
  const canvas = (w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void) => {
    const c = document.createElement('canvas')
    c.width = w
    c.height = h
    draw(c.getContext('2d')!)
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }
  const sheen = canvas(256, 256, (ctx) => {
    const g = ctx.createLinearGradient(0, 256, 256, 0)
    g.addColorStop(0.36, 'rgba(255,255,255,0)')
    g.addColorStop(0.5, 'rgba(255,255,255,0.85)')
    g.addColorStop(0.64, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 256, 256)
  })
  const blurred = (color: string, blur: number) => canvas(256, 256, (ctx) => {
    ctx.shadowColor = color
    ctx.shadowBlur = blur
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.roundRect(48, 48, 160, 160, 18)
    ctx.fill()
  })
  fx = { sheen, glow: blurred('rgba(255,147,30,1)', 34), shadow: blurred('rgba(20,16,10,1)', 30) }
  return fx
}

const easeOutBack = (k: number) => 1 + 2.4 * Math.pow(k - 1, 3) + 1.4 * Math.pow(k - 1, 2)
const noRay = () => null

function ItemMesh({ pl }: { pl: Placement }) {
  const id = pl.item.id
  const kind = pl.item.kind
  const group = useRef<THREE.Group>(null)
  const tilt = useRef<THREE.Group>(null)
  const swing = useRef<THREE.Group>(null)
  const lang = useStore((s) => s.lang)
  const focusId = useStore((s) => s.focusId)
  const hovered = useStore((s) => s.hoveredId === id)
  const hover = useStore((s) => s.hover)
  const focus = useStore((s) => s.focus)
  const focused = focusId === id
  // The big home wall is a backdrop: it doesn't grow, tilt or dim like the smaller items.
  const isWall = kind === 'home' || kind === 'tech'
  const hangs = kind === 'service'
  useCursor(hovered)

  const front = useMemo(() => new THREE.MeshBasicMaterial({ transparent: true, toneMapped: false }), [])
  const side = useMemo(() => {
    const color = kind === 'product' ? PRODUCTS.find((p) => p.id === pl.item.ref)!.color : '#ffffff'
    return new THREE.MeshLambertMaterial({ color: new THREE.Color(color).lerp(new THREE.Color('#000'), 0.2), transparent: true })
  }, [pl, kind])
  const boxMats = useMemo(() => [side, side, side, side, front, side], [side, front])

  const homeVideo = useHomeVideo(lang, kind === 'home')
  useEffect(() => {
    front.map = homeVideo ?? textureFor(pl, lang)
    front.needsUpdate = true
  }, [front, pl, lang, homeVideo])

  // A real board behind the print: the same rounded corners, a few centimetres thick.
  const board = useMemo(() => {
    if (pl.depth || isWall) return null
    const r = Math.max((CORNER[kind] ?? 0) * pl.width, 0.002)
    const geo = new THREE.ExtrudeGeometry(roundedRect(pl.width, pl.height, r), { depth: 0.026, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.003, bevelSegments: 2, curveSegments: 6 })
    geo.translate(0, 0, -0.033)
    return { geo, mat: new THREE.MeshLambertMaterial({ color: '#F6F4EF', transparent: true }) }
  }, [pl, kind, isWall])

  const fxMats = useMemo(() => {
    const t = effects()
    const sheen = t.sheen.clone()
    sheen.needsUpdate = true
    return {
      sheen: new THREE.MeshBasicMaterial({ map: sheen, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }),
      glow: new THREE.MeshBasicMaterial({ map: t.glow, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }),
      shadow: new THREE.MeshBasicMaterial({ map: t.shadow, transparent: true, opacity: 0.3, depthWrite: false }),
    }
  }, [])

  // The soft shadow a card standing off the wall throws onto it (light from the ceiling).
  const wallShadow = useMemo(() => {
    if (!WALL_SHADOW.has(kind)) return null
    const F = STOP_FRAMES[pl.item.stop]
    const gap = Math.max(0.03, pl.position.clone().sub(F.center).dot(F.normal))
    return { z: -gap + 0.012, y: -0.05 - gap * 0.12, grow: 1.35 + gap * 0.5 }
  }, [pl, kind])

  // Arrival: when the camera comes to this section its items come in one after another.
  const reveal = useRef(-1)
  const order = useMemo(() => itemsAt(pl.item.stop).findIndex((i) => i.id === id), [pl, id])
  useEffect(() => useStore.subscribe((s, prev) => {
    const arrived = s.stop === pl.item.stop && (prev.stop !== s.stop || (prev.overview && !s.overview)) && !s.focusId
    if (arrived && !isWall) reveal.current = performance.now() / 1000 + 0.45 + order * 0.07
  }), [pl, order, isWall])

  const pointer = useRef({ x: 0, y: 0 })
  const press = useRef(-10)
  const tmp = useMemo(() => new THREE.Vector3(), [])
  useFrame((_, dt) => {
    const g = group.current
    if (!g) return
    const d = Math.min(dt, 0.05)
    const now = performance.now() / 1000
    const o = THREE.MathUtils.damp(front.opacity, focusId && !focused && !isWall ? 0.25 : 1, 7, d)
    front.opacity = o
    side.opacity = o
    if (board) board.mat.opacity = o
    fxMats.shadow.opacity = 0.3 * o
    const live = hovered && !focused
    fxMats.glow.opacity = THREE.MathUtils.damp(fxMats.glow.opacity, live ? 0.75 : 0, 9, d)
    // the sheen sweeps across once per hover, then rests
    fxMats.sheen.opacity = THREE.MathUtils.damp(fxMats.sheen.opacity, live ? 0.3 : 0, 8, d)
    const map = fxMats.sheen.map
    if (map) map.offset.x = live ? THREE.MathUtils.damp(map.offset.x, -0.8, 2.2, d) : 0.8

    // 0 → 1 over the arrival animation (1 when there's none)
    const rv = reveal.current < 0 ? 1 : THREE.MathUtils.clamp((now - reveal.current) / 0.7, 0, 1)
    if (rv >= 1) reveal.current = -1
    // swing on the wire (service cards), with a kick when they arrive
    if (swing.current && hangs) {
      const kick = rv < 1 && now > reveal.current ? Math.sin((now - reveal.current) * 9) * 0.22 * (1 - rv) : 0
      swing.current.rotation.x = live || focused ? THREE.MathUtils.damp(swing.current.rotation.x, 0, 8, d) : Math.sin(now * 1.25 + order) * 0.035 + kick
    }
    if (isWall) return

    // tilt toward the pointer while hovered
    if (tilt.current) {
      tilt.current.rotation.x = THREE.MathUtils.damp(tilt.current.rotation.x, live ? -pointer.current.y * 0.16 : 0, 10, d)
      tilt.current.rotation.y = THREE.MathUtils.damp(tilt.current.rotation.y, live ? pointer.current.x * 0.2 : 0, 10, d)
    }
    // arrival reveal + a springy press
    const e = easeOutBack(rv)
    const since = now - press.current
    const squash = since < 0.6 ? -0.06 * Math.exp(-since * 9) * Math.cos(since * 26) : 0
    const target = (focused ? 1.03 : live ? 1.06 : 1) * (0.84 + 0.16 * e) + squash
    g.scale.setScalar(rv < 1 || since < 0.6 ? target : THREE.MathUtils.damp(g.scale.x, target, 12, d))
    tmp.copy(pl.position).addScaledVector(pl.normal, (focused ? 0.08 : live ? 0.06 : 0) - 0.25 * (1 - e))
    if (kind === 'product') tmp.y += Math.sin(rv * Math.PI) * 0.18
    g.position.lerp(tmp, rv < 1 ? 1 : 1 - Math.exp(-10 * d))
    if (kind === 'work') g.rotation.y = yawOf(pl.normal) + (1 - e) * 0.9
    if (kind === 'process') g.rotation.z = (1 - e) * 0.35
  })

  const handlers = {
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      hover(id)
      if (!isWall) useStore.getState().setTip(labelFor(pl, useStore.getState().lang))
    },
    onPointerMove: (e: ThreeEvent<PointerEvent>) => {
      if (e.uv) pointer.current = { x: e.uv.x * 2 - 1, y: e.uv.y * 2 - 1 }
    },
    onPointerOut: () => {
      pointer.current = { x: 0, y: 0 }
      if (useStore.getState().hoveredId === id) hover(null)
      useStore.getState().setTip(null)
    },
    onPointerDown: () => { press.current = performance.now() / 1000 },
    onClick: (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      if (e.delta > DRAG_PX) return
      focus(id)
    },
  }

  return (
    <group ref={group} position={pl.position} rotation-y={yawOf(pl.normal)}>
      {wallShadow && (
        <mesh position={[0, wallShadow.y, wallShadow.z]} material={fxMats.shadow} raycast={noRay}>
          <planeGeometry args={[pl.width * wallShadow.grow, pl.height * wallShadow.grow]} />
        </mesh>
      )}
      <group ref={swing} position-y={hangs ? pl.height / 2 : 0}>
        <group ref={tilt} position-y={hangs ? -pl.height / 2 : 0}>
          {!isWall && (
            <mesh position-z={pl.depth ? -pl.depth / 2 - 0.02 : -0.05} material={fxMats.glow} raycast={noRay}>
              <planeGeometry args={[pl.width * 1.55, pl.height * 1.55]} />
            </mesh>
          )}
          {pl.depth ? (
            <mesh material={boxMats} {...handlers}>
              <boxGeometry args={[pl.width, pl.height, pl.depth]} />
            </mesh>
          ) : (
            <>
              <mesh material={front} {...handlers}>
                <planeGeometry args={[pl.width, pl.height]} />
              </mesh>
              {board && <mesh geometry={board.geo} material={board.mat} raycast={noRay} />}
            </>
          )}
          {!isWall && (
            <mesh position-z={pl.depth ? pl.depth / 2 + 0.002 : 0.002} material={fxMats.sheen} raycast={noRay}>
              <planeGeometry args={[pl.width, pl.height]} />
            </mesh>
          )}
        </group>
      </group>
    </group>
  )
}
