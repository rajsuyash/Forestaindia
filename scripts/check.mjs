#!/usr/bin/env node
/**
 * Post-build sanity check.
 *
 * Not a test suite — this is a static content site with almost no branching
 * logic. These are the four things that actually break on a site like this:
 * dead internal links, missing/duplicate titles, missing meta descriptions,
 * and images without alt text.
 *
 * Run: node scripts/check.mjs   (or `pnpm verify`, which builds first)
 */

import { readdir, readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const DIST = resolve('dist');
const failures = [];
const warnings = [];

if (!existsSync(DIST)) {
  console.error('✗ dist/ not found — run `pnpm build` first.');
  process.exit(1);
}

/** Recursively collect every .html file under dist/. */
async function htmlFiles(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...(await htmlFiles(full)));
    else if (entry.name.endsWith('.html')) found.push(full);
  }
  return found;
}

/** Map a root-relative href to the file that should serve it. */
function resolveHref(href) {
  const clean = href.split('#')[0].split('?')[0];
  if (clean === '' || clean === '/') return join(DIST, 'index.html');
  const trimmed = clean.replace(/^\/+|\/+$/g, '');
  return [join(DIST, trimmed, 'index.html'), join(DIST, `${trimmed}.html`), join(DIST, trimmed)];
}

const pages = await htmlFiles(DIST);
if (pages.length === 0) failures.push('dist/ contains no HTML pages.');

const titles = new Map();

for (const file of pages) {
  const rel = '/' + relative(DIST, file).replace(/\\/g, '/');
  const html = await readFile(file, 'utf8');

  // ── <title> ──────────────────────────────────────────────────────────
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim();
  if (!title) {
    failures.push(`${rel}: missing or empty <title>`);
  } else {
    if (titles.has(title)) {
      failures.push(`${rel}: duplicate <title> "${title}" (also ${titles.get(title)})`);
    }
    titles.set(title, rel);
  }

  // ── meta description ─────────────────────────────────────────────────
  // Backreference the opening quote so an apostrophe inside the content
  // (India's, world's) doesn't truncate the match.
  const desc = html.match(
    /<meta[^>]+name=["']description["'][^>]*content=(["'])([\s\S]*?)\1/i
  )?.[2];
  if (!desc || desc.trim().length < 40) {
    failures.push(`${rel}: meta description missing or under 40 chars`);
  } else if (desc.length > 165) {
    warnings.push(`${rel}: meta description is ${desc.length} chars (Google truncates ~160)`);
  }

  // ── canonical ────────────────────────────────────────────────────────
  if (!/<link[^>]+rel=["']canonical["']/i.test(html)) {
    failures.push(`${rel}: missing canonical link`);
  }

  // ── images need alt ──────────────────────────────────────────────────
  // Empty alt is intentional: it marks a decorative image. Astro serialises
  // alt="" as a bare `alt`, so accept the attribute with or without a value.
  for (const [tag] of html.matchAll(/<img\b[^>]*>/gi)) {
    if (!/\balt(?=[\s=>/])/i.test(tag)) {
      failures.push(`${rel}: <img> without alt attribute — ${tag.slice(0, 90)}…`);
    }
  }

  // ── internal links resolve ───────────────────────────────────────────
  for (const [, href] of html.matchAll(/<a\b[^>]+href=["'](\/[^"']*)["']/gi)) {
    if (href.startsWith('//')) continue;
    const candidates = resolveHref(href);
    const list = Array.isArray(candidates) ? candidates : [candidates];
    const ok = await Promise.all(
      list.map((p) =>
        stat(p)
          .then((s) => s.isFile())
          .catch(() => false)
      )
    );
    if (!ok.some(Boolean)) {
      failures.push(`${rel}: dead internal link → ${href}`);
    }
  }
}

// ── Things that must exist in the deployable output ────────────────────
for (const required of ['robots.txt', 'sitemap-index.xml', 'contact.php', 'favicon.svg']) {
  if (!existsSync(join(DIST, required))) {
    failures.push(`dist/${required} is missing`);
  }
}

// secrets.php must never ship from the repo
if (existsSync(join(DIST, 'secrets.php'))) {
  failures.push('dist/secrets.php exists — credentials must never be built into the site.');
}

// ── Report ─────────────────────────────────────────────────────────────
for (const w of warnings) console.warn(`⚠  ${w}`);

if (failures.length > 0) {
  console.error(`\n✗ ${failures.length} problem(s) in ${pages.length} pages:\n`);
  for (const f of failures) console.error(`   ${f}`);
  process.exit(1);
}

console.log(
  `✓ ${pages.length} pages: titles unique, descriptions present, links resolve, images have alt.`
);
if (warnings.length) console.log(`  (${warnings.length} warning(s) above)`);
