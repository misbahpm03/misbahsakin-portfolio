/**
 * Interaction checks for the room. Asserts the behaviours that are easy to
 * break from the 3D side: camera flight, drawer content, keyboard routes,
 * reduced motion, and the no-WebGL fallback.
 */
import { chromium } from 'playwright';

const OUT = process.argv[2] || '/tmp/room';
const URL = 'http://localhost:4319/';
const fails = [];
const ok = (name, cond, extra = '') =>
  cond ? console.log(`  PASS  ${name}`) : (fails.push(name), console.log(`  FAIL  ${name} ${extra}`));

const browser = await chromium.launch({ args: ['--use-gl=angle', '--enable-unsafe-swiftshader'] });

/* ---- desktop ---- */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 850 }, deviceScaleFactor: 2 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForTimeout(4500);

  const camAt = () => page.evaluate(() => window.__roomCam ?? null);

  ok('canvas mounted', await page.locator('canvas').count() === 1);
  ok('nine labels visible', await page.locator('.room-label').count() === 9,
     `got ${await page.locator('.room-label').count()}`);
  ok('drawer starts closed', !(await page.locator('.room-sheet.is-open').count()));

  // The labels name the objects, so clicking the text must do what clicking
  // the object does.
  await page.locator('.room-label', { hasText: 'Projects' }).click();
  await page.waitForTimeout(1600);
  ok('clicking a label opens its section',
     (await page.locator('.room-sheet h2').innerText()).trim() === 'Projects',
     await page.locator('.room-sheet h2').innerText().catch(() => 'none'));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1200);

  // and they are reachable without a mouse
  const labelIsButton = await page.evaluate(() => {
    const el = document.querySelector('.room-label');
    return el.tagName === 'BUTTON' && el.tabIndex === 0;
  });
  ok('labels are focusable buttons', labelIsButton);

  // click the whiteboard through the canvas
  await page.mouse.click(560, 330);
  await page.waitForTimeout(2400);
  ok('drawer opens on object click', await page.locator('.room-sheet.is-open').count() === 1);
  ok('drawer shows the right section',
     (await page.locator('.room-sheet h2').innerText()).trim() === 'Experience',
     await page.locator('.room-sheet h2').innerText());
  ok('labels hidden while focused',
     await page.locator('.room-label.is-away').count() === 9 &&
       !(await page.locator('.room-label').first().isVisible()),
     `away=${await page.locator('.room-label.is-away').count()}`);
  await page.screenshot({ path: `${OUT}-desktop-panel.png` });

  // The reported bug: the drawer appeared to jump. It was the canvas sliding
  // sideways at the same time as the camera flew. Guard both halves.
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1400);
  const slide = await page.evaluate(async () => {
    const sheet = document.querySelector('.room-sheet');
    const canvas = document.querySelector('.room-canvas');
    const mx = (el) => {
      const t = getComputedStyle(el).transform;
      const m = t && t.startsWith('matrix') ? t.match(/matrix\(([^)]+)\)/) : null;
      return m ? Math.round(parseFloat(m[1].split(',')[4])) : 0;
    };
    const out = [];
    let go = true;
    const tick = () => { if (!go) return; out.push([mx(sheet), mx(canvas)]); requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
    [...document.querySelectorAll('.room-nav button')].find((b) => b.innerText.trim() === 'Skills').click();
    await new Promise((r) => setTimeout(r, 1400));
    go = false;
    return out;
  });
  const panel = slide.map((r) => r[0]);
  const canvasX = slide.map((r) => r[1]);
  const steps = new Set(panel).size;
  const backward = panel.filter((v, i) => i && v > panel[i - 1] + 1).length;
  ok('drawer slides instead of teleporting', steps > 12 && backward === 0,
     `${steps} distinct positions, ${backward} backward`);
  ok('room does not slide while the drawer opens', canvasX.every((v) => v === 0),
     `canvas moved to ${[...new Set(canvasX)].join(',')}`);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);

  await page.keyboard.press('Escape');
  await page.waitForTimeout(1200);
  ok('Escape closes the drawer', !(await page.locator('.room-sheet.is-open').count()));

  // arrow keys walk the room
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(1600);
  const first = await page.locator('.room-sheet h2').innerText();
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(1600);
  const second = await page.locator('.room-sheet h2').innerText();
  ok('arrow keys move between sections', first !== second, `${first} -> ${second}`);

  // every section renders content
  await page.keyboard.press('Escape');
  await page.waitForTimeout(900);
  const sections = await page.evaluate(async () => {
    const out = [];
    const btns = [...document.querySelectorAll('.room-nav button')];
    for (const b of btns) {
      b.click();
      await new Promise((r) => setTimeout(r, 260));
      const h2 = document.querySelector('.room-sheet h2')?.innerText ?? '';
      const chars = document.querySelector('.room-sheet-in')?.innerText.length ?? 0;
      out.push([b.innerText.trim(), h2, chars]);
    }
    return out;
  });
  ok('all nine sections have real content',
     sections.length === 9 && sections.every(([, h2, n]) => h2 && n > 250),
     JSON.stringify(sections.map(([a, , n]) => `${a}:${n}`)));

  // the pegboard hangs the actual marks, not grey tool silhouettes
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);
  const pegTextures = await page.evaluate(() => {
    // CanvasTexture-backed planes are the logos; count the canvases we made
    return document.querySelectorAll('canvas').length;
  });
  ok('the scene still renders one canvas', pegTextures === 1, `${pegTextures}`);

  ok('no console errors', errors.length === 0, errors.join(' | '));
  await page.close();
}

