import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

// Library build — bundles src/index.ts into dist/ as ESM + UMD, with the overlay HTML and
// CSS inlined (imported `?raw`), so the package is self-contained with zero dependencies.
// `.d.ts` types are emitted separately by `tsc -p tsconfig.build.json` (see build:lib).
export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      name: 'MomentOfCreation', // UMD global for the <script> / CDN path
      formats: ['es', 'umd'],
      fileName: (format) => (format === 'es' ? 'moment-of-creation.js' : 'moment-of-creation.umd.cjs'),
    },
  },
});
