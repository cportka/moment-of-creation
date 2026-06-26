# moment-of-creation — an animation toolkit

A toolkit for **first-paint web animations**: it generates two animations — a pure-CSS
**Burst** and a binary **Merger** — and combines them into a **Moment**. Each paints on the
very first frame (before any bundle parses), tunes live, and exports as **one self-contained
`.html`** with zero external dependencies.

### ▶ Live showcase — https://cportka.github.io/moment-of-creation/

It grew out of the load **intro** of [One Still Point](https://onestillpoint.app) — that
intro *is* a Burst (a one-frame test pattern → a firework burst) followed by a Merger (two
orbs spiralling into an event horizon). Lifted into this repo (history intact) and
generalized, the engine can play either half, the combined Moment, **randomize** or **swap**
their order, or **chain** up to ten Moments together.

|  | |
| --- | --- |
| `npm run dev` | the showcase at **localhost:5173**, the first-paint demo at **/demo.html**, the tuning lab at **/intro-lab.html** |
| `npm test` | unit tests (engine, intro timeline, melt) |
| `npm run build` | type-check + production bundle |
| `npm run export -- <id>` | write a self-contained `dist/<id>.html` (omit `<id>` to export all) |
| `npm run build:pages` | regenerate the showcase's embedded `burst.html` / `merger.html` / `moment.html` |

```bash
npm install
npm run dev
```

## Live showcase (GitHub Pages)

**https://cportka.github.io/moment-of-creation/** — the repo **root** is a static,
build-free site served by GitHub Pages (*Deploy from a branch* → `main` / root).
[`index.html`](index.html) shows three windows on one row — left the **Burst**, middle the
**Moment** (the two combined), right the **Merger** — each looping, with compact knob panels
for all 40 parameters and a 12-preset picker (default **Genesis**). **🎲 Randomize** rolls
fresh values for one half; **⇄ Swap order** reverses the two in the Moment (middle plays
Merger→Burst); **⛓ Continue the chain** builds a **visual chain of up to ten Moments** —
a strip of clickable link chips you select to tune (the middle plays the whole composition,
the side windows show the selected link's two halves). It embeds the single-file exports
([`burst.html`](burst.html), [`merger.html`](merger.html), [`moment.html`](moment.html)) as
same-origin iframes and conducts them live; deep-link state with `?preset=`, `?swap=1`,
`?chain=<n>`. Regenerate the exports with `npm run build:pages`. (The Vite first-paint demo
lives in [`demo.html`](demo.html); it needs a build step, so it isn't the static homepage.)

## The animations

The toolkit makes two animations and combines them — one overlay
([`src/intro/overlay.html`](src/intro/overlay.html)) played in three **modes** (selected by
`window.__ospMode`):

| id | mode | what it is |
| --- | --- | --- |
| `burst` | `burst` | the **Burst** — black hold → 1-frame test pattern → pure-CSS firework burst. |
| `merger` | `merger` | the **Merger** — two orbs inspiral and merge into the forming event horizon (CSS + a canvas dust field). |
| `moment` | `moment` | the **Moment** — the Burst then the Merger, with the crossfade hand-off and the melt-inward Replay. |

The intro unit (the source of all three) has its own [README](src/intro/README.md).

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
npm run export -- moment       # → dist/moment.html
npm run export -- burst        # → dist/burst.html
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

A new **mode** of an existing overlay (how `burst` / `merger` share the Moment's overlay):
have the overlay's boot script branch on `window.__ospMode`, then register an `Animation`
with that `mode` (see [`src/intro/burst.ts`](src/intro/burst.ts)).

Either way, a test in [`src/engine/engine.test.ts`](src/engine/engine.test.ts) then checks it
for free: schema covers its dials, the overlay defines the contract and mirrors the dials,
and it exports to a self-contained file.

## Layout

```
index.html                 the GitHub Pages showcase (static; served from root)
burst.html · merger.html · moment.html   single-file exports the showcase embeds (npm run build:pages)
demo.html                  Vite first-paint demo: the Moment inlined before the bundle
intro-lab.html             the general tuning lab (loads src/lab.ts)
src/
  engine/                  types · registry · mount · standalone export · manifest
  intro/                   the one overlay + burst.ts / merger.ts / moment.ts (its modes) + dials.json
  lab.ts                   the general lab
scripts/                   export-animation.mjs · verify-intro.mjs · capture-*.mjs
docs/intro-script.md       the Moment's beat-by-beat storyboard
```

## Provenance

This repo was lifted out of `github.com/cportka/onestillpoint` keeping the intro's commit
history — see the extraction notes in [`src/intro/README.md`](src/intro/README.md). The
sandbox blocked a plain `git clone`/`git filter-repo`, so the equivalent filtered history
was reconstructed faithfully from per-commit snapshots (original author, date and message
on each), then the build scaffold and this engine were added on top.
