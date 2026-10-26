// Selfie postcard: captures the current 3D view and frames it in a branded 1080×1350 card
// with the visitor's name, to download or share.
import { useCallback, useEffect, useRef, useState } from 'react'
import { COMPANY } from '../content'
import { NAME_MAX, PERSONAL, sanitizeName } from '../personal'
import { snapshot } from '../snapshot'
import { useStore } from '../store'
import { Modal } from './Modal'

const BASE = import.meta.env.BASE_URL
const SITE = '3d.coderzonebd.com'
const W = 1080
const H = 1350
const FONT = '"Anek Bangla Variable", system-ui, sans-serif'

function loadImg(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

let assets: Promise<{ word: HTMLImageElement | null; mark: HTMLImageElement | null }> | null = null
const loadAssets = () => (assets ??= Promise.all([
  loadImg(`${BASE}logos/coderzone-wordmark.png`),
  loadImg(`${BASE}logos/coderzone-mark.png`),
  document.fonts.load(`700 40px ${FONT}`, 'আমি Aa').catch(() => null),
]).then(([word, mark]) => ({ word, mark })))

function fitImage(ctx: CanvasRenderingContext2D, img: CanvasImageSource & { width: number; height: number }, x: number, y: number, w: number, h: number) {
  const k = Math.max(w / img.width, h / img.height)
  const sw = w / k
  const sh = h / k
  ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, x, y, w, h)
}

function contain(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number, align: 'left' | 'center') {
  const k = Math.min(w / img.naturalWidth, h / img.naturalHeight)
  const dw = img.naturalWidth * k
  ctx.drawImage(img, align === 'left' ? x : x + (w - dw) / 2, y + (h - img.naturalHeight * k) / 2, dw, img.naturalHeight * k)
}

