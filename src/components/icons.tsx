const base = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

export const CloseIcon = () => (
  <svg {...base} aria-hidden><path d="M6 6l12 12M18 6L6 18" /></svg>
)
export const ChevronLeft = () => (
  <svg {...base} aria-hidden><path d="M15 5l-7 7 7 7" /></svg>
)
export const ChevronRight = () => (
  <svg {...base} aria-hidden><path d="M9 5l7 7-7 7" /></svg>
)
export const ListIcon = () => (
  <svg {...base} aria-hidden><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" /></svg>
)
export const TrashIcon = () => (
  <svg {...base} width={18} height={18} aria-hidden><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" /></svg>
)