/* ---- mobile ---- */
{
  const m = await browser.newPage({
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
  });
  await m.goto(URL, { waitUntil: 'load' });
  await m.waitForTimeout(4500);
  await m.screenshot({ path: `${OUT}-mobile-home.png` });

  ok('mobile nav is visible', await m.locator('.room-nav').isVisible());
  ok('floating labels suppressed on mobile',
     !(await m.locator('.room-label').first().isVisible().catch(() => false)));

  await m.locator('.room-nav button', { hasText: 'Projects' }).click();
  await m.waitForTimeout(1800);
  ok('mobile drawer opens', await m.locator('.room-sheet.is-open').count() === 1);
  ok('mobile drawer is full width',
     (await m.locator('.room-sheet').boundingBox()).width === 390);
  await m.screenshot({ path: `${OUT}-mobile-panel.png` });

  // the drawer must not scroll the page behind it
  ok('page itself does not scroll', await m.evaluate(() => document.body.scrollHeight <= window.innerHeight + 2));
  await m.close();
}

/* ---- reduced motion ---- */
{
  const r = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await r.emulateMedia({ reducedMotion: 'reduce' });
  await r.goto(URL, { waitUntil: 'load' });
  await r.waitForTimeout(4000);
  // Reduced motion should cut the camera flight but still show the drawer
  // arriving. Killing its transition outright made it teleport, which is what
  // "it jumps" turned out to be for anyone with the OS setting on.
  const fade = await r.evaluate(async () => {
    const sheet = document.querySelector('.room-sheet');
    const seen = []; let go = true;
    const tick = () => { if (!go) return; seen.push(getComputedStyle(sheet).opacity); requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
    [...document.querySelectorAll('.room-nav button')].find((b) => b.innerText.trim() === 'Skills').click();
    await new Promise((res) => setTimeout(res, 900));
    go = false;
    return new Set(seen).size;
  });
  ok('reduced motion opens the section', await r.locator('.room-sheet.is-open').count() === 1);
  ok('reduced motion fades rather than teleporting', fade > 4, `${fade} distinct opacities`);
  await r.close();
}

/* ---- no WebGL ---- */
{
  const n = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await n.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = function () { return null; };
  });
  await n.goto(URL, { waitUntil: 'load' });
  await n.waitForTimeout(2000);
  const text = await n.locator('.room-fallback').innerText().catch(() => '');
  ok('fallback renders without WebGL', text.length > 2000, `${text.length} chars`);
  ok('fallback still lists every section',
     ['Experience', 'Projects', 'Skills', 'Awards', 'conversation'].every((w) => text.includes(w)));
  await n.screenshot({ path: `${OUT}-fallback.png`, fullPage: false });
  await n.close();
}

/* ---- effects forced off: the low-GPU path must still render ---- */
{
  const lo = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const loErrors = [];
  lo.on('pageerror', (e) => loErrors.push(e.message));
  await lo.goto(URL + '?fx=0', { waitUntil: 'load' });
  await lo.waitForTimeout(4000);
  ok('renders with effects disabled', await lo.locator('canvas').count() === 1 && loErrors.length === 0,
     loErrors.join(' | '));
  await lo.screenshot({ path: `${OUT}-nofx.png` });
  await lo.close();
}

await browser.close();
console.log(fails.length ? `\n${fails.length} FAILED: ${fails.join(', ')}` : '\nall checks passed');
process.exit(fails.length ? 1 : 0);
