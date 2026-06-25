/**
 * The **Burst** — one of the two animations the toolkit combines. The first half of a
 * Moment: black hold → one-frame test pattern → pure-CSS firework burst, with the Merger
 * hidden. It shares the one overlay + stylesheet; `mode: 'burst'` tells the overlay's boot
 * script to play just this slice. Its dials are the `burst`-scoped ones, projected from the
 * single source (dials.json) — add a dial there, tag its scope, and it appears here for free.
 */
import type { Animation } from '../engine/types';
import { pickByScope } from './introTimeline';
import overlayHtml from './overlay.html?raw';
import css from './intro.css?raw';

const { dials, schema } = pickByScope('burst');

export const burst: Animation = {
  id: 'burst',
  name: 'Burst',
  dials,
  schema,
  overlayHtml,
  css,
  mode: 'burst',
  // black hold + split black + the burst playing out, then loop.
  loopMs: (d) => d.initialBlackMs + d.splitBlackMs + 1400,
  background: '#05060a',
};
