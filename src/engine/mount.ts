/**
 * Mounting an animation at runtime (the lab's job — switching between animations).
 *
 * The shipped page and the standalone export inline the overlay at *build/export time*
 * so it paints before any bundle. The lab, by contrast, swaps animations live, so it
 * injects the overlay into the DOM here. Setting innerHTML does NOT run <script> tags,
 * which would break the whole point (the inline boot script paints + plays) — so we
 * re-create each <script> as a fresh executable element. That preserves the exact
 * first-paint contract: the injected inline script runs and defines window.__osp*.
 */
import type { Animation } from './types.js';

const STAGE_ID = 'osp-stage';
const STYLE_ID = 'osp-anim-style';

export interface MountHandle {
  /** Tear the animation down: remove its DOM + styles and clear the window.__osp* globals. */
  destroy(): void;
}

/** Clear the contract globals so a freshly-mounted overlay starts clean. */
function resetGlobals(): void {
  window.__ospDials = undefined;
  window.__ospPlay = undefined;
  window.__ospIntro = undefined;
  window.__ospMode = undefined;
  window.__ospCreation = undefined;
  window.__ospSplashOnly = undefined;
  window.__ospBoot = undefined;
  window.__ospBooted = undefined;
  window.__ospSplash = undefined;
  window.__ospSplashPlay = undefined;
  window.__ospSplashStart = undefined;
}

function teardownExisting(): void {
  document.getElementById(STAGE_ID)?.remove();
  document.getElementById(STYLE_ID)?.remove();
  resetGlobals();
}

/**
 * Apply `anim`'s CSS and inject its overlay into a fresh stage, executing the inline
 * boot script so it paints + plays. Any previously-mounted animation is torn down first.
 */
export function mountAnimation(anim: Animation): MountHandle {
  teardownExisting();

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = anim.css;
  document.head.appendChild(style);

  if (anim.background) document.body.style.background = anim.background;

  const stage = document.createElement('div');
  stage.id = STAGE_ID;

  // Parse the overlay, move its nodes into the stage, then replace each <script> with a
  // fresh one so it actually executes (innerHTML-inserted scripts never run).
  const tpl = document.createElement('template');
  tpl.innerHTML = anim.overlayHtml;
  stage.appendChild(tpl.content);
  document.body.appendChild(stage);
  window.__ospMode = anim.mode; // the overlay's auto-play reads this to pick its slice
  for (const old of Array.from(stage.querySelectorAll('script'))) {
    const fresh = document.createElement('script');
    for (const attr of Array.from(old.attributes)) fresh.setAttribute(attr.name, attr.value);
    fresh.textContent = old.textContent;
    old.replaceWith(fresh); // insertion executes it synchronously
  }

  return {
    destroy() {
      stage.remove();
      style.remove();
      if (anim.background) document.body.style.background = '';
      resetGlobals();
    },
  };
}
