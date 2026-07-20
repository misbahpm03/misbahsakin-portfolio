import { chromium } from 'playwright';

const OUT = process.argv[2] || '/tmp/room';
const URL = 'http://localhost:4319/';

const browser = await chromium.launch({
  args: ['--use-gl=angle', '--enable-unsafe-swiftshader'],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 850 }, deviceScaleFactor: 2 });

const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));

await page.goto(URL, { waitUntil: 'networkidle' });
await page.waitForTimeout(3500);
await page.screenshot({ path: `${OUT}-01-home.png` });

// hover the whiteboard, then click it: this is the interaction that matters,
// so the shot has to go through the canvas rather than the mobile nav.
const HIT = { x: 560, y: 330 };
await page.mouse.move(HIT.x, HIT.y);
await page.waitForTimeout(900);
await page.screenshot({ path: `${OUT}-02-hover.png` });

await page.mouse.click(HIT.x, HIT.y);
await page.waitForTimeout(2400);
await page.screenshot({ path: `${OUT}-03-panel.png` });

// zoomed in on one object, panel closed
await page.keyboard.press('Escape');
await page.waitForTimeout(1600);
await page.mouse.click(HIT.x, HIT.y);
await page.waitForTimeout(2400);
await page.screenshot({ path: `${OUT}-05-focus.png` });

// mobile
const m = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await m.goto(URL, { waitUntil: 'networkidle' });
await m.waitForTimeout(3500);
await m.screenshot({ path: `${OUT}-04-mobile.png` });

console.log(errors.length ? 'CONSOLE ERRORS:\n' + errors.join('\n') : 'no console errors');
await browser.close();
