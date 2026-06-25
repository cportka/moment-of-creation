# Improvements

A running, prioritized list of things worth improving — kept current with a pass over the
code each substantial change. Each item: **what**, **why it matters**, and a **sketch** of
the fix. Not a backlog of must-dos; a map of the known rough edges.

## High — real drift / correctness risk

### 1. The showcase hardcodes the dial schema (third copy)

**What.** Dial ranges/labels/hints live in three places: each animation's `schema`
(`src/intro/introTimeline.ts` `INTRO_SCHEMA`), the overlay's inline `__ospDials` defaults
(`src/intro/overlay.html`), and again in `index.html`'s `PANELS` array. The engine test only
guards that a *key* exists in the showcase — not that `min`/`max`/`step`/`label`/`hint`
match the registry.
**Why.** Change a range in the engine and the Pages knobs silently keep the old one.
**Sketch.** Emit `docs/schema.json` (or `schema.json` at the served root) from the registry
during `build:pages`, and have `index.html` build its panels by `fetch`ing it instead of the
hardcoded `PANELS`. One source of truth; the showcase becomes data-driven like the lab.

### 2. `__ospDials` is mirrored by hand (overlay ↔ `INTRO_DIALS`)

**What.** The overlay can't `import`, so it hard-codes the dials that `introTimeline.ts`
also declares; `introTimeline.test.ts` asserts they stay in lockstep.
**Why.** The test catches drift, but the duplication is a maintenance tax and a footgun.
**Sketch.** A tiny Vite transform (like `introOverlay()`) that injects the `INTRO_DIALS`
block into the overlay at build time, so the `.ts` is the single source. Must preserve the
first-paint guarantee (still inline in the served HTML).

## Medium — testing / CI

### 3. `verify:intro` can't run in CI (ffmpeg dependency)

**What.** `scripts/verify-intro.mjs` shells out to `ffmpeg` for luma/contact-sheet checks.
The minimal Playwright ffmpeg build rejects its filter args, so the pixel checks error
(the cascade guard still passes). It's therefore not wired into CI.
**Why.** The strongest "does the intro actually render" guard runs only by hand.
**Sketch.** Replace the ffmpeg luma reads with a ~30-line zero-dependency PNG decoder (mean
luma + a sampled column), drop the contact sheet (or make it optional), and add a CI job
that runs it headless with the bundled Chromium.

### 4. No interaction test for the showcase knobs

**What.** Tests check the showcase *has* a knob per dial, not that moving one changes the
animation.
**Why.** The same-origin `contentWindow.__ospDials` wiring could silently break.
**Sketch.** A Playwright test (Chromium is available): load `index.html` over a static
server, move a slider, assert the target iframe's `__ospDials[key]` updated.

### 5. Headless capture of the live-timed beats is unreliable

**What.** The creation/full intro don't render under `--virtual-time-budget` (their
sequence is gated on the first *painted* frame); only the splash and the freeze harness
capture cleanly.
**Why.** Hard to screenshot-verify the burst/full intro in automation.
**Sketch.** Generalize the `verify-intro.mjs` freeze harness to the splash + full modes
(set classes/`currentTime`, pause), so every beat has a deterministic shot.

## Medium — enhancements

### 6. The `splash` animation exposes only one live dial

**What.** Standalone, the merger reacts live to `splashSpeed` only; richer params (final
horizon diameter, dust density, hue range) are constants in the overlay/CSS.
**Why.** A thin tuning surface for an otherwise rich animation.
**Sketch.** Promote a few to `--osp-*` custom properties / `__ospDials` and read them in the
builder, then add them to `splash.ts`'s dials + schema.

### 7. `standalone.js` + `standalone.d.ts` are a hand-maintained twin

**What.** The export assembler is JS with a separate hand-written `.d.ts` so both Node and
the browser/TS can use it.
**Why.** The signature can drift from the impl.
**Sketch.** Author in TS and emit JS for the Node script in a prebuild, or add a type-level
test that exercises the declared signature.

## Low — polish

- **A11y:** showcase knob `<label>`s aren't programmatically associated with their inputs
  (`for`/`id` or wrapping). Wrap each input in its label.
- **`Animation.mode` is a loose `string`.** Could be a union (`'full' | 'creation' | 'splash'`)
  or validated against the overlay's supported modes.
- **In-overlay duplication.** `__ospCreation` repeats `__ospIntro`'s creation reset/restart
  block. Factoring a shared helper is awkward inside one inline script, but worth a look.
- **`docs/` now holds only `intro-script.md`.** Consider folding the storyboard into the
  intro README, or keep `docs/` purely for prose.

## Parked — saved for later

### Lissajous animation

A glowing Lissajous curve on a canvas — added as a deliberately *unrelated* second
animation to prove the engine generalizes, then cut when the showcase refocused on the
moment of creation's own two halves. Worth reviving as a genuinely independent example (it
exercises the engine more honestly than three modes of one overlay).

- **Where.** `src/animations/lissajous/` (overlay.html, lissajous.css, lissajous.ts) in git
  history before v0.2.0 (e.g. `git show d6da3b6:src/animations/lissajous/lissajous.ts`).
- **Revive.** Restore those files, re-add to `src/engine/registry.ts` +
  `src/engine/manifest.json`, and `npm run build:pages` / re-register in the lab. The engine
  tests will cover it automatically.
