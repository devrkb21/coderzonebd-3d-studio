// Records footage of the live 3D site frame by frame under a virtual clock (vclock.js),
// so every shot is a smooth 30 fps whatever this machine's GPU manages in real time.
//   node record.cjs <shot,shot|all> [vertical]
// Env: PUPPETEER = path to a puppeteer-core install, CHROME = Chrome executable.
const fs = require('fs')
const path = require('path')
const { execFileSync } = require('child_process')
const puppeteer = require(process.env.PUPPETEER || 'puppeteer-core')

const SITE = process.env.SITE || 'https://3d.coderzonebd.com/'
const vertical = process.argv[3] === 'vertical'
const OUT = path.resolve(__dirname, '..', vertical ? 'footage-9x16' : 'footage')
const TMP = process.env.REC_TMP || path.resolve(__dirname, '..', '.frames')
const VIEW = vertical
  ? { width: 540, height: 960, deviceScaleFactor: 2, isMobile: true, hasTouch: false }
  : { width: 1920, height: 1080, deviceScaleFactor: 1 }
const FPS = 30
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const ease = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2)

// Each shot: query string, setup in real time (pre), then frame-stepped actions (run).
const SHOTS = {
  intro: { q: '?3d&time=day', intro: true, run: async (a) => { await a.frames(300) } },
  tour: { q: '?3d&nointro&time=day', run: async (a) => { await a.key('t'); await a.frames(960) } },
  robot: { q: '?3d&nointro&time=day', pre: async (a) => { await a.key('5'); await sleep(4000) }, run: async (a) => { await a.key('8'); await a.frames(210) } },
  overview: { q: '?3d&nointro&time=day', pre: async (a) => { await a.key('o'); await sleep(4000) }, run: async (a) => { await a.frames(20); await a.drag(0.55, 0, 240); await a.frames(30) } },
  // from the tech board, turn toward the front window: the street, cars, rickshaws and CNGs going by
  street: { q: '?3d&nointro&time=day', pre: async (a) => { await a.key('5'); await sleep(4500) }, run: async (a) => { await a.frames(15); await a.dragH(0.6, 0, 120); await a.frames(225) } },
  night: { q: '?3d&nointro&time=night', pre: async (a) => { await a.key('o'); await sleep(4000) }, run: async (a) => { await a.drag(-0.4, 0, 240); await a.frames(30) } },
  team: { q: '?3d&nointro&time=day', pre: async (a) => { await a.key('4'); await sleep(4000) }, run: async (a) => { await a.drag(0.35, 0.02, 200); await a.frames(90) } },
}

async function record(browser, name) {
  const shot = SHOTS[name]
  const ctx = await browser.createBrowserContext()
  const page = await ctx.newPage()
  await page.setViewport(VIEW)
  await page.evaluateOnNewDocument(fs.readFileSync(path.join(__dirname, 'vclock.js'), 'utf8'))
  page.on('pageerror', (e) => console.error(`[${name}] page error:`, e.message))
  const cdp = await page.createCDPSession()
  const dir = path.join(TMP, name + (vertical ? '-v' : ''))
  fs.rmSync(dir, { recursive: true, force: true })
  fs.mkdirSync(dir, { recursive: true })
  let n = 0
  const grab = async () => {
    await page.evaluate((dt) => window.__vclock.step(dt), 1000 / FPS)
    const shotOpts = { format: 'jpeg', quality: 93 }
    // device pixels for the phone viewport (DPR 2 → 1080×1920)
    if (VIEW.deviceScaleFactor > 1) shotOpts.clip = { x: 0, y: 0, width: VIEW.width, height: VIEW.height, scale: VIEW.deviceScaleFactor }
    const { data } = await cdp.send('Page.captureScreenshot', shotOpts)
    fs.writeFileSync(path.join(dir, `f${String(n++).padStart(5, '0')}.jpg`), Buffer.from(data, 'base64'))
  }
  const W = VIEW.width
  const H = VIEW.height
  const api = {
    frames: async (k) => { for (let i = 0; i < k; i++) await grab() },
    key: async (k) => { await page.keyboard.press(k) },
    // drag by a fraction of the viewport height (camera-controls turns by pixels / element height)
    dragH: async (fx, fy, k) => api.drag((fx * H) / W, fy, k),
    // drag across a fraction of the width/height over k frames (look around)
    drag: async (fx, fy, k) => {
      const x = W / 2, y = H * 0.45
      await page.mouse.move(x, y)
      await page.mouse.down()
      for (let i = 1; i <= k; i++) {
        const e = ease(i / k)
        await page.mouse.move(x + fx * W * e, y + fy * H * e, { steps: 1 })
        await grab()
      }
      await page.mouse.up()
    },
  }
  await page.goto(SITE + shot.q, { waitUntil: 'domcontentloaded', timeout: 120000 })
  await page.waitForFunction(() => document.querySelector('canvas') && !/Setting up the studio|স্টুডিও সাজানো/.test(document.body.innerText), { timeout: 180000, polling: 100 })
  if (!shot.intro) {
    await sleep(3000)
    if (shot.pre) await shot.pre(api)
  }
  await page.evaluate(() => window.__vclock.manual())
  await shot.run(api)
  await ctx.close()
  fs.mkdirSync(OUT, { recursive: true })
  const out = path.join(OUT, `${name}.mp4`)
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-framerate', String(FPS), '-i', path.join(dir, 'f%05d.jpg'), '-pix_fmt', 'yuv420p', '-c:v', 'libx264', '-crf', '15', '-preset', 'medium', out])
  console.log(`${name}: ${n} frames → ${out}`)
  fs.rmSync(dir, { recursive: true, force: true })
}

;(async () => {
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: 'new',
    args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11', '--hide-scrollbars', '--mute-audio', '--autoplay-policy=no-user-gesture-required'],
  })
  const which = process.argv[2] === 'all' ? Object.keys(SHOTS) : process.argv[2].split(',')
  for (const name of which) await record(browser, name)
  await browser.close()
})().catch((e) => { console.error(e); process.exit(1) })
