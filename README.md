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
| 1 | Home | back wall, centre | Logo wall with the headline and stats. Its panel covers the company and why to choose us |
| 2 | Services | left wall, hanging rail | 8 cards. Each panel has what you get, an approximate price, duration, proof projects, **Add to quote** and WhatsApp buttons |
| 3 | Products | back-left plinth | CZ Commerce, CheckoutGuard, Laravel Ecom and CZ Social (coming soon), with real logos, pricing and links |
| 4 | Work | back-right wall | 13 projects. The live sites use real screenshots; projects without a public site get a neutral name + stack card |
| 5 | Tech Stack | left wall, front | A board of the real logos of the tools we use (Laravel, React, Flutter, WordPress, …) |
| 6 | Courier Check | centre kiosk | The free courier-history tool, with the real courier logos. **Check now** opens coderzonebd.com/courier-check |
| 7 | Process | right wall | Discover → Design & Build → Launch → Support |
| 8 | Contact | front-right desk | Contact details, team and FAQ. The quote list opens from here |
| 9 | Leadership | front-left glass cabins | The two founders, Rakib Uddin (CEO · CTO) and Barek Mian (CMO · CFO), each at a desk with an AI assistant on a screen. The panel introduces them and opens either assistant's chat |
| 9 | Leadership | front-left glass cabins | The two founders, Rakib Uddin (CEO · CTO) and Barek Mian (CMO · CFO), each at a desk with an AI assistant on a screen. The panel introduces them and opens either assistant's chat |

Brand: the real Coder Zone BD logo and wordmark, orange `#FF931E` on ink `#12141C`.

### A living office

- **Real Bangladesh time.** Through the windows and the glass entrance, the street follows the time in Dhaka (GMT+6): dawn, day, dusk and night, with the sun or moon, lit building windows and street lights after dark. `?time=day|dawn|dusk|night` forces a phase.
- **Street life.** Cars, a bus, green CNG auto-rickshaws and cycle rickshaws with painted hoods (the riders pedal, the wheels turn) pass outside. People walk along both pavements, and birds cross the sky by day.
- **Real-looking people on Bangladesh office hours.** Rigged, motion-captured avatars (see [People](#people)): two developers work at their desks and look up now and then, a colleague walks from the coffee corner to chat at reception, looks in on the lounge and goes back for a coffee, the founders work in their cabins, and a receptionist stands at the counter just inside the door. Lunch is in the lounge; after hours the desks are empty and the monitors sleep; at night a guard sits by the door. See [The office's day](#the-offices-day).
- **Reception.** Just inside the entrance on the right. The receptionist waves as the intro's glass doors open (or when you hover her). Clicking her, the counter or its screen opens the **AI receptionist** chat, at any hour.
- **Founders' cabins.** Two glass cabins in the front-left corner with nameplates, executive desks, a shelf, plants and monitors. Each desk has the founder's **AI assistant** on a screen facing the room; clicking the screen, desk or founder opens that assistant's chat.
- **Open / closed sign.** A sign hangs on the glass door, readable from the street and from inside: "OPEN NOW", or "CLOSED" with when we're back.
- **Everything moves a little.** Ceiling fans spin, the AC louver sweeps, steam rises from a coffee cup, the router's lights blink, code scrolls on the monitors, the plants sway and the service cards swing gently on their wires. Turn the lights off and the fans wind down too.
- **Digital clock.** An LED clock centred above the Home wall shows Dhaka time with ticking seconds, a blinking colon and the date.
- **Glass entrance.** Double glass doors in slim black frames, with tall orange pulls and an etched "CODER ZONE BD" band, set in walnut and oak-slat panels. The street shows through.
- **Office furniture.** Two workstations with code on the monitors, a lounge with a sofa and floor lamp, a bookshelf, a coffee corner, plants, and a wall clock showing Dhaka time.
- **Premium finish.** Recessed ceiling light strips with a soft glow, a satin floor that reflects the displays (desktop only), and frosted-glass controls.
- **Intro.** On the first visit of a session the camera starts across the street, crosses to the storefront (backlit sign, orange canopy, glass doors), the doors swing open with a chime and the camera walks in. **Skip intro**, Esc or Enter skips it; it never plays with reduced motion, a deep link or `?nointro`.
- **Real 3D models.** The lounge sofa, armchair, coffee and side tables, potted plants, ceiling fans, desk lamp, framed art and the CCTV camera are real CC0 models from Poly Haven. **CZ Bot**, the robot helper by the quote desk, waves when you arrive at Contact or hover it, gives a thumbs-up when you add to the quote, and opens Contact when clicked.
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
| 1 – 9 | | Jump straight to a section |
| T | ▶ Tour button | Auto tour through every section; any click, drag, scroll or key stops it |
| L | Light switch by the door | Office lights on / off (daylight through the windows stays) |
| ? or H | ? button | The "How to explore" help |
| O | ⌂ button | Overview of the whole studio |

On desktop, a label next to the pointer says what you're about to open ("Go to Work →", the service name, and so on).

Things to click in the office: the **receptionist** (or her screen) and each founder's **AI-assistant screen** open a chat, the **wall clock** tells you the time in Dhaka, the **coffee machine** takes you to Contact, the **monitors** take you to Work, the **door** shows the whole studio, and the **switch** by the door turns the lights off.

Clicking an item zooms to it and opens a side panel; on phones the panel is a bottom sheet. The quote list (top right) collects services, then takes a name, phone, budget and note. **Send on WhatsApp** opens `wa.me/8801885660190` with the whole list prefilled, and **Send by email** is the fallback.

## 2D version, SEO and slow devices

- All of the content is also plain semantic HTML (`src/flat/FlatSite.tsx`). It is **prerendered into `index.html` at build time**, so search engines and slow connections get the full text before any JavaScript runs.
- **Skip 3D** in the top bar switches to that 2D page. The site starts in 2D automatically when WebGL is missing or software-only, when the device has less than 3 GB of memory, or when Save-Data is on. A visitor's own choice is remembered.
- In 3D, the render resolution adapts to the frame rate instead of dropping to 2D. If the GPU loses the WebGL context, the canvas rebuilds itself.
- In 3D mode the 2D page stays in the DOM (visually hidden) for screen readers. Keyboard users who tab into it get it as a full overlay.
- With reduced motion turned on, the camera jumps between sections instead of flying.
- `?2d` / `?3d` / `?lang=bn` / `?time=night` in the URL force a mode, language or time of day. `?hour=0-23` (and `?day=fri`) preview the office at any hour; see [The office's day](#the-offices-day). `?hour=0-23` (and `?day=fri`) preview the office at any hour; see [The office's day](#the-offices-day).

**Weight:** in 2D mode, three.js is never downloaded. 3D adds about 300 KB gzipped of JS plus the screenshots and logos. Everything else in the room is drawn on `<canvas>` at runtime.

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
| `src/audio.ts` | The synthesised office and street sound |
| `src/three/Outside.tsx` | Sky, buildings, street, traffic, day/night |
| `src/three/CameraRig.tsx` | Camera moves, look-around, zoom, overview |
| `src/components/Interact.tsx` | Keyboard shortcuts, auto tour, pointer label, help overlay |

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
