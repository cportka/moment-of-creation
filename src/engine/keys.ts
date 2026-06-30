/**
 * Compile-time-typed dial + preset names.
 *
 * These hand-listed `as const` arrays are the typed surface for the dial schema
 * (`src/intro/dials.json`) and the presets (`src/engine/presets.json`). They are NOT a
 * second source of truth — `keys.test.ts` asserts they deep-equal the JSON, so they can
 * never silently drift from it.
 */

/** Every dial key, in `dials.json` order. */
export const DIAL_KEYS = [
  'initialBlackMs',
  'splitBlackMs',
  'creationSpeed',
  'crBlast',
  'crIgnition',
  'crCoreSize',
  'crFlashSize',
  'crRayLength',
  'crSpread',
  'crShards',
  'crRingExpand',
  'crHue',
  'crBright',
  'splashSpeed',
  'spForm',
  'spSides',
  'spCoreDiameter',
  'spDiskSize',
  'spBeams',
  'spSweep',
  'spNeon',
  'spHue',
  'spFlux',
  'spPulse',
  'spColorCycle',
  'spSparkle',
  'spTexture',
  'spDriftOut',
  'spMandala',
  'spWarmth',
  'spTwinkle',
  'spDustTrail',
  'spTurb',
  'spDawn',
  'spDustSize',
  'creationBeatMs',
  'creationToSplashMs',
  'creationFadeMs',
  'splashHoldMs',
  'splashFadeMs',
] as const;

/** A single dial name. */
export type DialKey = (typeof DIAL_KEYS)[number];

/** A (partial) set of dial overrides — every value is a number. */
export type Dials = Partial<Record<DialKey, number>>;

/** Every named preset id, in `presets.json` order. */
export const PRESET_IDS = [
  'genesis',
  'original',
  'portal',
  'prism',
  'mandala',
  'nova',
  'lightning',
  'bloom',
  'ember',
  'singularity',
  'zen',
  'maelstrom',
] as const;

/** A single preset id. */
export type PresetId = (typeof PRESET_IDS)[number];
