/**
 * The **Moment** — the two animations combined: a Burst followed by a Merger, the original
 * "moment of creation." The markup + inline boot script (`overlay.html`) and stylesheet
 * (`intro.css`) stay the single source of truth (imported `?raw`); the dials/schema come
 * from `dials.json` via `introTimeline`, and the named tunings from `presets.json`.
 */
import type { Animation, Preset } from '../engine/types';
import { INTRO_DIALS, INTRO_SCHEMA } from './introTimeline';
import presetsJson from '../engine/presets.json';
import overlayHtml from './overlay.html?raw';
import css from './intro.css?raw';

/** With no host engine on a preview surface, nothing dismisses the merger — so it holds
 *  fully formed until we loop. This is the extra time we let it play + linger (past the
 *  black + burst beats) before restarting, so each loop shows the whole arc. */
const ADMIRE_MS = 2600;

export const moment: Animation = {
  id: 'moment',
  name: 'Moment',
  dials: { ...INTRO_DIALS },
  schema: INTRO_SCHEMA,
  overlayHtml,
  css,
  mode: 'moment', // the whole thing — Burst → Merger
  loopMs: (d) => d.initialBlackMs + d.splitBlackMs + d.creationBeatMs + ADMIRE_MS,
  background: '#05060a',
  presets: presetsJson as Preset[],
};
