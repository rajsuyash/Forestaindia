#!/usr/bin/env node
/**
 * Delete build artefacts nothing links to.
 *
 * Astro emits the untouched source image alongside the optimised WebP
 * derivatives. The originals are never referenced, but they are the largest
 * files in the build — on this site roughly 6.5 MB of a 15 MB output.
 *
 * Conservative by design: an asset is removed only if its exact filename
 * appears in no HTML, CSS, JS, XML or JSON file in the build.
 *
 * Run: node scripts/prune.mjs   (chained after build by `pnpm build`)
 */

import { readdir, readFile, stat, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve, extname } from 'node:path';

const DIST = resolve('dist');
const ASSETS = join(DIST, '_astro');

if (!existsSync(ASSETS)) {
  console.log('prune: no dist/_astro, nothing to do.');
  process.exit(0);
}

/** Only ever consider raster sources for removal. Never JS, CSS or fonts. */
const PRUNABLE = new Set(['.png', '.jpg', '.jpeg', '.gif', '.tiff', '.avif', '.webp']);
const TEXTUAL = new Set(['.html', '.css', '.js', '.mjs', '.xml', '.json', '.txt', '.php']);

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

const all = await walk(DIST);

// Concatenate every text file once, then test membership against that haystack.
const haystack = (
  await Promise.all(
    all
      .filter((f) => TEXTUAL.has(extname(f).toLowerCase()))
      .map((f) => readFile(f, 'utf8').catch(() => ''))
  )
).join('\n');

const candidates = all.filter((f) => f.startsWith(ASSETS) && PRUNABLE.has(extname(f).toLowerCase()));

let removed = 0;
let bytes = 0;

for (const file of candidates) {
  const name = file.slice(ASSETS.length + 1);
  if (haystack.includes(name)) continue;

  bytes += (await stat(file)).size;
  await unlink(file);
  removed++;
}

if (removed === 0) {
  console.log('prune: nothing unreferenced.');
} else {
  console.log(`prune: removed ${removed} unreferenced asset(s), ${(bytes / 1024 / 1024).toFixed(1)} MB.`);
}
