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
import dialsJson from './dials.json';

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
 * The intro dials live in one place now — `dials.json` (each key carries its default, UI
 * schema, and `scope`). `INTRO_SCHEMA` (key → metadata) and `INTRO_DIALS` (key → default)
 * are derived from it, so the lab, the showcase and the tests share a single source.
 * The inline boot script paints before the bundle, so it still hard-codes the same numbers
 * on `window.__ospDials`; `introTimeline.test.ts` keeps the two in lockstep.
 */
export const INTRO_SCHEMA = dialsJson as Record<string, DialSchema>;

export const INTRO_DIALS = Object.fromEntries(
  Object.entries(dialsJson).map(([key, meta]) => [key, meta.default]),
) as Record<keyof typeof dialsJson, number>;

/** Project the dials/schema for the given scope(s) — how each half (creation / splash)
 *  declares only the dials it owns without re-typing them. */
export function pickByScope(...scopes: string[]): {
  dials: Record<string, number>;
  schema: Record<string, DialSchema>;
} {
  const dials: Record<string, number> = {};
  const schema: Record<string, DialSchema> = {};
  for (const [key, meta] of Object.entries(INTRO_SCHEMA)) {
    if (scopes.includes(meta.scope ?? '')) {
      dials[key] = INTRO_DIALS[key as keyof typeof INTRO_DIALS];
      schema[key] = meta;
    }
  }
  return { dials, schema };
}

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
