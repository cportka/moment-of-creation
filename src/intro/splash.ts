/**
 * The binary-merger splash, as its own animation — the second half of the intro: two
 * orbs inspiral and merge into the forming event horizon (CSS choreography + a canvas
 * dust field), with the creation layer hidden. Shares the intro's overlay and stylesheet;
 * `mode: 'splash'`. Its dials are the `splash`-scoped ones, projected from dials.json.
 */
import type { Animation } from '../engine/types';
import { pickByScope } from './introTimeline';
import overlayHtml from './overlay.html?raw';
import css from './intro.css?raw';

const { dials, schema } = pickByScope('splash');

export const splash: Animation = {
  id: 'splash',
  name: 'Binary merger',
  dials,
  schema,
  overlayHtml,
  css,
  mode: 'splash',
  // the merger plays out (~1.7s of dust) then settles; loop a touch after.
  loopMs: () => 2600,
  background: '#05060a',
};
