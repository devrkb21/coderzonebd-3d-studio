// Who is where, by the office schedule (Bangladesh time): the team at their desks or at lunch in
// the lounge, and the night guard by the door. The receptionist and the founders live with their
// furniture (Reception.tsx, Cabins.tsx). Phones get a smaller cast.
import { useRef } from 'react'
import { useSchedule } from '../schedule'
import { useLookUp } from './Cabins'
import { COFFEE_X, GUARD_SEAT, LOUNGE_X, RECEPTION, ROOM } from './layout'
import { Avatar, Walker, type Actor, type AvatarId, type Leg } from './People'

const { halfD } = ROOM
const coarse = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
/** Seated at the workstations (desks at x 5.4 / 8.6, z 7.4), facing the monitors. */
const DESK_Z = 6.62

/** Where a visitor stands at the reception counter. */
const AT_DESK: [number, number] = [RECEPTION.x + Math.sin(RECEPTION.yaw) * 1.05, RECEPTION.z + Math.cos(RECEPTION.yaw) * 1.05]
/** Coffee corner → a chat at reception → a look at the lounge → back for a coffee. */
const ROUND: Leg[] = [
  { to: [[3.9, 10.6], AT_DESK], then: 'talk', hold: 8, face: RECEPTION.yaw + Math.PI },
  { to: [[4.6, 9.3], [9.8, 9.3]], then: 'idle', hold: 4, face: 1.2 },
  { to: [[COFFEE_X + 0.2, halfD - 1.5]], then: 'drink', hold: 9, face: Math.PI },
]

export function PeopleCast() {
  const { period, guard } = useSchedule()
  return (
    <group>
      {period === 'work' && (
        <>
          <DeskWorker who="dev1" x={5.4} seed={1} />
          {!coarse && <DeskWorker who="dev2" x={8.6} seed={2} />}
          {!coarse && <Walker who="walker" start={[COFFEE_X + 0.2, halfD - 1.5]} legs={ROUND} seed={3} />}
        </>
      )}
      {period === 'lunch' && (
        <>
          <Avatar who="dev1" clip="drink" position={[COFFEE_X + 0.6, 0, halfD - 1.45]} rotation-y={Math.PI + 0.4} />
          {!coarse && <Avatar who="dev2" clip="sit" seed={2} position={[LOUNGE_X + 0.55, 0, halfD - 1.05]} rotation-y={Math.PI} />}
          {!coarse && <Avatar who="walker" clip="talk" seed={3} position={[LOUNGE_X - 1.1, 0, halfD - 2.0]} rotation-y={0.9} />}
        </>
      )}
      {guard && <Avatar who="guard" clip="sit" position={[GUARD_SEAT.x, 0, GUARD_SEAT.z]} rotation-y={GUARD_SEAT.yaw} />}
    </group>
  )
}

function DeskWorker({ who, x, seed }: { who: AvatarId; x: number; seed: number }) {
  const actor = useRef<Actor | null>(null)
  useLookUp(actor, seed)
  return <Avatar who={who} clip="type" seed={seed} actor={actor} position={[x, 0, DESK_Z]} />
}
