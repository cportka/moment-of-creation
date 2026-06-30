/**
 * The embed API — the recommended way to drop the animation into your own project.
 *
 * Each embed is an `<iframe>` whose `srcdoc` is the self-contained standalone build (the
 * same one `npm run export` writes), so it is fully **isolated**: scoped to the element,
 * immune to your page's CSS/JS, and safe to use many times on one page.
 *
 * Why an iframe? The overlay is a singleton — one set of `#osp-*` ids + `window.__osp*`
 * globals, and its CSS is `position: fixed` full-screen — so a *direct* mount is
 * one-per-page and full-viewport. The iframe sidesteps all of that for free. Use
 * `mount()` only when you deliberately want the full-page, in-document intro (e.g. to
 * crossfade into your app via `window.__ospBoot`).
 */
import { byId } from './registry.js';
import { applyDials, buildStandaloneHtml } from './standalone.js';
import { mountAnimation, type MountHandle } from './mount.js';
import type { Animation } from './types.js';
import type { Dials, PresetId } from './keys.js';

/** Which slice of the overlay to play. */
export type OspMode = 'together' | 'first' | 'last';

export interface EmbedOptions {
  /** `'together'` (default — First → Last), or one half: `'first'` / `'last'`. */
  mode?: OspMode;
  /** A named preset id (see the exported `presets`); its dials are the base. */
  preset?: PresetId | (string & {});
  /** Dial overrides applied on top of the preset / defaults (see the exported `dials`). */
  dials?: Dials;
  /** Loop forever (default `true`); `false` plays once; a number sets a custom ms interval. */
  loop?: boolean | number;
  /** Page background behind the animation. */
  background?: string;
}

/** Resolve the effective dial-set: animation defaults ← preset ← explicit overrides. */
function resolveDials(anim: Animation, preset?: string, overrides?: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = { ...anim.dials };
  if (preset) {
    const p = (anim.presets || []).find((x) => x.id === preset);
    if (p) Object.assign(out, p.dials);
  }
  if (overrides) for (const [k, v] of Object.entries(overrides)) if (Number.isFinite(Number(v))) out[k] = Number(v);
  return out;
}

/**
 * Build the self-contained HTML document for an embed — the iframe `srcdoc`, or a string
 * you can save to a `.html` file. Zero external dependencies.
 */
export function buildEmbedHtml(opts: EmbedOptions = {}): string {
  const anim = byId('together')!; // the full overlay; `mode` selects the slice
  const mode = opts.mode || 'together';
  const dials = resolveDials(anim, opts.preset, opts.dials);
  const loop = opts.loop === undefined ? true : opts.loop;
  const loopMs = loop === false ? undefined : typeof loop === 'number' ? loop : anim.loopMs ? anim.loopMs(dials) : undefined;
  return buildStandaloneHtml(
    { name: anim.name, css: anim.css, overlayHtml: anim.overlayHtml, background: opts.background || anim.background },
    { dials, mode, loopMs },
  );
}

export interface EmbedHandle {
  /** The created iframe element. */
  iframe: HTMLIFrameElement;
  /** Re-render with new options (rebuilds the srcdoc). */
  update(opts: EmbedOptions): void;
  /** Remove the iframe. */
  destroy(): void;
}

/**
 * Create an isolated iframe embed inside `target`. The iframe fills `target`, so size the
 * container yourself (e.g. `width`/`height` or `aspect-ratio`). Returns a handle.
 *
 *     import { embed } from 'moment-of-creation';
 *     embed(document.querySelector('#hero'), { preset: 'portal', loop: true });
 */
export function embed(target: Element, opts: EmbedOptions = {}): EmbedHandle {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('title', 'moment of creation');
  iframe.setAttribute('loading', 'lazy');
  iframe.setAttribute('scrolling', 'no');
  iframe.style.cssText = 'border:0;display:block;width:100%;height:100%;background:transparent';
  iframe.srcdoc = buildEmbedHtml(opts);
  target.appendChild(iframe);
  return {
    iframe,
    update(next) {
      iframe.srcdoc = buildEmbedHtml(next);
    },
    destroy() {
      iframe.remove();
    },
  };
}

/**
 * Play the animation full-page, **in your document** (no iframe) — a single instance, the
 * overlay's native mode. Use this for a load intro you crossfade out of (define
 * `window.__ospBoot` to start loading your app under the opening black). For anything
 * contained or repeated, prefer `embed()` / `<moment-of-creation>`.
 */
export function mount(opts: EmbedOptions = {}): MountHandle {
  const base = byId('together')!;
  const dials = resolveDials(base, opts.preset, opts.dials);
  const anim: Animation = {
    ...base,
    overlayHtml: applyDials(base.overlayHtml, dials), // bake the tuning into the inline script
    mode: opts.mode || 'together',
    background: opts.background ?? base.background,
  };
  return mountAnimation(anim);
}

const ATTRS = ['preset', 'mode', 'loop', 'background', 'dials'];

/**
 * `<moment-of-creation>` — a custom element that embeds the animation as an isolated iframe.
 * Attributes: `preset`, `mode`, `loop` (`true`/`false`/a number), `background`, `dials`
 * (a JSON object). Size it with CSS (it defaults to a 1:1 block if you don't).
 *
 *     <moment-of-creation preset="portal" mode="together" style="height:420px"></moment-of-creation>
 */
// SSR-safe base: the real HTMLElement in a browser, a harmless stub under Node so the
// module imports cleanly server-side (register() only defines the element in a browser).
const HostElement: typeof HTMLElement =
  typeof HTMLElement !== 'undefined' ? HTMLElement : (class {} as unknown as typeof HTMLElement);

export class MomentOfCreationElement extends HostElement {
  static get observedAttributes(): string[] {
    return ATTRS;
  }
  private _iframe?: HTMLIFrameElement;

  connectedCallback(): void {
    if (!this.style.display) this.style.display = 'block';
    if (!this.style.height && !this.style.aspectRatio) this.style.aspectRatio = '1 / 1'; // a visible default
    this._render();
  }

  attributeChangedCallback(): void {
    if (this.isConnected) this._render();
  }

  private _options(): EmbedOptions {
    let dials: Record<string, number> | undefined;
    const raw = this.getAttribute('dials');
    if (raw) {
      try {
        dials = JSON.parse(raw);
      } catch {
        /* ignore malformed JSON */
      }
    }
    const loopAttr = this.getAttribute('loop');
    let loop: boolean | number = true;
    if (loopAttr === 'false' || loopAttr === 'off' || loopAttr === '0') loop = false;
    else if (loopAttr && Number.isFinite(Number(loopAttr))) loop = Number(loopAttr);
    return {
      mode: (this.getAttribute('mode') as OspMode) || undefined,
      preset: this.getAttribute('preset') || undefined,
      background: this.getAttribute('background') || undefined,
      dials,
      loop,
    };
  }

  private _render(): void {
    if (!this._iframe) {
      const f = document.createElement('iframe');
      f.setAttribute('title', 'moment of creation');
      f.setAttribute('scrolling', 'no');
      f.style.cssText = 'border:0;display:block;width:100%;height:100%;background:transparent';
      this.appendChild(f);
      this._iframe = f;
    }
    this._iframe.srcdoc = buildEmbedHtml(this._options());
  }
}

/** Define the `<moment-of-creation>` custom element (idempotent). */
export function register(tag = 'moment-of-creation'): void {
  if (typeof customElements !== 'undefined' && !customElements.get(tag)) {
    customElements.define(tag, MomentOfCreationElement);
  }
}
