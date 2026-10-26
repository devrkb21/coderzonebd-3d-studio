// Builds public/models/studio-mini.glb and .usdz, the AR miniature of the studio.
// Serves scripts/ar/export.html with Vite, opens it in headless Chrome (which renders the real
// room and exports it) and writes the files the page posts back. No extra packages needed.
//   node scripts/ar/build-model.mjs          (set CHROME=/path/to/chrome if it isn't found)
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { createServer } from 'vite'

const root = fileURLToPath(new URL('../..', import.meta.url))
const outDir = path.join(root, 'public/models')
const profile = path.join(root, '.tmp/ar-chrome')

const chrome = [
  process.env.CHROME,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].find((p) => p && existsSync(p))
if (!chrome) throw new Error('Chrome not found: set CHROME to its path')

let finish
const done = new Promise((resolve, reject) => { finish = { resolve, reject } })
const timer = setTimeout(() => finish.reject(new Error('timed out after 15 minutes')), 900_000)

const body = (req) => new Promise((resolve) => {
  const chunks = []
  req.on('data', (c) => chunks.push(c))
  req.on('end', () => resolve(Buffer.concat(chunks)))
})

const server = await createServer({
  root,
  logLevel: 'warn',
  server: { port: 4193, watch: { ignored: ['**/.tmp/**', '**/public/**'] } },
  plugins: [{
    name: 'ar-save',
    configureServer(s) {
      s.middlewares.use('/__ar', async (req, res) => {
        const url = new URL(req.url, 'http://x')
        const data = await body(req)
        res.end('ok')
        if (url.pathname === '/log') console.log(' ', data.toString())
        else if (url.pathname === '/fail') finish.reject(new Error(data.toString()))
        else if (url.pathname === '/done') finish.resolve()
        else if (url.pathname === '/save') {
          const name = path.basename(url.searchParams.get('name'))
          writeFileSync(path.join(outDir, name), data)
          console.log(`  wrote public/models/${name} (${(data.length / 1024).toFixed(0)} KB)`)
        }
      })
    },
  }],
})
await server.listen()
const page = `${server.resolvedUrls.local[0]}scripts/ar/export.html?3d&nointro&lang=en&hour=11&day=sun&time=day&weather=clear`
console.log(`Exporting from ${page}`)

mkdirSync(profile, { recursive: true })
const browser = spawn(chrome, [
  '--headless=new', '--no-first-run', '--no-default-browser-check', '--mute-audio',
  '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--window-size=1280,800',
  `--user-data-dir=${profile}`, page,
], { stdio: 'ignore' })

try {
  await done
  for (const ext of ['glb', 'usdz']) {
    const f = path.join(outDir, `studio-mini.${ext}`)
    console.log(`studio-mini.${ext}: ${(statSync(f).size / 1024 / 1024).toFixed(2)} MB`)
  }
} finally {
  clearTimeout(timer)
  browser.kill()
  await server.close()
  await new Promise((r) => setTimeout(r, 500))
  rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 })
}
