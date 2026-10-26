// Live weather in Khulna from Open-Meteo (free, no key), cached for 15 minutes.
// Any failure falls back to a clear sky. `?weather=clear|cloudy|rain|storm|fog` forces a state.
import { create } from 'zustand'

export type Weather = 'clear' | 'cloudy' | 'rain' | 'storm' | 'fog'

const KHULNA = { lat: 22.8456, lon: 89.5403 }
const CACHE_KEY = 'cz3d-weather'
const TTL = 15 * 60_000
const KINDS: Weather[] = ['clear', 'cloudy', 'rain', 'storm', 'fog']

/** WMO weather code → one of the states the street can show. */
export function weatherFromCode(code: number): Weather {
  if (code >= 95) return 'storm'
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rain'
  if (code === 45 || code === 48) return 'fog'
  if (code === 2 || code === 3 || (code >= 71 && code <= 77) || code === 85 || code === 86) return 'cloudy'
  return 'clear'
}

function forced(): Weather | null {
  if (typeof location === 'undefined') return null
  const w = new URLSearchParams(location.search).get('weather') as Weather | null
  return w && KINDS.includes(w) ? w : null
}

function cached(): { kind: Weather; at: number } | null {
  try {
    const c = JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null') as { kind: Weather; at: number } | null
    return c && KINDS.includes(c.kind) ? c : null
  } catch { return null }
}

export const useWeather = create<{ kind: Weather }>(() => ({ kind: forced() ?? cached()?.kind ?? 'clear' }))

async function refresh() {
  const c = cached()
  if (c && Date.now() - c.at < TTL) { useWeather.setState({ kind: c.kind }); return }
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${KHULNA.lat}&longitude=${KHULNA.lon}&current=weather_code&timezone=Asia%2FDhaka`
    const res = await fetch(url)
    if (!res.ok) return
    const data = await res.json() as { current?: { weather_code?: number } }
    const code = data.current?.weather_code
    if (typeof code !== 'number') return
    const kind = weatherFromCode(code)
    useWeather.setState({ kind })
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ kind, at: Date.now() })) } catch { /* storage unavailable */ }
  } catch { /* offline or blocked: keep what we have */ }
}

let started = false
/** Starts following the live weather (once); re-checked every 15 minutes. */
export function followWeather() {
  if (started || typeof window === 'undefined' || forced()) return
  started = true
  refresh()
  setInterval(refresh, TTL)
}

const strikes = new Set<() => void>()
/** A lightning flash happened (storm); thunder follows in audio.ts. */
export function strike() { strikes.forEach((f) => f()) }
export function onStrike(f: () => void) { strikes.add(f); return () => { strikes.delete(f) } }
