/**
 * The intro timeline — one source of truth for *when* each beat happens, shared by
 * the bundle (replay path in `main.ts`) and mirrored by the inline boot script in
 * `index.html` (which can't import, so it hard-codes the same numbers — the
 * `introTimeline.test.ts` "inline sync" guard keeps the two from drifting).
 *
 * The intro is a sequence of beats, each oriented toward **the One Still Point** at
 * the centre of the screen. Every beat targets its own frame rate: the *intro story*
 * (the black hold, the test pattern, the moment of creation, the splash) is a cheap
 * CSS + canvas overlay that runs **uncapped** — we target **200 FPS** (past the
 * limit of human flicker detection, so it's as smooth as the display allows). The
 * *physics model* (the live engine + formation dolly) renders at its own rate and is
 * the one thing the optional cinematic frame-cap may throttle.
 *
 *   A · Black      0.00–0.25s   black hold              200 fps target (nothing drawn)
 *   B · Lines      ~0.25s       1-frame test pattern    200 fps target (one frame)
 *   C · Creation   ~0.28s+      the firework burst      200 fps target (CSS)
 *   D · Splash     ~0.33s+      the binary merger       200 fps target (CSS + canvas)
 *   E · Engine     ~0.6s onward the model settling in   engine/physics rate
 */

import type { DialSchema } from '../engine/types';

/** Frame rate we aim the *intro story* (everything but the live physics model) at —
 *  uncapped, beyond the limit of human flicker detection. Documentation/intent: the
 *  CSS + canvas overlay runs every animation frame, so it's as smooth as the display
 *  permits (a 60/120/240Hz panel simply can't show all 200). */
export const INTRO_STORY_FPS = 200;

/** The named beats and their FPS targets, in order (drives the script doc + tests). */
export const INTRO_BEATS = [
  { id: 'black', label: 'Black hold', fps: INTRO_STORY_FPS },
  { id: 'lines', label: 'Test pattern', fps: INTRO_STORY_FPS },
  { id: 'creation', label: 'Moment of creation', fps: INTRO_STORY_FPS },
  { id: 'splash', label: 'The splash', fps: INTRO_STORY_FPS },
  { id: 'engine', label: 'Engine takeover', fps: 0 /* 0 = the physics model's own rate */ },
] as const;

/**
 * The intro dials — the one place (with the `window.__ospDials` mirror in `index.html`)
 * to tune the load intro. Times are ms; *speeds* are duration multipliers (1 = as
 * authored, 2 = twice as slow, 0.5 = twice as fast). The inline boot script paints
 * before the bundle, so it can't import these — it hard-codes the same values; the
 * `introTimeline.test.ts` inline-sync guard keeps the two from drifting.
 */
export const INTRO_DIALS = {
  /** (a) Opening black-screen length. */
  initialBlackMs: 500,
  /** (b) The deliberate split-second of black after the interference pattern. */
  splitBlackMs: 70,
  /** (c) Moment-of-creation animation speed (× its CSS durations). */
  creationSpeed: 1,
  /** (d) Splash animation speed (× its CSS durations). */
  splashSpeed: 1,
  /** How long the creation plays as its own beat before handing to the splash. Tuned so
   *  the splash reveals (creationBeatMs + creationFadeMs after the burst) by ~0.95s. */
  creationBeatMs: 240,
  /** (e) Creation→splash crossfade *overlap*: when the splash starts relative to the
   *  creation fade — negative = splash a touch *before* the fade (overlap, no gap),
   *  positive = a black gap. */
  creationToSplashMs: -80,
  /** (e) Creation→splash crossfade *speed*: how fast the creation fades into the splash. */
  creationFadeMs: 120,
  /** (f) Splash→engine crossfade *hold*: how long the splash stays up before the engine is
   *  revealed (main.ts's MIN_SPLASH_MS, measured from the splash's first painted frame). */
  splashHoldMs: 600,
  /** (f) Splash→engine crossfade *speed*: how fast the splash fades into the engine. */
  splashFadeMs: 450,
} as const;

/** Replay: the live view "melts" inward toward the One Still Point for this long before
 *  the intro replays from black (bundle-only; not part of the inline overlay). */
export const MELT_MS = 2000;

/**
 * When (ms after the intro starts) the screen is reliably *covered* — the opaque creation
 * layer covers from the first frame and the splash takes over by here — i.e. when it's
 * safe to un-melt the engine canvas on replay and start the splash's minimum-on-screen
 * countdown. dismissAfterPlayed still polls `__ospSplashStart`, so a generous value is fine.
 */
export const SPLASH_COVERS_AT_MS =
  INTRO_DIALS.initialBlackMs + INTRO_DIALS.splitBlackMs + INTRO_DIALS.creationBeatMs + 150;

/**
 * The intro's per-dial UI schema — the metadata the tuning lab renders sliders from.
 * Promoted out of the lab (it used to hold a private `META` map) so the intro, like
 * every animation, *declares its own* schema; the generalized lab reads it from the
 * registry. Rows render in `INTRO_DIALS` order (also the copy-paste snippet order).
 */
export const INTRO_SCHEMA: Record<keyof typeof INTRO_DIALS, DialSchema> = {
  initialBlackMs: { label: 'Opening black', min: 0, max: 2000, step: 10, unit: 'ms',
    hint: '(a) how long the screen holds pure black before the test pattern' },
  splitBlackMs: { label: 'Split black', min: 0, max: 400, step: 5, unit: 'ms',
    hint: '(b) the deliberate sliver of black after the test pattern' },
  creationSpeed: { label: 'Creation speed', min: 0.25, max: 4, step: 0.05, unit: '×',
    hint: '(c) stretch / compress the moment-of-creation burst (1 = as authored)' },
  splashSpeed: { label: 'Splash speed', min: 0.25, max: 4, step: 0.05, unit: '×',
    hint: '(d) stretch / compress the splash animation (1 = as authored)' },
  creationBeatMs: { label: 'Creation beat', min: 0, max: 1200, step: 10, unit: 'ms',
    hint: 'how long the creation plays as its own beat before the splash' },
  creationToSplashMs: { label: 'Creation → splash overlap', min: -400, max: 400, step: 5, unit: 'ms',
    hint: '(e) splash start vs the creation fade — negative = overlap (no black gap)' },
  creationFadeMs: { label: 'Creation fade', min: 0, max: 800, step: 10, unit: 'ms',
    hint: '(e) how fast the creation crossfades into the splash' },
  splashHoldMs: { label: 'Splash hold', min: 0, max: 3000, step: 50, unit: 'ms',
    hint: '(f) how long the splash holds before the engine is revealed (read by main.ts)' },
  splashFadeMs: { label: 'Splash fade', min: 0, max: 1500, step: 10, unit: 'ms',
    hint: '(f) how fast the splash crossfades into the engine' },
};
