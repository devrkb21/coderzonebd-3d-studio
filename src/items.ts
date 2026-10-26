// The clickable things in the room, in the order prev/next walks through them.
import { PROCESS, PRODUCTS, SERVICES, WORK, type StopId } from './content'

export type ItemKind = 'home' | 'service' | 'product' | 'work' | 'tech' | 'courier' | 'process' | 'contact' | 'leadership'

export interface Item {
  id: string
  stop: StopId
  kind: ItemKind
  /** Id inside its content list (service id, work id, …). */
  ref: string
}

export const ITEMS: Item[] = [
  { id: 'home', stop: 'home', kind: 'home', ref: 'home' },
  ...SERVICES.map((s) => ({ id: `service:${s.id}`, stop: 'services' as const, kind: 'service' as const, ref: s.id })),
  ...PRODUCTS.map((p) => ({ id: `product:${p.id}`, stop: 'products' as const, kind: 'product' as const, ref: p.id })),
  ...WORK.map((w) => ({ id: `work:${w.id}`, stop: 'work' as const, kind: 'work' as const, ref: w.id })),
  { id: 'tech', stop: 'tech', kind: 'tech', ref: 'tech' },
  { id: 'courier', stop: 'courier', kind: 'courier', ref: 'courier' },
  ...PROCESS.map((p) => ({ id: `process:${p.id}`, stop: 'process' as const, kind: 'process' as const, ref: p.id })),
  { id: 'contact', stop: 'contact', kind: 'contact', ref: 'contact' },
  { id: 'leadership', stop: 'leadership', kind: 'leadership', ref: 'leadership' },
]

export const itemById = (id: string) => ITEMS.find((i) => i.id === id)
export const itemsAt = (stop: StopId) => ITEMS.filter((i) => i.stop === stop)
