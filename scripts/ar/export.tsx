// The AR miniature, built from the real room: renders it without people, traffic or anything
// animated, bakes every texture small, merges meshes by material, scales the 32 m room to a
// tabletop (1:64, origin at floor centre) and exports a GLB and a USDZ. build-model.mjs serves
// this page in headless Chrome and saves what it posts.
import { Suspense, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import * as THREE from 'three'
import { Canvas, useThree } from '@react-three/fiber'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import { USDZExporter } from 'three/examples/jsm/exporters/USDZExporter.js'
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { unzipSync, zipSync, strFromU8, strToU8 } from 'three/examples/jsm/libs/fflate.module.js'
import { MeshoptSimplifier } from 'meshoptimizer'
import '../../src/fonts/anek-bangla.css'
import { Room } from '../../src/three/Room'
import { Office } from '../../src/three/Office'
import { Items } from '../../src/three/Items'
import { OfficeModels } from '../../src/three/Models'
import { Reception } from '../../src/three/Reception'
import { Cabins } from '../../src/three/Cabins'
import { ROOM } from '../../src/three/layout'
import { homeWallTexture, prepareTextures } from '../../src/three/textures'

/** Room metres → tabletop metres: the 32 m room becomes 0.5 m. */
const SCALE = 1 / 64
/** Meshes above this many triangles are simplified (the Poly Haven plants and sofa). */
const MAX_TRIS = 500
const JPEG_QUALITY = 0.75
const NAME = 'studio-mini'
const { halfW, halfD } = ROOM

const post = (path: string, body: BodyInit) => fetch(`/__ar/${path}`, { method: 'POST', body })
const log = (msg: string) => { console.log(msg); post('log', msg) }

// The exporters encode JPEGs at 0.92 and PNGs at maximum compression (minutes in headless
// Chrome); this page only exports, so use a smaller JPEG and the default PNG level.
const toBlob = HTMLCanvasElement.prototype.toBlob
HTMLCanvasElement.prototype.toBlob = function (cb, type) {
  toBlob.call(this, cb, type, type === 'image/jpeg' ? JPEG_QUALITY : undefined)
}

// ── textures ─────────────────────────────────────────────────

const pot = (n: number) => 2 ** Math.max(2, Math.floor(Math.log2(Math.max(4, n))))
const baked = new Map<string, THREE.CanvasTexture>()
/** Texture source ids that keep an alpha channel (PNG); the rest are JPEG. */
const withAlpha = new Set<number>()

/** Redraws a texture at most `max` px, with its repeat and offset baked in, so no texture transform is needed. */
function bake(tex: THREE.Texture, max: number) {
  if ((tex as THREE.VideoTexture).isVideoTexture) tex = homeWallTexture('en')
  const key = `${tex.uuid}:${max}`
  const hit = baked.get(key)
  if (hit) return hit
  const img = tex.image as HTMLCanvasElement | ImageBitmap | HTMLImageElement
  const sw = img.width, sh = img.height
  const { x: rx, y: ry } = tex.repeat
  const { x: ox, y: oy } = tex.offset
  const k = Math.min(1, max / Math.max(sw * rx, sh * ry))
  const W = pot(sw * rx * k), H = pot(sh * ry * k)
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')!
  ctx.imageSmoothingQuality = 'high'
  // map source pixels to output pixels; the pattern repeats the image wherever the repeat needs it
  const a = W / (sw * rx), d = H / (sh * ry)
  if (tex.flipY) ctx.setTransform(a, 0, 0, d, -ox * sw * a, H * (1 - (1 - oy) / ry))
  else ctx.setTransform(a, 0, 0, d, -ox * sw * a, -oy * sh * d)
  ctx.fillStyle = ctx.createPattern(img, 'repeat')!
  const y0 = tex.flipY ? (1 - oy - ry) * sh : oy * sh
  ctx.fillRect(ox * sw, y0, rx * sw, ry * sh)
  // only real cut-outs keep alpha; rounded card corners are flattened onto white (a white board is behind them)
  const px = ctx.getImageData(0, 0, W, H).data
  let clear = 0
  for (let i = 3; i < px.length; i += 4) if (px[i] < 250) clear++
  const alpha = clear > px.length / 4 * 0.06
  if (clear && !alpha) {
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.globalCompositeOperation = 'destination-over'
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, W, H)
  }
  const out = new THREE.CanvasTexture(c)
  out.flipY = tex.flipY
  out.colorSpace = tex.colorSpace
  out.userData.mimeType = alpha ? 'image/png' : 'image/jpeg'
  if (alpha) withAlpha.add(out.source.id)
  baked.set(key, out)
  return out
}

