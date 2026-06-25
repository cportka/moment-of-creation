# Improvements

A prioritized, honest map of the repo's rough edges — refreshed with a full pass over the
code (and an independent audit) for the v0.3.0 work. Each item: **what**, **why it
matters**, **where** (file refs), a **fix sketch**, and **status**.

> **Status key:** ✅ done in 0.3.0 · 🔧 partially done in 0.3.0 · 🔜 planned · 💤 parked

**What 0.3.0 lands:** the dial single-source (§0.1), presets in the data model (§0.2),
dial `scope` tags + a `pick()` projection (§2.4), the data-driven showcase that *fetches*
its controls (§0.1), hardened dial baking (§0.3), the +20 parameters (§1.3), the compact
grouped dial UI and three-on-one-row layout (§8.3/§8.4), and a11y label association in the
new control renderer (§6.1/§6.2). The rest is sequenced below.

---

## 0. The keystone — fix before/with the dial growth

### 0.1 The dial schema lived in four places ✅
Every dial was declared in (1) `src/intro/overlay.html`'s inline `window.__ospDials`
(can't `import`), (2) `src/intro/introTimeline.ts` (`INTRO_DIALS` + `INTRO_SCHEMA`),
(3) `index.html`'s hardcoded `PANELS` (a fourth copy of label/min/max/step/default/hint),
and (4) the per-half subsets re-typed in `creation.ts` / `splash.ts`. Adding 20 dials
meant ~20 synchronized edits across four spots, guarded only by *key-presence* tests — so
range/label drift between the registry and the showcase was silently allowed.

**Why it matters.** This was *the* blocker for "+20 dials, 10 presets."
**Fix (0.3.0).** One source of truth: **`src/intro/dials.json`** (`{key: {label, default,
min, max, step, unit, hint, scope}}`). `introTimeline.ts` derives `INTRO_DIALS`/`INTRO_SCHEMA`
from it; `creation.ts`/`splash.ts` project subsets by `scope` (§2.4); the **showcase
`fetch`es `dials.json`** at runtime and builds its panels from it (the `PANELS` literal is
gone). The overlay still hard-codes `__ospDials` for first-paint, kept honest by the
inline-sync test. (Build-time injection of the overlay block remains 🔜 — see §0.4.)

### 0.2 Presets had no home in the data model ✅
The `Animation` interface had no `presets`; nothing could express "10 named tunings."
**Fix (0.3.0).** **`src/engine/presets.json`** — `[{id, name, dials}]`, where `dials` is a
partial override over the defaults; `"Original"` is the empty/default preset. `Animation`
gains an optional `presets`. The lab and the showcase both render a **preset `<select>`**
from this one list; picking one applies the overrides over every dial and replays.

### 0.3 `applyDials` baking was fragile 🔧
Baking dials into the single-file export was a per-key regex (`standalone.js`):
`('(\\b' + key + '\\s*:\\s*)(-?[0-9.]+)')`. Hazards that worsen at 29 dials + presets:
key-prefix matches, value formats outside `-?[0-9.]+`, and "first `__ospDials` block only."
**Fix (0.3.0, partial).** Anchor the key match, coerce every value through `Number()` and
skip non-finite, and assert (test) that baking *all* dials at once round-trips. The fuller
fix — bake a single `JSON.stringify`'d blob instead of N regexes — stays 🔜 (§0.4).

### 0.4 Remaining single-source gaps 🔜
- Inject the overlay's `__ospDials` from `dials.json` at build time (a sibling of the
  `introOverlay()` Vite plugin), so the overlay's numbers stop being hand-typed while
  staying inline. Today: hard-coded, guarded by the inline-sync test.
- Replace regex baking with a JSON-blob the overlay parses (`§0.3` fuller fix).

---

## 1. Correctness / bugs

