// "Build my site live": a big freestanding screen facing the entrance, mirroring the courier
// kiosk. It shows the AI writing the HTML as scrolling code, then the finished mock-up.
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import CameraControlsImpl from 'camera-controls'
import type { Lang } from '../content'
import { useStore } from '../store'
import { safeDoc, tidyHtml, useDemo } from '../ai/demo'
import { Hot } from './Hot'
import { MOBILE_BREAKPOINT, PANEL_WIDTH } from './CameraRig'
import { fitFrame, KIOSK_NORMAL, KIOSK_POS, yawOf } from './layout'

const { ACTION } = CameraControlsImpl

/** Mirrors the courier kiosk across the room's centre line. */
const POS = new THREE.Vector3(-KIOSK_POS.x, 0, KIOSK_POS.z)
const NORMAL = new THREE.Vector3(-KIOSK_NORMAL.x, 0, KIOSK_NORMAL.z)
const SCREEN = { w: 2.3, h: 1.4, y: 1.8 }
/** CSS pixels of the page shown on the screen (a desktop layout). */
const PX_W = 1280
const PX_H = Math.round((PX_W * SCREEN.h) / SCREEN.w)

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function idleTexture(lang: Lang) {
  const c = document.createElement('canvas')
  c.width = 1024
  c.height = Math.round((1024 * SCREEN.h) / SCREEN.w)
  const g = c.getContext('2d')!
  const bg = g.createLinearGradient(0, 0, c.width, c.height)
  bg.addColorStop(0, '#171A24')
  bg.addColorStop(1, '#0E1018')
  g.fillStyle = bg
  g.fillRect(0, 0, c.width, c.height)
  // a faint browser window with code lines
  g.fillStyle = '#1F2330'
  g.fillRect(560, 120, 400, 380)
  g.fillStyle = '#2A2F3E'
  g.fillRect(560, 120, 400, 36)
  ;['#FF5F57', '#FEBC2E', '#28C840'].forEach((col, i) => { g.fillStyle = col; g.beginPath(); g.arc(584 + i * 22, 138, 7, 0, Math.PI * 2); g.fill() })
  const code = ['#FF931E', '#7FE3FF', '#C3E88D', '#7FE3FF', '#FFCB6B', '#C3E88D', '#FF931E', '#7FE3FF']
  code.forEach((col, i) => { g.fillStyle = col; g.globalAlpha = 0.75; g.fillRect(588 + (i % 3) * 22, 186 + i * 36, 120 + ((i * 53) % 190), 12) })
  g.globalAlpha = 1
  const font = "'Anek Bangla Variable', system-ui, sans-serif"
  g.fillStyle = '#FF931E'
  g.font = `700 30px ${font}`
  g.fillText(lang === 'bn' ? 'AI · লাইভ' : 'AI · LIVE', 64, 150)
  g.fillStyle = '#FFFFFF'
  g.font = `700 ${lang === 'bn' ? 60 : 66}px ${font}`
  const title = lang === 'bn' ? ['লাইভ সাইট', 'বানিয়ে দেখুন'] : ['Build my', 'site live']
  title.forEach((l, i) => g.fillText(l, 64, 240 + i * 76))
  g.fillStyle = '#A9AFC0'
  g.font = `500 28px ${font}`
  const sub = lang === 'bn' ? ['আপনার ব্যবসার নাম দিন, AI এক মিনিটে', 'আপনার অনলাইন শপ ডিজাইন করবে।'] : ['Name your business and our AI designs', 'your online shop in about a minute.']
  sub.forEach((l, i) => g.fillText(l, 64, 400 + i * 38))
  g.fillStyle = '#FF931E'
  const label = lang === 'bn' ? 'শুরু করুন →' : 'Start →'
  g.font = `700 30px ${font}`
  const w = g.measureText(label).width + 56
  g.beginPath()
  g.roundRect(64, 470, w, 58, 14)
  g.fill()
  g.fillStyle = '#12141C'
  g.fillText(label, 92, 510)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

function headerTexture(lang: Lang) {
  const c = document.createElement('canvas')
  c.width = 1024
  c.height = Math.round((1024 * 0.2) / SCREEN.w)
  const g = c.getContext('2d')!
  g.fillStyle = '#FF931E'
  g.fillRect(0, 0, c.width, c.height)
  g.fillStyle = '#12141C'
  g.font = "700 46px 'Anek Bangla Variable', system-ui, sans-serif"
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.fillText(lang === 'bn' ? '✦  AI স্টুডিও · লাইভ সাইট বিল্ডার' : '✦  AI STUDIO · LIVE SITE BUILDER', c.width / 2, c.height / 2 + 2)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

/** The streamed HTML as scrolling code, revealed at a typing pace that keeps up with the stream. */
function CodeView({ html, onCaughtUp }: { html: string; onCaughtUp: () => void }) {
  const [shown, setShown] = useState(0)
  const target = useRef(html.length)
  target.current = html.length
  useEffect(() => {
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      // About 900 characters a second, faster when the stream runs ahead.
      setShown((n) => Math.min(target.current, n + Math.ceil(dt * (900 + (target.current - n) * 1.5))))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])
  useEffect(() => { if (shown >= html.length) onCaughtUp() }, [shown, html.length, onCaughtUp])
  const text = html.slice(Math.max(0, shown - 2600), shown)
  return (
    <pre className="demo-code">
      {text.slice(text.indexOf('\n') + 1)}
      <span className="demo-caret" />
    </pre>
  )
}

function ScreenContent() {
  const { open, status, html } = useDemo()
  const [caughtUp, setCaughtUp] = useState(false)
  useEffect(() => { if (status === 'building') setCaughtUp(false) }, [status])
  const doc = useMemo(() => (status === 'done' ? safeDoc(tidyHtml(html)) : ''), [status, html])
  const showSite = status === 'done' && caughtUp
  return (
    <div className="demo-screen" style={{ width: PX_W, height: PX_H, pointerEvents: open ? 'auto' : 'none' }}>
      {showSite
        ? <iframe title="Demo site" sandbox="" srcDoc={doc} width={PX_W} height={PX_H} />
        : <CodeView html={html} onCaughtUp={() => setCaughtUp(true)} />}
    </div>
  )
}

/** Flies the camera to the screen while the builder is open, and hands it back to the rig after. */
function useDemoCamera() {
  const controls = useThree((s) => s.controls) as unknown as CameraControlsImpl | null
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const size = useThree((s) => s.size)
  const open = useDemo((d) => d.open)
  const token = useRef(0)
  const wasOverview = useRef(false)
  const interrupted = useRef(false)
  const returning = useRef(false)
  const active = useRef(false)

  // Any navigation while the builder is open (a pill, a key, a click on the room) closes it.
  useEffect(() => useStore.subscribe((s, prev) => {
    if (!useDemo.getState().open || returning.current) return
    if (s.stop !== prev.stop || s.focusId !== prev.focusId || s.overview !== prev.overview) {
      interrupted.current = true
      useDemo.getState().setOpen(false)
    }
  }), [])

  useEffect(() => {
    const c = controls
    if (!c) return
    const id = ++token.current
    if (!open) {
      if (!active.current) return
      active.current = false
      if (interrupted.current) { interrupted.current = false; return }
      // Re-run the rig: flip the overview and back, so it flies to where the visitor was.
      returning.current = true
      const back = wasOverview.current
      useStore.getState().setOverview(!back)
      requestAnimationFrame(() => {
        useStore.getState().setOverview(back)
        returning.current = false
      })
      return
    }
    const s = useStore.getState()
    if (s.intro) { useDemo.getState().setOpen(false); return }
    if (!active.current) wasOverview.current = s.overview
    active.current = true
    if (s.focusId) {
      returning.current = true
      s.focus(null)
      returning.current = false
    }
    let cancelled = false
    let raf = 0
    const vw = size.width
    const vh = size.height
    const mobile = vw < MOBILE_BREAKPOINT
    const insets = mobile ? { top: 64, right: 0, bottom: Math.round(vh * 0.5) } : { top: 76, right: PANEL_WIDTH + 24, bottom: 40 }
    const center = POS.clone().setY(SCREEN.y + 0.1)
    const fit = fitFrame({ center, normal: NORMAL, width: SCREEN.w + 0.3, height: SCREEN.h + 0.5 }, camera.fov, vw, vh, insets, 1.06)
    const fly = () => {
      // Wait until the rig has landed (look-around is back on) so its own move can't finish after ours.
      if (c.mouseButtons.left === ACTION.NONE) { raf = requestAnimationFrame(fly); return }
      if (cancelled) return
      const { position: p, target: t } = fit
      c.minAzimuthAngle = -Infinity
      c.maxAzimuthAngle = Infinity
      c.minPolarAngle = 0
      c.maxPolarAngle = Math.PI
      c.mouseButtons.left = ACTION.NONE
      c.touches.one = ACTION.NONE
      c.smoothTime = 0.7
      c.zoomTo(1, true)
      c.setLookAt(p.x, p.y, p.z, t.x, t.y, t.z, !reducedMotion()).then(() => {
        if (cancelled || id !== token.current) return
        // Land like the rig: pivot just ahead of the camera, so a drag turns the head in place.
        const pivot = p.clone().addScaledVector(t.clone().sub(p).normalize(), 0.05)
        c.setLookAt(p.x, p.y, p.z, pivot.x, pivot.y, pivot.z, false)
        c.minPolarAngle = Math.PI / 2 - 0.55
        c.maxPolarAngle = Math.PI / 2 + 0.45
        c.mouseButtons.left = ACTION.ROTATE
        c.touches.one = ACTION.TOUCH_ROTATE
      })
    }
    raf = requestAnimationFrame(fly)
    return () => { cancelled = true; cancelAnimationFrame(raf) }
  }, [open, controls, camera, size.width, size.height])
}

export function DemoScreen() {
  const lang = useStore((s) => s.lang)
  const status = useDemo((d) => d.status)
  const hasHtml = useDemo((d) => d.html.length > 0)
  const idle = useMemo(() => idleTexture(lang), [lang])
  const header = useMemo(() => headerTexture(lang), [lang])
  useEffect(() => () => { idle.dispose(); header.dispose() }, [idle, header])
  useDemoCamera()
  const mats = useMemo(() => ({
    ink: new THREE.MeshStandardMaterial({ color: '#1C1E26', roughness: 0.5, metalness: 0.3 }),
    brand: new THREE.MeshStandardMaterial({ color: '#FF931E', roughness: 0.45, emissive: '#FF931E', emissiveIntensity: 0.15 }),
  }), [])
  const live = status !== 'idle' && (hasHtml || status === 'building')

  return (
    <group position={[POS.x, 0, POS.z]} rotation-y={yawOf(NORMAL)}>
      <mesh position-y={0.02} material={mats.ink}><cylinderGeometry args={[0.6, 0.66, 0.04, 28]} /></mesh>
      {[-0.55, 0.55].map((x) => (
        <mesh key={x} position={[x, 0.55, -0.02]} material={mats.ink}><boxGeometry args={[0.08, 1.1, 0.08]} /></mesh>
      ))}
      <mesh position={[0, SCREEN.y, -0.02]} material={mats.ink}><boxGeometry args={[SCREEN.w + 0.12, SCREEN.h + 0.12, 0.1]} /></mesh>
      <mesh position={[0, SCREEN.y + SCREEN.h / 2 + 0.2, -0.02]} material={mats.brand}><boxGeometry args={[SCREEN.w + 0.12, 0.26, 0.1]} /></mesh>
      <mesh position={[0, SCREEN.y + SCREEN.h / 2 + 0.2, 0.035]}>
        <planeGeometry args={[SCREEN.w, 0.2]} />
        <meshBasicMaterial map={header} toneMapped={false} />
      </mesh>
      <Hot
        tip={{ en: 'Build my site live →', bn: 'লাইভ সাইট বানিয়ে দেখুন →' }}
        onPick={() => useDemo.getState().setOpen(true)}
      >
        <mesh position={[0, SCREEN.y, 0.035]}>
          <planeGeometry args={[SCREEN.w, SCREEN.h]} />
          <meshBasicMaterial map={idle} toneMapped={false} />
        </mesh>
      </Hot>
      {live && (
        <Html transform position={[0, SCREEN.y, 0.04]} distanceFactor={(400 * SCREEN.w) / PX_W} zIndexRange={[4, 0]}>
          <ScreenContent />
        </Html>
      )}
    </group>
  )
}
