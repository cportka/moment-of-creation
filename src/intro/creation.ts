/**
 * The "moment of creation" burst, as its own animation — the first half of the intro
 * (black hold → one-frame test pattern → pure-CSS firework burst), with the splash
 * hidden. It shares the intro's overlay and stylesheet; `mode: 'creation'` tells the
 * overlay's boot script to play just this slice (window.__ospMode).
 */
import type { Animation } from '../engine/types';
import { INTRO_DIALS, INTRO_SCHEMA } from './introTimeline';
import overlayHtml from './overlay.html?raw';
import css from './intro.css?raw';

export const creation: Animation = {
  id: 'creation',
  name: 'Creation burst',
  dials: {
    initialBlackMs: INTRO_DIALS.initialBlackMs,
    splitBlackMs: INTRO_DIALS.splitBlackMs,
    creationSpeed: INTRO_DIALS.creationSpeed,
  },
  schema: {
    initialBlackMs: INTRO_SCHEMA.initialBlackMs,
    splitBlackMs: INTRO_SCHEMA.splitBlackMs,
    creationSpeed: INTRO_SCHEMA.creationSpeed,
  },
  overlayHtml,
  css,
  mode: 'creation',
  // black hold + split black + the burst playing out, then loop.
  loopMs: (d) => d.initialBlackMs + d.splitBlackMs + 1400,
  background: '#05060a',
};
