// Injected before the site loads: a virtual clock behind performance.now, Date.now,
// requestAnimationFrame and timers. It runs at real speed while the studio loads
// ("real" mode); in "manual" mode the recorder advances it exactly one frame at a time,
// so the footage is a smooth 30 fps no matter how fast this machine renders.
;(() => {
  const realRaf = window.requestAnimationFrame.bind(window)
  const realNow = performance.now.bind(performance)
  const dateZero = Date.now()
  let now = realNow()
  let rafs = new Map()
  let rafId = 0
  let timers = []
  let timerId = 0
  performance.now = () => now
  Date.now = () => dateZero + now
  window.requestAnimationFrame = (cb) => { rafs.set(++rafId, cb); return rafId }
  window.cancelAnimationFrame = (id) => { rafs.delete(id) }
  const add = (cb, ms, args, every) => { timers.push({ id: ++timerId, at: now + Math.max(0, +ms || 0), cb, args, every }); return timerId }
  window.setTimeout = (cb, ms, ...args) => add(cb, ms, args, 0)
  window.setInterval = (cb, ms, ...args) => add(cb, ms, args, Math.max(1, +ms || 1))
  window.clearTimeout = window.clearInterval = (id) => { timers = timers.filter((t) => t.id !== id) }
  const step = (dt) => {
    const target = now + dt
    for (;;) {
      timers.sort((a, b) => a.at - b.at)
      const t = timers[0]
      if (!t || t.at > target) break
      now = Math.max(now, t.at)
      if (t.every) t.at += t.every
      else timers.shift()
      try { typeof t.cb === 'function' ? t.cb(...t.args) : eval(t.cb) } catch (e) { console.error(e) }
    }
    now = target
    const due = rafs
    rafs = new Map()
    for (const cb of due.values()) { try { cb(now) } catch (e) { console.error(e) } }
  }
  let mode = 'real'
  let last = realNow()
  const pump = () => {
    const t = realNow()
    if (mode === 'real') step(Math.min(t - last, 100))
    last = t
    realRaf(pump)
  }
  realRaf(pump)
  window.__vclock = { manual: () => { mode = 'manual' }, real: () => { mode = 'real'; last = realNow() }, step }
})()
