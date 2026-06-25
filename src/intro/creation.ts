/**
 * The "moment of creation" burst, as its own animation — the first half of the intro
 * (black hold → one-frame test pattern → pure-CSS firework burst), with the splash
 * hidden. It shares the intro's overlay and stylesheet; `mode: 'creation'` tells the
 * overlay's boot script to play just this slice. Its dials are the `creation`-scoped
 * ones, projected from the single source (dials.json) — add a dial there, tag its scope,
 * and it shows up here for free.
 */
import type { Animation } from '../engine/types';
import { pickByScope } from './introTimeline';
import overlayHtml from './overlay.html?raw';
import css from './intro.css?raw';

const { dials, schema } = pickByScope('creation');

export const creation: Animation = {
  id: 'creation',
  name: 'Creation burst',
  dials,
  schema,
  overlayHtml,
  css,
  mode: 'creation',
  // black hold + split black + the burst playing out, then loop.
  loopMs: (d) => d.initialBlackMs + d.splitBlackMs + 1400,
  background: '#05060a',
};