### 1.1 `manifest.json` `loopMs` is frozen at default dials 🔜
The registry computes `loopMs` from dials (`intro.ts`/`creation.ts`/`splash.ts`), but
`manifest.json` hard-codes the result; the CLI export reads the static number. Harmless
today (the CLI can't pass dials yet), but the moment `npm run export -- … --preset` exists,
it'll bake tuned dials and loop at the *default* interval.
**Fix.** Recompute `loopMs` from the (overridden) dials in the CLI, or stop duplicating it
in the manifest (derive it). Add a test that `manifest.loopMs === registry.loopMs(defaults)`.

### 1.2 Looped full-intro re-arms an uncleared safety-net timer 🔜
`buildStandaloneHtml` wraps finite animations in `setInterval(__ospPlay, loopMs)`; for
`full`, each replay re-arms the 1400ms boot safety-net `setTimeout` (`overlay.html`) that's
never cleared — a slow timer accrual on a long-lived showcase tab. Harmless (boot is a
no-op in exports) but a latent leak.
**Fix.** Store + clear the safety-net timer at the top of `__ospIntro`.

### 1.3 The splash exposed exactly one live parameter ✅
Of the rich splash, only `splashSpeed` was tunable; dust count, sizes, hue, horizon
diameter (`--core-d`), disk/streak/plume/flash sizes were constants.
**Fix (0.3.0).** Promoted to dials + `--osp-*` custom properties / canvas params (part of
the +20). See the new `sp*` and `cr*` dials in `dials.json`.

### 1.4 Stale provenance references 🔜
`intro.css` comments `INTRO_TIMING.meltMs` (the constant here is `MELT_MS`); and
`docs/intro-script.md` references `src/core/…`, `main.ts`, `MIN_SPLASH_MS` etc. that belong
to the *origin app*, not this repo.
**Fix.** s/`INTRO_TIMING.meltMs`/`MELT_MS`/ in the CSS comment; banner or trim the
origin-app sections of the storyboard (§9.2).

### 1.5 The 1400ms boot safety-net is a magic number 🔜
Every other timing is a dial; this one is hard-coded and implicitly coupled to
`initialBlackMs`. Either derive it (`initialBlackMs + slack`) or comment why it's fixed.

---

## 2. Architecture & DRY

### 2.1 In-overlay triplication of the burst reset/restart dance 🔜
The "reset className → null each animation → reflow → restore" restart appears in both
`__ospIntro` and `__ospCreation`. You can't `import` into an inline script, but you can
factor a local `function restartBurst(cr)` inside the IIFE. Worth doing before the script
grows further.

### 2.2 `mount.ts resetGlobals()` hand-lists every `__osp*` global 🔜
Three unsynchronized lists (reset list, `vite-env.d.ts`, the overlay). A forgotten reset
entry leaks state across a lab animation switch. Drive it from one
`const OSP_GLOBALS = [...] as const`.

### 2.3 `Animation.mode` is a loose `string` 🔜
Only a test's `['full','creation','splash']` array and the overlay's `if` chain enforce
valid modes; `mode:'creaton'` silently falls through to `full`. Make it a union or validate
at registry load (hoist the allowlist out of the test).

### 2.4 Dials had three implicit tiers encoded by *which file lists them* ✅
creation-only vs splash-only vs sequencing was implied by which `.ts` re-typed which keys.
**Fix (0.3.0).** Each dial carries `scope: 'creation' | 'splash' | 'sequence'` in
`dials.json`; the halves and the showcase's window-targeting derive from it (`pick()` /
`scope → targets`). Adding a dial = tag it once.

### 2.5 Two slider renderers (lab vs showcase) 🔜 (constrained)
The lab (`lab.ts`, TS, Vite-served) and the showcase (`index.html`, static, Pages-served,
no build step) each build sliders. A *shared module* is awkward because the static showcase
can't import from `src/` on Pages. 0.3.0 unifies the **data** (both read one source) and
keeps two small renderers; a fuller fix would build the showcase JS via Vite too.

---

## 3. Testing & CI

### 3.1 `verify:intro` can't run in CI (ffmpeg filters rejected) 🔜
The strongest render guard shells to `ffmpeg` (luma + `drawtext` contact sheet); the
minimal Playwright ffmpeg rejects those filters, so CI runs only `npm test` + build. Given
how many changelog entries are intro-render regressions, this is the highest-value missing
automation. **Fix.** Replace the ffmpeg luma reads with a ~30-line zero-dep PNG decoder
(`zlib` inflate + unfilter), gate the contact sheet, and add a CI job that runs it headless.

### 3.2 No interaction test for the showcase knobs 🔜
Tests assert a knob *exists*, not that moving it mutates the target iframe's `__ospDials`.
The cross-window glue is exactly what a layout/UI refactor can break. **Fix.** A Playwright
test: serve the root, move a slider, assert `frames.intro.contentWindow.__ospDials[key]`
updated.

### 3.3 Schema *content* across copies was untested ✅ (obviated)
Nothing asserted the showcase's min/max/step matched the registry. 0.3.0 makes the showcase
*fetch* the registry data, so the copy (and the gap) is gone; a test now guards the
generated `dials.json` covers every registry dial with valid ranges.

### 3.4 Headless capture of live-timed beats is unreliable 🔜
The full intro is gated on the first painted frame and doesn't render under
`--virtual-time-budget`; only the freeze harness / splash capture cleanly. Generalize the
`verify-intro.mjs` freeze harness to splash + full so every beat has a deterministic shot.

### 3.5 CI doesn't verify the committed exports are fresh 🔜
`creation/splash/intro.html` are tracked and embedded by the showcase; nothing checks
they're regenerated. **Fix.** CI: `npm run build:pages && git diff --exit-code *.html`.

---

## 4. Performance

### 4.1 The showcase runs three always-on rAF loops 🔜
Three iframes auto-play and loop forever — two canvas dust fields (`splash` + `full`) plus a
looping CSS burst — even off-screen or backgrounded. **Fix.** Gate each iframe's loop on an
`IntersectionObserver` + `visibilitychange`; add `loading="lazy"`. The one-row layout makes
all three visible at once, so this matters more now.

