import { useEffect, type ReactNode } from 'react'
import { tr, UI } from '../content'
import { useStore } from '../store'
import { CloseIcon } from './icons'

/** A centred card over a dimmed room (styled like the help overlay); Esc or a click outside closes it. */
export function Modal({ title, onClose, children, className = '' }: { title: string; onClose: () => void; children: ReactNode; className?: string }) {
  const lang = useStore((s) => s.lang)
  useEffect(() => {
    // capture phase, so Esc closes this card before the room's own Esc (overview) sees it
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); onClose() } }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [onClose])
  return (
    <div className="help" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <div className={`help-card ${className}`} onClick={(e) => e.stopPropagation()}>
        <div className="help-head">
          <h2>{title}</h2>
          <button className="icon-btn sm" onClick={onClose} aria-label={tr(UI.close, lang)}><CloseIcon /></button>
        </div>
        {children}
      </div>
    </div>
  )
}
