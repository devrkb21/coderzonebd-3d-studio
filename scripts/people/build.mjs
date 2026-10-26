// Builds the optimised avatar and animation GLBs in public/models/people from FBX2glTF output
// (see README, "People"). Needs: npm i --no-save @gltf-transform/core @gltf-transform/extensions
// @gltf-transform/functions meshoptimizer
// usage: node scripts/people/build.mjs <convDir> <texDir> <outDir>
//   convDir/av/<Rocketbox name>.glb, convDir/anim/<m|f>_<clip>.glb, texDir from textures.py
import fs from 'node:fs'
import path from 'node:path'
import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import { dedup, meshopt, mergeDocuments, prune, resample, unpartition } from '@gltf-transform/functions'
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer'

const [conv, texDir, out] = process.argv.slice(2)
await MeshoptEncoder.ready
await MeshoptDecoder.ready
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder })
fs.mkdirSync(out, { recursive: true })

const AV = {
  receptionist: 'Female_Adult_06', dev1: 'Male_Adult_17', dev2: 'Male_Adult_15', walker: 'Business_Female_01',
  ceo: 'Business_Male_05', cmo: 'Business_Male_06', guard: 'Security_Male_01',
}

for (const [key, name] of Object.entries(AV)) {
  const doc = await io.read(path.join(conv, 'av', name + '.glb'))
  const root = doc.getRoot()
  root.listAnimations().forEach((a) => a.dispose())
  for (const mat of root.listMaterials()) {
    const part = mat.getName().split('_').pop()
    const file = ['jpg', 'png'].map((e) => path.join(texDir, `${key}_${part}.${e}`)).find((f) => fs.existsSync(f))
    mat.setNormalTexture(null).setMetallicRoughnessTexture(null).setEmissiveTexture(null).setOcclusionTexture(null)
    mat.setMetallicFactor(0).setRoughnessFactor(1).setBaseColorFactor([1, 1, 1, 1])
    if (file) {
      const tex = doc.createTexture(`${key}_${part}`).setImage(fs.readFileSync(file)).setMimeType(file.endsWith('png') ? 'image/png' : 'image/jpeg')
      mat.setBaseColorTexture(tex)
    }
    if (part === 'opacity') mat.setAlphaMode('MASK').setAlphaCutoff(0.4).setDoubleSided(true)
  }
  await doc.transform(prune(), dedup(), unpartition(), meshopt({ encoder: MeshoptEncoder, level: 'medium' }))
  await io.write(path.join(out, key + '.glb'), doc)
  console.log(key, fs.statSync(path.join(out, key + '.glb')).size)
}

// Animation packs: one per body type, body bones only, rotations (+ root/pelvis translation).
const BODY = /^Bip01( Pelvis| Spine\d?| Neck| Head| [LR] (Clavicle|UpperArm|Forearm|Hand|Finger\d+|Thigh|Calf|Foot|Toe0))?$/
const TRIM = { type: 14, talk: 12, sit: 14, drink: 12 }
const CLIPS = { type: 'sit_table_idle_neutral_01', sit: 'sit_chair_idle_neutral_01', look: 'sit_table_idle_look_around', idle: 'idle_neutral_01', talk: 'gestic_talk_neutral_01', wave: 'wave_01', walk: 'walk_neutral_01', drink: 'drink_drinking' }
for (const g of ['m', 'f']) {
  let base = null
  for (const [clip, file] of Object.entries(CLIPS)) {
    const doc = await io.read(path.join(conv, 'anim', `${g}_${file}.glb`))
    const anim = doc.getRoot().listAnimations()[0]
    anim.setName(clip)
    const maxT = TRIM[clip] ?? Infinity
    for (const ch of anim.listChannels()) {
      const n = ch.getTargetNode()?.getName() ?? ''
      const p = ch.getTargetPath()
      const keep = BODY.test(n) && (p === 'rotation' || (p === 'translation' && (n === 'Bip01' || n === 'Bip01 Pelvis')))
      if (!keep) { ch.getSampler().dispose(); ch.dispose(); continue }
      const smp = ch.getSampler()
      const inp = smp.getInput().getArray()
      const n0 = inp.findIndex((t) => t > maxT)
      if (n0 > 0) {
        const outA = smp.getOutput()
        const size = outA.getElementSize()
        smp.setInput(doc.createAccessor().setType('SCALAR').setArray(inp.slice(0, n0)))
        smp.setOutput(doc.createAccessor().setType(outA.getType()).setArray(outA.getArray().slice(0, n0 * size)))
      }
    }
    if (!base) { base = doc; continue }
    const map = mergeDocuments(base, doc)
    const byName = new Map(base.getRoot().listScenes()[0].listChildren().flatMap(function walk(n) { return [n, ...n.listChildren().flatMap(walk)] }).map((n) => [n.getName(), n]))
    for (const ch of map.get(anim).listChannels()) ch.setTargetNode(byName.get(ch.getTargetNode().getName()))
    base.getRoot().listScenes().slice(1).forEach((s) => { s.listChildren().forEach(function kill(n) { n.listChildren().forEach(kill); n.dispose() }); s.dispose() })
  }
  await base.transform(resample({ tolerance: 2e-4 }), prune(), dedup(), unpartition(), meshopt({ encoder: MeshoptEncoder, level: 'medium' }))
  const f = path.join(out, `anims-${g}.glb`)
  await io.write(f, base)
  console.log(f, fs.statSync(f).size, base.getRoot().listAnimations().map((a) => a.getName() + ':' + a.listChannels().length))
}
