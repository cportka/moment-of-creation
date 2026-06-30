/**
 * The **First** — one of the two animations the toolkit combines. The opening half of a
 * Together: black hold → one-frame test pattern → pure-CSS firework burst, with the Last
 * hidden. It shares the one overlay + stylesheet; `mode: 'first'` tells the overlay's boot
 * script to play just this slice. Its dials are the `first`-scoped ones, projected from the
 * single source (dials.json) — add a dial there, tag its scope, and it appears here for free.
 */
import type { Animation } from '../engine/types.js';
import { pickByScope } from './introTimeline.js';
import overlayHtml from './overlay.html?raw';
import css from './intro.css?raw';

const { dials, schema } = pickByScope('first');

export const first: Animation = {
  id: 'first',
  name: 'First',
  dials,
  schema,
  overlayHtml,
  css,
  mode: 'first',
  // black hold + split black + the burst playing out, then loop.
  loopMs: (d) => d.initialBlackMs + d.splitBlackMs + 1400,
  background: '#05060a',
};
