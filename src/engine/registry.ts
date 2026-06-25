/**
 * The animation registry — the engine plays a *selected* animation from here instead
 * of a single hardcoded sequence. Add an animation by importing its object and listing
 * it; the lab picker, the export and the tests all read from this one list.
 */
import type { Animation } from './types';
import { burst } from '../intro/burst';
import { merger } from '../intro/merger';
import { moment } from '../intro/moment';

/** Every registered animation, in display order: the two animations the toolkit combines
 *  (Burst, Merger) and the Moment they make. They share one overlay + stylesheet and
 *  differ only by mode. */
export const animations: Animation[] = [burst, merger, moment];

/** The animation the lab/demo selects by default — the combined Moment. */
export const DEFAULT_ID = 'moment';

/** Look up an animation by id (undefined if none matches). */
export function byId(id: string): Animation | undefined {
  return animations.find((a) => a.id === id);
}
