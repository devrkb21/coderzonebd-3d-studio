// Injects the server-rendered 2D page into dist/index.html (see entry-server.tsx).
import { readFileSync, rmSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const { render } = await import(pathToFileURL(resolve(root, 'dist-ssr/entry-server.js')).href)
const file = resolve(root, 'dist/index.html')
const html = readFileSync(file, 'utf8')
if (!html.includes('<!--ssr-->')) throw new Error('index.html is missing the <!--ssr--> marker')
writeFileSync(file, html.replace('<!--ssr-->', render()))
rmSync(resolve(root, 'dist-ssr'), { recursive: true, force: true })
console.log('prerendered 2D page into dist/index.html')
