/**
 * The intro, as a registered animation. The markup + inline boot script
 * (`overlay.html`) and the stylesheet (`intro.css`) stay the single source of truth —
 * imported here `?raw` so this wrapper never duplicates them — joined with the dials
 * (`INTRO_DIALS`) and their UI schema (`INTRO_SCHEMA`). This is the object the engine
 * registry plays, the lab tunes, and the export packages.
 */
import type { Animation } from '../engine/types';
import { INTRO_DIALS, INTRO_SCHEMA } from './introTimeline';
import overlayHtml from './overlay.html?raw';
import css from './intro.css?raw';

/** With no engine on a tuning/preview surface, nothing dismisses the splash — so it
 *  holds fully formed until we loop. This is the extra time we let it play + linger
 *  (past the black + creation beats) before restarting, so each loop shows the whole arc. */
const ADMIRE_MS = 2600;

export const intro: Animation = {
  id: 'intro',
  name: 'Moment of creation',
  dials: { ...INTRO_DIALS },
  schema: INTRO_SCHEMA,
  overlayHtml,
  css,
  loopMs: (d) => d.initialBlackMs + d.splitBlackMs + d.creationBeatMs + ADMIRE_MS,
  background: '#05060a',
};
