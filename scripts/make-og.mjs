/**
 * Generates the social share card and the touch icon.
 *
 * The card is a screenshot of the actual room rather than a designed graphic:
 * the room is the thing being shared, and a hand-made card would drift out of
 * date the moment the scene changes.
 *
 * Run against a local preview:
 *   npx vite preview --port 4319 --strictPort &
 *   node scripts/make-og.mjs
 */
import { chromium } from 'playwright';
import { writeFileSync, statSync, readFileSync } from 'node:fs';

const URL = process.env.OG_URL || 'http://localhost:4319/';
const browser = await chromium.launch({ args: ['--use-gl=angle', '--enable-unsafe-swiftshader'] });

/* ---- 1200x630 share card ------------------------------------------- */
{
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 2,
    reducedMotion: 'no-preference',
  });
  // fx=1 forces bloom on: headless reports a low GPU tier and would otherwise
  // render the flat scene, which is not what the room looks like.
  await page.goto(URL + '?fx=1', { waitUntil: 'load' });
  await page.waitForTimeout(6500);
  // The drag hint is guidance for someone already on the page, not part of the
  // picture someone sees in a feed.
  await page.evaluate(() => {
    const cue = document.querySelector('.room-cue');
    if (cue) cue.style.display = 'none';
  });
  await page.waitForTimeout(300);
  const buf = await page.screenshot({ type: 'jpeg', quality: 82 });
  writeFileSync('public/og.jpg', buf);
  console.log(`public/og.jpg  ${(statSync('public/og.jpg').size / 1024).toFixed(0)} kB`);
  await page.close();
}

/* ---- 180x180 apple touch icon, from the same favicon artwork -------- */
{
  const svg = readFileSync('public/favicon.svg', 'utf8');
  const page = await browser.newPage({ viewport: { width: 180, height: 180 } });
  await page.setContent(
    `<body style="margin:0">${svg.replace('<svg', '<svg width="180" height="180"')}</body>`,
  );
  await page.waitForTimeout(200);
  const buf = await page.screenshot({ type: 'png' });
  writeFileSync('public/apple-touch-icon.png', buf);
  console.log(
    `public/apple-touch-icon.png  ${(statSync('public/apple-touch-icon.png').size / 1024).toFixed(0)} kB`,
  );
  await page.close();
}

await browser.close();
