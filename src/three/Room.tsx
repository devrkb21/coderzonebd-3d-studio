import { useMemo } from 'react'
import * as THREE from 'three'
import { SERVICES, type StopId } from '../content'
import { useStore } from '../store'
import {
  KIOSK_NORMAL, KIOSK_POS, PRODUCT_BOX, PROCESS_BOARD, ROOM, SERVICE_CARD, SERVICE_RAIL_Y, STOP_FRAMES, yawOf,
} from './layout'
import { BRAND, deskTexture, floorTexture, frontWallTexture, signTexture } from './textures'

const { halfW, halfD, height } = ROOM

function useMaterials() {
  return useMemo(() => ({
    wall: new THREE.MeshLambertMaterial({ color: '#EEF0F5' }),
    ceiling: new THREE.MeshLambertMaterial({ color: '#F8F9FB' }),
    floor: new THREE.MeshLambertMaterial({ map: floorTexture() }),
    white: new THREE.MeshLambertMaterial({ color: '#ffffff' }),
    ink: new THREE.MeshLambertMaterial({ color: '#12141C' }),
    blue: new THREE.MeshLambertMaterial({ color: BRAND }),
    oak: new THREE.MeshLambertMaterial({ color: '#C9A77C' }),
    light: new THREE.MeshBasicMaterial({ color: '#ffffff' }),
    ao: new THREE.MeshBasicMaterial({ map: gradient(), transparent: true, depthWrite: false }),
    plant: new THREE.MeshLambertMaterial({ color: '#4C7A55' }),
  }), [])
}
type Mats = ReturnType<typeof useMaterials>

function gradient() {
  const c = document.createElement('canvas')
  c.width = 4
  c.height = 64
  const ctx = c.getContext('2d')!
  const g = ctx.createLinearGradient(0, 64, 0, 0)
  g.addColorStop(0, 'rgba(40,45,70,0.28)')
  g.addColorStop(1, 'rgba(40,45,70,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 4, 64)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

export function Room() {
  const m = useMaterials()
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} material={m.floor}>
        <planeGeometry args={[halfW * 2, halfD * 2]} />
      </mesh>
      <mesh rotation-x={Math.PI / 2} position-y={height} material={m.ceiling}>
        <planeGeometry args={[halfW * 2, halfD * 2]} />
      </mesh>
      <mesh position={[0, height / 2, -halfD]} material={m.wall}>
        <planeGeometry args={[halfW * 2, height]} />
      </mesh>
      <mesh position={[-halfW, height / 2, 0]} rotation-y={Math.PI / 2} material={m.wall}>
        <planeGeometry args={[halfD * 2, height]} />
      </mesh>
      <mesh position={[halfW, height / 2, 0]} rotation-y={-Math.PI / 2} material={m.wall}>
        <planeGeometry args={[halfD * 2, height]} />
      </mesh>
      {/* Front wall, so a full look-around never shows the void. It faces inward only:
          from outside (the intro fly-in) it is invisible. */}
      <FrontWall m={m} />
      {/* contact shadows + a brand-orange skirting line */}
      {([[0, -halfD + 0.01, 0, halfW * 2], [-halfW + 0.01, 0, Math.PI / 2, halfD * 2], [halfW - 0.01, 0, -Math.PI / 2, halfD * 2], [0, halfD - 0.01, Math.PI, halfW * 2]] as const).map(([x, z, r, len], i) => (
        <group key={i} position={[x, 0, z]} rotation-y={r}>
          <mesh position-y={0.45} material={m.ao}><planeGeometry args={[len, 0.9]} /></mesh>
          <mesh position={[0, 0.06, 0.005]} material={m.blue}><planeGeometry args={[len, 0.12]} /></mesh>
        </group>
      ))}
      {[-7, -3.5, 0, 3.5, 7].map((z) => (
        <mesh key={z} position={[0, height - 0.03, z]} material={m.light}>
          <boxGeometry args={[halfW * 1.6, 0.04, 0.2]} />
        </mesh>
      ))}

      <ServiceRail m={m} />
      <ProductPlinth m={m} />
      <WorkWallBacking m={m} />
      <Kiosk m={m} />
      <ProcessArrows m={m} />
      <ContactDesk m={m} />
      {(['services', 'products', 'work', 'tech', 'process'] as StopId[]).map((s) => <HangingSign key={s} stop={s} m={m} />)}
      <Plant m={m} position={[-halfW + 0.9, 0, 3.6]} />
      <Plant m={m} position={[halfW - 0.9, 0, 2.2]} />
    </group>
  )
}

