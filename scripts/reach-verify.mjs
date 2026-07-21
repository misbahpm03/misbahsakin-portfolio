/**
 * Checks the things that decide whether anyone ever finds the room:
 * what a crawler sees, what a link preview scrapes, and whether each section
 * has a working URL of its own.
 *
 * Run against a built preview:
 *   npm run build
 *   npx vite preview --port 4319 --strictPort &
 *   node scripts/reach-verify.mjs
 */
import { chromium } from 'playwright';
import { existsSync, readFileSync, statSync } from 'node:fs';

const BASE = 'http://localhost:4319';
const fails = [];
const ok = (name, cond, extra = '') =>
  cond ? console.log(`  PASS  ${name}`) : (fails.push(name), console.log(`  FAIL  ${name} ${extra}`));

const read = (f) => readFileSync(f, 'utf8');
const attr = (html, re) => (html.match(re) || [])[1];

/* ---- what a crawler that runs no JavaScript gets ---- */
{
  const html = read('build/index.html');
  const text = html
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ');
  for (const probe of ['Sheba Pay', 'Graphoskop', 'Chittagong', 'ANIMATIBA', 'HULT Prize']) {
    ok(`static HTML contains "${probe}"`, text.includes(probe));
  }
  ok('static HTML is substantial', text.length > 5000, `${text.length} chars`);
  // the marks are aria-hidden decoration; they belong in the app, not in ten
  // copies of the pre-rendered HTML
  ok('static HTML carries no logo paths', !html.includes('room-chip-logo'));
}

/* ---- one page per section, each with its own title and description ---- */
{
  const slugs = ['about', 'experience', 'projects', 'skills', 'awards', 'education', 'creative', 'community', 'contact'];
  const titles = new Set();
  const descriptions = new Set();
  let allPresent = true;
  for (const slug of ['', ...slugs]) {
    const f = slug ? `build/${slug}/index.html` : 'build/index.html';
    if (!existsSync(f)) { allPresent = false; continue; }
    const html = read(f);
    titles.add(attr(html, /<title>([^<]*)<\/title>/));
    descriptions.add(attr(html, /name="description"\s*content="([^"]*)"/));
    const canonical = attr(html, /rel="canonical"\s*href="([^"]*)"/) || '';
    if (slug && !canonical.endsWith('/' + slug)) {
      ok(`canonical for /${slug}`, false, canonical);
      allPresent = false;
    }
  }
  ok('a page exists for every section', allPresent);
  ok('every page has its own title', titles.size === slugs.length + 1, `${titles.size} distinct`);
  ok('every page has its own description', descriptions.size === slugs.length + 1, `${descriptions.size} distinct`);
}

/* ---- link preview assets ---- */
{
  const html = read('build/index.html');
  const og = attr(html, /property="og:image"\s*content="([^"]*)"/) || '';
  ok('og:image is declared', og.endsWith('/og.jpg'), og);
  ok('og.jpg exists', existsSync('build/og.jpg'));
  const kb = existsSync('build/og.jpg') ? statSync('build/og.jpg').size / 1024 : Infinity;
  // over ~300 kB and some scrapers quietly skip the image
  ok('og.jpg is under 300 kB', kb < 300, `${kb.toFixed(0)} kB`);
  ok('twitter card is large', html.includes('summary_large_image'));
  ok('favicon exists and is linked', existsSync('build/favicon.svg') && html.includes('favicon.svg'));
  ok('apple touch icon exists', existsSync('build/apple-touch-icon.png'));
  ok('structured data present', html.includes('"@type": "Person"') || html.includes('"@type":"Person"'));
}

/* ---- sitemap and robots ---- */
{
  const sitemap = read('build/sitemap.xml');
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  ok('sitemap lists ten URLs', locs.length === 10, `${locs.length}`);
  ok('robots points at the sitemap', read('build/robots.txt').includes('sitemap.xml'));
}