// ── materials ────────────────────────────────────────────────

type AnyMat = THREE.Material & { map?: THREE.Texture | null; color?: THREE.Color; emissive?: THREE.Color; roughness?: number; metalness?: number }
const converted = new Map<string, THREE.MeshStandardMaterial | null>()

/**
 * One PBR material per source material: lit surfaces keep colour and texture; self-lit ones
 * (screens, printed displays, signs) become emissive so they read the same in AR. Painted-on
 * shading, glows and hit areas are dropped.
 */
function convert(src: AnyMat, size: number) {
  const max = size > 20 ? 1024 : size > 2.5 ? 512 : 256
  const key = `${src.uuid}:${max}`
  if (converted.has(key)) return converted.get(key)!
  let out: THREE.MeshStandardMaterial | null = null
  const map = src.map ?? null
  const dropped = !src.visible || !src.colorWrite || src.blending === THREE.AdditiveBlending
    || (src.transparent && src.opacity < 0.02)
    || (map && src.transparent && !src.depthWrite && (map.image as { width: number }).width <= 8)
  if (!dropped) {
    const tex = map ? bake(map, max) : null
    const alpha = !!tex && withAlpha.has(tex.source.id)
    const glass = src.transparent && !map
    out = new THREE.MeshStandardMaterial({
      name: src.name || src.type.replace('Mesh', '').replace('Material', '').toLowerCase(),
      roughness: src.roughness ?? 0.9,
      metalness: Math.min(src.metalness ?? 0, 0.5),
      side: src.side,
      transparent: glass || alpha || (src.transparent && src.opacity < 0.99),
      opacity: glass ? Math.max(src.opacity, 0.22) : src.opacity,
      alphaTest: src.alphaTest,
    })
    if (src.type === 'MeshBasicMaterial') {
      out.color.set(0)
      out.emissive.copy(src.color ?? new THREE.Color(1, 1, 1))
      out.emissiveMap = tex
      if (alpha) out.map = tex
    } else {
      out.color.copy(src.color ?? new THREE.Color(1, 1, 1))
      out.map = tex
      if (src.emissive) out.emissive.copy(src.emissive)
    }
  }
  converted.set(key, out)
  return out
}

// ── geometry ─────────────────────────────────────────────────

const simplified = new Map<string, THREE.BufferGeometry>()

/** Plain float copy of an attribute (the Poly Haven models are quantized and interleaved). */
function toFloat(a: THREE.BufferAttribute | THREE.InterleavedBufferAttribute) {
  const get = [a.getX, a.getY, a.getZ, a.getW]
  const arr = new Float32Array(a.count * a.itemSize)
  for (let i = 0; i < a.count; i++) for (let c = 0; c < a.itemSize; c++) arr[i * a.itemSize + c] = get[c].call(a, i)
  return new THREE.BufferAttribute(arr, a.itemSize)
}

/** Position, normal and (when textured) uv only, never indexed; heavy meshes simplified first. */
function prepare(src: THREE.BufferGeometry) {
  let g = simplified.get(src.uuid)
  if (!g) {
    g = new THREE.BufferGeometry()
    for (const name of ['position', 'normal', 'uv']) if (src.attributes[name]) g.setAttribute(name, toFloat(src.attributes[name]))
    if (src.index) g.setIndex(src.index)
    g.groups = src.groups
    if (!g.attributes.normal) g.computeVertexNormals()
    const tris = (src.index ? src.index.count : src.attributes.position.count) / 3
    if (tris > MAX_TRIS && !src.groups.length) {
      const welded = mergeVertices(g, 1e-4)
      const pos = welded.attributes.position as THREE.BufferAttribute
      const [idx] = MeshoptSimplifier.simplify(new Uint32Array(welded.index!.array), new Float32Array(pos.array), 3, MAX_TRIS * 3, 0.05)
      welded.setIndex(new THREE.BufferAttribute(idx, 1))
      g = welded
    }
    g = g.index ? g.toNonIndexed() : g
    simplified.set(src.uuid, g)
  }
  return g
}