function ServiceRail({ m }: { m: Mats }) {
  const F = STOP_FRAMES.services
  const len = SERVICES.length * SERVICE_CARD.gap + 0.6
  const x = -halfW + 0.55
  return (
    <group position={[x, 0, F.center.z]}>
      <mesh position-y={SERVICE_RAIL_Y} rotation-x={Math.PI / 2} material={m.ink}>
        <cylinderGeometry args={[0.03, 0.03, len, 10]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[-0.27, SERVICE_RAIL_Y, (s * len) / 2]} material={m.ink}>
          <boxGeometry args={[0.55, 0.05, 0.05]} />
        </mesh>
      ))}
      {/* hanging wires from the rail to each card */}
      {SERVICES.map((_, i) => {
        const z = -((i - (SERVICES.length - 1) / 2) * SERVICE_CARD.gap)
        return (
          <mesh key={i} position={[0, SERVICE_RAIL_Y - 0.14, z]} material={m.ink}>
            <boxGeometry args={[0.01, 0.28, 0.01]} />
          </mesh>
        )
      })}
    </group>
  )
}

function ProductPlinth({ m }: { m: Mats }) {
  return (
    <group position={[-10, 0, -halfD]}>
      <mesh position={[0, PRODUCT_BOX.plinthTop / 2, 0.75]} material={m.white}>
        <boxGeometry args={[7.6, PRODUCT_BOX.plinthTop, 1.3]} />
      </mesh>
      <mesh position={[0, PRODUCT_BOX.plinthTop - 0.02, 1.405]} material={m.blue}>
        <boxGeometry args={[7.6, 0.04, 0.01]} />
      </mesh>
      <mesh position={[0, 3.3, 0.02]} material={m.white}>
        <boxGeometry args={[7.8, 0.06, 0.04]} />
      </mesh>
    </group>
  )
}

function WorkWallBacking({ m }: { m: Mats }) {
  return (
    <mesh position={[10, 3.3, -halfD + 0.015]} material={m.white}>
      <boxGeometry args={[10.4, 4.7, 0.03]} />
    </mesh>
  )
}

function Kiosk({ m }: { m: Mats }) {
  return (
    <group position={[KIOSK_POS.x, 0, KIOSK_POS.z]} rotation-y={yawOf(KIOSK_NORMAL)}>
      <mesh position-y={0.02} material={m.ink}>
        <cylinderGeometry args={[0.45, 0.5, 0.04, 24]} />
      </mesh>
      <mesh position-y={0.55} material={m.ink}>
        <boxGeometry args={[0.16, 1.1, 0.16]} />
      </mesh>
      <mesh position={[0, 1.55, 0.04]} material={m.ink}>
        <boxGeometry args={[1.42, 1.06, 0.12]} />
      </mesh>
      <mesh position={[0, 2.35, 0.04]} material={m.blue}>
        <boxGeometry args={[1.42, 0.3, 0.1]} />
      </mesh>
      <HangingSignInline stop="courier" position={[0, 2.35, 0.1]} />
    </group>
  )
}

function ProcessArrows({ m }: { m: Mats }) {
  const F = STOP_FRAMES.process
  return (
    <group>
      {[0, 1, 2].map((i) => {
        const z = F.center.z + (i - 1) * PROCESS_BOARD.gap
        return (
          <mesh key={i} position={[halfW - 0.05, 2.6, z]} rotation-x={Math.PI / 2} material={m.blue}>
            <coneGeometry args={[0.13, 0.26, 3]} />
          </mesh>
        )
      })}
    </group>
  )
}

function ContactDesk({ m }: { m: Mats }) {
  const lang = useStore((s) => s.lang)
  const front = useMemo(() => new THREE.MeshBasicMaterial({ map: deskTexture(lang) }), [lang])
  return (
    <group position={[halfW - 1.3, 0, 5.5]} rotation-y={-Math.PI / 2}>
      <mesh position-y={0.5} material={m.white}>
        <boxGeometry args={[2.8, 1, 0.9]} />
      </mesh>
      <mesh position-y={1.03} material={m.oak}>
        <boxGeometry args={[3, 0.06, 1.05]} />
      </mesh>
      <mesh position={[0, 0.55, 0.455]} material={front}>
        <planeGeometry args={[2.4, 0.94]} />
      </mesh>
    </group>
  )
}

const WIN = { x0: 4, x1: 12, y0: 1, y1: 4.2 }

