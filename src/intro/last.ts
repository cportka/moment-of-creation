/**
 * The **Last** — the other of the two animations the toolkit combines. The closing half
 * of a Together: two orbs inspiral and merge into the forming event horizon (CSS choreography
 * + a canvas dust field), with the First hidden. It shares the one overlay + stylesheet;
 * `mode: 'last'` plays just this slice. Its dials are the `last`-scoped ones, projected
 * from the single source (dials.json).
 */
import type { Animation } from '../engine/types.js';
import { pickByScope } from './introTimeline.js';
import overlayHtml from './overlay.html?raw';
import css from './intro.css?raw';

const { dials, schema } = pickByScope('last');

export const last: Animation = {
  id: 'last',
  name: 'Last',
  dials,
  schema,
  overlayHtml,
  css,
  mode: 'last',
  // the merger plays out (~1.7s of dust) then settles; loop a touch after.
  loopMs: () => 2600,
  background: '#05060a',
};
