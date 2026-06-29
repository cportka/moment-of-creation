import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { animations, byId, DEFAULT_ID } from './registry';
import { applyDials, buildStandaloneHtml } from './standalone.js';

const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8');

describe('engine registry — animation as data', () => {
  it('registers the two animations the toolkit combines (First, Last) and the Together', () => {
    const ids = animations.map((a) => a.id);
    expect(ids).toContain('first');
    expect(ids).toContain('last');
    expect(ids).toContain('together');
    expect(ids.length).toBeGreaterThanOrEqual(3);
    expect(new Set(ids).size).toBe(ids.length); // ids are unique
  });

  it('resolves the default animation and unknown ids', () => {
    expect(byId(DEFAULT_ID)).toBeDefined();
    expect(byId('does-not-exist')).toBeUndefined();
  });
});

// Every animation must be fully self-describing: the engine plays it as data, the lab
// renders its schema, the export packages it — none of them know anything animation-specific.
describe.each(animations.map((a) => [a.id, a] as const))('animation "%s" is self-describing', (_id, a) => {
  it('carries id, name, an inline-script overlay and a stylesheet', () => {
    expect(a.id).toBeTruthy();
    expect(a.name).toBeTruthy();
    expect(a.overlayHtml).toContain('<script'); // the inline boot script that paints first
    expect(a.css.length).toBeGreaterThan(0);
  });

  it('declares a UI schema covering exactly its dials', () => {
    expect(Object.keys(a.schema).sort()).toEqual(Object.keys(a.dials).sort());
    for (const [key, meta] of Object.entries(a.schema)) {
      expect(typeof meta.label).toBe('string');
      expect(meta.label.length).toBeGreaterThan(0);
      expect(meta.step).toBeGreaterThan(0);
      expect(meta.min).toBeLessThanOrEqual(a.dials[key]); // the default sits within range
      expect(meta.max).toBeGreaterThanOrEqual(a.dials[key]);
    }
  });

  it('defines the window.__osp* contract (dials + play + boot hook)', () => {
    expect(a.overlayHtml).toContain('window.__ospDials');
    expect(a.overlayHtml).toMatch(/__ospPlay/);
    expect(a.overlayHtml).toMatch(/__ospBoot/);
  });

  it("mirrors its declared dials in the overlay's inline __ospDials (no drift)", () => {
    for (const [key, value] of Object.entries(a.dials)) {
      expect(a.overlayHtml).toMatch(new RegExp(`\\b${key}:\\s*${value}(?![0-9])`));
    }
  });
});

// The registry uses the animations' real overlay.html / css as the single source of
// truth (imported ?raw), so the lab, export and shipped page can never drift. The three
// animations are one overlay played in three modes — same file, no duplication.
describe('registry overlays are the real source files (one overlay, three modes)', () => {
  const overlay = read('../intro/overlay.html');
  const introCss = read('../intro/intro.css');
  for (const a of animations) {
    it(`${a.id} uses the shared overlay + stylesheet`, () => {
      expect(a.overlayHtml).toBe(overlay);
      expect(a.css).toBe(introCss);
    });
  }
  it('the overlay implements every registered mode', () => {
    expect(overlay).toContain('window.__ospMode');
    expect(overlay).toContain('__ospCreation'); // internal play fn for the First slice
    expect(overlay).toContain('__ospSplashOnly'); // internal play fn for the Last slice
    for (const a of animations) expect(['together', 'first', 'last']).toContain(a.mode);
  });
});

