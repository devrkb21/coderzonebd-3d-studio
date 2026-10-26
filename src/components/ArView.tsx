// "View in AR": a miniature of the studio (public/models/studio-mini.glb, .usdz for iOS) in
// Google's <model-viewer>, placed on a table through the phone camera. On a desktop the dialog
// shows a 3D preview and a QR code that opens it on a phone. `?ar` opens the dialog at load.
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AR_TEXT, tr } from '../content'
import { useStore } from '../store'
import { Modal } from './Modal'

const BASE = import.meta.env.BASE_URL
const PHONE_URL = 'https://3d.coderzonebd.com/?ar'

type ArKind = 'phone' | 'desktop'

/**
 * Where AR can work: iOS and iPadOS with Quick Look, Android Chrome (WebXR or Scene Viewer).
 * Desktops get the preview with a QR code; other phones and tablets get no button.
 */
function arKind(): ArKind | null {
  if (typeof window === 'undefined') return null
  const ua = navigator.userAgent
  if (document.createElement('a').relList.supports?.('ar')) return 'phone'
  if (/android/i.test(ua)) return /firefox|oculus/i.test(ua) ? null : 'phone'
  if (/iphone|ipad|ipod/i.test(ua)) return null
  return matchMedia('(hover: hover) and (pointer: fine)').matches ? 'desktop' : null
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & Record<string, unknown>
    }
  }
}

/** QR code as an SVG path, drawn by the qrcode-generator package (no network). */
function Qr({ text }: { text: string }) {
  const [qr, setQr] = useState<{ n: number; d: string } | null>(null)
  useEffect(() => {
    let live = true
    import('qrcode-generator').then(({ default: qrcode }) => {
      const q = qrcode(0, 'M')
      q.addData(text)
      q.make()
      const n = q.getModuleCount()
      let d = ''
      for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`
      if (live) setQr({ n, d })
    })
    return () => { live = false }
  }, [text])
  if (!qr) return <div className="ar-qr" />
  return (
    <svg className="ar-qr" viewBox={`-2 -2 ${qr.n + 4} ${qr.n + 4}`} shapeRendering="crispEdges" role="img" aria-label={text}>
      <rect x={-2} y={-2} width={qr.n + 4} height={qr.n + 4} fill="#fff" />
      <path d={qr.d} fill="#12141C" />
    </svg>
  )
}

function ArDialog({ kind, onClose }: { kind: ArKind; onClose: () => void }) {
  const lang = useStore((s) => s.lang)
  const viewer = useRef<HTMLElement & { canActivateAR?: boolean }>(null)
  const [loaded, setLoaded] = useState(false)
  const [canAr, setCanAr] = useState(true)
  useEffect(() => {
    import('@google/model-viewer')
    const el = viewer.current
    const onLoad = () => { setLoaded(true); setCanAr(!!el?.canActivateAR) }
    el?.addEventListener('load', onLoad)
    return () => el?.removeEventListener('load', onLoad)
  }, [])
  const phone = kind === 'phone'
  return createPortal(
    <Modal title={tr(AR_TEXT.title, lang)} onClose={onClose} className="ar-card">
      <div className="ar-stage">
        <model-viewer
          ref={viewer}
          src={`${BASE}models/studio-mini.glb`}
          ios-src={`${BASE}models/studio-mini.usdz`}
          alt={tr(AR_TEXT.alt, lang)}
          ar=""
          ar-modes="webxr scene-viewer quick-look"
          ar-scale="auto"
          camera-controls=""
          auto-rotate=""
          touch-action="pan-y"
          interaction-prompt="none"
          camera-orbit="25deg 60deg 88%"
          min-camera-orbit="auto auto 30%"
          shadow-intensity="1"
          style={{ width: '100%', height: '100%' }}
        >
          {phone && <button slot="ar-button" className="btn primary ar-place">{tr(AR_TEXT.place, lang)}</button>}
        </model-viewer>
        {!loaded && <p className="ar-loading">{tr(AR_TEXT.loading, lang)}</p>}
      </div>
      {phone
        ? <p className="ar-note">{tr(loaded && !canAr ? AR_TEXT.noAr : AR_TEXT.howTo, lang)}</p>
        : (
          <div className="ar-scan">
            <Qr text={lang === 'bn' ? `${PHONE_URL}&lang=bn` : PHONE_URL} />
            <div>
              <p>{tr(AR_TEXT.scan, lang)}</p>
              <p className="ar-works">{tr(AR_TEXT.works, lang)}</p>
            </div>
          </div>
        )}
    </Modal>,
    document.body,
  )
}

/** Top-bar button and its dialog; the button is hidden where AR can't work and there's no QR to show. */
export function ArButton() {
  const lang = useStore((s) => s.lang)
  const [kind] = useState(arKind)
  const [open, setOpen] = useState(() => typeof location !== 'undefined' && new URLSearchParams(location.search).has('ar'))
  const label = tr(AR_TEXT.button, lang)
  return (
    <>
      {kind && <button className="icon-btn ar-btn" onClick={() => setOpen(true)} aria-label={label} title={label}>
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 3 4 7.5v9L12 21l8-4.5v-9z" /><path d="M4 7.5 12 12l8-4.5M12 12v9" />
        </svg>
      </button>}
      {/* a QR scan on a phone without AR still gets the 3D preview */}
      {open && <ArDialog kind={kind ?? 'phone'} onClose={() => setOpen(false)} />}
    </>
  )
}
