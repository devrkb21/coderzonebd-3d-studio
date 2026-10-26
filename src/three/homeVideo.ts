// The Home wall plays a short, silent, seamlessly looping brand film per language
// (public/video/home-<lang>.mp4; its source is the HyperFrames project in video/home).
// The static canvas wall stays on until the film's first frame is decoded, and it stays
// for good when Save-Data or reduced motion is on, or the browser refuses to autoplay.
import { useEffect, useState } from 'react'
import * as THREE from 'three'
import type { Lang } from '../content'

function videoAllowed() {
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } }
  if (nav.connection?.saveData) return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  return true
}

/** Phones and small screens get the 1280×720 cut: less to decode and upload each frame. */
const isSmallScreen = () => window.matchMedia('(pointer: coarse)').matches || Math.min(screen.width, screen.height) < 720

/** A VideoTexture of the Home film once it is playing, else null (show the static wall). */
export function useHomeVideo(lang: Lang, enabled: boolean) {
  const [texture, setTexture] = useState<THREE.VideoTexture | null>(null)

  useEffect(() => {
    if (!enabled || !videoAllowed()) return
    const video = document.createElement('video')
    video.muted = true
    video.defaultMuted = true
    video.loop = true
    video.playsInline = true
    video.setAttribute('muted', '')
    video.setAttribute('playsinline', '')
    video.preload = 'auto'
    video.src = `${import.meta.env.BASE_URL}video/home-${lang}${isSmallScreen() ? '-720' : ''}.mp4`

    const tex = new THREE.VideoTexture(video)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.minFilter = THREE.LinearFilter
    tex.magFilter = THREE.LinearFilter
    tex.generateMipmaps = false

    let alive = true
    // Swap only once a real frame is there, so the wall never flashes blank.
    const onPlaying = () => { if (alive && video.readyState >= 2) setTexture(tex) }
    const onError = () => { if (alive) setTexture(null) }
    const play = () => { video.play().catch(() => { /* autoplay refused: keep the static wall */ }) }
    const onVisibility = () => (document.hidden ? video.pause() : play())

    video.addEventListener('playing', onPlaying)
    video.addEventListener('error', onError)
    document.addEventListener('visibilitychange', onVisibility)
    if (!document.hidden) play()

    return () => {
      alive = false
      video.removeEventListener('playing', onPlaying)
      video.removeEventListener('error', onError)
      document.removeEventListener('visibilitychange', onVisibility)
      video.pause()
      video.removeAttribute('src')
      video.load()
      tex.dispose()
      setTexture(null)
    }
  }, [lang, enabled])

  return texture
}
