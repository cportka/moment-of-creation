/**
 * The animation lab — a dev tool for tuning *any* registered animation.
 *
 *   npm run dev → http://localhost:5173/intro-lab.html
 *
 * Generalized from the intro-only lab: it lists the engine registry in a picker, mounts
 * the selected animation (so it plays/loops behind the panel), and renders one slider
 * per dial **from that animation's own schema** — which is what makes the lab general.
 * Tweaks bind live to window.__ospDials; "Copy values" emits a paste-back snippet;
 * "Export .html" downloads the self-contained single file for the current animation.
 */
import { animations, byId, DEFAULT_ID } from './engine/registry';
import { mountAnimation, type MountHandle } from './engine/mount';
import { buildStandaloneHtml } from './engine/standalone.js';
import type { Animation } from './engine/types';

// Deep-link the starting animation with ?anim=<id> (falls back to the default).
const wanted = new URLSearchParams(location.search).get('anim');
let current: Animation = (wanted ? byId(wanted) : undefined) ?? byId(DEFAULT_ID) ?? animations[0];
let handle: MountHandle | null = null;
let loopOn = true;
let loopTimer = 0;
let restartTimer = 0;

function liveDials(): Record<string, number> {
  return window.__ospDials ?? { ...current.dials };
}

function scheduleNext(): void {
  window.clearTimeout(loopTimer);
  // Only finite animations (those that declare a length) auto-replay; continuous ones
  // (e.g. the Lissajous) just keep running and pick up dial changes frame by frame.
  if (loopOn && current.loopMs) loopTimer = window.setTimeout(runCycle, current.loopMs(liveDials()));
}

function runCycle(): void {
  window.__ospPlay?.();
  scheduleNext();
}

/** Debounced replay so a tweak previews quickly (finite animations only). */
function restartSoon(): void {
  if (!current.loopMs) return;
  window.clearTimeout(restartTimer);
  restartTimer = window.setTimeout(runCycle, 350);
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Partial<Record<string, string>> = {},
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null) node.setAttribute(k, v);
  if (text != null) node.textContent = text;
  return node;
}

/** The live "paste me back into the source" snippet, in the schema's dial order. */
function snippet(): string {
  const d = liveDials();
  return Object.keys(current.schema)
    .map((k) => `${k}: ${d[k]},`)
    .join('\n');
}

// DOM the lab owns and rebuilds when the animation changes.
let dialsBox!: HTMLDivElement;
let snippetBox!: HTMLPreElement;
let presetSel!: HTMLSelectElement;
let presetRow!: HTMLDivElement;

/** Populate the preset picker for the current animation (hidden if it has none). */
function refreshPresets(): void {
  presetSel.textContent = '';
  const presets = current.presets;
  presetRow.style.display = presets && presets.length ? '' : 'none';
  for (const p of presets ?? []) presetSel.appendChild(el('option', { value: p.id }, p.name));
}

/** Apply a named preset: its overrides over the defaults, then re-render + replay. */
function applyPreset(id: string): void {
  const preset = current.presets?.find((p) => p.id === id);
  if (!preset) return;
  const store = window.__ospDials;
  for (const key of Object.keys(current.schema)) {
    const v = key in preset.dials ? preset.dials[key] : current.dials[key];
    if (store) store[key] = v;
  }
  rebuildDials();
  runCycle();
}

function updateSnippet(): void {
  snippetBox.textContent = snippet();
}

/** Render one row (slider + number box, kept in sync) per dial in current.schema. */
function rebuildDials(): void {
  dialsBox.textContent = '';
  const d = liveDials();
  for (const key of Object.keys(current.schema)) {
    const meta = current.schema[key];
    const row = el('div', { class: 'osp-lab__dial' });
    const head = el('div', { class: 'osp-lab__dialhead' });
    head.appendChild(el('label', {}, meta.label));
    const num = el('input', {
      type: 'number', min: String(meta.min), max: String(meta.max), step: String(meta.step),
    });
    num.value = String(d[key]);
    head.appendChild(num);
    head.appendChild(el('span', { class: 'osp-lab__unit' }, meta.unit));
    row.appendChild(head);
    const range = el('input', {
      type: 'range', min: String(meta.min), max: String(meta.max), step: String(meta.step),
    });
    range.value = String(d[key]);
    row.appendChild(range);
    row.appendChild(el('p', { class: 'osp-lab__hint' }, meta.hint));
    dialsBox.appendChild(row);

    const apply = (raw: string): void => {
      const value = Number(raw);
      if (!Number.isFinite(value)) return;
      if (window.__ospDials) window.__ospDials[key] = value;
      num.value = String(value);
      range.value = String(value);
      updateSnippet();
      restartSoon();
    };
    range.addEventListener('input', () => apply(range.value));
    num.addEventListener('input', () => apply(num.value));
  }
  updateSnippet();
}

