/**
 * The animation registry — the engine plays a *selected* animation from here instead
 * of a single hardcoded sequence. Add an animation by importing its object and listing
 * it; the lab picker, the export and the tests all read from this one list.
 */
import type { Animation } from './types';
import { first } from '../intro/first';
import { last } from '../intro/last';
import { together } from '../intro/together';

/** Every registered animation, in display order: the two animations the toolkit combines
 *  (First, Last) and the Together they make. They share one overlay + stylesheet and
 *  differ only by mode. */
export const animations: Animation[] = [first, last, together];

/** The animation the lab/demo selects by default — the combined Together. */
export const DEFAULT_ID = 'together';

/** Look up an animation by id (undefined if none matches). */
export function byId(id: string): Animation | undefined {
  return animations.find((a) => a.id === id);
}
