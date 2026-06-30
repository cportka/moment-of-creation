import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { DIAL_KEYS, PRESET_IDS } from './keys.js';

// Read + parse the JSON straight from disk so the typed consts are checked against the
// real source of truth (same pattern as introTimeline.test.ts). This pins keys.ts to the
// JSON — the hand-listed arrays can never silently drift from dials.json / presets.json.
const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8');
const dialsJson = JSON.parse(read('../intro/dials.json')) as Record<string, unknown>;
const presetsJson = JSON.parse(read('./presets.json')) as Array<{ id: string }>;

describe('keys.ts mirrors the JSON (no drift)', () => {
  it('DIAL_KEYS equals Object.keys(dials.json), in order', () => {
    expect([...DIAL_KEYS]).toEqual(Object.keys(dialsJson));
  });

  it('DIAL_KEYS covers exactly the dial set (no missing / extra)', () => {
    expect(new Set(DIAL_KEYS)).toEqual(new Set(Object.keys(dialsJson)));
    expect(DIAL_KEYS.length).toBe(Object.keys(dialsJson).length);
  });

  it('PRESET_IDS equals the presets.json ids, in order', () => {
    expect([...PRESET_IDS]).toEqual(presetsJson.map((p) => p.id));
  });

  it('has the expected counts (40 dials, 12 presets)', () => {
    expect(DIAL_KEYS.length).toBe(40);
    expect(PRESET_IDS.length).toBe(12);
  });
});
