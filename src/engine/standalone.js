/**
 * Build a chosen animation into one self-contained `.html`: inline CSS, the inline
 * overlay script, a canvas, zero external dependencies. Because the overlay already
 * paints inline on the first frame, this is a packaging step — wrap the same overlay +
 * CSS the app uses, define a no-op `__ospBoot` (there's no app to load in a standalone
 * file), bake in any tuned dials, and optionally loop.
 *
 * Plain JS (not TS) on purpose: the in-browser lab AND the Node export CLI
 * (scripts/export-animation.mjs) import this one implementation. Types live in
 * standalone.d.ts.
 */

/** Bake dial overrides into the overlay's `window.__ospDials = { ... }` block (scoped to
 *  that object literal, so a dial name appearing elsewhere is untouched). */
export function applyDials(overlayHtml, dials) {
  if (!dials) return overlayHtml;
  return overlayHtml.replace(/(__ospDials\s*=\s*\{)([\s\S]*?)(\s*\};)/, (_m, open, body, close) => {
    let out = body;
    for (const [key, value] of Object.entries(dials)) {
      const num = Number(value);
      if (!Number.isFinite(num)) continue; // never bake a non-number into the inline script
      // `\b<key>\s*:` anchors the property name (the trailing `:` rules out prefix collisions).
      out = out.replace(new RegExp('(\\b' + key + '\\s*:\\s*)(-?[0-9.]+)'), '$1' + num);
    }
    return open + out + close;
  });
}

/**
 * @param {{ name: string, css: string, overlayHtml: string, background?: string }} anim
 * @param {{ dials?: Record<string, number>, loopMs?: number, mode?: string }} [opts]
 * @returns {string} a complete, self-contained HTML document
 */
export function buildStandaloneHtml(anim, opts = {}) {
  const overlay = applyDials(anim.overlayHtml, opts.dials);
  const bg = anim.background || '#05060a';
  // Pick the overlay slice before it auto-plays (multi-mode overlays read window.__ospMode).
  const modeLine = opts.mode ? `\n      window.__ospMode = ${JSON.stringify(opts.mode)};` : '';
  const loop =
    opts.loopMs && opts.loopMs > 0
      ? `\n      window.setInterval(function () { if (window.__ospPlay) window.__ospPlay(); }, ${Math.round(opts.loopMs)});`
      : '';
  const tail = loop ? `\n    <script>\n      (function () {${loop}\n      })();\n    </script>` : '';
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="color-scheme" content="dark" />
    <title>${anim.name}</title>
    <style>
${anim.css}
    </style>
  </head>
  <body style="margin: 0; background: ${bg}">
    <!-- ${anim.name} — self-contained export from the moment-of-creation engine. The
         inline script below paints on the first frame; there is no external app, so
         __ospBoot is a no-op. Zero external dependencies. -->
    <script>
      window.__ospBoot = function () {};${modeLine}
    </script>
${overlay}${tail}
  </body>
</html>
`;
}
