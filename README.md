# Coder Zone BD · 3D Studio

A walk-through 3D office and showroom for [Coder Zone BD](https://coderzonebd.com), a software studio in Khulna. Visitors look around the studio, meet the team, fly between nine sections, open any service, product or project, build a quote list, and send it on WhatsApp. The site is in English by default, with a Bangla toggle.

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
| 1 | Home | back wall, centre | A looping 23-second brand film: the logo builds in, the headline, the stats count up, the four service lines and the four products, then Khulna · since 2024 and the WhatsApp call to action. Its panel covers the company and why to choose us |
| 2 | CZ Commerce | centre of the room, facing the entrance | The flagship product's launchpad: a booth with a slideshow screen (the hook, features, pricing, coupon CZ50), the floating CZ Commerce logo and a phone showing a store. Its panel has the pitch, **Start free** (czcommerce.app) and WhatsApp setup help. The AI receptionist recommends it to Facebook sellers |
| 3 | Services | left wall, hanging rail | 8 cards. Each panel has what you get, an approximate price, duration, proof projects, **Add to quote** and WhatsApp buttons |
| 4 | Products | back-left plinth | CZ Commerce, CheckoutGuard, Laravel Ecom (lifetime, self-hosted), CZ Social and TinyBot (both coming soon), with real logos, pricing and links |
| 5 | Work | back-right wall | 13 projects. The live sites use real screenshots; projects without a public site get a neutral name + stack card |
| 6 | Tech Stack | left wall, front | A board of the real logos of the tools we use (Laravel, React, Flutter, WordPress, …) |
| 7 | Courier Check | centre kiosk | The free courier-history tool, with the real courier logos. **Check now** opens coderzonebd.com/courier-check |
| 8 | Process | right wall | Discover → Design & Build → Launch → Support |
| 9 | Contact | front-right desk | Contact details, team and FAQ. The quote list opens from here |
| 10 | Leadership | front-left glass cabins | The two founders, Rakib Uddin (CEO · CTO) and Barek Mian (CMO · CFO), each at a desk with an AI assistant on a screen and a **Book a call** tablet. The panel introduces them and opens either assistant's chat or the booking dialog |

Brand: the real Coder Zone BD logo and wordmark, orange `#FF931E` on ink `#12141C`.

### A living office

- **Real Bangladesh time.** Through the windows and the glass entrance, the street follows the time in Dhaka (GMT+6): dawn, day, dusk and night, with the sun or moon, lit building windows and street lights after dark. `?time=day|dawn|dusk|night` forces a phase.
- **Real Khulna weather.** The street shows the current weather in Khulna, from [Open-Meteo](https://open-meteo.com) (free, no key, checked every 15 minutes, clear sky if it can't be reached). Cloudy: grey clouds drift across the sky. Rain: rain falls over the street, drops run down the windows and the glass doors, the road turns dark and wet, rickshaws get clear plastic covers, their riders rain capes, and people walk under umbrellas. Storm: rain plus lightning that lights up the sky and the room for a moment, and thunder when sound is on. Fog: the far buildings fade into haze. `?weather=clear|cloudy|rain|storm|fog` forces a state.
- **Bangladeshi festivals.** Chosen by today's date in Bangladesh. Pohela Boishakh (14 April): alpona floor art at the entrance, red-and-white bunting and a "শুভ নববর্ষ" banner. Eid ul-Fitr and Eid ul-Adha (from the Islamic calendar, give or take a day): twinkling fairy lights (morich bati) along the front wall, the windows and the door, and an "Eid Mubarak / ঈদ মোবারক" sign. 21 February: a small Shaheed Minar with flowers by the entrance and "অমর একুশে". 26 March and 16 December: a Bangladesh flag flying outside and green-and-red bunting. 1 January: a "Happy New Year" banner and gold bunting. The greeting hangs over the door inside and above the canopy outside. `?fest=boishakh|eid|ekushe|independence|victory|newyear` forces one.
- **Street life.** Cars, a bus, green CNG auto-rickshaws and cycle rickshaws with painted hoods (the riders pedal, the wheels turn) pass outside. People walk along both pavements, and birds cross the sky by day.
- **Real-looking people on Bangladesh office hours.** Rigged, motion-captured avatars (see [People](#people)): two developers work at their desks and look up now and then, a colleague walks from the coffee corner to chat at reception, looks in on the lounge and goes back for a coffee, the founders work in their cabins, and a receptionist stands at the counter just inside the door. Lunch is in the lounge; after hours the desks are empty and the monitors sleep; at night a guard sits by the door. See [The office's day](#the-offices-day).
- **Reception.** Just inside the entrance on the right. The receptionist waves as the intro's glass doors open (or when you hover her). Clicking her, the counter or its screen opens the **AI receptionist** chat, at any hour.
- **Founders' cabins.** Two glass cabins in the front-left corner with nameplates, executive desks, a shelf, plants and monitors. Each desk has the founder's **AI assistant** on a screen facing the room; clicking the screen, desk or founder opens that assistant's chat. A small tablet on the other front corner of the desk opens **Book a 15-min call** (see [Book a call with a founder](#book-a-call-with-a-founder)).
- **Open / closed sign.** A sign hangs on the glass door, readable from the street and from inside: "OPEN NOW", or "CLOSED" with when we're back.
- **Everything moves a little.** Ceiling fans spin, the AC louver sweeps, steam rises from a coffee cup, the router's lights blink, code scrolls on the monitors, the plants sway and the service cards swing gently on their wires. Turn the lights off and the fans wind down too.
- **Digital clock.** An LED clock centred above the Home wall shows Dhaka time with ticking seconds, a blinking colon and the date.
- **Glass entrance.** Double glass doors in slim black frames, with tall orange pulls and an etched "CODER ZONE BD" band, set in walnut and oak-slat panels. The street shows through.
- **Office furniture.** Two workstations with code on the monitors, a lounge with a sofa and floor lamp, a bookshelf, a coffee corner, plants, and a wall clock showing Dhaka time.
- **Premium finish.** Recessed ceiling light strips with a soft glow, a satin floor that reflects the displays (desktop only), and frosted-glass controls.
- **Intro.** On the first visit of a session the camera starts across the street, crosses to the storefront (backlit sign, orange canopy, glass doors), the doors swing open with a chime and the camera walks in. **Skip intro**, Esc or Enter skips it; it never plays with reduced motion, a deep link or `?nointro`.
- **Real 3D models.** The lounge sofa, armchair, coffee and side tables, potted plants, ceiling fans, desk lamp, framed art and the CCTV camera are real CC0 models from Poly Haven. **CZ Bot**, the robot helper by the quote desk, waves when you arrive at Contact or hover it, gives a thumbs-up when you add to the quote, and opens the AI receptionist chat when clicked (Contact, when the AI is off).
- **Baked-looking light.** Soft contact shadows under everything on the floor (live on desktop, rendered once on phones), shading where walls meet the ceiling and each other, and sunlight patches through the windows that follow the time of day.
- **Sound** (off until you turn it on, top bar). Synthesised live with Web Audio, so there are no sound files: fan and AC hum, distant traffic, keyboard typing, rickshaw bells, the odd horn, birds by day, a door chime, and soft ticks when you move around.

### Personal links, coin hunt and selfie postcard

- **Personalised visit** (for outreach): `?for=<business name>` greets a prospect by name. The storefront gets a second banner under the sign ("Welcome, Rahim Fashion House" / "স্বাগতম, …"), the intro caption is personal, and inside, opposite the courier kiosk, a freestanding screen shows a mock-up of *their* online store home page: their name as the logo, and a palette and illustrated product tiles for their trade. Clicking it opens the preview large with **Get this store** (adds E-commerce Store to the quote list and opens it) and a prefilled WhatsApp button. Without `?for` none of this appears.
  - `&type=fashion|food|electronics|cosmetics|grocery|other` picks the mock-up (without it, the name is used to guess, e.g. "… Fashion House" → fashion). `&lang=bn` opens it in Bangla.
  - The name is trimmed, cut to 32 characters and stripped of control and bidi-override characters; it is only drawn on canvas or set as text, never injected as HTML.
  - **Link maker** for the team: open `/?make-link` (not linked anywhere, `noindex`). Type the business name, pick the type and language, then copy the link or a ready-to-send message.
- **Coin hunt.** Five spinning gold CZ coins are hidden in the office: on the bookshelf, under the lounge table, on the coffee counter, behind the courier kiosk and by the plant near the tech stack. Click one to collect it (a pop, and a chime with sound on). The counter under the logo shows "Coins 2/5"; found coins are remembered in the browser. All five open a reward card with a WhatsApp button to claim it. The reward text lives in `COIN_REWARD` (and the WhatsApp message in `COIN_CLAIM`) in `src/content.ts`.
- **Selfie postcard.** The camera button in the top bar (3D only) captures the current view and frames it in a branded 1080×1350 postcard with the visitor's name and the site address: **Download**, and **Share** where the browser can share files (most phones). The frame is rendered and copied in one go, so the canvas never needs `preserveDrawingBuffer`.

## Client project rooms (`?client=`)

Each client gets a private link, `https://3d.coderzonebd.com/?client=<token>`, that shows **their project's live progress** inside the studio:

- The intro caption greets them by name ("Welcome, <client>" · "Your project room is ready"). After the intro the camera flies to the **Your project** board on the right wall's back corner, between the last Process board and the corner plant. It hangs flush on the wall, so it stands in front of no stop and doesn't block the Esc overview. The board shows the client and project, a progress ring with the %, the phase on the four-step process (Discover → Design & Build → Launch → Support), "Day 13 of 30", the milestones with ticks, the latest updates and, if the repo is connected, the latest commits.
- The same details open in a side panel (a bottom sheet on phones, easy to read) and, on the 2D page, in a card. **Your project** (bottom right) flies back to the board; the panel has **Ask about my project** on WhatsApp.
- A wrong, deleted or expired link shows a polite "This project link isn't active" note with a WhatsApp button, then the normal site.
- **Privacy.** The token is read once and removed from the address bar at once (`history.replaceState`), so it never ends up in shared links, postcards or analytics; it's kept in `sessionStorage` so a reload in the same tab still works. The Worker stores each record under a SHA-256 hash of the token (never the token itself), so the lookup never compares tokens and the stored keys are useless without the link. It never lists keys, rate-limits lookups (60 per visitor per hour) and answers the same 404 for anything unknown, malformed or expired. Clients only see the fields below; `repo` and `expiresAt` stay on the server.
- Code: `src/clientRoom.ts` (token, loading, dates), `src/three/ProjectBoard.tsx` (the board), `src/components/ProjectPanel.tsx` (panel, 2D card, note), `worker/src/project.ts` (the route).

**Record** (one JSON per client in the `CLIENTS` KV namespace): `{ name, project: {en, bn}, startDate, dueDate, percent, phase: discover|build|launch|support, milestones: [{ title: {en, bn}, done, date? }], updates: [{ date, text: {en, bn} }], manager, repo?, demo?, expiresAt? }`. Dates are `YYYY-MM-DD` in Dhaka time.

### How the team creates and updates a client room

Use `worker/scripts/client.mjs`. It runs `wrangler kv` on the live namespace, so run `cd worker && npm ci` once and be logged in to the Cloudflare account (`npx wrangler login`). `<token>` can be the bare token or the whole link.

```bash
cd worker
# a new client: prints the private link once (the token isn't stored, so send it straight to the client)
node scripts/client.mjs new "Rahim Fashion House" "Online store" "অনলাইন স্টোর" --days 30 --manager "Rakib Uddin"
#   options: --start YYYY-MM-DD (default today), --due YYYY-MM-DD or --days N (default 30), --repo owner/name, --demo
node scripts/client.mjs set <token> percent 45          # 0-100
node scripts/client.mjs set <token> phase build         # discover | build | launch | support
node scripts/client.mjs set <token> dueDate 2026-12-01  # also: name, project, project.en, project.bn, startDate, manager, repo, expiresAt, demo
node scripts/client.mjs milestone <token> add "Design approved" "ডিজাইন অনুমোদিত" 2026-11-02
node scripts/client.mjs milestone <token> done 1        # also: undo <n>, remove <n>
node scripts/client.mjs update <token> "Checkout is live on staging" "স্টেজিং-এ চেকআউট লাইভ"   # newest first, last 10 kept
node scripts/client.mjs show <token>
node scripts/client.mjs list                            # names and short ids (no tokens)
node scripts/client.mjs relink <id>                     # lost the link? issues a new one; the old one stops working
node scripts/client.mjs set <token> expiresAt 2027-03-31   # the link stops working after that day ("" clears it)
node scripts/client.mjs delete <token|id>
```

Changes show on the client's next visit; no deploy needed. **Recent commits** appear only when the record has `repo` (e.g. `coderzonebd/rahim-store`) *and* the Worker has a `GITHUB_TOKEN` secret: create a fine-grained GitHub token with read-only **Contents** access to those repos, then `cd worker && npx wrangler secret put GITHUB_TOKEN`. Commits are cached for 10 minutes; without the secret they're silently skipped.

A sample record named **Demo client** ("Demo e-commerce store", marked DEMO on the board and in the panel) shows how it looks. Remove it with `node scripts/client.mjs delete <id>` (the id from `list`).

## Book a call with a founder

**Book a 15-min call / ১৫ মিনিটের কল বুক করুন** opens a small dialog from the tablet on each founder's desk, the Leadership panel and 2D section, and a button at the top of each founder's AI chat. The visitor picks one of the next 7 working days (Saturday–Thursday, Friday off) and a 15-minute slot in office hours (10:00–19:00 Dhaka time, none over lunch 13:30–14:15, at least 90 minutes ahead), shown in Dhaka time plus their own local time when it differs, then adds name, phone and topic. **Send request on WhatsApp** opens `wa.me/8801885660190` with everything prefilled (founder, date, time, name, phone, topic) in the site's language, and the team confirms. Nothing is stored on any server.

The founders' AI assistants can open it too: the Worker's `book_call` tool (`founder: "ceo" | "cmo"`, strict schema) runs in the browser and opens the dialog; it never books anything by itself.

**Using a real calendar later:** every slot comes from one function, `bookingSlots(founder)` in `src/booking.ts`. To use Cal.com or a Google Calendar appointment schedule, make it fetch that calendar's free slots (or busy times) and return them in the same `{ date, weekday, slots }` shape; the dialog doesn't change. Or replace the WhatsApp step with a link to the booking page.

## See the studio in AR

**View in AR / AR-এ দেখুন** (the cube button in the top bar, 2D and 3D) puts a miniature of the studio on a table through the phone camera. It's a 1:64 model, so the 32 m room is about 50 cm wide: the room shell with the front glass, door and storefront sign, the brand-coloured walls, every display with its real texture (Home wall, product boxes, work wall, service cards, tech board, courier kiosk, process boards, contact desk), the furniture, the reception counter and the founders' cabins. No people, traffic, ceiling or anything animated, so it reads as a dollhouse from above.

- **Where the button shows.** Android Chrome (WebXR, or Google's Scene Viewer as the fallback) and iPhone / iPad Safari (AR Quick Look) get a dialog with a 3D preview and **Place it on your table**. Desktops (mouse or trackpad) get the same preview with a QR code for `https://3d.coderzonebd.com/?ar` (plus `&lang=bn` in Bangla), drawn locally by `qrcode-generator`. Other phones and tablets (Firefox on Android, in-app browsers on iOS, touch-only devices) get no button. `?ar` opens the dialog straight away (and skips the intro), so the QR lands right on it; a phone without AR still gets the preview with a note.
- **How.** Google's `<model-viewer>` 4.0.0 (`ar ar-modes="webxr scene-viewer quick-look"`, `ar-scale="auto"`, camera controls, auto-rotate), installed from npm and bundled by Vite into its own lazy chunk that shares the site's three.js. Nothing loads until the dialog opens: then the model-viewer chunk (about 130 KB gzipped, plus three.js in 2D mode), the QR code (8 KB) and `public/models/studio-mini.glb` (2.4 MB). iOS fetches `studio-mini.usdz` (4.1 MB) only when Quick Look starts.
- **Why a ready-made USDZ.** model-viewer can convert the GLB to USDZ on the phone when AR starts, but that runs three's exporter on the device at tap time (slow on older iPhones, and a long pause before Quick Look opens). The build script makes the USDZ once, with JPEG textures and rounded numbers, and it's committed next to the GLB.
- **Bangla.** The model's displays are the English versions.

**Rebuilding the model** after the room or the content changes (Chrome or Edge installed; set `CHROME=/path/to/chrome` if it isn't found):

```bash
node scripts/ar/build-model.mjs
```

It serves `scripts/ar/export.html` with Vite and opens it in headless Chrome. The page renders the real room components (`Room`, `Office`, `Items`, the Poly Haven models, `Reception`, `Cabins`) with the office open and the lights on, then drops the people, the ceiling, the fans and the painted-on shading and glows, redraws every texture at 256–1024 px (JPEG, PNG only for real cut-outs), simplifies the heavy models with meshoptimizer, merges everything by material, scales it to the tabletop with the origin at floor centre, adds a plinth and a strip of pavement, and exports `public/models/studio-mini.glb` (three's GLTFExporter, no extensions, so Scene Viewer reads it) and `studio-mini.usdz` (USDZExporter). It takes about a minute. Keep the GLB under ~2.5 MB: `MAX_TRIS`, `JPEG_QUALITY` and the texture sizes in `convert()` are the knobs.

## How to explore

| Desktop | Phone | What it does |
| --- | --- | --- |
| Drag | Drag with one finger | Look around, all 360° |
| Scroll | Pinch | Zoom in and out (lens zoom, so the camera never goes through a wall) |
| Click | Tap | Open an item, or click a section's empty space to fly there |
| Esc | | Step back one level: close the help, the quote list or the panel, then show the whole studio |
| ← → | | Previous / next section (inside a panel: previous / next item) |
| 1 – 9, 0 | | Jump straight to a section |
| T | ▶ Tour button | Auto tour through every section; any click, drag, scroll or key stops it |
| L | Light switch by the door | Office lights on / off (daylight through the windows stays) |
| ? or H | ? button | The "How to explore" help |
| O | ⌂ button | Overview of the whole studio |

On desktop, a label next to the pointer says what you're about to open ("Go to Work →", the service name, and so on).

Things to click in the office: the **receptionist** (or her screen) and each founder's **AI-assistant screen** open a chat, the **wall clock** tells you the time in Dhaka, the **coffee machine** takes you to Contact, the **monitors** take you to Work, the **door** shows the whole studio, and the **switch** by the door turns the lights off.

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
| `POST /chat` | `{ persona, lang, messages }` → server-sent events: `{t:'text'}`, `{t:'tool', name, input}`, `{t:'done'}` or `{t:'error'}`. Tool calls (`add_to_quote`, `go_to_section`, `open_whatsapp`, `book_call`) run in the browser; the Worker answers them and lets the model finish its reply. |
| `POST /demo` | `{ name, type, description, lang }` → server-sent events `{t:'html'}` with one self-contained HTML page (inline CSS, no scripts, no external URLs). |
| `GET /presence` | WebSocket. Send `{ p: [x, y, z, heading] }`; receive `{ you }` once, then `{ n, v: [[id, x, y, z, heading], ...] }`. |
| `GET /project/:token` | A client's project record for `?client=` (see [Client project rooms](#client-project-rooms-client)), plus `commits` when `repo` and `GITHUB_TOKEN` are set. The same `404 { error: 'not_found' }` for any unknown, malformed or expired token; `Cache-Control: no-store`. |
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
| Client-room lookups per visitor per hour (`PROJECT_PER_HOUR`) | 60 |

Over a limit, the visitor gets a friendly `429` message in their language. Only `https://3d.coderzonebd.com` and `http://localhost:*` may call the Worker (CORS and an Origin check), set in `ALLOWED_ORIGINS`.

### Set up and deploy the Worker

```bash
cd worker
npm ci
npx wrangler secret put ANTHROPIC_API_KEY   # paste the key when asked; it's stored only in Cloudflare
npx wrangler secret put GITHUB_TOKEN        # optional: read-only token for client rooms' recent commits
npx wrangler deploy                         # after changing worker/ or src/content.ts
npx wrangler tail                           # live logs
```

Bindings: `LIMITER` and `PRESENCE` (Durable Objects) and `CLIENTS`, the KV namespace `cz3d-clients` (its id is in `wrangler.jsonc`), which holds the client-room records (`client:<sha256 of token>`) and the 10-minute GitHub commit cache (`gh:<repo>`). To recreate it on another account: `npx wrangler kv namespace create cz3d-clients` and put the new id in `wrangler.jsonc`.

## 2D version, SEO and slow devices

- All of the content is also plain semantic HTML (`src/flat/FlatSite.tsx`). It is **prerendered into `index.html` at build time**, so search engines and slow connections get the full text before any JavaScript runs.
- **Skip 3D** in the top bar switches to that 2D page. The site starts in 2D automatically when WebGL is missing or software-only, when the device has less than 3 GB of memory, or when Save-Data is on. A visitor's own choice is remembered.
- In 3D, the render resolution adapts to the frame rate instead of dropping to 2D. If the GPU loses the WebGL context, the canvas rebuilds itself.
- In 3D mode the 2D page stays in the DOM (visually hidden) for screen readers. Keyboard users who tab into it get it as a full overlay.
- With reduced motion turned on, the camera jumps between sections instead of flying.
- `?2d` / `?3d` / `?lang=bn` / `?time=night` / `?weather=rain` / `?fest=eid` in the URL force a mode, language, time of day, weather or festival. `?for=<name>&type=<kind>` makes a personalised visit, `?client=<token>` opens a client's project room, `?nointro` skips the intro, `?ar` opens the AR dialog, and `?make-link` opens the team's link maker. `?hour=0-23` (and `?day=fri`) preview the office at any hour; see [The office's day](#the-offices-day).

**Weight:** in 2D mode, three.js is never downloaded. 3D adds about 300 KB gzipped of JS plus the screenshots and logos, and the Home film for the current language (about 0.8 MB on desktop, 0.7 MB on phones, streamed after the room appears). Everything else in the room is drawn on `<canvas>` at runtime.

## Stack

Vite, React 18, TypeScript, React Three Fiber + drei (`CameraControls` for the camera, `MeshReflectorMaterial` for the floor, `PerformanceMonitor` for adaptive resolution), zustand, and the self-hosted Anek Bangla font (OFL, `src/fonts/OFL.txt`).

| File | What's in it |
| --- | --- |
| `src/content.ts` | All text (English + Bangla), prices, products, projects, process, FAQ, contacts, UI strings |
| `src/store.ts` | App state: section, focus, overview, tour, lights, help, quote list |
| `src/three/Room.tsx` | Walls, floor, ceiling lights, displays, glass entrance, light switch |
| `src/three/Office.tsx` | Furniture, wall clock, clickable office objects |
| `src/three/Life.tsx` | Fans, AC, steam, router, digital clock, and the simple capsule people used on the street |
| `src/three/People.tsx` | Realistic avatars: loading, animation cross-fades, the walking loop |
| `src/three/PeopleCast.tsx` | Who is where at this hour (team, lunch, night guard) |
| `src/three/Reception.tsx` | Reception counter, receptionist, open/closed door sign, guard's chair |
| `src/three/Cabins.tsx` | The founders' glass cabins, desks and AI-assistant screens |
| `src/schedule.ts` | Office hours in Bangladesh time, `?hour=` / `?day=` |
| `src/three/Street.tsx` | Rickshaws, CNGs, pedestrians, birds |
| `src/three/Models.tsx` | Real 3D models and the CZ Bot receptionist |
| `src/weather.ts`, `src/three/Weather.tsx` | Live Khulna weather (Open-Meteo) and the clouds, rain, fog and lightning outside |
| `src/three/Festivals.tsx` | Festival dates and decorations |
| `src/audio.ts` | The synthesised office and street sound |
| `src/three/Outside.tsx` | Sky, buildings, street, traffic, day/night |
| `src/three/CameraRig.tsx` | Camera moves, look-around, zoom, overview |
| `src/components/Interact.tsx` | Keyboard shortcuts, auto tour, pointer label, help overlay |
| `src/components/Chat.tsx` | The AI chat panel: receptionist and the founders' assistants, voice in and out |
| `src/ai/` | Worker client and tool calls, the site builder's state and panel, live presence |
| `src/three/DemoScreen.tsx`, `src/three/Ghosts.tsx` | The "Build my site live" screen, other live visitors |
| `worker/` | The Cloudflare Worker: chat, site builder, presence, rate limits |
| `src/personal.ts` | Personalised visits: reads and cleans `?for` / `?type`, builds share links |
| `src/mockup.ts` | The prospect's store mock-up, drawn on canvas |
| `src/three/Welcome.tsx` | The storefront welcome banner and the store-preview stand |
| `src/three/Coins.tsx` | The five hidden coins |
| `src/components/Coins.tsx` | Coin counter and reward card |
| `src/components/Postcard.tsx` | Selfie postcard button and dialog (capture via `src/three/Snapshot.tsx`) |
| `src/components/WelcomeCard.tsx` | The large store preview with Get this store / WhatsApp |
| `src/components/LinkMaker.tsx` | Internal link maker at `?make-link` |
| `src/clientRoom.ts`, `src/three/ProjectBoard.tsx`, `src/components/ProjectPanel.tsx` | Client project rooms: token and loading, the 3D board, the panel / 2D card / note |
| `worker/src/project.ts`, `worker/scripts/client.mjs` | The `/project/:token` route, and the team's tool to create and update client records |
| `src/booking.ts`, `src/components/BookCall.tsx` | Book a 15-min call: the slot source (`bookingSlots`), the WhatsApp message, the dialog |
| `src/components/ArView.tsx` | The View in AR button and dialog (model-viewer, QR code) |
| `scripts/ar/` | Builds the AR miniature `public/models/studio-mini.glb` / `.usdz` |
| `src/three/homeVideo.ts` | The Home wall film as a video texture, with the static fallback |
| `video/home/` | The Home film's source (HyperFrames) and its render script |

## Home wall video

The Home wall plays a silent, seamlessly looping motion-graphics film, one per language: `public/video/home-en.mp4` and `home-bn.mp4` (1600×900, H.264, 30 fps, faststart), `home-<lang>-720.mp4` (1280×720, used on touch devices and small screens) and a poster `home-<lang>.jpg`. The last frame is the first frame, so the loop has no seam.

- `src/three/homeVideo.ts` plays it on a muted, looping, inline `<video>` as a `THREE.VideoTexture` (sRGB) and switches the file when the language changes. The static canvas wall (`homeWallTexture`) shows until the film's first frame is playing, and stays for good when Save-Data or reduced motion is on or the browser refuses to autoplay. The film pauses while the tab is hidden. Clicking the wall still opens the Home panel.
- The film is a [HyperFrames](https://hyperframes.heygen.com) composition in `video/home/index.html` (HTML + GSAP, Anek Bangla, brand colours, real logos). Its copy is the `COPY` object at the bottom of that file; keep it in step with `src/content.ts`.
- To change and re-render it (Node 22+, FFmpeg):

```bash
cd video/home
npx hyperframes preview          # edit in the browser Studio
npx hyperframes check            # lint + layout checks
node render.mjs                  # renders en + bn, writes public/video/*
```

`render.mjs` renders a master per language with `--variables '{"lang":"bn"}'`, then encodes the 1600×900 and 720p MP4s and the posters with FFmpeg. (A VP9 WebM came out larger than the H.264 at the same quality, so there isn't one.)

### Promo trailer (not shipped)

`marketing/trailer/` holds a 30-second silent promo of the studio for ads and reels, in 16:9 (`wide/`) and 9:16 (`tall/`, built from `wide/` by `scripts/make-tall.py`). The footage is the live site, recorded frame by frame under a virtual clock so it is a smooth 30 fps on any machine: `node scripts/record.cjs all` and `node scripts/record.cjs intro,tour,street,night,team,robot vertical` (set `PUPPETEER` to a `puppeteer-core` install). Link `wide/assets/footage` to `footage/` and `tall/assets/footage` to `footage-9x16/` (a symlink or junction), then run `npx hyperframes render --quality delivery` in `wide/` and `tall/`. Footage and renders are git-ignored.

## 3D models and credits

The furniture and props are CC0 (public domain), in `public/models/`, meshopt-compressed with textures cut to 512 px (about 2.9 MB in total, loaded after the room appears):

- Furniture, plants and props: [Poly Haven](https://polyhaven.com/models) (CC0)
- CZ Bot: "RobotExpressive" by Tomás Laulhé / [Quaternius](https://quaternius.com), via the three.js examples (CC0)
- People and their animations: the [Microsoft Rocketbox Avatar Library](https://github.com/microsoft/Microsoft-Rocketbox) (MIT licence, © 2020 Microsoft), in `public/models/people/` (3.4 MB in all; see [People](#people))

To add one: download the glTF from Poly Haven at 1k, shrink its textures, then run `gltf-transform optimize in.gltf public/models/name.glb --compress meshopt --texture-compress false`, and place it in `src/three/Models.tsx`.

## People

The people in the office are avatars from the **Microsoft Rocketbox Avatar Library** (github.com/microsoft/Microsoft-Rocketbox): 115 realistic, fully rigged humans made by Rocketbox Studios over ten years and released by Microsoft under the **MIT licence** (December 2020), which allows commercial use on a public website as long as the copyright notice stays with the files (it does: `public/models/people/LICENSE-Rocketbox.txt`). Their animations are Rocketbox's own motion-capture clips from the same repository (also MIT). All avatars share one skeleton (3ds Max Biped, `Bip01 …`), so one clip pack drives everyone.

| File | Who | Rocketbox source | Notes |
| --- | --- | --- | --- |
| `receptionist.glb` | Receptionist | `Adults/Female_Adult_06` | salwar kameez and orna |
| `dev1.glb` | Developer, desk 1 | `Adults/Male_Adult_17` | hoodie and cap |
| `dev2.glb` | Developer, desk 2 | `Adults/Male_Adult_15` | panjabi and tupi |
| `walker.glb` | Colleague walking about | `Professions/Business_Female_01` | |
| `ceo.glb` | Placeholder for Rakib Uddin | `Professions/Business_Male_05` | swap for the real face (below) |
| `cmo.glb` | Placeholder for Barek Mian | `Professions/Business_Male_06` | skin tone darkened |
| `guard.glb` | Night guard | `Professions/Security_Male_01` | skin tone darkened |
| `anims-m.glb`, `anims-f.glb` | Clip packs | `Animations/all_animations_max_motextr_*` | `type` (seated at a table), `sit`, `look`, `idle`, `talk`, `wave`, `walk`, `drink` |

The placeholders are generic stock characters, not likenesses of the founders.

Rocketbox has no seated typing clip, so the desk workers use the seated-at-a-table clip with procedural finger taps on top. Clips cross-fade (0.45 s), long clips loop back and forth so there's no seam, and everyone starts at a different point so nobody moves in step.

**Weight.** About 280–420 KB per avatar (one 7k-triangle mesh, 1k JPG body and head textures, no normal maps) and 450–500 KB per clip pack: 3.4 MB in all. Only the people on duty load, after the room is up: in office hours on desktop that's six avatars and both packs (about 2.9 MB), on a phone four avatars (about 2.2 MB: no walker, one developer), at night just the guard (about 0.9 MB).

**Rebuilding them** (Windows, no Blender needed), from a checkout of the Rocketbox repo:

```bash
npm i --no-save fbx2gltf @gltf-transform/core @gltf-transform/extensions @gltf-transform/functions meshoptimizer
# 1. FBX → GLB with FBX2glTF, one file per avatar (Export/<Name>.fbx) and per clip
npx FBX2glTF -b -i Assets/Avatars/Adults/Female_Adult_06/Export/Female_Adult_06.fbx -o conv/av/Female_Adult_06
npx FBX2glTF -b --anim-framerate bake30 -i Assets/Animations/all_animations_max_motextr_static/f_wave_01.max.fbx -o conv/anim/f_wave_01
# 2. textures: TGA → 1k JPG with Pillow (gltf-transform's WebP step fails on this machine with a libvips colourspace error)
python scripts/people/textures.py Assets conv/tex 1024
# 3. attach textures, keep body-bone rotations only, trim and pack the clips, meshopt-compress
node scripts/people/build.mjs conv conv/tex public/models/people
```

The walk clip comes from `all_animations_max_motextr_xy` (walking in place), everything else from `…_static`. The two scripts list exactly which avatars and clips are used.

## The office's day

`src/schedule.ts` runs the office on Bangladesh time (GMT+6):

| When | What you see |
| --- | --- |
| Saturday–Thursday 10:00–19:00 | Everyone at work. The door sign says **OPEN NOW** |
| 13:30–14:15 | Lunch: one developer has a drink at the coffee corner, the other sits on the lounge sofa, a colleague chats in the lounge. Reception and the cabins stay staffed |
| Before 10:00, after 19:00, all Friday | Desks and cabins empty, monitors on a sleeping screen saver, the office lights a little dimmer (the switch still works). The reception screen says "We're closed. Our AI receptionist is still here", and clicking it still opens the chat. The door sign says **CLOSED** with "Back at 10 AM", "Back tomorrow at 10 AM" or "Back on Saturday at 10 AM" |
| 22:00–07:00 | A night guard sits on the chair left of the door |

The AI receptionist and the founders' AI assistants answer at any hour. Preview any moment with `?hour=0-23` (fractions work: `?hour=13.75`) and `?day=sat|sun|mon|tue|wed|thu|fri`; `?hour=` also sets the sky outside.

## Real faces for the founders

The cabins use placeholder avatars. To put Rakib Uddin and Barek Mian in their own cabins, each founder needs a rigged 3D avatar made from their photos. Swapping one in is a one-file change: replace `public/models/people/ceo.glb` (Rakib) or `cmo.glb` (Barek) and redeploy. No code changes: an avatar file that carries its own animation clips plays those instead of the Rocketbox pack.

These steps need the founders' own accounts and photos, so they have to do them (or someone they trust):

1. **Make the avatar from a photo.** Recommended: **MetaPerson Creator** by Avatar SDK / itSeez3D (avatarsdk.com). Upload one clear, front-facing photo (even light, neutral expression, no glasses or cap), adjust hair, beard, body and clothes (a suit or formal shirt suits the cabins), then export **GLB** with the full-body rig. The first avatar is free; more cost in-app credits. The rig is Mixamo-compatible, which step 2 needs. Its terms say the avatar data is yours, and that identifiable people need to give informed consent.
   - Alternative: **Avaturn** (avaturn.me), photo-based head on a Mixamo-compatible body. Read its terms first: the avatar stays Avaturn's property, attribution and a link are required, and commercial use needs an email to hello@avaturn.me (its paid plan is $800/month).
   - Highest quality, paid, desktop only: Reallusion Character Creator with the Headshot plug-in (photo to head, FBX export).
   - Ready Player Me is no longer an option: its public service shut down on 31 January 2026.
2. **Add the moves.** At mixamo.com (free Adobe account), upload the exported avatar, then download these as **FBX, "Without Skin", 30 fps**: **Typing** (save as `type`), **Sitting Idle** (`look`), and optionally **Standing Idle** (`idle`), **Talking** (`talk`) and **Waving** (`wave`). Convert each to GLB: `npx FBX2glTF -b -i Typing.fbx -o clips/type`.
3. **Pack it for the site:**

   ```bash
   npm i --no-save @gltf-transform/core @gltf-transform/extensions @gltf-transform/functions meshoptimizer sharp
   node scripts/people/founder.mjs rakib.glb clips public/models/people/ceo.glb
   ```

   The script renames the clips, matches them to the avatar's bones by name, rescales the hips to the avatar's height, cuts textures to 1k and compresses everything (aim for under ~1.5 MB). Check it with `npm run dev` and press **9** for Leadership. If the new avatar sits too high, low or far from the desk, adjust its position in `Founder` in `src/three/Cabins.tsx`.

**Privacy and consent.** Use a founder's photos only with their explicit consent. These services process photos on their own servers under their own privacy policies: check how long they keep uploads, and delete the source photos there once the avatar is exported. The published GLB contains the face texture, and anyone can download it from the live site.

What's been checked: the swap path (an avatar GLB with its own clips is picked up automatically) and `founder.mjs`, both tested with a Rocketbox avatar and Rocketbox clips standing in. A real MetaPerson or Avaturn export with Mixamo clips hasn't been tried yet.

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
