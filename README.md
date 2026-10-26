# Coder Zone BD · 3D Studio

A walk-through 3D office and showroom for [Coder Zone BD](https://coderzonebd.com), a software studio in Khulna. Visitors look around the studio, fly between eight sections, open any service, product or project, build a quote list, and send it on WhatsApp. The site is in English by default, with a Bangla toggle.

**Live:** https://3d.coderzonebd.com/

![Home wall](docs/home.jpg)
![Glass entrance with the street outside](docs/entrance.jpg)
![Night, office lights off, reflective floor](docs/night.jpg)
![Service card with its panel and Add to quote](docs/service.jpg)
![Work wall with real screenshots](docs/work.jpg)
![Phone: bottom sheets, quote list](docs/mobile.jpg)

## What's in the room

| # | Section | Where | What it shows |
| --- | --- | --- | --- |
| 1 | Home | back wall, centre | Logo wall with the headline and stats. Its panel covers the company and why to choose us |
| 2 | Services | left wall, hanging rail | 8 cards. Each panel has what you get, an approximate price, duration, proof projects, **Add to quote** and WhatsApp buttons |
| 3 | Products | back-left plinth | CZ Commerce, CheckoutGuard, Laravel Ecom and CZ Social (coming soon), with real logos, pricing and links |
| 4 | Work | back-right wall | 13 projects. The live sites use real screenshots; projects without a public site get a neutral name + stack card |
| 5 | Tech Stack | left wall, front | A board of the real logos of the tools we use (Laravel, React, Flutter, WordPress, …) |
| 6 | Courier Check | centre kiosk | The free courier-history tool, with the real courier logos. **Check now** opens coderzonebd.com/courier-check |
| 7 | Process | right wall | Discover → Design & Build → Launch → Support |
| 8 | Contact | front-right desk | Contact details, team and FAQ. The quote list opens from here |

Brand: the real Coder Zone BD logo and wordmark, orange `#FF931E` on ink `#12141C`.

### A living office

- **Real Bangladesh time.** Through the windows and the glass entrance, the street follows the time in Dhaka (GMT+6): dawn, day, dusk and night, with the sun or moon, lit building windows and street lights after dark. `?time=day|dawn|dusk|night` forces a phase.
- **Street life.** Cars, a bus, green CNG auto-rickshaws and cycle rickshaws with painted hoods (the riders pedal, the wheels turn) pass outside. People walk along both pavements, and birds cross the sky by day.
- **The team at work.** Two people type at their desks (and stretch now and then), while a third walks between the coffee corner and the lounge, sipping from a mug.
- **Everything moves a little.** Ceiling fans spin, the AC louver sweeps, steam rises from a coffee cup, the router's lights blink, code scrolls on the monitors, the plants sway and the service cards swing gently on their wires. Turn the lights off and the fans wind down too.
- **Digital clock.** An LED clock centred above the Home wall shows Dhaka time with ticking seconds, a blinking colon and the date.
- **Glass entrance.** Double glass doors in slim black frames, with tall orange pulls and an etched "CODER ZONE BD" band, set in walnut and oak-slat panels. The street shows through.
- **Office furniture.** Two workstations with code on the monitors, a lounge with a sofa and floor lamp, a bookshelf, a coffee corner, plants, and a wall clock showing Dhaka time.
- **Premium finish.** Recessed ceiling light strips with a soft glow, a satin floor that reflects the displays (desktop only), and frosted-glass controls.
- **Intro.** On the first visit of a session the camera starts across the street, crosses to the storefront (backlit sign, orange canopy, glass doors), the doors swing open with a chime and the camera walks in. **Skip intro**, Esc or Enter skips it; it never plays with reduced motion, a deep link or `?nointro`.
- **Real 3D models.** The lounge sofa, armchair, coffee and side tables, potted plants, ceiling fans, desk lamp, framed art and the CCTV camera are real CC0 models from Poly Haven. **CZ Bot**, the robot receptionist by the quote desk, waves when you arrive at Contact or hover it, gives a thumbs-up when you add to the quote, and opens the AI receptionist chat when clicked (Contact, when the AI is off).
- **Baked-looking light.** Soft contact shadows under everything on the floor (live on desktop, rendered once on phones), shading where walls meet the ceiling and each other, and sunlight patches through the windows that follow the time of day.
- **Sound** (off until you turn it on, top bar). Synthesised live with Web Audio, so there are no sound files: fan and AC hum, distant traffic, keyboard typing, rickshaw bells, the odd horn, birds by day, a door chime, and soft ticks when you move around.

## How to explore

| Desktop | Phone | What it does |
| --- | --- | --- |
| Drag | Drag with one finger | Look around, all 360° |
| Scroll | Pinch | Zoom in and out (lens zoom, so the camera never goes through a wall) |
| Click | Tap | Open an item, or click a section's empty space to fly there |
| Esc | | Step back one level: close the help, the quote list or the panel, then show the whole studio |
| ← → | | Previous / next section (inside a panel: previous / next item) |
| 1 – 8 | | Jump straight to a section |
| T | ▶ Tour button | Auto tour through every section; any click, drag, scroll or key stops it |
| L | Light switch by the door | Office lights on / off (daylight through the windows stays) |
| ? or H | ? button | The "How to explore" help |
| O | ⌂ button | Overview of the whole studio |

On desktop, a label next to the pointer says what you're about to open ("Go to Work →", the service name, and so on).

Things to click in the office: the **wall clock** tells you the time in Dhaka, the **coffee machine** takes you to Contact, the **monitors** take you to Work, the **door** shows the whole studio, and the **switch** by the door turns the lights off.

Clicking an item zooms to it and opens a side panel; on phones the panel is a bottom sheet. The quote list (top right) collects services, then takes a name, phone, budget and note. **Send on WhatsApp** opens `wa.me/8801885660190` with the whole list prefilled, and **Send by email** is the fallback.

## AI: receptionist chat, live site builder, live visitors

A small Cloudflare Worker (`worker/`, deployed as **https://cz3d-api.electroherebd.workers.dev**) runs the AI and the live presence. The site only shows AI features when it is built with `VITE_API_URL` set (the GitHub workflow sets it; locally, `cp .env.example .env.local`). Without it the site is exactly as before.

- **Chat** (`src/components/Chat.tsx`). The **Chat with us** button and a click on CZ Bot open the AI front-desk receptionist. `openChat('ceo' | 'cmo')` in the store opens **Rakib's assistant** (CEO · CTO office: tech, architecture, timelines) or **Barek's assistant** (CMO · CFO office: prices, packages, payment). The assistants speak for the founders' offices and never pretend to be them. Replies stream in, in the visitor's language (Bangla, English or Banglish), with quick-reply chips. The assistant can add services to the quote list, fly the camera to a section, and show a WhatsApp button prefilled with a summary (it never sends anything itself). Replies can be read aloud (a Bangla voice when the browser has one) and there's a push-to-talk mic (Bangla or English, following the site language) where the browser supports speech recognition; both buttons are hidden where it doesn't. Esc closes the chat first. Conversations last for the browser session only.
- **Build my site live** (`src/three/DemoScreen.tsx`, `src/ai/DemoPanel.tsx`). A big screen faces the entrance, mirroring the courier kiosk (it's behind the camera at every section, so it never blocks a view; it shows in the overview). Click it, or **Build my site live**, and the camera flies over. The visitor types a business name, what they sell and a note; the screen types out the HTML as the AI writes it, then shows the finished e-commerce home page mock-up. **Make this real** adds E-commerce Store to the quote list and opens it; **Talk on WhatsApp** and **Open full size** are next to it. The mock-up runs in an iframe with `sandbox=""` and a CSP that blocks every script and network request.
- **Live visitors** (`src/three/Ghosts.tsx`, `src/ai/presence.tsx`). Every open studio sends only its camera position and heading, about twice a second while it moves. Other visitors appear as soft translucent figures (they fade out when they stand where you are), and a chip shows "N people in the studio now". The socket closes while the tab is hidden.
- **Knowledge.** The assistants know only what's in `src/content.ts` (services, prices, durations, products and plans, work, process, FAQ, contacts, address): `worker/src/knowledge.ts` builds their facts from it when the Worker is deployed. After changing content, redeploy the Worker. They're told never to invent prices, clients or promises and to say the team will confirm.

### Worker endpoints

| Endpoint | What it does |
| --- | --- |
| `POST /chat` | `{ persona, lang, messages }` → server-sent events: `{t:'text'}`, `{t:'tool', name, input}`, `{t:'done'}` or `{t:'error'}`. Tool calls run in the browser; the Worker answers them and lets the model finish its reply. |
| `POST /demo` | `{ name, type, description, lang }` → server-sent events `{t:'html'}` with one self-contained HTML page (inline CSS, no scripts, no external URLs). |
| `GET /presence` | WebSocket. Send `{ p: [x, y, z, heading] }`; receive `{ you }` once, then `{ n, v: [[id, x, y, z, heading], ...] }`. |
| `GET /health` | `{ ok, ai }`: whether the API key is set. |

Models: `claude-sonnet-5-5` for chat and the site builder (both at low effort, with server-side refusal fallback), set in `worker/wrangler.jsonc`. The big shared system prompt (rules + facts) is prompt-cached. Without the API key, `/chat` and `/demo` answer `503 { error: 'not_configured' }` and the site shows a polite note with a WhatsApp button instead.

### Limits that protect the API credit

All in `worker/wrangler.jsonc` (`vars`), counted in a Durable Object:

| Limit | Default |
| --- | --- |
| Chat messages per visitor (by IP hash) per hour | 30 |
| Site demos per visitor per hour | 5 |
| Chat messages per day, everyone together | 600 |
| Site demos per day, everyone together | 60 |
| Request body / one message / whole history | 16 KB / 1,000 chars / 6,000 chars (last 16 turns) |
| Demo inputs | name and type 60 chars, note 400 |
| Output | chat 2,000 tokens, demo 16,000 tokens |
| Live visitors per room | 60 sockets, 40 shown |

Over a limit, the visitor gets a friendly `429` message in their language. Only `https://3d.coderzonebd.com` and `http://localhost:*` may call the Worker (CORS and an Origin check), set in `ALLOWED_ORIGINS`.

### Set up and deploy the Worker

```bash
cd worker
npm ci
npx wrangler secret put ANTHROPIC_API_KEY   # paste the key when asked; it's stored only in Cloudflare
npx wrangler deploy                         # after changing worker/ or src/content.ts
npx wrangler tail                           # live logs
```

## 2D version, SEO and slow devices

- All of the content is also plain semantic HTML (`src/flat/FlatSite.tsx`). It is **prerendered into `index.html` at build time**, so search engines and slow connections get the full text before any JavaScript runs.
- **Skip 3D** in the top bar switches to that 2D page. The site starts in 2D automatically when WebGL is missing or software-only, when the device has less than 3 GB of memory, or when Save-Data is on. A visitor's own choice is remembered.
- In 3D, the render resolution adapts to the frame rate instead of dropping to 2D. If the GPU loses the WebGL context, the canvas rebuilds itself.
- In 3D mode the 2D page stays in the DOM (visually hidden) for screen readers. Keyboard users who tab into it get it as a full overlay.
- With reduced motion turned on, the camera jumps between sections instead of flying.
- `?2d` / `?3d` / `?lang=bn` / `?time=night` in the URL force a mode, language or time of day.

**Weight:** in 2D mode, three.js is never downloaded. 3D adds about 300 KB gzipped of JS plus the screenshots and logos. Everything else in the room is drawn on `<canvas>` at runtime.

## Stack

Vite, React 18, TypeScript, React Three Fiber + drei (`CameraControls` for the camera, `MeshReflectorMaterial` for the floor, `PerformanceMonitor` for adaptive resolution), zustand, and the self-hosted Anek Bangla font (OFL, `src/fonts/OFL.txt`).

| File | What's in it |
| --- | --- |
| `src/content.ts` | All text (English + Bangla), prices, products, projects, process, FAQ, contacts, UI strings |
| `src/store.ts` | App state: section, focus, overview, tour, lights, help, quote list |
| `src/three/Room.tsx` | Walls, floor, ceiling lights, displays, glass entrance, light switch |
| `src/three/Office.tsx` | Furniture, wall clock, clickable office objects |
| `src/three/Life.tsx` | The animated team, fans, AC, steam, router, digital clock |
| `src/three/Street.tsx` | Rickshaws, CNGs, pedestrians, birds |
| `src/three/Models.tsx` | Real 3D models and the CZ Bot receptionist |
| `src/audio.ts` | The synthesised office and street sound |
| `src/three/Outside.tsx` | Sky, buildings, street, traffic, day/night |
| `src/three/CameraRig.tsx` | Camera moves, look-around, zoom, overview |
| `src/components/Interact.tsx` | Keyboard shortcuts, auto tour, pointer label, help overlay |
| `src/components/Chat.tsx` | The AI chat panel: receptionist and the founders' assistants, voice in and out |
| `src/ai/` | Worker client and tool calls, the site builder's state and panel, live presence |
| `src/three/DemoScreen.tsx`, `src/three/Ghosts.tsx` | The "Build my site live" screen, other live visitors |
| `worker/` | The Cloudflare Worker: chat, site builder, presence, rate limits |

## 3D models and credits

All models are CC0 (public domain), in `public/models/`, meshopt-compressed with textures cut to 512 px (about 2.9 MB in total, loaded after the room appears):

- Furniture, plants and props: [Poly Haven](https://polyhaven.com/models) (CC0)
- CZ Bot: "RobotExpressive" by Tomás Laulhé / [Quaternius](https://quaternius.com), via the three.js examples (CC0)

To add one: download the glTF from Poly Haven at 1k, shrink its textures, then run `gltf-transform optimize in.gltf public/models/name.glb --compress meshopt --texture-compress false`, and place it in `src/three/Models.tsx`.

## Edit the content

Everything is in **`src/content.ts`**. The 3D room, the panels and the 2D page all read from it.

- Add a service or project and it gets a place on the rail or the wall automatically (`src/three/layout.ts`).
- To give a project a real screenshot, save `public/work/<id>.jpg` (960×600) and `public/work/<id>-thumb.jpg` (512×320), then set `shot: true`.
- Logos live in `public/logos/`.
- Testimonials are off on purpose. Once there are real ones, fill `TESTIMONIALS` and set `SHOW_TESTIMONIALS = true`.

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:5173/

`npm run build` type-checks, builds, server-renders the 2D page into `dist/index.html`, and writes everything to `dist/`.

## Deploy

Every push to `main` triggers `.github/workflows/deploy.yml`, which builds the site and publishes it to GitHub Pages at **3d.coderzonebd.com** (`public/CNAME`). The site builds at the root path by default; set `BASE_PATH=/repo-name/` to host it under a project path instead.
