# moment-of-creation — an animation engine

A small engine for **first-paint web animations**: each animation paints on the very
first frame (before any bundle parses), can be tuned live in a general lab, and can be
exported as **one self-contained `.html`** with zero external dependencies.

It grew out of the load **intro** of [One Still Point](https://onestillpoint.app) — a
black hold, a one-frame test pattern, a pure-CSS *moment of creation* burst, and a
colourful binary-merger splash — which was lifted into this repo (history intact) and
then generalized so it can play *many* animations, not just that one.

|  | |
| --- | --- |
| `npm run dev` | the selected animation at **localhost:5173**, the tuning lab at **/intro-lab.html** |
| `npm test` | unit tests (engine, intro timeline, melt) |
| `npm run build` | type-check + production bundle |
| `npm run export -- <id>` | write a self-contained `dist/<id>.html` (omit `<id>` to export all) |

```bash
npm install
npm run dev
```

## The two animations

| id | what it is |
| --- | --- |
| `intro` | the **moment of creation** — black hold → 1-frame test pattern → CSS firework burst → binary-merger splash, then a crossfade hand-off and a melt-inward Replay. Its own unit lives in [`src/intro/`](src/intro/README.md). |
| `lissajous` | a glowing **Lissajous curve** on a canvas — deliberately unrelated to the intro. It shares the engine and *nothing else*: its own overlay, CSS and dials. It's the proof the abstraction generalizes. |

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
}
```

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
adds a few more globals (`__ospSplash*`, `__ospSplashStart`) — see
[`src/intro/README.md`](src/intro/README.md) for its full contract and reveal/Replay wiring.

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
npm run export -- lissajous    # → dist/lissajous.html
npm run export                 # all registered animations
```

The output is one file: inline `<style>`, the inline overlay script, a canvas, **zero
external dependencies**. Because the overlay already paints inline, this is a packaging
step — the engine wraps the same overlay + CSS, defines a no-op `__ospBoot` (there's no
app to load in a standalone file), and optionally loops. The in-browser lab's **Export**
button and the CLI use the **same** assembly ([`src/engine/standalone.js`](src/engine/standalone.js)).

## Add an animation

1. Make `src/animations/<id>/overlay.html` — first-paint markup + an inline `<script>`
   that defines `window.__ospDials`, defines `window.__ospPlay()`, calls `window.__ospBoot`
   once, and paints frame 0 synchronously. (Copy `src/animations/lissajous/overlay.html`.)
2. Make its `.css` (namespaced; opaque background so it paints first).
3. Make `<id>.ts` exporting an `Animation` (import `overlay.html?raw` + the css `?raw`,
   declare `dials` + `schema`).
4. Register it in `src/engine/registry.ts`, and add it to
   `src/engine/manifest.json` (the Node export CLI reads that JSON).

A test in [`src/engine/engine.test.ts`](src/engine/engine.test.ts) then checks it for
free: schema covers its dials, the overlay defines the contract and mirrors the dials,
and it exports to a self-contained file.

## Layout

```
index.html                 demo: the intro, inlined for first paint
intro-lab.html             the general tuning lab (loads src/lab.ts)
src/
  engine/                  types · registry · mount · standalone export · manifest
  intro/                   the moment-of-creation intro (its own README) + intro.ts wrapper
  animations/lissajous/    the second animation
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
