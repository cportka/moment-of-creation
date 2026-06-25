import type { Animation } from './types';

export interface StandaloneOptions {
  /** Dial overrides to bake into the exported file (defaults to the overlay's values). */
  dials?: Record<string, number>;
  /** If set, the export auto-replays every `loopMs` (for finite animations like the intro). */
  loopMs?: number;
}

/** Bake dial overrides into an overlay's `window.__ospDials` block. */
export function applyDials(overlayHtml: string, dials?: Record<string, number>): string;

/** Build a chosen animation into one self-contained HTML document (zero external deps). */
export function buildStandaloneHtml(
  anim: Pick<Animation, 'name' | 'css' | 'overlayHtml' | 'background'>,
  opts?: StandaloneOptions,
): string;
