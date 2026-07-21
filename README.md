# misbahsakin-portfolio

A portfolio you walk around instead of scroll.

The landing page is a dark 3D room. Nine objects each open one section of the CV
in a drawer, and clicking one flies the camera to it.

| Object | Section |
| --- | --- |
| Laptop | About |
| Whiteboard | Experience |
| Corkboard of sticky notes | Projects |
| Pegboard of tools | Skills |
| Shelf with the trophy | Awards & recognition |
| Bookcase, cap and framed degree | Education & certifications |
| Camera and film reel | Creative & film |
| Wall of pinned polaroids | Community & organising |
| Phone | Contact |

The whiteboard is not decoration: each swimlane is one role, labelled with the
company, and bar length tracks tenure against a 2023–2026 axis — so the wall says
something true before you click it. The sticky notes carry real project names and
numbers; the polaroids are captioned. The window shows the Dhaka skyline at night
and is deliberately not clickable: it places the room somewhere real without
adding another thing to click.

## No 3D assets

Every object is assembled from three.js primitives — boxes, cylinders, planes —
each wrapped in a chalk-coloured [`<Edges>`](https://github.com/pmndrs/drei#edges)
outline. That outline is what carries the hand-drawn look into 3D, and it means the
repo ships **no GLTF/GLB models at all**: nothing to license, compress, or 404.

A bevel was tried and reverted — `RoundedBox` leaves no hard edges for `<Edges>`
to find, so the outline shatters into floating dashes across every bevel facet.
Polish comes from light instead: a shadow-casting lamp, contact shadows, and a
bloom pass that lets the bulb, the two screens and the window actually glow.
Bloom is gated behind `useDetectGPU`; weak and touch devices render the plain
scene. Append `?fx=0` or `?fx=1` to force it either way.

Surface text is real 3D type via troika — note that it cannot read woff2, which
is why `public/fonts/` carries one `.ttf` alongside the woff2 the CSS uses.

three.js lazy-loads behind `React.lazy` and is the entire 3D cost (~304 kB gzip).

## Running it

```bash
npm install
npm run dev      # vite dev server
npm run build    # production build → build/
```

Note the build output directory is `build/`, not Vite's default `dist/`.

## URLs

Every section has its own address — `/projects`, `/creative`, `/education` — so
a link can point straight at one part of the work. The URL is the source of
truth for which drawer is open, so browser Back closes it. `/message` is the
brief form.

At build time `scripts/prerender.mjs` renders the readable version of the CV
into the HTML and emits one page per section, each with its own title,
description and canonical. Without it the site shipped `<div id="root"></div>`
and a crawler saw nothing.

That markup lands in `#seo-static`, **not** in `#root`. Inside `#root`, React
had to tear it down on every load and the teardown was visible as a flash of a
different page; outside it, an inline style hides it the moment scripting is
confirmed and `main.tsx` removes it on mount.

`/message` and the "Send a brief" action open a dialog over the room rather
than a separate page. The old `src/pages/ContactPage.tsx` is no longer routed. `scripts/make-og.mjs` screenshots the room itself for
the share card, so it cannot drift away from what the room looks like.

## Verifying it

```bash
npm run build
npx vite preview --port 4319 --strictPort &
node scripts/room-verify.mjs /tmp/room
```

20 Playwright checks covering the parts that are easy to break from the 3D side:
camera flight, drawer contents for all nine sections, `Escape`, arrow-key
navigation, the mobile drawer, reduced motion, the no-WebGL fallback, and the
effects-disabled path. Writes screenshots to the path given.
`scripts/room-shot.mjs` takes the screenshots alone, without asserting.

```bash
node scripts/reach-verify.mjs   # crawlable HTML, share card, per-section URLs
node scripts/room-labels.mjs    # in-room label placement at three widths
```

## How it holds up

- **No WebGL** — renders the same content as a plain, readable page rather than a
  blank canvas.
- **Reduced motion** — camera jumps straight to each object instead of flying.
- **Keyboard** — `←` / `→` walk the nine sections, `Escape` steps back out.
- **Portrait** — phones get their own camera pose. The room is wide and short, so
  the landscape framing left a phone screen mostly empty; a bottom nav bar reaches
  every section regardless of what is on screen.

## Layout

```
src/
  room/
    RoomPortfolio.tsx  shell: state, keyboard, WebGL detection, flat fallback
    Room.tsx           the r3f canvas — geometry, lighting, camera rig
    Panel.tsx          the drawer, and the blocks shared with the fallback
    content.ts         every word on the site, kept apart from the geometry
    room.css           plain CSS (see below)
  pages/ContactPage.tsx  message form, unchanged
```

`content.ts` holds all copy so text edits never mean touching geometry.

CSS here is plain, not Tailwind: this project ships a **pre-compiled** Tailwind
stylesheet at `src/index.css` with no Tailwind build step, so any new utility class
would silently generate no styles.

## Type

Unbounded (display), Manrope (body), DM Mono (labels and dates) — all self-hosted
from `public/fonts/`, latin subset, ~88 kB. No request to Google Fonts; that one
blocked first paint on a third-party host.

## Stack

Vite · React 18 · React Three Fiber 8 · drei · postprocessing · three 0.169 ·
React Router · EmailJS

---

Originally scaffolded from a Figma Make export; the room replaced the generated
landing page.
