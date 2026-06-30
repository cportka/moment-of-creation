// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import {
  buildEmbedHtml,
  embed,
  register,
  MomentOfCreationElement,
  buildStandaloneHtml,
  presets,
  dials,
  byId,
  animations,
} from '../index';

describe('public library surface', () => {
  it('exports the engine data + helpers', () => {
    expect(typeof buildStandaloneHtml).toBe('function');
    expect(typeof buildEmbedHtml).toBe('function');
    expect(typeof embed).toBe('function');
    expect(typeof register).toBe('function');
    expect(animations.map((a) => a.id)).toEqual(['first', 'last', 'together']);
    expect(byId('together')).toBeDefined();
    expect(presets.length).toBe(12);
    expect(Object.keys(dials).length).toBe(40);
  });
});

describe('buildEmbedHtml — a self-contained, baked document', () => {
  it('is a complete HTML doc with the inline overlay (zero deps)', () => {
    const html = buildEmbedHtml();
    expect(html).toMatch(/^<!doctype html>/i);
    expect(html).toContain('window.__ospDials');
    // Drop the inlined <style> + HTML comments (where the word "<link>" appears in CSS
    // prose) so we test real tags, not inlined text — then assert zero external deps.
    const structural = html.replace(/<style>[\s\S]*?<\/style>/g, '').replace(/<!--[\s\S]*?-->/g, '');
    expect(structural).not.toMatch(/<script[^>]*\ssrc=/i);
    expect(structural).not.toMatch(/<link\b/i);
  });

  it('defaults to the whole Together; mode picks a half', () => {
    expect(buildEmbedHtml()).toContain('__ospMode = "together"');
    expect(buildEmbedHtml({ mode: 'last' })).toContain('__ospMode = "last"');
    expect(buildEmbedHtml({ mode: 'first' })).toContain('__ospMode = "first"');
  });

  it('bakes a preset and explicit dial overrides into the inline dials', () => {
    // The "portal" preset sets spForm: 3; an override wins over the preset.
    expect(buildEmbedHtml({ preset: 'portal' })).toMatch(/spForm:\s*3\b/);
    expect(buildEmbedHtml({ preset: 'portal', dials: { spForm: 5 } })).toMatch(/spForm:\s*5\b/);
  });

  it('loops by default; loop:false plays once', () => {
    expect(buildEmbedHtml()).toContain('__ospLoop');
    expect(buildEmbedHtml({ loop: false })).not.toContain('__ospLoop');
    expect(buildEmbedHtml({ loop: 1234 })).toMatch(/setInterval[\s\S]*1234/);
  });
});

describe('embed() — an isolated iframe', () => {
  it('appends an iframe whose srcdoc is the baked document', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const handle = embed(host, { preset: 'mandala' });
    expect(handle.iframe.tagName).toBe('IFRAME');
    expect(host.querySelector('iframe')).toBe(handle.iframe);
    expect(handle.iframe.getAttribute('srcdoc')).toContain('window.__ospDials');
    handle.update({ mode: 'last' });
    expect(handle.iframe.getAttribute('srcdoc')).toContain('__ospMode = "last"');
    handle.destroy();
    expect(host.querySelector('iframe')).toBeNull();
  });
});

describe('<moment-of-creation> custom element', () => {
  it('registers and renders an iframe from its attributes', () => {
    register();
    expect(customElements.get('moment-of-creation')).toBe(MomentOfCreationElement);
    const el = document.createElement('moment-of-creation');
    el.setAttribute('preset', 'portal');
    el.setAttribute('mode', 'last');
    document.body.appendChild(el); // connectedCallback renders
    const iframe = el.querySelector('iframe');
    expect(iframe).not.toBeNull();
    expect(iframe!.getAttribute('srcdoc')).toMatch(/spForm:\s*3\b/);
    expect(iframe!.getAttribute('srcdoc')).toContain('__ospMode = "last"');
    el.remove();
  });
});
