/**
 * moment-of-creation — public library entry.
 *
 * A first-paint web animation: a First (a CSS firework birth) and a Last (a binary merger
 * that resolves into a neon Form), combined into a Together. Drop it into any project as an
 * isolated iframe embed / web component, a full-page mount, or a self-contained `.html`.
 *
 *     import { register } from 'moment-of-creation';
 *     register();                          // then use <moment-of-creation preset="portal">
 *
 *     import { embed } from 'moment-of-creation';
 *     embed(document.querySelector('#hero'), { preset: 'genesis', loop: true });
 *
 *     import { buildEmbedHtml } from 'moment-of-creation';
 *     iframe.srcdoc = buildEmbedHtml({ mode: 'last', dials: { spForm: 3 } });
 */
import presetsJson from './engine/presets.json';
import dialsJson from './intro/dials.json';
import type { DialSchema, Preset } from './engine/types';

// --- the data model ---
export type { Animation, Preset, DialSchema } from './engine/types';

// --- the registry: the animations as data ---
export { animations, byId, DEFAULT_ID } from './engine/registry';

// --- embedding (recommended): iframe embed, web component, full-page mount ---
export {
  embed,
  mount,
  buildEmbedHtml,
  register,
  MomentOfCreationElement,
} from './engine/embed';
export type { EmbedOptions, EmbedHandle, OspMode } from './engine/embed';
export type { MountHandle } from './engine/mount';

// --- packaging: build a self-contained .html for any animation (isomorphic) ---
export { buildStandaloneHtml, applyDials } from './engine/standalone.js';
export type { StandaloneOptions } from './engine/standalone';

/** Every named preset (id, name, dial overrides) — for building a picker or deep-linking. */
export const presets = presetsJson as Preset[];

/** The dial schema (key → label/min/max/step/unit/scope/hint/default) — render your own UI. */
export const dials = dialsJson as Record<string, DialSchema>;
