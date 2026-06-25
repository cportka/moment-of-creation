# Changelog

All notable changes to this project. Versioning follows [SemVer](https://semver.org/);
each PR bumps the version.

## 0.1.1

### Fixed

- **GitHub Pages was blank.** Pages deploys from the repo root, where it served the Vite
  first-paint _demo_ `index.html` — which needs a build step, so static-served it threw
  `window.__ospDials is undefined`. The repo root is now the static, build-free site: the
  showcase is `index.html` with the single-file exports (`intro.html`, `lissajous.html`)
  beside it and a root `.nojekyll`. The Vite first-paint demo moved to `demo.html` (now the
  Vite build entry), and it guards on `window.__ospDials` so it can't throw if served raw.

## 0.1.0

Initial release — the animation engine.

- Extracted the **moment-of-creation** intro from One Still Point with its commit history.
- Build scaffold (Vite + TypeScript + Vitest) so it runs standalone.
- Generalized into a multi-animation **engine**: animations as registered data, a per-animation
  dial schema, a second animation (**Lissajous**), a general tuning **lab**, and a
  **single-file export** (`npm run export`).
- A **GitHub Pages showcase**: the intro and the Lissajous looping separately and composited
  together, with live knob panels for every dial.