### 4.2 Broad `will-change` 🔜
`will-change` is set on every `.osp-cr` / orb and the melt canvas — dozens of promoted
layers × three live windows. Scope it to the `--go` state.

---

## 5. Build / tooling

### 5.1 `standalone.js` + `standalone.d.ts` hand-maintained twin 🔜
Author in TS and emit JS for the Node CLI, or add a type-test that exercises the declared
signatures.

### 5.2 The manifest is a second source of truth for the registry 🔜
`manifest.json` restates id/name/overlay/css/mode/background/loopMs because the Node CLI
can't import the TS registry. Generate it from the registry in a prebuild (with `vite-node`/
`tsx`), which also fixes §1.1.

---

## 6. Accessibility

### 6.1 Dial labels weren't associated with inputs ✅
Labels sat *next to* inputs without `for`/`id` or wrapping — unnamed controls for AT, and
clicking the label didn't focus. **Fix (0.3.0).** The new compact renderer wraps each
input in its `<label>` and gives the range an `aria-label` + `aria-describedby` → the hint.

### 6.2 The number+range pair had no shared accessible name ✅
Fixed with 6.1 (the range gets `aria-label`).

### 6.3 No reduced-motion handling at the showcase level 🔜
The animations honor `prefers-reduced-motion` internally, but the showcase's `setInterval`
loops still replay. Consider not auto-looping under reduced motion.

---

## 7. Security

### 7.1 Dial values are concatenated into inline `<script>` when baking 🔧
`mode` is `JSON.stringify`'d and `loopMs` is numeric (safe), but `applyDials` concatenated
raw dial values. Low risk (UI coerces to `Number`), widened by presets. **Fix (0.3.0).**
Coerce + reject non-finite inside `applyDials`/`buildStandaloneHtml`, not just at the UI.

### 7.2 Same-origin iframe reads are fragile if ever cross-origin 🔜
The showcase reads `contentWindow.__ospDials` (same-origin, `try/catch`). Documented; note
it so a future "host exports on a CDN" change doesn't silently no-op (the catch swallows it).

### 7.3 Self-contained export invariant — enforced ✅ (keep)
Tests assert no external `<link>`/`<script src>`; keep that guard through any baking rework.

---

## 8. Product / UX

### 8.1 No shareable deep-link for a tuning 🔜
The lab deep-links `?anim=`, but not dial values; "Copy values" emits code, not a URL.
**Fix.** Serialize live dials to the query string (or `?d=<base64>`) in both surfaces;
presets become shareable links for free.

### 8.2 Showcase "Reset" used a fourth copy of defaults ✅ (obviated)
Reset now pulls from the fetched registry data, so the two surfaces' resets can't disagree.

### 8.3 No compact / grouped dial UI ✅
A flat list of 29 dials is unusable. **Fix (0.3.0).** `scope` groups render as compact,
collapsible sections; a preset selector sits on top; the rows are denser (label + slider +
number on tight lines, two columns where space allows).

### 8.4 Three windows on one row ✅
Were a 3-col grid collapsing to one column ≤820px. **Fix (0.3.0).** Pinned to one row with
`repeat(3, minmax(0,1fr))` and a `min()`-sized frame so they hold across widths (with a
sensible floor on very narrow screens).

---

## 9. Parked / saved for later

### 9.1 Revive the Lissajous as a genuinely independent example 💤
Generality is currently proven by *three modes of one overlay* — which share overlay + CSS +
most dials. A truly independent animation (continuous, no `loopMs`, its own overlay/CSS/
dials) exercises the registry far more honestly and is the best regression test for the
single-source refactor. Code is in git history: `git show <pre-0.2.0>:src/animations/lissajous/lissajous.ts`
(it lived under `src/animations/lissajous/`). Revive *after* 0.1 to validate the new
architecture.

### 9.2 Scope or fold `docs/intro-script.md` 🔜
~40% of the storyboard describes the origin app (One Still Point), not this repo. Banner
those sections as origin-app context, or trim.

---

## Sequencing (the throughline)

1. **§0.1 + §2.4 + §0.2** — single-source dials with `scope`, the data-driven showcase, and
   presets. *Everything rides on this.* — **0.3.0**
2. **§0.3 / §7.1** — robust, safe baking. — **0.3.0 (partial; JSON-blob 🔜)**
3. **§1.3 + §8.3 + §8.4** — the 20 dials + compact grouped UI + one-row layout, now cheap
   because the plumbing is data-driven. — **0.3.0**
4. **§3.1 + §3.2 + §3.5** — CI visual guard + showcase interaction test + stale-export check.
5. **§1.1 / §5.2** — kill the manifest drift (recompute `loopMs`).
6. **§9.1** — revive the Lissajous to validate the new architecture.
7. Polish: §2.1, §2.2, §4.1, §6.3.

The keystone is the dial single-source: adding 20 dials and 10 presets onto the old
four-copy structure would have quadrupled the drift surface; doing §0.1/§0.2/§2.4 first
makes new dials and presets nearly free to add and impossible to drift.
