/**
 * The animation registry — the engine plays a *selected* animation from here instead
 * of a single hardcoded sequence. Add an animation by importing its object and listing
 * it; the lab picker, the export and the tests all read from this one list.
 */
import type { Animation } from './types';
import { intro } from '../intro/intro';
import { lissajous } from '../animations/lissajous/lissajous';

/** Every registered animation, in display order. */
export const animations: Animation[] = [intro, lissajous];

/** The animation the lab/demo selects by default. */
export const DEFAULT_ID = 'intro';

/** Look up an animation by id (undefined if none matches). */
export function byId(id: string): Animation | undefined {
  return animations.find((a) => a.id === id);
}
