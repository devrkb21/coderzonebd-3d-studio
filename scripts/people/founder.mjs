// Packs a founder's own photo avatar (a rigged GLB, e.g. from Avaturn) and a few animation clips
// for that rig (e.g. from Mixamo) into public/models/people/<ceo|cmo>.glb for the cabins: the
// clips are renamed to what the room plays, matched to the avatar's bones by name, the root
// motion is rescaled to the avatar's height, big textures are cut to 1k, and it's all
// meshopt-compressed. See README, "Real faces for the founders".
//
// Needs: npm i --no-save @gltf-transform/core @gltf-transform/extensions @gltf-transform/functions meshoptimizer sharp
// usage: node scripts/people/founder.mjs <avatar.glb> <clipsDir> <out.glb>
//   clipsDir: GLBs named after the clip they become. type.glb is required (Mixamo "Typing");
//   look.glb (e.g. Mixamo "Sitting Idle"), idle.glb, talk.glb and wave.glb are optional.
//   Convert Mixamo FBX downloads first: npx fbx2gltf -b -i Typing.fbx -o clips/type
import fs from 'node:fs'
import path from 'node:path'
import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import { dedup, meshopt, mergeDocuments, prune, resample, textureCompress, unpartition } from '@gltf-transform/functions'
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer'

const CLIPS = ['type', 'look', 'idle', 'talk', 'wave']
const [avatarFile, clipsDir, out] = process.argv.slice(2)
if (!out) {
  console.error('usage: node scripts/people/founder.mjs <avatar.glb> <clipsDir> <out.glb>')
  process.exit(1)
}
await MeshoptEncoder.ready
await MeshoptDecoder.ready
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder })

/** Bone names compared without a Mixamo prefix, spaces or case. */
const norm = (n) => n.replace(/^mixamorig\d*[:_]?/i, '').replace(/[\s_:.]/g, '').toLowerCase()
const walk = (n) => [n, ...n.listChildren().flatMap(walk)]

const doc = await io.read(avatarFile)
const root = doc.getRoot()
root.listAnimations().forEach((a) => a.dispose())
const bones = new Map(root.listScenes().flatMap((s) => s.listChildren().flatMap(walk)).map((n) => [norm(n.getName()), n]))

for (const clip of CLIPS) {
  const file = path.join(clipsDir, `${clip}.glb`)
  if (!fs.existsSync(file)) {
    if (clip === 'type') throw new Error(`missing ${file}`)
    continue
  }
  const src = await io.read(file)
  const anim = src.getRoot().listAnimations()[0]
  if (!anim) throw new Error(`${file} has no animation`)
  anim.setName(clip)
  // The top-most animated bone (Hips on Mixamo rigs) keeps its translation, scaled to this body.
  const animated = new Set(anim.listChannels().map((c) => c.getTargetNode()))
  const top = [...animated].find((n) => n && !n.listParents().some((p) => animated.has(p)))
  const target = top && bones.get(norm(top.getName()))
  const k = target && top.getTranslation()[1] ? target.getTranslation()[1] / top.getTranslation()[1] : 1
  for (const ch of anim.listChannels()) {
    const node = ch.getTargetNode()
    const p = ch.getTargetPath()
    const keep = node && bones.has(norm(node.getName())) && (p === 'rotation' || (p === 'translation' && node === top))
    if (!keep) { ch.getSampler()?.dispose(); ch.dispose(); continue }
    if (p === 'translation' && k !== 1) {
      const outA = ch.getSampler().getOutput()
      outA.setArray(outA.getArray().map((v) => v * k))
    }
  }
  const map = mergeDocuments(doc, src)
  for (const ch of map.get(anim).listChannels()) ch.setTargetNode(bones.get(norm(ch.getTargetNode().getName())))
  root.listScenes().slice(1).forEach((s) => { s.listChildren().flatMap(walk).forEach((n) => n.dispose()); s.dispose() })
  console.log(`${clip}: ${map.get(anim).listChannels().length} channels`)
}

let sharp = null
try { sharp = (await import('sharp')).default } catch { console.warn('sharp not installed: textures kept at their size') }
await doc.transform(
  resample({ tolerance: 2e-4 }),
  ...(sharp ? [textureCompress({ encoder: sharp, resize: [1024, 1024] })] : []),
  prune(), dedup(), unpartition(), meshopt({ encoder: MeshoptEncoder, level: 'medium' }),
)
await io.write(out, doc)
console.log(`${out}: ${(fs.statSync(out).size / 1024 / 1024).toFixed(2)} MB`)
