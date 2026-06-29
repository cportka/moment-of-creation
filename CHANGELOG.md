# Changelog

All notable changes to this project. Versioning follows [SemVer](https://semver.org/);
each PR bumps the version.

## 0.7.0

A creative + performance pass: stop leaning on a dust field of tiny particles (which dragged
the framerate down) and move to **snappy neon vector geometry** — more ways to explode, more
things to resolve into.

### Changed

- **Snappy.** The Last is no longer a heavy particle field. The dust is now a small, hard-capped
  *accent* (`Sparkle`, ~170 motes max); the show is bold neon vectors — a handful of strokes per
  frame. `Mandala` is now a whole-canvas composite (K blits, not K×N redraws). No more presets
  that grind to a near-standstill.
- **40 knobs (down from 50), with macros that chain sub-params internally** — e.g. `Texture` is
  one knob that journeys smooth → water → flame → crumble → disintegrate; `Flux` folds the inspiral
  + swirl. The dial labels stay abstract and pedal-style.
- **No emojis in the UI.** The showcase text is glyph-free; the dice is a small CSS die that still
  tumbles on a roll.

### Added

- **The First explodes six ways — `Blast`:** classic (the CSS firework), cone (directional),
  shockwave (expanding rings), shards (flying fragments), lightning (branching bolts), nova (a
  bloom of light). Plus `Spread` (tight ↔ full radial) and `Shards` (fragment count).
- **The Last resolves into eight neon `Form`s** — ring, polygon, star, slit (a portal), lens (an
  eye), lattice (a grid), spiral, cross — sized by `Scale`, detailed by `Facets`, haloed by `Halo`.
  It no longer always ends on a circle.
- **Slices of light — `Beams`** (count) + `Sweep` (rotation) + `Neon` (glow/weight): light wedges
  that frame the Form.
- **12 presets retuned** around the Forms/Blasts — `Genesis`, `Portal`, `Prism`, `Mandala`, `Nova`,
  `Lightning`, `Bloom`, `Ember`, `Singularity`, `Zen`, `Maelstrom` — keeping `Original`.

## 0.6.0

### Changed

- **Renamed the vocabulary again — First / Last / Together.** The Burst is now the **First**,
  the Merger the **Last**, the Moment the **Together** (ids, modes, scopes, files
  `first.ts` / `last.ts` / `together.ts`, exports `first.html` / `last.html` /
  `together.html`, registry, manifest, UI and docs). The overlay's `__ospPlay` accepts the
  new names plus the previous and oldest ones, so nothing breaks across renames. (Deep
  internals — the `osp-creation` / `osp-splash` CSS, `cr*` / `sp*` dial keys, the
  `__ospCreation` / `__ospSplashOnly` functions, the storyboard beats — stay as before.)
- **Knobs are now abstract, pedal-style sculptors** (in the spirit of Old Blood Noise
  Endeavors): every dial got a feeling/texture name — `Void`, `Ignition`, `Gravity`,
  `Vortex`, `Bloom`, `Breath`, `Shimmer`, `Chromatic`, `Heartbeat`, `Memory`, `Mood`,
  `Mortality`, `Dawn`, `Dusk`, … — instead of widths and sizes.

### Added

- **10 new sculpting behaviors (50 dials total)**, wired into the Last's canvas field — all
  default to 0 so the authored look is untouched:
  - **Tide** (water — a fluid rippling current), **Pyre** (flame — motes rise, lick and
    flicker), **Erosion** (crumble — break apart and fall), **Entropy** (disintegrate —
    scatter into noise), **Turbulence** (chaos), **Undertow** (a counter-current).
  - **Mandala** (kaleidoscopic N-fold symmetry) and **Facet** (soft motes harden into
    crystalline shapes) for geometry/fractals.
  - **Dawn** (how it *starts* — gather slowly from far, scattered chaos), and **Dusk** —
    the exit is now **signed**: collapse inward (−), settle (0), or fly apart (+). Plus
    **Ignition** for how violent the First's birth is. So starts and ends are no longer same-y.
- **Animated controls** — every button pops on press, the **🎲 dice tumbles and rolls
  through faces** when you randomize, and the Swap arrow flips.
- **Drag-and-drop chain reordering** — drag any link chip to reorder the chain (the selected
  link follows its move).
- **12 presets retuned around the new textures** — `Aqua` (water), `Inferno` (flame), `Ash`
  (crumble), `Entropy`, `Mandala`, `Prism`, `Supernova`, `Singularity` (collapse), `Zen`,
  `Maelstrom` (chaos), keeping `Genesis` as the default and `Original (One Still Point)`.

## 0.5.0

### Added

- **11 dynamic Merger knobs (40 dials total)** — pattern/geometry parameters that *actively
  change* the dust field rather than just sizing it: **Spiral arms** (quantise the dust into
  N arms), **Arm twist**, **Petal wave** (flower modulation off the arm count), **Swirl
  oscillation**, **Twinkle**, **Colour cycle**, **Radial pulse**, **Drift out**, **Dust
  trail** (motion-smear), **Dust warmth** and **Dust fade**. Wired into the canvas dust
  generator + draw loop; all default to today's look.
- **🎲 Randomize per half** — a button on the Burst and Merger panels rolls fresh values
  across the full range for *that half's* parameters only.
- **A visual, clickable chain (max 10).** The chain is now a strip of link chips — each a
  swatch of its Moment's colours — that you **click to select and edit**. The middle window
  plays the whole composition; the side windows show the selected link's Burst/Merger halves.
  `+` adds a Moment (up to ten), `×` removes one. Deep-link with `?chain=<n>` (n Moments).
- **12 presets, dramatically retuned**, each with a distinct visual identity built on the new
  dynamic knobs — `Genesis`, `Supernova`, `Pinwheel`, `Bloom`, `Comet trails`, `Prism`,
  `Embers`, `Singularity`, `Strobe`, `Zen`, `Frenetic`.

### Changed

- **New default preset.** `Genesis` — a colour-cycling spiral galaxy — is the default,
  differentiating the toolkit from One Still Point. The original intro is kept as a
  selectable preset, **`Original (One Still Point)`**, no longer the default.

### Fixed

- **Swap order could drop the Burst from the Moment.** Playing the Merger (or Burst) half
  alone sets the other layer `display:none`; the full Moment's `__ospIntro` never restored
  it, so after a few Swaps the middle Moment lost its Burst. It now resets both layers'
  visibility on every play.

## 0.4.0

### Changed

- **Standardized the vocabulary.** The toolkit makes two animations — a **Burst** and a
  **Merger** — and combines them into a **Moment**. Renamed the registered animations,
  modes, files (`burst.ts` / `merger.ts` / `moment.ts`), dial scopes, exports
  (`burst.html` / `merger.html` / `moment.html`) and all UI/docs to match. (Deep internals
  — the `osp-creation` / `osp-splash` CSS classes and `cr*` / `sp*` dial keys — stay as
  implementation detail; see the roadmap.)
- **Three windows, fixed roles, one row:** left **Burst**, middle **Moment** (the two
  combined), right **Merger**.

### Added

- **Swap order** — reverses the two animations in the Moment (the middle plays
  Merger→Burst) and swaps the side windows.
- **Continue the chain** — folds the current Moment into a new one: the current Moment
  becomes the saved left window, a new **randomized** Moment (perturbed from the current
  dials) becomes the right window, and the middle plays them combined. Repeatable (depth
  capped so the loop stays watchable). Deep-linkable via `?swap=1` / `?chain=<n>`.
- The showcase now **conducts** all three windows (one sequence player drives the Swap
  reversal and the chain), via a clearable `window.__ospLoop` handle on the export loop.

## 0.3.0

### Added

- **20 new tunable parameters** (29 total) wired to real effects — creation: core/flash
  sizes, ray length/width, ring thickness/expand, hue, brightness, test-pattern band;
  splash: orb/horizon/disk sizes, shock/streak/plume/flash sizes, hue, and canvas dust
  count/size/spiral. All default to today's look (CSS `var()` fallbacks).
- **10 presets** (`presets.json`), `Original` as the default, surfaced as a dropdown in the
  showcase and the lab.
- **Single source for dials** — `src/intro/dials.json` (defaults + UI schema + `scope`).
  `introTimeline.ts` derives `INTRO_DIALS`/`INTRO_SCHEMA`; `creation`/`splash` project their
  dials by `scope` via `pickByScope()`. The keystone from `IMPROVEMENTS.md` §0.1.

### Changed

- **The showcase is data-driven** — it `fetch`es `dials.json` + `presets.json` and builds
  its controls from them (the hand-copied panel literal is gone), with a **compact,
  grouped two-column dial UI** and the **three windows pinned to one row**.
- Dial labels/inputs are now associated for accessibility (`label[for]` + `aria-label`);
  `applyDials` coerces values through `Number()` so a non-number can't be baked into the
  inline export script.
- A full pass over the code: see [`IMPROVEMENTS.md`](IMPROVEMENTS.md) (this version lands
  §0.1, §0.2, §0.3 partial, §1.3, §2.4, §6.1/§6.2, §8.3/§8.4).

## 0.2.0

### Changed

- **The showcase now shows the moment of creation's own two halves.** The intro is two
  animations in sequence — the **creation burst** and the **binary-merger splash**. The
  engine now registers each half plus the whole as three animations driven from one
  overlay via `window.__ospMode` (`creation` / `splash` / `full`) — no duplicated markup.
  The Pages showcase shows the two halves looping separately and the original intro
  together (three windows), with a knob panel per half whose dials drive the matching
  windows live.

### Removed

- The **Lissajous** animation (an unrelated "does the engine generalize?" demo). Parked,
  not gone — see [`IMPROVEMENTS.md`](IMPROVEMENTS.md); the code is in git history.

### Added

- [`IMPROVEMENTS.md`](IMPROVEMENTS.md) — a running, prioritized list of code and
  architecture improvements from a full pass over the repo.
- `Animation.mode` + a mode dispatcher in the intro overlay so one overlay can play
  several ways.

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