/** Switch the previewed/tuned animation: tear down the old one, mount the new one, and
 *  re-render the sliders from its schema. */
function switchTo(id: string): void {
  const next = byId(id);
  if (!next) return;
  current = next;
  handle?.destroy();
  handle = mountAnimation(current); // defines window.__ospDials + auto-plays
  rebuildDials();
  refreshPresets();
  window.clearTimeout(loopTimer);
  scheduleNext();
}

function download(name: string, html: string): void {
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
  const a = el('a', { href: url, download: name });
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function flash(button: HTMLButtonElement, text: string): void {
  const original = button.textContent;
  button.textContent = text;
  window.setTimeout(() => {
    button.textContent = original;
  }, 1100);
}

function build(): void {
  const panel = el('aside', { id: 'osp-lab' });
  panel.appendChild(el('h1', {}, 'Animation lab'));
  panel.appendChild(el('p', { class: 'osp-lab__sub' }, 'Tune any registered animation — it plays behind this panel.'));

  // Animation picker — the registry, as a dropdown.
  const pickRow = el('div', { class: 'osp-lab__row' });
  pickRow.appendChild(el('label', { class: 'osp-lab__pickerlabel' }, 'Animation'));
  const picker = el('select', { class: 'osp-lab__select' });
  for (const a of animations) {
    const opt = el('option', { value: a.id }, a.name);
    if (a.id === current.id) opt.selected = true;
    picker.appendChild(opt);
  }
  picker.addEventListener('change', () => switchTo(picker.value));
  pickRow.appendChild(picker);
  panel.appendChild(pickRow);

  // Preset picker — named tunings the animation declares (refreshed on switch).
  presetRow = el('div', { class: 'osp-lab__row' });
  presetRow.appendChild(el('label', { class: 'osp-lab__pickerlabel' }, 'Preset'));
  presetSel = el('select', { class: 'osp-lab__select' });
  presetSel.addEventListener('change', () => applyPreset(presetSel.value));
  presetRow.appendChild(presetSel);
  panel.appendChild(presetRow);

  // Transport: loop toggle + replay.
  const transport = el('div', { class: 'osp-lab__row osp-lab__transport' });
  const loop = el('label', { class: 'osp-lab__toggle' });
  const loopBox = el('input', { type: 'checkbox' });
  loopBox.checked = loopOn;
  loopBox.addEventListener('change', () => {
    loopOn = loopBox.checked;
    if (loopOn) runCycle();
    else window.clearTimeout(loopTimer);
  });
  loop.appendChild(loopBox);
  loop.appendChild(el('span', {}, 'Loop'));
  const replay = el('button', { type: 'button', class: 'osp-lab__btn' }, 'Replay now');
  replay.addEventListener('click', runCycle);
  transport.appendChild(loop);
  transport.appendChild(replay);
  panel.appendChild(transport);

  // Dials — rebuilt from current.schema whenever the animation changes.
  dialsBox = el('div', { class: 'osp-lab__dials' });
  panel.appendChild(dialsBox);

  // Tools: reset, copy values, export single-file html.
  const tools = el('div', { class: 'osp-lab__row' });
  const reset = el('button', { type: 'button', class: 'osp-lab__btn' }, 'Reset defaults');
  reset.addEventListener('click', () => {
    if (window.__ospDials) for (const k of Object.keys(current.dials)) window.__ospDials[k] = current.dials[k];
    rebuildDials();
    runCycle();
  });
  const copy = el('button', { type: 'button', class: 'osp-lab__btn' }, 'Copy values');
  copy.addEventListener('click', () => {
    void navigator.clipboard?.writeText(snippet()).then(
      () => flash(copy, 'Copied!'),
      () => flash(copy, 'Copy failed'),
    );
  });
  const exportBtn = el('button', { type: 'button', class: 'osp-lab__btn' }, 'Export .html');
  exportBtn.addEventListener('click', () => {
    const dials = { ...liveDials() };
    download(`${current.id}.html`, buildStandaloneHtml(current, { dials, loopMs: current.loopMs?.(dials), mode: current.mode }));
    flash(exportBtn, 'Saved!');
  });
  tools.appendChild(reset);
  tools.appendChild(copy);
  tools.appendChild(exportBtn);
  panel.appendChild(tools);

  panel.appendChild(
    el('p', { class: 'osp-lab__sub' }, "Paste back into the animation's dials (its overlay.html + *.ts):"),
  );
  snippetBox = el('pre', { class: 'osp-lab__snippet' });
  panel.appendChild(snippetBox);

  document.body.appendChild(panel);
}

build();
switchTo(current.id); // mount the default animation, render its dials, start the loop
