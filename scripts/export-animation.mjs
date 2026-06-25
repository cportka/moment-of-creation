#!/usr/bin/env node
/**
 * Export an animation as one self-contained `.html` — inline CSS, inline overlay script,
 * canvas, zero external dependencies:
 *
 *     npm run export -- intro            # → dist/intro.html
 *     npm run export -- lissajous out.html
 *     npm run export                     # all registered animations → dist/<id>.html
 *
 * It reads src/engine/manifest.json (the Node-readable index of animations) and uses the
 * SAME assembly the in-browser lab uses (src/engine/standalone.js), so a CLI export and a
 * lab export are byte-for-byte identical for the same dials.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { buildStandaloneHtml } from '../src/engine/standalone.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(readFileSync(join(ROOT, 'src/engine/manifest.json'), 'utf8'));

const [id, outArg] = process.argv.slice(2);

function exportOne(entry, out) {
  const overlayHtml = readFileSync(join(ROOT, entry.overlay), 'utf8');
  const css = readFileSync(join(ROOT, entry.css), 'utf8');
  const html = buildStandaloneHtml(
    { name: entry.name, css, overlayHtml, background: entry.background },
    { loopMs: entry.loopMs, mode: entry.mode },
  );
  const dest = out || join(ROOT, 'dist', `${entry.id}.html`);
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, html);
  console.log(`exported ${entry.id} → ${dest} (${html.length.toLocaleString()} bytes)`);
}

if (id) {
  const entry = manifest.find((m) => m.id === id);
  if (!entry) {
    console.error(`unknown animation "${id}" — have: ${manifest.map((m) => m.id).join(', ')}`);
    process.exit(1);
  }
  exportOne(entry, outArg);
} else {
  for (const entry of manifest) exportOne(entry);
}
