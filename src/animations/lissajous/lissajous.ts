/**
 * Lissajous, as a registered animation — the proof the engine generalizes. It shares
 * the Animation shape, the registry, the lab and the export with the intro, and nothing
 * else: its own overlay (markup + inline boot script), its own stylesheet, its own dials
 * and schema. The overlay/CSS stay the source of truth (imported `?raw`).
 */
import type { Animation } from '../../engine/types';
import overlayHtml from './overlay.html?raw';
import css from './lissajous.css?raw';

/** Defaults, mirrored by the overlay's inline `window.__ospDials` (engine test guards it). */
export const LISSAJOUS_DIALS = {
  freqX: 3,
  freqY: 2,
  phase: 90,
  spin: 6,
  speed: 1,
  trail: 90,
  points: 900,
  width: 2.5,
  hue: 190,
};

export const lissajous: Animation = {
  id: 'lissajous',
  name: 'Lissajous',
  dials: { ...LISSAJOUS_DIALS },
  schema: {
    freqX: { label: 'Frequency X', min: 1, max: 12, step: 1, unit: '', hint: 'horizontal frequency — lobes across' },
    freqY: { label: 'Frequency Y', min: 1, max: 12, step: 1, unit: '', hint: 'vertical frequency — lobes down' },
    phase: { label: 'Phase', min: 0, max: 360, step: 1, unit: '°', hint: 'phase offset between the X and Y waves' },
    spin: { label: 'Spin', min: 0, max: 90, step: 1, unit: '°/s', hint: 'how fast the phase drifts — keeps the figure alive' },
    speed: { label: 'Speed', min: 0, max: 4, step: 0.05, unit: '×', hint: 'overall time multiplier (0 = frozen)' },
    trail: { label: 'Trail', min: 0, max: 100, step: 1, unit: '%', hint: 'motion-trail persistence (100 = never fades)' },
    points: { label: 'Points', min: 50, max: 4000, step: 10, unit: '', hint: 'samples along the curve (smoothness)' },
    width: { label: 'Line width', min: 0.5, max: 8, step: 0.5, unit: 'px', hint: 'stroke width' },
    hue: { label: 'Hue', min: 0, max: 360, step: 1, unit: '°', hint: 'base colour; drifts over time' },
  },
  overlayHtml,
  css,
  background: '#05060a',
  // No loopMs: a Lissajous figure runs continuously, so the lab doesn't auto-replay it.
};