function slice(g: THREE.BufferGeometry, start: number, count: number, uv: boolean) {
  const out = new THREE.BufferGeometry()
  const end = Math.min(g.attributes.position.count, start + count)
  for (const name of ['position', 'normal', 'uv'] as const) {
    const a = g.attributes[name] as THREE.BufferAttribute | undefined
    if (name === 'uv' && !uv) continue
    const arr = a ? (a.array as Float32Array).slice(start * a.itemSize, end * a.itemSize) : new Float32Array((end - start) * 2)
    out.setAttribute(name, new THREE.BufferAttribute(arr, a?.itemSize ?? 2))
  }
  return out
}

/** Reverses the winding of a non-indexed geometry (for mirrored transforms). */
function flip(g: THREE.BufferGeometry) {
  for (const a of Object.values(g.attributes) as THREE.BufferAttribute[]) {
    for (let i = 0; i < a.count; i += 3) {
      for (let c = 0; c < a.itemSize; c++) {
        const t = a.array[(i + 1) * a.itemSize + c]
        a.array[(i + 1) * a.itemSize + c] = a.array[(i + 2) * a.itemSize + c]
        a.array[(i + 2) * a.itemSize + c] = t
      }
    }
  }
}

const mats = (mesh: THREE.Mesh) => (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) as AnyMat[]

/** Walks the rendered room and returns the miniature: one merged mesh per material, in tabletop metres. */
function build(scene: THREE.Scene) {
  scene.updateMatrixWorld(true)
  const buckets = new Map<THREE.MeshStandardMaterial, THREE.BufferGeometry[]>()
  const box = new THREE.Box3()
  const dim = new THREE.Vector3()
  const add = (mat: THREE.MeshStandardMaterial, g: THREE.BufferGeometry) => {
    const list = buckets.get(mat) ?? []
    list.push(g)
    buckets.set(mat, list)
  }
  scene.traverseVisible((o) => {
    const mesh = o as THREE.Mesh
    if (!mesh.isMesh || (o as THREE.SkinnedMesh).isSkinnedMesh || (o as THREE.InstancedMesh).isInstancedMesh) return
    box.setFromObject(mesh)
    // no ceiling, ceiling lights or fans (it's a dollhouse); nothing outside the shop front
    if (/^(ceiling_fan|security_camera)/.test(mats(mesh)[0].name) || box.min.y > 6.3 || box.max.x > halfW + 0.6 || box.min.x < -halfW - 0.6 || box.min.z < -halfD - 0.6 || box.max.z > halfD + 0.7) return
    const size = box.getSize(dim).x + dim.y + dim.z
    const geo = prepare(mesh.geometry)
    const groups = Array.isArray(mesh.material) && geo.groups.length ? geo.groups : [{ start: 0, count: Infinity, materialIndex: 0 }]
    for (const grp of groups) {
      const mat = convert(mats(mesh)[grp.materialIndex ?? 0], size)
      if (!mat) continue
      const part = slice(geo, grp.start, grp.count, !!(mat.map || mat.emissiveMap))
      part.applyMatrix4(mesh.matrixWorld)
      if (mesh.matrixWorld.determinant() < 0) flip(part)
      add(mat, part)
    }
  })
  // a plinth under the room and a strip of pavement in front of the shop
  const plinth = new THREE.MeshStandardMaterial({ name: 'plinth', color: '#2B2E36', roughness: 0.9 })
  const pave = new THREE.MeshStandardMaterial({ name: 'pavement', color: '#CFC8BC', roughness: 0.95 })
  // (its top sits a little below the floor and the pavement, so they never flicker against it)
  add(plinth, new THREE.BoxGeometry(halfW * 2 + 0.4, 0.3, halfD * 2 + 3.4).translate(0, -0.2, 1.5).toNonIndexed().deleteAttribute('uv'))
  add(pave, new THREE.PlaneGeometry(halfW * 2 + 0.4, 3).rotateX(-Math.PI / 2).translate(0, 0, halfD + 1.7).toNonIndexed().deleteAttribute('uv'))

  const root = new THREE.Group()
  root.name = 'CoderZoneBDStudio'
  let tris = 0
  for (const [mat, list] of buckets) {
    const merged = mergeVertices(mergeGeometries(list).scale(SCALE, SCALE, SCALE), 1e-6)
    tris += merged.index!.count / 3
    const mesh = new THREE.Mesh(merged, mat)
    mesh.name = mat.name
    root.add(mesh)
  }
  // transparent glass last, so the room behind it draws first
  root.children.sort((a, b) => Number((a as THREE.Mesh<THREE.BufferGeometry, THREE.Material>).material.transparent) - Number((b as THREE.Mesh<THREE.BufferGeometry, THREE.Material>).material.transparent))
  log(`${root.children.length} meshes, ${Math.round(tris)} triangles, ${baked.size} textures (${withAlpha.size} with alpha)`)
  return root
}

