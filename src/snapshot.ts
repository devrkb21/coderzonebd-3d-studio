/** Set by the 3D scene (three/Snapshot.tsx) while it is on screen; kept here so 2D never loads three.js. */
export const snap: { grab: (() => HTMLCanvasElement | null) | null } = { grab: null }

/** A copy of the current 3D view, or null when the room isn't on screen. */
export const snapshot = () => snap.grab?.() ?? null
