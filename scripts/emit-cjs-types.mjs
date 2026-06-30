// Emit CommonJS-flavoured type declarations (`*.d.cts`) alongside the ESM ones.
//
// The package is dual-format: the `import` condition serves the ESM bundle +
// `dist/index.d.ts`, the `require` condition serves the UMD/CJS bundle. Because
// `package.json` has `"type": "module"`, a `.d.ts` is interpreted as ESM, so a
// CJS `require('moment-of-creation')` consumer (moduleResolution node16/nodenext)
// would get TS1471 ("module only resolves to an ES module") without a `.d.cts`
// twin for the `require` condition to point at.
//
// The type *shapes* are identical between the two formats, so we mirror the
// emitted `.d.ts` tree to `.d.cts`, rewriting relative `./x.js` specifiers to
// `./x.cjs` (which TS resolves to the sibling `./x.d.cts`). Run this AFTER the
// `tsc` declaration emit and the `standalone.d.ts` copy in `build:lib`.
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;

/** Recursively collect every `*.d.ts` (but not already-emitted `*.d.cts`). */
function declarations(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...declarations(full));
    else if (name.endsWith('.d.ts')) out.push(full);
  }
  return out;
}

let count = 0;
for (const file of declarations(DIST)) {
  const esm = readFileSync(file, 'utf8');
  // Rewrite relative module specifiers `'./x.js'` / `"../x.js"` → `.cjs` so the
  // CJS declaration resolves to its `.d.cts` siblings. Only touches quoted
  // relative specifiers ending in `.js`; bare-package and asset specifiers are
  // already stripped from declaration output.
  const cjs = esm.replace(/(['"])(\.\.?\/[^'"]*?)\.js\1/g, '$1$2.cjs$1');
  writeFileSync(file.replace(/\.d\.ts$/, '.d.cts'), cjs);
  count++;
}

console.log(`emit-cjs-types: wrote ${count} .d.cts file(s)`);
