# moment-of-creation — an animation toolkit

A toolkit for **first-paint web animations**: it generates two animations — a pure-CSS
**First** and a binary **Last** — and combines them into a **Together**. Each paints on the
very first frame (before any bundle parses), tunes live, and exports as **one self-contained
`.html`** with zero external dependencies.

### ▶ Live showcase — https://cportka.github.io/moment-of-creation/

It grew out of the load **intro** of [One Still Point](https://onestillpoint.app) — that
intro *is* a First (a one-frame test pattern → a firework burst) followed by a Last (two
orbs spiralling into an event horizon). Lifted into this repo (history intact) and
generalized, the engine can play either half, the combined Together, **randomize** or
**swap** their order, or **chain** up to ten Togethers (drag to reorder).

You **sculpt** with **abstract, pedal-style knobs** — not widths and sizes. The First explodes
six ways (the **Blast** — cone, shockwave, shards, lightning, nova) and the Last resolves into
eight neon **Forms** (ring, polygon, star, slit, lens, lattice, spiral, cross) framed by slices
of light. It's drawn as **snappy neon vectors** — a handful of strokes a frame — not a field of
thousands of particles.

|  | |
| --- | --- |
| `npm run dev` | the showcase at **localhost:5173**, the first-paint demo at **/demo.html**, the tuning lab at **/intro-lab.html** |
| `npm test` | unit tests (engine, intro timeline, melt) |
| `npm run build` | type-check + production bundle |
| `npm run export -- <id>` | write a self-contained `dist/<id>.html` (omit `<id>` to export all) |
| `npm run build:pages` | regenerate the showcase's embedded `first.html` / `last.html` / `together.html` |

```bash
npm install
npm run dev
```

## Use it in your project

It ships as a **framework-agnostic library with zero runtime dependencies**. Every path below
plays the same animation; pick by how much control you want.

| You want… | Use | Build step? |
| --- | --- | --- |
| The simplest drop-in, fully isolated | a **single `.html` in an `<iframe>`** | none |
| A tag you configure with attributes | the **`<moment-of-creation>` web component** | bundler or a `<script>` |
| Programmatic control (create / update / destroy) | **`embed(target, opts)`** | bundler |
| A full-page load intro you crossfade out of | **`mount(opts)`** | bundler |
| Your own controls / presets UI | the exported **`presets` / `dials` / `buildStandaloneHtml`** | bundler |

> **Why iframes?** The overlay is a singleton (fixed-position, `window.__osp*` globals), so the
> embed paths wrap it in an `<iframe srcdoc>` — each instance is contained, immune to your CSS/JS,
> and safe to repeat on one page. `mount()` is the one in-document, full-page path.

### 1 · Single file in an `<iframe>` (no build, works anywhere)

The repo ships self-contained exports ([`together.html`](together.html), [`first.html`](first.html),
[`last.html`](last.html)). Drop one in an iframe — host it yourself, or pull it straight from the
repo via a CDN:

```html
<iframe src="together.html" style="border:0;width:100%;height:100%"></iframe>

<!-- straight from the repo, no install: -->
<iframe src="https://cdn.jsdelivr.net/gh/cportka/moment-of-creation/together.html"></iframe>
```

### 2 · Install

```bash
npm install moment-of-creation
# …or straight from the repo (builds on install):
npm install github:cportka/moment-of-creation
```

### 3 · The `<moment-of-creation>` web component

```js
import { register } from 'moment-of-creation';
register(); // defines <moment-of-creation> (idempotent)
```

```html
<moment-of-creation preset="portal" mode="together" loop
                    style="display:block; height:420px"></moment-of-creation>
```

Attributes: `preset`, `mode` (`together` / `first` / `last`), `loop` (`true` / `false` / a number of ms),
`background`, and `dials` (a JSON object of overrides). It renders an isolated iframe internally, so
size it with CSS (defaults to a 1:1 block). No build? Use the UMD bundle from a CDN and call
`MomentOfCreation.register()`:

```html
<script src="https://cdn.jsdelivr.net/npm/moment-of-creation"></script>
<script>MomentOfCreation.register()</script>
<moment-of-creation preset="nova"></moment-of-creation>
```

### 4 · `embed()` and `mount()`

```js
import { embed, mount } from 'moment-of-creation';

// Contained, isolated, repeatable — an iframe inside your element:
const handle = embed(document.querySelector('#hero'), { preset: 'genesis', loop: true });
handle.update({ mode: 'last', dials: { spForm: 3 } }); // re-tune live
handle.destroy();

// A full-page load intro, in your document (single instance). Define __ospBoot to load
// your app under the opening black, then crossfade in:
window.__ospBoot = () => import('./main.js');
mount({ preset: 'genesis' });
```

`EmbedOptions` (shared by all three): `{ mode?, preset?, dials?, loop?, background? }`.

### 5 · Build your own UI / files

```js
import { presets, dials, buildStandaloneHtml, byId } from 'moment-of-creation';

presets;                 // [{ id, name, dials }, …] — for a picker / deep-links
dials;                   // { key: { label, min, max, step, unit, scope, hint, default } } — 40 knobs
buildStandaloneHtml(byId('together'), { dials: { spForm: 2 }, mode: 'together', loopMs: 3400 });
// → a complete, self-contained HTML document string (save it, or set it as an iframe srcdoc)
```

### 6 · In a framework (React · Vue · Svelte · Angular)

`<moment-of-creation>` is a standard custom element, so it works everywhere — call `register()` once
at startup, then use the tag (pass `dials` as a JSON **string** attribute). Each framework needs one
small thing:

- **React 19** — custom elements work out of the box; render `<moment-of-creation preset="portal"
  dials={JSON.stringify({ spForm: 3 })} style={{ height: 420 }} />`. (Pre-19, or for fully-typed
  options, call `embed(ref.current, { … })` in a `useEffect` instead.)
- **Vue 3** — tell the compiler it's a custom element:
  `vue({ template: { compilerOptions: { isCustomElement: (t) => t.includes('-') } } })`, then use the
  tag with `:dials="JSON.stringify({ spForm: 3 })"`.
- **Svelte** — works natively; just use the tag.
- **Angular** — add `CUSTOM_ELEMENTS_SCHEMA` to the component/module `schemas`, then bind
  `[attr.dials]="…"`.

Full, copy-paste snippets for each are in [`examples/embed.html`](examples/embed.html) and the
expanded guide. **TypeScript:** `EmbedOptions.preset` is a `PresetId` union and `EmbedOptions.dials`
is keyed by `DialKey`, so preset names and knob names autocomplete and type-check; `DIAL_KEYS` and
`PRESET_IDS` are exported if you want to enumerate them.

And if you'd rather **own the source**, the animation is a single forkable unit — copy
[`src/intro/`](src/intro/README.md) from the repo (one find/replace renames the `osp-` namespace).

See the [full demo + tuning lab](#live-showcase-github-pages) below, or
[**try every knob live →**](https://cportka.github.io/moment-of-creation/).

## Live showcase (GitHub Pages)

**https://cportka.github.io/moment-of-creation/** — the repo **root** is a static,
build-free site served by GitHub Pages (*Deploy from a branch* → `main` / root).
[`index.html`](index.html) shows three windows on one row — left the **First**, middle the
**Together** (the two combined), right the **Last** — each looping, with compact knob panels
for all 40 parameters and a 12-preset picker (default **Genesis**). **Randomize** rolls fresh
values for one half (the die tumbles); **Swap order** reverses the two in the Together
(middle plays Last→First); **Continue the chain** builds a **visual chain of up to ten
Togethers** — a strip of link chips you **click to edit** and **drag to reorder** (the middle
plays the whole composition, the side windows show the selected link's two halves). It embeds
the single-file exports ([`first.html`](first.html), [`last.html`](last.html),
[`together.html`](together.html)) as same-origin iframes and conducts them live; deep-link
state with `?preset=`, `?swap=1`, `?chain=<n>`. Regenerate the exports with
`npm run build:pages`. (The Vite first-paint demo lives in [`demo.html`](demo.html); it needs
a build step, so it isn't the static homepage.)

## The animations

The toolkit makes two animations and combines them — one overlay
([`src/intro/overlay.html`](src/intro/overlay.html)) played in three **modes** (selected by
`window.__ospMode`):

| id | mode | what it is |
| --- | --- | --- |
| `first` | `first` | the **First** — black hold → 1-frame test pattern → pure-CSS firework burst. |
| `last` | `last` | the **Last** — two orbs inspiral + merge (CSS), then the field resolves into a selectable neon **Form** + slices of light on the canvas (this is where most knobs live). |
| `together` | `together` | the **Together** — the First then the Last, with the crossfade hand-off and the melt-inward Replay. |

The intro unit (the source of all three) has its own [README](src/intro/README.md).

## Sculpting — abstract knobs

The 40 knobs are *characterful* macros, not dimensions — each chains several sub-effects:

- **the explosion** — `Blast` (classic · cone · shockwave · shards · lightning · nova),
  `Spread` (tight ↔ full radial), `Shards`, `Ignition`, `Reach`.
- **the form it resolves into** — `Form` (ring · polygon · star · slit · lens · lattice · spiral ·
  cross), `Facets` (its detail), `Scale`, `Halo`, plus `Beams` / `Sweep` / `Neon` for the slices of
  light that frame it.
- **how it moves** — `Flux` (inspiral), `Heartbeat`, `Mandala` (a cheap whole-canvas kaleidoscope),
  `Texture` (one knob: smooth → water → flame → crumble → disintegrate), `Turbulence`.
- **start & end** — `Dawn` (gather from far) and `Dusk` (a signed exit: collapse inward `−`, settle
  `0`, fly apart `+`).

Defaults match the authored look, so the **Original (One Still Point)** preset stays faithful and
**Genesis** is the new default; the field is **snappy neon vectors** with a small, capped dust
`Sparkle` — not a heavy particle field.

## The idea — an animation is data

An animation is a registered object, not code the engine hardcodes
([`src/engine/types.ts`](src/engine/types.ts)):

```ts
interface Animation {
  id: string;
  name: string;
  dials: Record<string, number>;          // tuning values, mirrored by the overlay
  schema: Record<string, DialSchema>;      // per-dial UI metadata — the lab renders sliders from this
  overlayHtml: string;                     // first-paint markup + inline boot script (imported ?raw)
  css: string;                             // the stylesheet (imported ?raw)
  loopMs?: (dials) => number;              // one play's length, if finite (drives the lab loop)
  background?: string;
  mode?: string;                           // which slice a multi-mode overlay plays (window.__ospMode)
  presets?: Preset[];                      // named tunings (the lab + showcase offer a picker)
}
```

Dials, their UI schema (`label`/`min`/`max`/`step`/`unit`/`hint`/`scope`) and the presets
live as **data in one place** — [`src/intro/dials.json`](src/intro/dials.json) and
[`src/engine/presets.json`](src/engine/presets.json). The overlay mirrors the defaults
(kept in lockstep by a test), the lab imports them, and the static showcase `fetch`es them —
so the 40 parameters and 12 presets are declared once.

They're collected in [`src/engine/registry.ts`](src/engine/registry.ts); the lab, the
export and the tests all read from that one list. The engine plays a **selected**
animation rather than a single hardcoded sequence.

## The first-paint contract

The whole point is that an animation **paints on the first frame**, before the app
bundle parses. So each animation's overlay is markup **plus an inline `<script>`** that
must stay inline — the shipped page and the export inline it at build/export time, and
the lab re-executes it on mount. The contract between that inline script and the host is
a handful of `window.__osp*` globals:

| global | direction | meaning |
| --- | --- | --- |
| `window.__ospDials` | read/write | the live tuning dials (numbers). |
| `window.__ospPlay()` | you call | play the animation from the top (the generic entry; the intro also keeps `__ospIntro`). |
| **`window.__ospBoot`** | **you define** | **the one hook** — the overlay calls it at the very start so your app's heavy bundle loads *under* the opening hold, not at the reveal. |

Keep the inline script inline. Converting it to an imported module loses the
first-paint guarantee that makes the intro (and the single-file export) work. The intro
adds a few more globals (`__ospSplash*`, `__ospSplashStart`, and `__ospMode` to pick which
half to play) — see [`src/intro/README.md`](src/intro/README.md) for its full contract and
reveal/Replay wiring.

## The lab

`npm run dev` → **/intro-lab.html**. Pick any registered animation; it plays behind a
panel of sliders **rendered from that animation's own schema**. Tweaks bind live to
`window.__ospDials`; **Copy values** emits a paste-back snippet; **Export .html**
downloads the self-contained single file for the current animation, with your tuning
baked in. Switching animations mounts a different overlay
([`src/engine/mount.ts`](src/engine/mount.ts) re-executes the inline script so it still
paints + plays).

## Single-file export

```bash
npm run export -- together     # → dist/together.html
npm run export -- first        # → dist/first.html
npm run export                 # all registered animations
```

The output is one file: inline `<style>`, the inline overlay script, a canvas, **zero
external dependencies**. Because the overlay already paints inline, this is a packaging
step — the engine wraps the same overlay + CSS, defines a no-op `__ospBoot` (there's no
app to load in a standalone file), and optionally loops. The in-browser lab's **Export**
button and the CLI use the **same** assembly ([`src/engine/standalone.js`](src/engine/standalone.js)).

## Add an animation

A new **standalone** animation:

1. Make `src/animations/<id>/overlay.html` — first-paint markup + an inline `<script>`
   that defines `window.__ospDials` and `window.__ospPlay()`, calls `window.__ospBoot`
   once, and paints frame 0 synchronously.
2. Make its `.css` (namespaced; opaque background so it paints first).
3. Make `<id>.ts` exporting an `Animation` (import `overlay.html?raw` + the css `?raw`,
   declare `dials` + `schema`).
4. Register it in [`src/engine/registry.ts`](src/engine/registry.ts) and add it to
   [`src/engine/manifest.json`](src/engine/manifest.json) (the Node export CLI reads that JSON).

A new **mode** of an existing overlay (how `first` / `last` share the Together's overlay):
have the overlay's boot script branch on `window.__ospMode`, then register an `Animation`
with that `mode` (see [`src/intro/first.ts`](src/intro/first.ts)).

Either way, a test in [`src/engine/engine.test.ts`](src/engine/engine.test.ts) then checks it
for free: schema covers its dials, the overlay defines the contract and mirrors the dials,
and it exports to a self-contained file.

## Releasing (maintainers)

The library build (`npm run build:lib` → `dist/` ESM + UMD + `.d.ts`) runs automatically on
`npm install` (the `prepare` hook), so `npm install github:cportka/moment-of-creation` works from
source. CI also runs it and a `scripts/smoke-package.mjs` check (the built bundle must import under
plain Node — i.e. stay SSR-safe).

Publishing is **tag-driven** via [`.github/workflows/release.yml`](.github/workflows/release.yml):

```bash
npm version patch   # or minor / major — bumps package.json + tags vX.Y.Z
git push --follow-tags
```

The pushed `v*.*.*` tag triggers a workflow that tests, builds, and runs
`npm publish --provenance --access public` (a signed npm provenance attestation, via GitHub
Actions OIDC). **One-time setup:** add a repo secret `NPM_TOKEN` (an npm *Automation* token), or
configure npm *Trusted Publishing* for the package (then the token isn't needed). To publish by hand
instead: `npm publish` (the `prepublishOnly` hook runs the tests + type-check first).

## Layout

```
index.html                 the GitHub Pages showcase (static; served from root)
first.html · last.html · together.html   single-file exports the showcase embeds (npm run build:pages)
demo.html                  Vite first-paint demo: the Together inlined before the bundle
intro-lab.html             the general tuning lab (loads src/lab.ts)
examples/embed.html        embedding examples (iframe · web component · embed())
src/
  index.ts                 the public library entry (exports below)
  engine/                  types · registry · mount · standalone export · manifest
                           embed.ts (embed / mount / <moment-of-creation>) · keys.ts (typed dial/preset names)
  intro/                   the one overlay + first.ts / last.ts / together.ts (its modes) + dials.json
  lab.ts                   the general lab
vite.lib.config.ts         library build → dist/ (ESM + UMD + .d.ts); `npm run build:lib`
scripts/                   export-animation.mjs · smoke-package.mjs · verify-intro.mjs · capture-*.mjs
.github/workflows/         ci.yml (test + build + smoke) · release.yml (tag-driven npm publish)
docs/intro-script.md       the Together's beat-by-beat storyboard
```

## Provenance

This repo was lifted out of `github.com/cportka/onestillpoint` keeping the intro's commit
history — see the extraction notes in [`src/intro/README.md`](src/intro/README.md). The
sandbox blocked a plain `git clone`/`git filter-repo`, so the equivalent filtered history
was reconstructed faithfully from per-commit snapshots (original author, date and message
on each), then the build scaffold and this engine were added on top.
