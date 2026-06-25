import { defineConfig, type Plugin } from 'vite';
import { readFileSync } from 'node:fs';

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

export default defineConfig({ plugins: [introOverlay()] });
