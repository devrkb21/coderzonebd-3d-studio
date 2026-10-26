// Re-renders the Home wall film in both languages and writes the web files to public/video.
//   cd video/home && node render.mjs        (needs Node 22+, FFmpeg, and Chrome via `npx hyperframes browser ensure`)
import { execFileSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'

const run = (cmd, args) => execFileSync(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32' })
const out = '../../public/video'
mkdirSync('renders', { recursive: true })
mkdirSync(out, { recursive: true })

for (const lang of ['en', 'bn']) {
  const master = `renders/home-${lang}-master.mp4`
  const vars = JSON.stringify({ lang })
  // with shell: true (Windows) the JSON needs its own quoting
  const varsArg = process.platform === 'win32' ? `"${vars.replace(/"/g, '\\"')}"` : vars
  run('npx', ['hyperframes', 'render', '--quality', 'delivery', '--fps', '30', '--variables', varsArg, '--output', master])
  const x264 = ['-c:v', 'libx264', '-preset', 'veryslow', '-tune', 'animation', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-g', '90', '-movflags', '+faststart', '-an']
  // 1600×900 for desktop, 1280×720 for phones, and a poster (the headline, landed)
  run('ffmpeg', ['-y', '-v', 'error', '-i', master, ...x264, '-crf', '25', `${out}/home-${lang}.mp4`])
  run('ffmpeg', ['-y', '-v', 'error', '-i', master, '-vf', 'scale=1280:720:flags=lanczos', ...x264, '-crf', '24', `${out}/home-${lang}-720.mp4`])
  run('ffmpeg', ['-y', '-v', 'error', '-ss', '6.6', '-i', master, '-frames:v', '1', '-q:v', '4', `${out}/home-${lang}.jpg`])
}
