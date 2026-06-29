# Roadmap

A loose roadmap for the toolkit — what's shipped, what's next, what's later, what's parked.
Honest about rough edges, not a contract. Each item is roughly **what · why · sketch**.

The toolkit makes two animations — a **First** and a **Last** — and combines them into a
**Together**. Everything below is in that vocabulary (renamed from Burst/Merger/Moment in 0.6).

---

## Shipped

- **0.1** — extracted the intro from One Still Point (history intact) + a Vite/TS/Vitest scaffold.
- **0.2** — generalized into a multi-mode engine: the Burst and Merger halves + the whole Moment,
  one overlay played in three modes (`window.__ospMode`).
- **0.3** — single source for dials (`src/intro/dials.json`) + presets (`src/engine/presets.json`);
  +20 parameters (29 total) wired to real CSS/canvas effects; data-driven, compact, one-row showcase.
- **0.4** — standardized the **Burst / Merger / Moment** vocabulary (ids, modes, files, scopes,
  exports, UI, docs); fixed window roles (left Burst · middle Moment · right Merger);
  **Swap order**; **Continue the chain**; a showcase "conductor" (one sequence player drives the
  swap reversal and the chain) via a clearable `window.__ospLoop`.
- **0.5** — **11 dynamic Merger knobs (40 total)** — pattern/geometry that *actively changes*
  (spiral arms, arm twist, petal wave, swirl oscillation, twinkle, colour cycle, radial pulse,
  drift, dust trail, warmth, fade) wired into the canvas dust. **🎲 Randomize per half**;
  a **visual, clickable chain** (a strip of per-Moment swatch chips, select to edit, max 10);
  **12 dramatically-retuned presets** with a new default (**Genesis**, the OG kept as
  `Original`); fixed the **Swap-drops-the-Burst** bug (half-only plays left a layer hidden).
- **0.6** — renamed the vocabulary **First / Last / Together** (was Burst / Merger / Moment);
  turned the dials into **abstract, pedal-style sculptors** (Void, Ignition, Gravity, Vortex,
  Bloom, Breath, Shimmer, Mood, Mortality…); added **10 texture behaviours (50 total)** to the
  Last's canvas — **Tide** (water), **Pyre** (flame), **Erosion** (crumble), **Entropy**
  (disintegrate), **Turbulence**, **Undertow**, **Mandala** (kaleidoscope), **Facet** (shapes),
  **Dawn** (start) and a signed **Dusk** (collapse ↔ explode); **animated buttons + a tumbling
  dice**; **drag-to-reorder** chain links; **12 texture-forward presets**.

---

## Now / next — small, high-value

- **`verify:intro` in CI.** The strongest render guard shells to `ffmpeg`, which the minimal
  Playwright build rejects, so CI runs only `npm test` + build. Replace the ffmpeg luma reads with
  a ~30-line zero-dep PNG decoder (`zlib` inflate + unfilter) and add a headless CI job. *Highest-value
  missing automation — most changelog entries are render regressions.*
- **Finish the vocabulary rename through the internals.** The CSS classes (`#osp-creation` /
  `#osp-splash`), dial-key prefixes (`cr*` / `sp*`), overlay fn names (`__ospCreation` /
  `__ospSplashOnly`) and the storyboard `INTRO_BEATS` ids still use the original words — and
  there have now been three naming generations at the API/UI layer (creation/splash →
  burst/merger → first/last). 0.4 and 0.6 deliberately stopped above the internals to keep the
  delicate overlay + `verify-intro.mjs` regex safe. Do the internal pass with a careful
  find/replace + a green `verify:intro`, and consider a `mode` alias map so old names keep working.
- **Showcase interaction test.** Nothing asserts that a knob (or Swap / Continue) actually changes a
  window. A small Playwright test (Chromium is present) — load the page, move a slider / click Continue,
  assert the iframe's `__ospDials` / caption updated.
