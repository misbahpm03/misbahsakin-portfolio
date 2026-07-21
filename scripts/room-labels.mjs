/**
 * Label placement guard. The nine in-room titles are positioned by hand in
 * world space, so a camera or object move can silently push one on top of
 * another, off the frame, or under the header block. This catches that.
 */
import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--use-gl=angle','--enable-unsafe-swiftshader'] });
for (const vp of [{ width: 1440, height: 850 }, { width: 1280, height: 720 }, { width: 1920, height: 1000 }]) {
  const p = await b.newPage({ viewport: vp, reducedMotion: 'no-preference' });
  await p.goto('http://localhost:4319/', { waitUntil: 'load' });
  await p.waitForTimeout(4500);
  const boxes = await p.evaluate(() =>
    [...document.querySelectorAll('.room-label')].map((el) => {
      const r = el.getBoundingClientRect();
      return { t: el.innerText.trim(), x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) };
    }),
  );
  console.log(`\n=== ${vp.width}x${vp.height} ===`);
  const pad = 4;
  const hit = (a, c) =>
    a.x < c.x + c.w + pad && a.x + a.w + pad > c.x && a.y < c.y + c.h + pad && a.y + a.h + pad > c.y;
  let issues = 0;
  for (let i = 0; i < boxes.length; i++)
    for (let j = i + 1; j < boxes.length; j++)
      if (hit(boxes[i], boxes[j])) { console.log(`  OVERLAP: ${boxes[i].t} <-> ${boxes[j].t}`); issues++; }
  for (const bx of boxes) {
    if (bx.x < 0 || bx.y < 0 || bx.x + bx.w > vp.width || bx.y + bx.h > vp.height) {
      console.log(`  OFF-SCREEN: ${bx.t} at x=${bx.x}..${bx.x + bx.w}, y=${bx.y}..${bx.y + bx.h}`); issues++;
    }
  }
  // near the header block, which sits top-left
  for (const bx of boxes) if (bx.x < 340 && bx.y < 130) { console.log(`  UNDER HEADER: ${bx.t}`); issues++; }
  console.log(issues ? `  ${issues} issue(s)` : '  clean');
  console.log('  ' + boxes.map((k) => `${k.t}(${k.x},${k.y})`).join(' '));
  await p.close();
}
await b.close();
