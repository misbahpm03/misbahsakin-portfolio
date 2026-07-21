# misbahsakin-portfolio

A portfolio you walk around instead of scroll.

The landing page is a dark 3D room. Six objects each open one section of the CV in
a drawer, and clicking one flies the camera to it.

| Object | Section |
| --- | --- |
| Laptop | About |
| Whiteboard | Experience |
| Corkboard of sticky notes | Projects |
| Pegboard of tools | Skills |
| Shelf — trophy, books, certificate | Awards & study |
| Phone | Contact |

The whiteboard is not decoration: each swimlane is one role, and bar length tracks
tenure, so the wall says something true about the content before you click it. The
window shows the Dhaka skyline at night and is deliberately not clickable — it
places the room somewhere real without adding another thing to click.

## No 3D assets

Every object is assembled from three.js primitives — boxes, cylinders, planes —
each wrapped in a chalk-coloured [`<Edges>`](https://github.com/pmndrs/drei#edges)
outline. That outline is what carries the hand-drawn look into 3D, and it means the
repo ships **no GLTF/GLB models at all**: nothing to license, compress, or 404.
three.js lazy-loads behind `React.lazy` and is the entire 3D cost (~237 kB gzip).

## Running it

```bash
npm install
npm run dev      # vite dev server
npm run build    # production build → build/
```

Note the build output directory is `build/`, not Vite's default `dist/`.

## Verifying it

```bash
npm run build
npx vite preview --port 4319 --strictPort &
node scripts/room-verify.mjs /tmp/room
```

19 Playwright checks covering the parts that are easy to break from the 3D side:
camera flight, drawer contents for all six sections, `Escape`, arrow-key navigation,
the mobile drawer, reduced motion, and the no-WebGL fallback. Writes screenshots to
the path given. `scripts/room-shot.mjs` takes the screenshots alone, without asserting.

## How it holds up

- **No WebGL** — renders the same content as a plain, readable page rather than a
  blank canvas.
- **Reduced motion** — camera jumps straight to each object instead of flying.
- **Keyboard** — `←` / `→` walk the six sections, `Escape` steps back out.
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

## Stack

Vite · React 18 · React Three Fiber 8 · drei · three 0.169 · React Router · EmailJS

---

Originally scaffolded from a Figma Make export; the room replaced the generated
landing page.