- **`manifest.json` `loopMs` is frozen at default dials.** The registry computes it from dials but the
  manifest hard-codes the result; a future `export --preset` would loop at the wrong interval. Recompute
  in the CLI (or derive, don't duplicate) + a test that `manifest.loopMs === registry.loopMs(defaults)`.

## Chain & swap — follow-ups (0.4–0.6)

- **Per-step crossfades in the conductor.** The Moment's default (single `moment` step) keeps the
  polished burst→merger crossfade, but the Swap reversal and chain sequences are hard cuts between
  steps. Add a short fade (or overlap two iframes) between sequence steps.
- **Step timing is approximate.** `stepMs()` estimates each step's length from a few dials; if a dial
  makes a beat much longer/shorter the next step can clip or lag. Have the overlay signal "done"
  (a `window.__ospDone` callback / postMessage) and advance on that instead of a timer.
- **Live chain thumbnails.** The chain chips are a colour swatch derived from each link's hue dials,
  not a render of the Together. A real (cheap, throttled) thumbnail — a tiny live iframe or a cached
  canvas frame per link — would make the chain genuinely previewable. (0.6 added drag-to-reorder.)
- **Chain persistence.** 0.5 added per-link **rewind** (the `×` on a chip) and `?chain=<n>` seeds a
  randomized chain, but a hand-built chain still lives in memory only. Serialize the links (URL hash /
  localStorage) so a specific composition is shareable like `?preset=`.
- **Swap inside chain mode** is still normal-mode-only (chain mode shows the selected link's two halves
  in the side windows instead). Decide whether a per-link swap belongs in the chain, or leave by design.

## Later — bigger / structural

- **Build-time injection of the overlay's `__ospDials`** from `dials.json` (a sibling of the
  `introOverlay()` Vite plugin), so the overlay's numbers stop being hand-typed while staying inline.
  Today they're hard-coded, guarded by the inline-sync test.
- **JSON-blob dial baking.** `applyDials` rewrites each dial with a per-key regex; bake a single
  `JSON.stringify`'d blob the overlay reads instead — robust at 50 dials + presets.
- **One slider renderer.** The lab (`src/lab.ts`, Vite-served) and the showcase (`index.html`, static)
  each build sliders; they share the *data* but not the code. Build the showcase JS through Vite too.
- **`Animation.mode` is a loose `string`** — `mode: 'mergr'` silently falls through to the Moment.
  Make it a union and validate at registry load (hoist the allowlist out of the test).
- **In-overlay DRY:** `__ospIntro` and `__ospCreation` repeat the burst reset/restart dance — factor a
  local `restartBurst(cr)`. `mount.ts resetGlobals()` hand-lists every `__osp*` — drive it from one
  `OSP_GLOBALS` array shared with `vite-env.d.ts`.
- **More Last parameters** (dust hue spread, jet angle, orb turns) promoted to dials/`--osp-*`.
  0.6 added ten texture/geometry knobs; the CSS-structured bits (jet, orbs, plumes) are still fixed.
- **Texture knobs are Last-only.** Tide/Pyre/Mandala/Facet etc. sculpt the canvas dust; the First is
  pure CSS, so it only got `Ignition`. A canvas layer in the First (or CSS filters driven by the same
  knobs) would let water/flame/crumble shape the birth too.
- **Stale provenance:** `intro.css` says `INTRO_TIMING.meltMs` (it's `MELT_MS`); `docs/intro-script.md`
  references the origin app (`main.ts`, `MIN_SPLASH_MS`, `src/core/…`). Fix the comment; banner/trim the
  storyboard. The `1400ms` boot safety-net is the one timing that isn't a dial — derive or comment it.
- **A11y polish:** continue auditing label/control association and slider keyboard affordances.

## Parked

- **Lissajous.** A glowing Lissajous curve, added as a deliberately *unrelated* animation to prove the
  engine generalizes, then cut when the showcase refocused on the First/Last/Together. Worth reviving as
  a genuinely independent example (it exercises the engine more honestly than three modes of one overlay).
  Lives in git history before v0.2.0 (`git show <pre-0.2.0>:src/animations/lissajous/lissajous.ts`);
  restore the files, re-add to `registry.ts` + `manifest.json`, `npm run build:pages`.
