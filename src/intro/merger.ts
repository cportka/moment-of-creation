/**
 * The **Merger** — the other of the two animations the toolkit combines. The second half
 * of a Moment: two orbs inspiral and merge into the forming event horizon (CSS choreography
 * + a canvas dust field), with the Burst hidden. It shares the one overlay + stylesheet;
 * `mode: 'merger'` plays just this slice. Its dials are the `merger`-scoped ones, projected
 * from the single source (dials.json).
 */
import type { Animation } from '../engine/types';
import { pickByScope } from './introTimeline';
import overlayHtml from './overlay.html?raw';
import css from './intro.css?raw';

const { dials, schema } = pickByScope('merger');

export const merger: Animation = {
  id: 'merger',
  name: 'Merger',
  dials,
  schema,
  overlayHtml,
  css,
  mode: 'merger',
  // the merger plays out (~1.7s of dust) then settles; loop a touch after.
  loopMs: () => 2600,
  background: '#05060a',
};
