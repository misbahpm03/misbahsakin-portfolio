/**
 * Puts real HTML in the build output.
 *
 * The app is a client-rendered SPA, so index.html shipped an empty
 * <div id="root">. A crawler that does not run JavaScript — and every link
 * preview scraper — saw nothing at all. This renders the readable version of
 * the CV into the HTML at build time, and emits one page per section so each
 * has its own URL, title and description.
 *
 * The markup goes into #seo-static rather than #root. React would otherwise
 * have to tear it down on every load, which was visible as a flash of a
 * different page before the room appeared.
 *
 * Runs after `vite build`; see the build script in package.json.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(root, 'build');
const TMP = join(root, '.ssr-tmp');

// The domain every canonical, sitemap entry, og:url and og:image is stamped
// with. Order of preference:
//   1. SITE_URL, for a custom domain you set yourself
//   2. Vercel's own production URL, provided at build time — so a fresh deploy
//      is correct with zero configuration, and stays correct if the project is
//      renamed
//   3. a sensible default for local builds
// Everything in index.html is written against PLACEHOLDER and swapped to SITE
// below, so there is one domain to change and it lives here.
const PLACEHOLDER = 'https://misbahsakin.vercel.app';
const SITE =
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL &&
    `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) ||
  'https://msportfolio-omega.vercel.app';

/* 1. Build the SEO entry for Node. Vite handles the CSS imports that plain
      node cannot parse. */
execFileSync(
  'npx',
  ['vite', 'build', '--ssr', 'src/room/seo.tsx', '--outDir', '.ssr-tmp', '--logLevel', 'warn'],
  { cwd: root, stdio: 'inherit' },
);

// Vite names the SSR entry .mjs when package.json has no "type": "module",
// and .js when it does. Take whichever landed rather than guessing.
const entry = ['seo.mjs', 'seo.js']
  .map((f) => join(TMP, f))
  .find((f) => existsSync(f));
if (!entry) throw new Error('prerender: no SSR entry emitted in .ssr-tmp');

const { SeoDocument, PAGES } = await import(pathToFileURL(entry).href);
const markup = renderToStaticMarkup(React.createElement(SeoDocument));

/* 2. Splice into the built index.html, once per page. */
const template = readFileSync(join(OUT, 'index.html'), 'utf8');
if (!template.includes('<div id="seo-static"></div>')) {
  throw new Error('prerender: could not find an empty #seo-static in build/index.html');
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

/**
 * Replace and insist it landed. These patterns depend on how Vite formats the
 * head; a silent no-op would ship every page with the home page's title and
 * description, which is exactly the kind of failure nobody notices.
 */
function must(html, pattern, replacement, what) {
  // Test for the pattern rather than comparing before/after: the home page's
  // title and description are already the correct values in the template, so a
  // successful replacement there is legitimately a no-op.
  const found = typeof pattern === 'string' ? html.includes(pattern) : pattern.test(html);
  if (!found) throw new Error(`prerender: nothing matched for ${what}`);
  return html.replace(pattern, replacement);
}

for (const page of PAGES) {
  const url = SITE + (page.slug ? `/${page.slug}` : '');
  let html = must(
    template,
    '<div id="seo-static"></div>',
    `<div id="seo-static">${markup}</div>`,
    'the #seo-static placeholder',
  );
  html = must(html, /<title>[^<]*<\/title>/, `<title>${esc(page.title)}</title>`, 'title');
  html = must(
    html,
    /(<meta\s+name="description"\s+content=")[^"]*(")/,
    `$1${esc(page.description)}$2`,
    'description',
  );
  html = must(
    html,
    /(<meta\s+property="og:title"\s+content=")[^"]*(")/,
    `$1${esc(page.title)}$2`,
    'og:title',
  );
  html = must(
    html,
    /(<meta\s+property="og:description"\s+content=")[^"]*(")/,
    `$1${esc(page.description)}$2`,
    'og:description',
  );
  html = must(
    html,
    /(<meta\s+property="og:url"\s+content=")[^"]*(")/,
    `$1${esc(url)}$2`,
    'og:url',
  );
  html = must(
    html,
    /(<link\s+rel="canonical"\s+href=")[^"]*(")/,
    `$1${esc(url)}$2`,
    'canonical',
  );
  // og:image and the JSON-LD carry the bare domain rather than a per-page path,
  // so a plain swap finishes them off. No-op when SITE already is PLACEHOLDER.
  html = html.split(PLACEHOLDER).join(SITE);

  const dir = page.slug ? join(OUT, page.slug) : OUT;
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html);
}

/* 3. sitemap.xml, from the same list, so it cannot drift out of sync. */
const urls = PAGES.map(
  (p) => `  <url><loc>${SITE}${p.slug ? '/' + p.slug : ''}</loc></url>`,
).join('\n');
writeFileSync(
  join(OUT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`,
);

/* 4. robots.txt, so its Sitemap: line names the same domain as everything
      else rather than whatever was hardcoded in public/robots.txt. */
writeFileSync(
  join(OUT, 'robots.txt'),
  `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`,
);

rmSync(TMP, { recursive: true, force: true });
console.log(
  `prerendered ${PAGES.length} pages (${(markup.length / 1024).toFixed(0)} kB of markup each) + sitemap.xml + robots.txt`,
);
