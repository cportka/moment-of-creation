/**
 * The engine's data model. An animation is *data*, not code the engine hardcodes:
 * a registered object carrying its own dials, the per-dial UI schema the lab renders
 * from, the first-paint overlay (markup + inline boot script), and its stylesheet.
 * The engine plays whichever one is selected; the lab tunes any of them; the export
 * packages any one into a single self-contained `.html`.
 */

/** Per-dial UI metadata — what the lab needs to render a slider for a dial. */
export interface DialSchema {
  /** Human label shown next to the slider. */
  label: string;
  /** Slider minimum. */
  min: number;
  /** Slider maximum. */
  max: number;
  /** Slider step. */
  step: number;
  /** Unit suffix (e.g. `ms`, `×`, `°`). */
  unit: string;
  /** One-line explanation under the slider. */
  hint: string;
}

/** A registered animation — everything the engine, lab and export need, as data. */
export interface Animation {
  /** Stable id (used by the registry, the lab picker and the export filename). */
  id: string;
  /** Human name for the lab picker / export title. */
  name: string;
  /** Default tuning values, mirrored by the overlay's inline `window.__ospDials`. */
  dials: Record<string, number>;
  /** UI schema for every dial — the lab renders sliders from this. */
  schema: Record<string, DialSchema>;
  /** The overlay: first-paint markup + the inline boot script (kept inline so it
   *  paints before any bundle). Imported `?raw` from the animation's `overlay.html`. */
  overlayHtml: string;
  /** The animation's stylesheet, imported `?raw` from its `.css`. */
  css: string;
  /** How long one play lasts (ms) for the given dials. If set, the lab loops the
   *  animation (and the export can auto-replay); omit for ones that run continuously. */
  loopMs?: (dials: Record<string, number>) => number;
  /** Page background behind the animation (lab stage + standalone export). */
  background?: string;
}
