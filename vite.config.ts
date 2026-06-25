import { defineConfig, type Plugin } from 'vite';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const OVERLAY_MARKER = '<!-- @osp-intro-overlay -->';
const overlayUrl = new URL('./src/intro/overlay.html', import.meta.url);

function introOverlay(): Plugin {
  return {
    name: 'intro-overlay',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) =>
        html.includes(OVERLAY_MARKER) ? html.replace(OVERLAY_MARKER, readFileSync(overlayUrl, 'utf8')) : html,
    },
    handleHotUpdate(ctx) {
      if (ctx.file.endsWith('/src/intro/overlay.html')) {
        ctx.server.hot.send({ type: 'full-reload' });
        return [];
      }
    },
  };
}

export default defineConfig({
  plugins: [introOverlay()],
  // The repo root index.html is the static, build-free Pages showcase, so the Vite app's
  // entry is the first-paint demo (demo.html), where introOverlay() inlines the overlay
  // before the bundle. `npm run dev` still serves every page (showcase at /, demo at
  // /demo.html, lab at /intro-lab.html).
  build: { rollupOptions: { input: fileURLToPath(new URL('./demo.html', import.meta.url)) } },
});
