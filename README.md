# Coder Zone BD · 3D Studio

A walk-through 3D showroom for [Coder Zone BD](https://coderzonebd.com), a software studio in Khulna. Visitors move between seven stops, open any service, product or project, build a quote list, and send it on WhatsApp. The site is Bangla by default, with an English toggle.

**Live:** https://devrkb21.github.io/coderzonebd-3d-studio/

![Home wall](docs/home.jpg)
![Service card with its panel and Add to quote](docs/service.jpg)
![Work wall with real screenshots and neutral cards](docs/work.jpg)
![Phone: bottom sheets, quote list and English mode](docs/mobile.jpg)

## What's in the room

| Stop | Where | What it shows |
| --- | --- | --- |
| Home | back wall, centre | Logo wall with the headline and stats. Its panel covers the company and why to choose us |
| Services | left wall, hanging rail | 8 cards. Each panel has what you get, an approximate price, duration, proof projects, **Add to quote** and WhatsApp buttons |
| Products | back-left plinth | CZ Commerce, CheckoutGuard, Laravel Ecom and CZ Social (coming soon), with pricing and links |
| Work | back-right wall | 13 projects. The 6 live sites use real screenshots; projects without a public site get a neutral name + stack card |
| Courier Check | centre kiosk | Explains the free tool. **Check now** opens coderzonebd.com/courier-check, because that page sends no CORS headers and can't be called from here |
| Process | right wall | Discover → Design & Build → Launch → Support |
| Contact | front-right desk | Contact details, team and FAQ. The quote list opens from here |

A tech-stack pegboard on the front-left wall is decoration only.

Clicking anything zooms to it and opens a side panel; on phones the panel is a bottom sheet. Prev/next arrows (or ← →) step through items at the same stop, and Esc closes the panel. The quote list (top-right) collects services, then takes a name, phone, budget and note. **Send on WhatsApp** opens `wa.me/8801885660190` with the whole list prefilled, and **Send by email** is the fallback.

## 2D version, SEO and low-end phones

- All of the content is also plain semantic HTML (`src/flat/FlatSite.tsx`). It is **prerendered into `index.html` at build time**, so search engines and slow connections get the full text before any JavaScript runs.
- **Skip 3D** in the top bar switches to that 2D page. The site also starts in 2D automatically when WebGL is missing or software-only, when the device has less than 3 GB of memory, or when Save-Data is on. If the frame rate stays low in 3D, it switches to 2D and shows a "View in 3D" button. A visitor's own choice is remembered.
- In 3D mode the 2D page stays in the DOM (visually hidden) for screen readers. Keyboard users who tab into it get it as a full overlay.
- With reduced motion turned on, the camera jumps between stops instead of flying.
- `?2d` / `?3d` / `?lang=en` in the URL force a mode or language.

**Weight:** in 2D mode, three.js is never downloaded (~62 KB gzipped of JS + fonts). 3D adds ~240 KB gzipped of JS and ~150 KB of screenshot thumbnails. Everything else in the room is drawn on `<canvas>` at runtime.

## Stack

Vite, React 18, TypeScript, React Three Fiber + drei (`CameraControls` for the camera moves), zustand, and the self-hosted Anek Bangla font (OFL, `src/fonts/OFL.txt`).

## Edit the content

All text (Bangla and English), prices, products, projects, process steps, FAQ and contact details are in **`src/content.ts`**. The 3D room, the panels and the 2D page all read from it.

- Add a service or project and it gets a place on the rail or the wall automatically (`src/three/layout.ts`).
- To give a project a real screenshot, save `public/work/<id>.jpg` (960×600) and `public/work/<id>-thumb.jpg` (512×320), then set `shot: true`.
- Testimonials are off on purpose. Once there are real ones, fill `TESTIMONIALS` and set `SHOW_TESTIMONIALS = true`.

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:5173/coderzonebd-3d-studio/

`npm run build` type-checks, builds, server-renders the 2D page into `dist/index.html`, and writes everything to `dist/`.

## Deploy

Every push to `main` triggers `.github/workflows/deploy.yml`, which builds the site and publishes it to GitHub Pages.

For a custom domain (e.g. `3d.coderzonebd.com`), build at the root path:

```bash
BASE_PATH=/ npm run build
```

In the workflow, add `env: BASE_PATH: /` to the build step, and add a `public/CNAME` file containing the domain.