/* ---- the URLs actually work in a browser ---- */
{
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 850 }, reducedMotion: 'no-preference' });
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));

  await page.goto(`${BASE}/projects`, { waitUntil: 'load' });
  await page.waitForTimeout(4500);
  ok('/projects opens the Projects drawer',
     (await page.locator('.room-sheet h2').innerText().catch(() => '')).trim() === 'Projects');

  await page.goto(`${BASE}/`, { waitUntil: 'load' });
  await page.waitForTimeout(4000);
  await page.locator('.room-label', { hasText: 'Creative' }).click();
  await page.waitForTimeout(1600);
  ok('opening a section pushes its URL', new URL(page.url()).pathname === '/creative', page.url());
  ok('the tab title follows the section', (await page.title()).startsWith('Creative'), await page.title());

  await page.goBack();
  await page.waitForTimeout(1600);
  ok('Back closes the drawer',
     new URL(page.url()).pathname === '/' && !(await page.locator('.room-sheet.is-open').count()));

  await page.goto(`${BASE}/nonsense`, { waitUntil: 'load' });
  await page.waitForTimeout(3500);
  ok('an unknown slug redirects home', new URL(page.url()).pathname === '/');

  await page.goto(`${BASE}/message`, { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  ok('/message still serves the brief form', (await page.locator('input, textarea').count()) >= 3);

  /* ---- reload must not flash a different page ---- */
  await page.goto(`${BASE}/`, { waitUntil: 'commit' });
  const frames = [];
  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(220);
    frames.push(
      await page.evaluate(() => {
        const seo = document.getElementById('seo-static');
        return {
          seo: !!seo && seo.offsetHeight > 0,
          flat: !!document.querySelector('.room-fallback'),
          boot: !!document.querySelector('.room-boot'),
          canvas: !!document.querySelector('canvas'),
        };
      }),
    );
  }
  const sequence = frames.map((f) =>
    f.canvas ? 'room' : f.boot ? 'boot' : f.flat ? 'flat' : f.seo ? 'seo' : 'blank',
  );
  ok('reload never flashes the flat CV page',
     !sequence.includes('flat') && !sequence.includes('seo'), sequence.join('>'));
  ok('reload ends in the room', sequence[sequence.length - 1] === 'room', sequence.join('>'));

  /* ---- the brief is a dialog in the room, not the old page ---- */
  await page.goto(`${BASE}/contact`, { waitUntil: 'load' });
  await page.waitForTimeout(4500);
  await page.locator('.room-reach', { hasText: 'Send a brief' }).click();
  await page.waitForTimeout(900);
  ok('Send a brief opens a dialog', (await page.locator('.brief.is-open').count()) === 1);
  ok('the old contact page is gone', (await page.locator('text=Get In Touch').count()) === 0);
  ok('the room is still behind it', (await page.locator('canvas').count()) === 1);

  await page.locator('.brief-send').click();
  await page.waitForTimeout(500);
  ok('the brief validates before sending', (await page.locator('.brief-error').count()) >= 3);

  await page.keyboard.press('Escape');
  await page.waitForTimeout(700);
  ok('Escape closes the brief', (await page.locator('.brief.is-open').count()) === 0);

  await page.goto(`${BASE}/message`, { waitUntil: 'load' });
  await page.waitForTimeout(4500);
  ok('/message opens the brief over the room', (await page.locator('.brief.is-open').count()) === 1);

  /* ---- tool chips carry their brand mark ---- */
  await page.goto(`${BASE}/skills`, { waitUntil: 'load' });
  await page.waitForTimeout(4500);
  const chips = await page.evaluate(() => ({
    all: document.querySelectorAll('.room-chip').length,
    logos: document.querySelectorAll('.room-chip.has-logo svg').length,
  }));
  ok('tool chips show logos', chips.logos >= 15, `${chips.logos} of ${chips.all}`);
  ok('skills without a brand stay text-only', chips.all - chips.logos > 20, `${chips.all - chips.logos}`);

  ok('no page errors across the routes', errs.length === 0, errs.join(' | '));
  await browser.close();
}

console.log(fails.length ? `\n${fails.length} FAILED: ${fails.join(', ')}` : '\nall reach checks passed');
process.exit(fails.length ? 1 : 0);
