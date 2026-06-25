# moment-of-creation — an animation engine

A small engine for **first-paint web animations**: each animation paints on the very
first frame (before any bundle parses), can be tuned live in a general lab, and can be
exported as **one self-contained `.html`** with zero external dependencies.

### ▶ Live showcase — https://cportka.github.io/moment-of-creation/

It grew out of the load **intro** of [One Still Point](https://onestillpoint.app) — a
black hold, a one-frame test pattern, a pure-CSS *moment of creation* burst, and a
colourful binary-merger splash — which was lifted into this repo (history intact) and
generalized into an engine. The intro is itself **two animations** — the creation burst
and the binary-merger splash — which the engine can play apart or together.

|  | |
| --- | --- |
| `npm run dev` | the showcase at **localhost:5173**, the first-paint demo at **/demo.html**, the tuning lab at **/intro-lab.html** |
| `npm test` | unit tests (engine, intro timeline, melt) |
| `npm run build` | type-check + production bundle |
| `npm run export -- <id>` | write a self-contained `dist/<id>.html` (omit `<id>` to export all) |
| `npm run build:pages` | regenerate the showcase's embedded `creation.html` / `splash.html` / `intro.html` |

```bash
npm install
npm run dev
```

## Live showcase (GitHub Pages)

**https://cportka.github.io/moment-of-creation/** — the repo **root** is a static,
build-free site served by GitHub Pages (*Deploy from a branch* → `main` / root).
[`index.html`](index.html) shows the moment of creation's two halves — the **creation
burst** and the **binary-merger splash** — looping on their own, and **together** as the
original intro (three windows), with live knob panels for every dial. It embeds the
single-file exports ([`creation.html`](creation.html), [`splash.html`](splash.html),
[`intro.html`](intro.html)) as same-origin iframes, so the sliders drive the running
animations in real time. Regenerate the exports with `npm run build:pages`. (The Vite
first-paint demo lives in [`demo.html`](demo.html); it needs a build step, so it isn't the
static homepage.)

## The animations

The moment of creation is two animations in sequence; the engine registers each half and
the whole — one overlay ([`src/intro/overlay.html`](src/intro/overlay.html)) played in
three **modes** (selected by `window.__ospMode`):

| id | mode | what it is |
| --- | --- | --- |
| `creation` | `creation` | the **creation burst** — black hold → 1-frame test pattern → pure-CSS firework burst. |
| `splash` | `splash` | the **binary-merger splash** — two orbs inspiral and merge into the forming event horizon (CSS + a canvas dust field). |
| `intro` | `full` | the whole **moment of creation** — both halves in sequence, the crossfade hand-off, and the melt-inward Replay. |

The intro unit has its own [README](src/intro/README.md).

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
so the 29 parameters and 10 presets are declared once.

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
npm run export -- intro        # → dist/intro.html
npm run export -- creation     # → dist/creation.html
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

A new **mode** of an existing overlay (how `creation` / `splash` share the intro): have the
overlay's boot script branch on `window.__ospMode`, then register an `Animation` with that
`mode` (see [`src/intro/creation.ts`](src/intro/creation.ts)).

Either way, a test in [`src/engine/engine.test.ts`](src/engine/engine.test.ts) then checks it
for free: schema covers its dials, the overlay defines the contract and mirrors the dials,
and it exports to a self-contained file.

## Layout

```
index.html                 the GitHub Pages showcase (static; served from root)
creation.html · splash.html · intro.html   single-file exports the showcase embeds (npm run build:pages)
demo.html                  Vite first-paint demo: the intro inlined before the bundle
intro-lab.html             the general tuning lab (loads src/lab.ts)
src/
  engine/                  types · registry · mount · standalone export · manifest
  intro/                   the intro overlay + intro.ts / creation.ts / splash.ts (its three modes)
  lab.ts                   the general lab
scripts/                   export-animation.mjs · verify-intro.mjs · capture-*.mjs
docs/intro-script.md       the intro's beat-by-beat storyboard
```

## Provenance

This repo was lifted out of `github.com/cportka/onestillpoint` keeping the intro's commit
history — see the extraction notes in [`src/intro/README.md`](src/intro/README.md). The
sandbox blocked a plain `git clone`/`git filter-repo`, so the equivalent filtered history
was reconstructed faithfully from per-commit snapshots (original author, date and message
on each), then the build scaffold and this engine were added on top.
