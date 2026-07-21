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

  // click the whiteboard through the canvas
  await page.mouse.click(560, 330);
  await page.waitForTimeout(2400);
  ok('drawer opens on object click', await page.locator('.room-sheet.is-open').count() === 1);
  ok('drawer shows the right section',
     (await page.locator('.room-sheet h2').innerText()).trim() === 'Experience',
     await page.locator('.room-sheet h2').innerText());
  ok('labels hidden while focused', await page.locator('.room-label').count() === 0);
  ok('canvas shifts aside', await page.locator('.room-canvas.is-shifted').count() === 1);
  await page.screenshot({ path: `${OUT}-desktop-panel.png` });

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
  await r.mouse.click(500, 320);
  await r.waitForTimeout(700); // far less than a camera flight
  ok('reduced motion jumps straight to the section',
     await r.locator('.room-sheet.is-open').count() === 1);
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