describe('single-file export', () => {
  it.each(animations.map((a) => [a.id, a] as const))('packages "%s" as a self-contained .html', (_id, a) => {
    const html = buildStandaloneHtml(a, { loopMs: a.loopMs?.(a.dials), mode: a.mode });
    expect(html).toMatch(/^<!doctype html>/i);
    expect(html).toContain('<style>');
    expect(html).toContain(a.css); // CSS inlined verbatim
    expect(html).toContain(a.overlayHtml); // overlay (markup + inline script) inlined
    expect(html).toContain('window.__ospBoot'); // the contract hook is defined
    if (a.mode) expect(html).toContain(`__ospMode = ${JSON.stringify(a.mode)}`); // slice baked in
    // Zero external dependencies: no stylesheet links, no external scripts. Check the
    // structural markup (drop the inlined <style> + HTML comments, where the word "<link>"
    // legitimately appears in CSS prose) so we test real tags, not inlined text.
    const structural = html.replace(/<style>[\s\S]*?<\/style>/g, '').replace(/<!--[\s\S]*?-->/g, '');
    expect(structural).not.toMatch(/<link\b/i);
    expect(structural).not.toMatch(/<script[^>]*\ssrc=/i);
  });

  it('bakes tuned dials into the exported overlay', () => {
    const together = byId('together')!;
    const html = buildStandaloneHtml(together, { dials: { initialBlackMs: 1234 } });
    expect(html).toMatch(/initialBlackMs:\s*1234/);
    expect(html).not.toMatch(/initialBlackMs:\s*500\b/); // the default was replaced
  });

  it('applyDials only rewrites the __ospDials block', () => {
    const baked = applyDials('window.__ospDials = { a: 1, b: 2 };\nvar a = 99;', { a: 7 });
    expect(baked).toContain('a: 7');
    expect(baked).toContain('var a = 99;'); // untouched outside the dials object
  });
});

// The Node export CLI reads a JSON manifest (it can't import the TS registry); keep the
// two lists in lockstep so `npm run export` and the in-browser lab cover the same set.
describe('registry ↔ export manifest stay in sync', () => {
  it('lists exactly the registered animations', () => {
    const manifest: Array<{ id: string }> = JSON.parse(read('./manifest.json'));
    expect(manifest.map((m) => m.id).sort()).toEqual(animations.map((a) => a.id).sort());
  });
});

// Dials + presets live in one source (dials.json / presets.json); the lab imports them
// and the showcase fetches them. Guard that single source instead of a hand-copied panel.
describe('single-source dials + presets', () => {
  const dials: Record<string, { min: number; max: number; step: number; scope: string }> = JSON.parse(
    read('../intro/dials.json'),
  );
  const presets: Array<{ id: string; name: string; dials: Record<string, number> }> = JSON.parse(
    read('../engine/presets.json'),
  );
  const showcase = read('../../index.html');

  it('dials.json covers every registered dial with a valid range + scope', () => {
    for (const a of animations) {
      for (const [key, def] of Object.entries(a.dials)) {
        const meta = dials[key];
        expect(meta, `dials.json missing ${key}`).toBeDefined();
        expect(meta.min).toBeLessThanOrEqual(def);
        expect(meta.max).toBeGreaterThanOrEqual(def);
        expect(meta.step).toBeGreaterThan(0);
        expect(['first', 'last', 'together']).toContain(meta.scope);
      }
    }
  });

  it('there are at least 40 dials (the pattern/geometry knobs included)', () => {
    expect(Object.keys(dials).length).toBeGreaterThanOrEqual(40);
  });

  it('the showcase fetches the single source (no hand-copied schema)', () => {
    expect(showcase).toContain('dials.json');
    expect(showcase).toContain('presets.json');
  });

  it('the Together carries 12 presets — a new default first, the OG kept selectable', () => {
    const together = byId('together')!;
    expect(together.presets?.length).toBe(12);
    expect(presets[0].id).toBe('genesis'); // the new default, distinct from One Still Point
    expect(presets[0].id).not.toBe('original'); // ...the OG is no longer the default
    expect(presets.some((p) => p.id === 'original')).toBe(true); // ...but stays selectable
  });

  it('every preset overrides only real dials, within range', () => {
    for (const p of presets) {
      for (const [key, value] of Object.entries(p.dials)) {
        const meta = dials[key];
        expect(meta, `preset "${p.id}" → unknown dial ${key}`).toBeDefined();
        expect(value).toBeGreaterThanOrEqual(meta.min);
        expect(value).toBeLessThanOrEqual(meta.max);
      }
    }
  });
});
