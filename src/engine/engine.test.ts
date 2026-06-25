import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { animations, byId, DEFAULT_ID } from './registry';
import { applyDials, buildStandaloneHtml } from './standalone.js';

const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8');

describe('engine registry — animation as data', () => {
  it('registers the intro plus at least one more, unrelated animation', () => {
    const ids = animations.map((a) => a.id);
    expect(ids).toContain('intro');
    expect(ids).toContain('lissajous');
    expect(ids.length).toBeGreaterThanOrEqual(2);
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
// truth (imported ?raw), so the lab, export and shipped page can never drift from them.
describe('registry overlays are the real source files', () => {
  it('intro', () => {
    const intro = byId('intro')!;
    expect(intro.overlayHtml).toBe(read('../intro/overlay.html'));
    expect(intro.css).toBe(read('../intro/intro.css'));
  });
  it('lissajous', () => {
    const liss = byId('lissajous')!;
    expect(liss.overlayHtml).toBe(read('../animations/lissajous/overlay.html'));
    expect(liss.css).toBe(read('../animations/lissajous/lissajous.css'));
  });
});

describe('single-file export', () => {
  it.each(animations.map((a) => [a.id, a] as const))('packages "%s" as a self-contained .html', (_id, a) => {
    const html = buildStandaloneHtml(a, { loopMs: a.loopMs?.(a.dials) });
    expect(html).toMatch(/^<!doctype html>/i);
    expect(html).toContain('<style>');
    expect(html).toContain(a.css); // CSS inlined verbatim
    expect(html).toContain(a.overlayHtml); // overlay (markup + inline script) inlined
    expect(html).toContain('window.__ospBoot'); // the contract hook is defined
    // Zero external dependencies: no stylesheet links, no external scripts. Check the
    // structural markup (drop the inlined <style> + HTML comments, where the word "<link>"
    // legitimately appears in CSS prose) so we test real tags, not inlined text.
    const structural = html.replace(/<style>[\s\S]*?<\/style>/g, '').replace(/<!--[\s\S]*?-->/g, '');
    expect(structural).not.toMatch(/<link\b/i);
    expect(structural).not.toMatch(/<script[^>]*\ssrc=/i);
  });

  it('bakes tuned dials into the exported overlay', () => {
    const intro = byId('intro')!;
    const html = buildStandaloneHtml(intro, { dials: { initialBlackMs: 1234 } });
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

// The GitHub Pages showcase (docs/index.html) embeds a knob per dial. Guard against
// adding a dial to an animation but forgetting to expose it in the showcase.
describe('Pages showcase exposes every dial', () => {
  const showcase = read('../../docs/index.html');
  for (const a of animations) {
    it(`has a knob for every ${a.id} dial`, () => {
      for (const key of Object.keys(a.dials)) {
        expect(showcase).toContain(`'${key}'`);
      }
    });
  }
});
