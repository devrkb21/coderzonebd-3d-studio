// A clickable office object: pointer cursor, a label next to the pointer, and a click that
// ignores drags (so looking around never triggers it).
import type { ReactNode } from 'react'
import type { GroupProps } from '@react-three/fiber'
import { tr, type L } from '../content'
import { useStore } from '../store'
import { DRAG_PX } from './Items'

export function Hot({ tip, onPick, children, ...props }: GroupProps & { tip: L; onPick: () => void; children: ReactNode }) {
  return (
    <group
      {...props}
      onPointerOver={(e) => {
        e.stopPropagation()
        document.body.style.cursor = 'pointer'
        const s = useStore.getState()
        s.setTip(tr(tip, s.lang))
      }}
      onPointerOut={() => {
        document.body.style.cursor = ''
        useStore.getState().setTip(null)
      }}
      onClick={(e) => {
        e.stopPropagation()
        if (e.delta > DRAG_PX) return
        useStore.getState().setTouring(false)
        onPick()
      }}
    >
      {children}
    </group>
  )
}