// ── USDZ ─────────────────────────────────────────────────────

/** Shortens every number in a USDA file to 4 decimals (0.1 mm on the tabletop). */
const compact = (text: string) => text.replace(/-?\d+\.\d+(?:e[-+]?\d+)?/g, (n) => String(Number(Number(n).toFixed(4))))

/**
 * Makes the USDZ smaller: USDZExporter writes every texture as PNG and every number with 7
 * decimals. Opaque textures become JPEG (Quick Look reads both) and the geometry is rounded.
 */
async function shrinkUsdz(usdz: Uint8Array) {
  const files = unzipSync(usdz)
  let usda = strFromU8(files['model.usda'])
  const out: Record<string, Uint8Array> = {}
  for (const [name, data] of Object.entries(files)) {
    if (name.startsWith('geometries/')) { out[name] = strToU8(compact(strFromU8(data))); continue }
    const m = /^textures\/Texture_(\d+)_\w+\.png$/.exec(name)
    if (!m || withAlpha.has(Number(m[1]))) { out[name] = data; continue }
    const bmp = await createImageBitmap(new Blob([data], { type: 'image/png' }))
    const c = document.createElement('canvas')
    c.width = bmp.width
    c.height = bmp.height
    c.getContext('2d')!.drawImage(bmp, 0, 0)
    const blob = await new Promise<Blob>((r) => c.toBlob((b) => r(b!), 'image/jpeg'))
    const jpg = name.replace(/\.png$/, '.jpg')
    out[jpg] = new Uint8Array(await blob.arrayBuffer())
    usda = usda.split(`@${name}@`).join(`@${jpg}@`)
  }
  out['model.usda'] = strToU8(usda)
  // model.usda first, every file 64-byte aligned (as USDZExporter does)
  const ordered: Record<string, Uint8Array | [Uint8Array, { extra: Record<number, Uint8Array> }]> = { 'model.usda': out['model.usda'] }
  for (const name of Object.keys(out)) if (name !== 'model.usda') ordered[name] = out[name]
  let offset = 0
  for (const name of Object.keys(ordered)) {
    const file = ordered[name] as Uint8Array
    offset += 34 + name.length
    const mod = offset & 63
    if (mod !== 4) ordered[name] = [file, { extra: { 12345: new Uint8Array(64 - mod) } }]
    offset = file.length
  }
  return zipSync(ordered, { level: 0 })
}

// ── page ─────────────────────────────────────────────────────

async function run(scene: THREE.Scene) {
  await MeshoptSimplifier.ready
  const root = build(scene)
  const glb = await new GLTFExporter().parseAsync(root, { binary: true }) as ArrayBuffer
  await post(`save?name=${NAME}.glb`, glb)
  const usdz = await new USDZExporter().parseAsync(root, { quickLookCompatible: true, maxTextureSize: 1024 })
  await post(`save?name=${NAME}.usdz`, await shrinkUsdz(usdz))
  await post('done', 'ok')
}

function Exporter() {
  const scene = useThree((s) => s.scene)
  useEffect(() => {
    // let the displays get their textures and settle first
    const t = setTimeout(() => run(scene).catch((e) => post('fail', String(e?.stack ?? e))), 2500)
    return () => clearTimeout(t)
  }, [scene])
  return null
}

window.addEventListener('error', (e) => post('fail', String(e.error?.stack ?? e.message)))
window.addEventListener('unhandledrejection', (e) => post('fail', String(e.reason?.stack ?? e.reason)))

prepareTextures('en', import.meta.env.BASE_URL, () => {}).then(() => {
  createRoot(document.getElementById('root')!).render(
    <Canvas flat camera={{ position: [0, 20, 30], fov: 50 }}>
      <ambientLight intensity={1.5} />
      <Room />
      <Office />
      <Items />
      <Suspense fallback={null}>
        <OfficeModels />
        <Reception />
        <Cabins />
        <Exporter />
      </Suspense>
    </Canvas>,
  )
})