function compose(out: HTMLCanvasElement, photo: HTMLCanvasElement, name: string, bn: boolean, a: Awaited<ReturnType<typeof loadAssets>>) {
  out.width = W
  out.height = H
  const ctx = out.getContext('2d')!
  ctx.fillStyle = '#FFF8F0'
  ctx.fillRect(0, 0, W, H)
  // the photo, with a soft shadow and rounded corners
  const px = 60, py = 60, pw = W - 120, ph = 860
  ctx.save()
  ctx.shadowColor = 'rgba(18,20,28,0.28)'
  ctx.shadowBlur = 40
  ctx.shadowOffsetY = 14
  ctx.fillStyle = '#fff'
  ctx.beginPath(); ctx.roundRect(px - 12, py - 12, pw + 24, ph + 24, 34); ctx.fill()
  ctx.restore()
  ctx.save()
  ctx.beginPath(); ctx.roundRect(px, py, pw, ph, 24); ctx.clip()
  fitImage(ctx, photo, px, py, pw, ph)
  ctx.restore()
  // a round CZ "stamp" on the photo's corner
  if (a.mark) {
    ctx.fillStyle = '#fff'
    ctx.beginPath(); ctx.arc(px + pw - 70, py + 70, 62, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = '#FF931E'; ctx.lineWidth = 5; ctx.setLineDash([10, 8])
    ctx.beginPath(); ctx.arc(px + pw - 70, py + 70, 54, 0, Math.PI * 2); ctx.stroke()
    ctx.setLineDash([])
    contain(ctx, a.mark, px + pw - 110, py + 30, 80, 80, 'center')
  }
  // words
  let y = py + ph + 64
  if (a.word) contain(ctx, a.word, px, y - 22, 330, 72, 'left')
  else { ctx.fillStyle = '#12141C'; ctx.font = `700 44px ${FONT}`; ctx.fillText(COMPANY.name, px, y + 30) }
  y += 106
  ctx.fillStyle = '#12141C'
  ctx.textBaseline = 'alphabetic'
  const line = bn ? 'আমি ঘুরে এলাম Coder Zone BD-র 3D স্টুডিও' : 'I visited the Coder Zone BD 3D studio'
  let size = 48
  do { ctx.font = `700 ${size}px ${FONT}`; size -= 2 } while (ctx.measureText(line).width > pw && size > 20)
  ctx.fillText(line, px, y)
  if (name) {
    y += 76
    ctx.fillStyle = '#D46A00'
    size = 60
    do { ctx.font = `700 ${size}px ${FONT}`; size -= 2 } while (ctx.measureText(`— ${name}`).width > pw && size > 20)
    ctx.fillText(`— ${name}`, px, y)
  }
  // footer band with the address of the studio
  ctx.fillStyle = '#12141C'
  ctx.fillRect(0, H - 96, W, 96)
  ctx.fillStyle = '#FF931E'
  ctx.fillRect(0, H - 96, W, 6)
  ctx.fillStyle = '#ffffff'
  ctx.font = `700 36px ${FONT}`
  ctx.fillText(SITE, px, H - 34)
  ctx.textAlign = 'right'
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.font = `500 28px ${FONT}`
  ctx.fillText(bn ? 'খুলনা, বাংলাদেশ' : 'Khulna, Bangladesh', W - px, H - 36)
  ctx.textAlign = 'left'
}

const toBlob = (c: HTMLCanvasElement) => new Promise<Blob | null>((r) => c.toBlob(r, 'image/jpeg', 0.92))
const FILE = 'coder-zone-bd-3d-postcard.jpg'

const canShareFiles = () => {
  try {
    return !!navigator.canShare?.({ files: [new File([new Blob()], 'x.jpg', { type: 'image/jpeg' })] })
  } catch { return false }
}

/** Camera button for the top bar (3D only). */
export function PostcardButton() {
  const lang = useStore((s) => s.lang)
  const label = lang === 'bn' ? 'সেলফি পোস্টকার্ড' : 'Selfie postcard'
  return (
    <button className="icon-btn postcard-btn" onClick={() => useStore.getState().setPostcardOpen(true)} aria-label={label} title={label}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" />
      </svg>
    </button>
  )
}

export function PostcardDialog() {
  const open = useStore((s) => s.postcardOpen)
  if (!open) return null
  return <PostcardCard />
}

function PostcardCard() {
  const lang = useStore((s) => s.lang)
  const bn = lang === 'bn'
  const close = useCallback(() => useStore.getState().setPostcardOpen(false), [])
  const [name, setName] = useState(PERSONAL?.name ?? '')
  const [photo] = useState(snapshot)
  const [a, setA] = useState<Awaited<ReturnType<typeof loadAssets>> | null>(null)
  const [busy, setBusy] = useState(false)
  const [share] = useState(canShareFiles)
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => { loadAssets().then(setA) }, [])
  useEffect(() => {
    if (a && photo && ref.current) compose(ref.current, photo, sanitizeName(name) ?? '', bn, a)
  }, [a, photo, name, bn])

  const download = async () => {
    if (!ref.current) return
    setBusy(true)
    const blob = await toBlob(ref.current)
    setBusy(false)
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = FILE
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 4000)
  }

  const shareIt = async () => {
    if (!ref.current) return
    setBusy(true)
    const blob = await toBlob(ref.current)
    setBusy(false)
    if (!blob) return
    try {
      await navigator.share({
        files: [new File([blob], FILE, { type: 'image/jpeg' })],
        title: COMPANY.name,
        text: `${bn ? 'আমি ঘুরে এলাম Coder Zone BD-র 3D স্টুডিও' : 'I visited the Coder Zone BD 3D studio'} · https://${SITE}`,
      })
    } catch { /* the visitor closed the share sheet */ }
  }

  return (
    <Modal title={bn ? 'সেলফি পোস্টকার্ড' : 'Selfie postcard'} onClose={close} className="postcard">
      {photo ? (
        <>
          <canvas ref={ref} className="postcard-preview" width={W} height={H} aria-label={bn ? 'পোস্টকার্ডের প্রিভিউ' : 'Postcard preview'} />
          <label className="postcard-name">
            {bn ? 'আপনার নাম' : 'Your name'}
            <input value={name} maxLength={NAME_MAX} onChange={(e) => setName(e.target.value)} placeholder={bn ? 'যেমন: রহিম' : 'e.g. Rahim'} autoComplete="name" />
          </label>
          <div className="actions">
            <button className="btn primary" onClick={download} disabled={busy || !a}>{bn ? 'ডাউনলোড' : 'Download'}</button>
            {share && <button className="btn" onClick={shareIt} disabled={busy || !a}>{bn ? 'শেয়ার করুন' : 'Share'}</button>}
          </div>
        </>
      ) : (
        <p>{bn ? 'এখন ছবি তোলা গেল না। একটু পরে আবার চেষ্টা করুন।' : 'Could not take the picture right now. Please try again in a moment.'}</p>
      )}
    </Modal>
  )
}
