// Office and street ambience, synthesised live with Web Audio: no sound files to download.
// Room tone (fan + AC), distant traffic, keyboard typing in bursts, a rickshaw bell, the odd
// horn, birds by day, and a soft tick on clicks. Starts only after the visitor turns it on.
import { useStore } from './store'
import { dhakaHours, phaseAt } from './three/time'

let ctx: AudioContext | null = null
let master: GainNode | null = null
let roomGain: GainNode | null = null
let timers: ReturnType<typeof setTimeout>[] = []
let unsub: (() => void) | null = null

function noiseBuffer(c: AudioContext, seconds: number, brown = false) {
  const b = c.createBuffer(1, c.sampleRate * seconds, c.sampleRate)
  const d = b.getChannelData(0)
  let last = 0
  for (let i = 0; i < d.length; i++) {
    const w = Math.random() * 2 - 1
    if (brown) { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5 } else d[i] = w
  }
  return b
}

function loop(c: AudioContext, buf: AudioBuffer, filter: BiquadFilterType, freq: number, gain: number, out: AudioNode) {
  const src = c.createBufferSource()
  src.buffer = buf
  src.loop = true
  const f = c.createBiquadFilter()
  f.type = filter
  f.frequency.value = freq
  const g = c.createGain()
  g.gain.value = gain
  src.connect(f).connect(g).connect(out)
  src.start()
  return g
}

function every(minS: number, maxS: number, fn: () => void) {
  const next = () => {
    timers.push(setTimeout(() => { fn(); next() }, (minS + Math.random() * (maxS - minS)) * 1000))
  }
  next()
}

function tone(freq: number, dur: number, gain: number, type: OscillatorType = 'sine', at = 0, out: AudioNode | null = master) {
  if (!ctx || !out) return
  const t = ctx.currentTime + at
  const o = ctx.createOscillator()
  o.type = type
  o.frequency.value = freq
  const g = ctx.createGain()
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(gain, t + 0.005)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(out)
  o.start(t)
  o.stop(t + dur + 0.05)
}

/** One key press: a very short filtered click. */
function key(at: number, click: AudioBuffer) {
  if (!ctx || !roomGain) return
  const t = ctx.currentTime + at
  const s = ctx.createBufferSource()
  s.buffer = click
  const f = ctx.createBiquadFilter()
  f.type = 'bandpass'
  f.frequency.value = 2200 + Math.random() * 1800
  const g = ctx.createGain()
  g.gain.setValueAtTime(0.05 + Math.random() * 0.03, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03)
  s.connect(f).connect(g).connect(roomGain)
  s.start(t)
}

function bell() {
  // the classic two-ring rickshaw bell: bright partials, fast decay
  for (const at of [0, 0.16, 0.7, 0.86]) {
    tone(2350, 0.35, 0.03, 'sine', at)
    tone(3720, 0.25, 0.015, 'sine', at)
  }
}

function horn() {
  const f = 380 + Math.random() * 120
  tone(f, 0.35, 0.012, 'sawtooth')
  tone(f * 1.26, 0.35, 0.01, 'sawtooth')
}

function chirp() {
  if (!ctx || !master) return
  const n = 2 + Math.floor(Math.random() * 3)
  for (let i = 0; i < n; i++) {
    const t = ctx.currentTime + i * 0.13
    const o = ctx.createOscillator()
    o.frequency.setValueAtTime(3200 + Math.random() * 900, t)
    o.frequency.exponentialRampToValueAtTime(4800 + Math.random() * 900, t + 0.08)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.012, t + 0.01)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1)
    o.connect(g).connect(master)
    o.start(t)
    o.stop(t + 0.12)
  }
}

export function startSound() {
  if (ctx) { ctx.resume(); master?.gain.setTargetAtTime(0.9, ctx.currentTime, 0.4); return }
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  if (!AC) return
  ctx = new AC()
  master = ctx.createGain()
  master.gain.value = 0
  master.gain.setTargetAtTime(0.9, ctx.currentTime, 0.6)
  master.connect(ctx.destination)
  roomGain = ctx.createGain()
  roomGain.connect(master)

  const brown = noiseBuffer(ctx, 4, true)
  const white = noiseBuffer(ctx, 3)
  const click = noiseBuffer(ctx, 0.05)
  const fan = loop(ctx, brown, 'lowpass', 420, 0.22, roomGain)
  loop(ctx, white, 'bandpass', 520, 0.012, master) // distant traffic hiss
  loop(ctx, brown, 'lowpass', 140, 0.35, master) // low city rumble

  // typing: bursts of keys, then a pause
  every(1.5, 4.5, () => {
    const n = 8 + Math.floor(Math.random() * 22)
    let at = 0
    for (let i = 0; i < n; i++) { at += 0.07 + Math.random() * 0.12; key(at, click) }
  })
  every(9, 22, bell)
  every(18, 40, horn)
  every(4, 11, () => { const p = phaseAt(dhakaHours()); if (p === 'day' || p === 'dawn') chirp() })

  // the fan and AC hum go quiet with the lights; a soft tick when moving around
  unsub = useStore.subscribe((s, prev) => {
    if (s.lightsOn !== prev.lightsOn && ctx) fan.gain.setTargetAtTime(s.lightsOn ? 0.22 : 0.02, ctx.currentTime, 0.8)
    if ((s.stop !== prev.stop || s.focusId !== prev.focusId || s.overview !== prev.overview) && !s.intro) tone(s.focusId ? 1180 : 880, 0.08, 0.04)
    if (s.quote.length > prev.quote.length) { tone(1320, 0.12, 0.05); tone(1760, 0.18, 0.04, 'sine', 0.09) }
    if (s.coins.length > prev.coins.length) { tone(1975, 0.1, 0.05, 'triangle'); tone(2637, 0.3, 0.05, 'triangle', 0.08) } // coin
    if (s.doorOpen && !prev.doorOpen) { tone(1568, 0.6, 0.03); tone(1175, 0.9, 0.03, 'sine', 0.35) } // door chime
  })
}

export function stopSound() {
  if (!ctx || !master) return
  master.gain.setTargetAtTime(0, ctx.currentTime, 0.2)
  const c = ctx
  timers.forEach(clearTimeout)
  timers = []
  unsub?.()
  unsub = null
  setTimeout(() => { c.close(); }, 600)
  ctx = null
  master = null
  roomGain = null
}
