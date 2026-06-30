#!/usr/bin/env node
// Smoke-test the *built* library bundle in plain Node (no DOM). Run after `npm run build:lib`.
// Asserts the public API surface + the data shapes are intact — and, crucially, that importing
// the package server-side does NOT throw (the web component must be SSR-safe). Prints "smoke ok".
import { createRequire } from 'node:module';

const DIST = new URL('../dist/moment-of-creation.js', import.meta.url);
const DIST_CJS = new URL('../dist/moment-of-creation.umd.cjs', import.meta.url);

function fail(msg) {
  console.error(`smoke failed: ${msg}`);
  process.exit(1);
}

try {
  const mod = await import(DIST); // must not throw under Node (no DOM)
  const { buildEmbedHtml, register, embed, mount, animations, presets, dials, DIAL_KEYS, PRESET_IDS } = mod;

  for (const [name, fn] of [
    ['buildEmbedHtml', buildEmbedHtml],
    ['register', register],
    ['embed', embed],
    ['mount', mount],
  ]) {
    if (typeof fn !== 'function') fail(`${name} is not a function (got ${typeof fn})`);
  }

  // buildEmbedHtml produces a self-contained document with no DOM needed.
  const html = buildEmbedHtml({ preset: 'portal' });
  if (typeof html !== 'string') fail(`buildEmbedHtml did not return a string (got ${typeof html})`);
  if (!html.startsWith('<!doctype')) fail(`output does not start with <!doctype (${JSON.stringify(html.slice(0, 24))})`);
  if (!html.includes('spForm')) fail('output does not contain "spForm" (preset not baked)');

  // the registry — three animations, display order.
  const ids = Array.isArray(animations) ? animations.map((a) => a.id) : null;
  const want = ['first', 'last', 'together'];
  if (!ids || ids.length !== want.length || ids.some((id, i) => id !== want[i])) {
    fail(`animations ids = ${JSON.stringify(ids)} (expected ${JSON.stringify(want)})`);
  }

  // data shapes + the typed-key arrays agree with the data.
  if (!Array.isArray(presets) || presets.length !== 12) fail(`presets.length = ${presets?.length} (expected 12)`);
  if (!dials || Object.keys(dials).length !== 40) fail(`Object.keys(dials).length = ${Object.keys(dials || {}).length} (expected 40)`);
  if (!Array.isArray(DIAL_KEYS) || DIAL_KEYS.length !== 40) fail(`DIAL_KEYS.length = ${DIAL_KEYS?.length} (expected 40)`);
  if (!Array.isArray(PRESET_IDS) || PRESET_IDS.length !== 12) fail(`PRESET_IDS.length = ${PRESET_IDS?.length} (expected 12)`);

  // the `require` condition (UMD/CJS bundle) must also load under plain Node and expose the API,
  // so dual-package consumers (`require('moment-of-creation')`) work, not just ESM `import`.
  const require = createRequire(import.meta.url);
  const cjs = require(DIST_CJS.pathname);
  for (const name of ['buildEmbedHtml', 'register', 'embed', 'mount']) {
    if (typeof cjs[name] !== 'function') fail(`require: ${name} is not a function (got ${typeof cjs[name]})`);
  }

  console.log('smoke ok');
} catch (err) {
  console.error('smoke failed:', err && err.stack ? err.stack : err);
  process.exit(1);
}