function Window({ m, cx }: { m: Mats; cx: number }) {
  const glass = useMemo(() => new THREE.MeshBasicMaterial({ color: '#CFE4F2', transparent: true, opacity: 0.1, depthWrite: false }), [])
  const w = WIN.x1 - WIN.x0
  const h = WIN.y1 - WIN.y0
  const cy = (WIN.y0 + WIN.y1) / 2
  return (
    <group position={[cx, 0, 0]}>
      <mesh position={[0, cy, -0.02]} material={glass}><planeGeometry args={[w, h]} /></mesh>
      {/* frame, mullions and sill */}
      {[WIN.y0, WIN.y1].map((y) => <mesh key={y} position={[0, y, 0.03]} material={m.ink}><boxGeometry args={[w + 0.12, 0.1, 0.08]} /></mesh>)}
      {[-w / 2, -w / 4, 0, w / 4, w / 2].map((x) => <mesh key={x} position={[x, cy, 0.03]} material={m.ink}><boxGeometry args={[0.08, h, 0.08]} /></mesh>)}
      <mesh position={[0, WIN.y0 - 0.04, 0.12]} material={m.white}><boxGeometry args={[w + 0.3, 0.06, 0.26]} /></mesh>
    </group>
  )
}

function FrontWall({ m }: { m: Mats }) {
  const lang = useStore((s) => s.lang)
  const sign = useMemo(() => new THREE.MeshBasicMaterial({ map: frontWallTexture(lang), transparent: true }), [lang])
  return (
    <group position={[0, 0, halfD]} rotation-y={Math.PI}>
      {/* wall built around two big windows (|x| 4…12, y 1…4.2) that look onto the street */}
      <mesh position-y={WIN.y0 / 2} material={m.wall}><planeGeometry args={[halfW * 2, WIN.y0]} /></mesh>
      <mesh position-y={(WIN.y1 + height) / 2} material={m.wall}><planeGeometry args={[halfW * 2, height - WIN.y1]} /></mesh>
      {[[-(halfW + WIN.x1) / 2, halfW - WIN.x1], [0, WIN.x0 * 2], [(halfW + WIN.x1) / 2, halfW - WIN.x1]].map(([x, w]) => (
        <mesh key={x} position={[x, (WIN.y0 + WIN.y1) / 2, 0]} material={m.wall}><planeGeometry args={[w, WIN.y1 - WIN.y0]} /></mesh>
      ))}
      {[-1, 1].map((side) => <Window key={side} m={m} cx={side * (WIN.x0 + WIN.x1) / 2} />)}
      {/* entrance doors */}
      <mesh position={[0, 1.4, 0.02]} material={m.ink}>
        <planeGeometry args={[2.6, 2.8]} />
      </mesh>
      <mesh position={[0, 1.4, 0.03]} material={m.blue}>
        <planeGeometry args={[0.06, 2.8]} />
      </mesh>
      <mesh position={[0, 4.4, 0.02]} material={sign}>
        <planeGeometry args={[7.2, 1.84]} />
      </mesh>
    </group>
  )
}

function HangingSign({ stop, m }: { stop: StopId; m: Mats }) {
  const F = STOP_FRAMES[stop]
  const pos = F.center.clone().addScaledVector(F.normal, 0.9)
  const y = stop === 'work' ? 6.2 : 5.5
  return (
    <group position={[pos.x, y, pos.z]} rotation-y={yawOf(F.normal)}>
      <HangingSignInline stop={stop} />
      {[-0.9, 0.9].map((x) => (
        <mesh key={x} position={[x, (height - y) / 2 + 0.15, 0]} material={m.ink}>
          <boxGeometry args={[0.012, height - y - 0.3, 0.012]} />
        </mesh>
      ))}
    </group>
  )
}

function HangingSignInline({ stop, position }: { stop: StopId; position?: [number, number, number] }) {
  const lang = useStore((s) => s.lang)
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ map: signTexture(stop, lang) }), [stop, lang])
  const small = stop === 'courier'
  return (
    <mesh position={position} material={mat}>
      <boxGeometry args={small ? [1.2, 0.3, 0.02] : [2.4, 0.6, 0.05]} />
    </mesh>
  )
}

function Plant({ m, position }: { m: Mats; position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position-y={0.35} material={m.ink}>
        <cylinderGeometry args={[0.32, 0.25, 0.7, 14]} />
      </mesh>
      {[[0, 1.1, 0, 0.5], [0.22, 1.45, 0.1, 0.38], [-0.2, 1.4, -0.1, 0.36], [0, 1.75, 0, 0.3]].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]} material={m.plant}>
          <icosahedronGeometry args={[r, 1]} />
        </mesh>
      ))}
    </group>
  )
}
