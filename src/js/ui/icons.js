/**
 * Inline SVG icon set.
 *
 * Replaces the emoji that used to stand in for tower types, HUD stats and enemy
 * traits. Emoji render differently on every OS and browser and looked
 * inconsistent; these are drawn in-app, inherit `currentColor`, and scale
 * cleanly. Self-contained — no external assets, which the strict CSP requires.
 *
 * Every glyph is authored on a 24x24 viewBox. `icon(name, opts)` returns an
 * <svg> string; unknown names fall back to a neutral dot so a missing key can
 * never throw or leave a raw emoji behind.
 */

// Path/markup body for each icon, on a 0 0 24 24 viewBox. Stroke-based icons use
// `class="ln"` (stroke:currentColor, no fill); filled icons use `class="fl"`.
const PATHS = {
  // ── HUD / stats ──────────────────────────────────────────────────────────
  wave: '<path class="ln" d="M2 12c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2M2 17c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2"/>',
  enemies: '<path class="ln" d="M7 4h10a2 2 0 0 1 2 2v6a6 6 0 0 1-12 0V6a2 2 0 0 1 2-2Z"/><circle class="fl" cx="9.5" cy="9" r="1.2"/><circle class="fl" cx="14.5" cy="9" r="1.2"/><path class="ln" d="M6 20l1.5-2M18 20l-1.5-2M12 20v-2"/>',
  skull: '<path class="ln" d="M12 3a8 8 0 0 0-5 14v2a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-2a8 8 0 0 0-5-14Z"/><circle class="fl" cx="9" cy="12" r="1.4"/><circle class="fl" cx="15" cy="12" r="1.4"/><path class="ln" d="M10 19v2M14 19v2"/>',
  coin: '<circle class="ln" cx="12" cy="12" r="8"/><path class="ln" d="M12 8v8M9.5 9.5a2.5 2 0 0 1 5 0c0 1.5-5 1-5 2.5a2.5 2 0 0 0 5 0"/>',
  heart: '<path class="fl" d="M12 20.5S3.5 14.6 3.5 9.2A4.7 4.7 0 0 1 12 6a4.7 4.7 0 0 1 8.5 3.2C20.5 14.6 12 20.5 12 20.5Z"/>',
  star: '<path class="fl" d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L3.3 9.3l6.1-.7Z"/>',
  lock: '<rect class="ln" x="5" y="10.5" width="14" height="9.5" rx="2"/><path class="ln" d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',

  // ── Enemy traits ─────────────────────────────────────────────────────────
  crown: '<path class="fl" d="M4 8l3.5 3L12 5l4.5 6L20 8l-1.5 10h-13L4 8Z"/>',
  wings: '<path class="ln" d="M12 5v11M12 8c-2-3-6-4-9-3 1 4 4 6 9 6M12 8c2-3 6-4 9-3-1 4-4 6-9 6"/>',
  shield: '<path class="ln" d="M12 3l7 2.5v5c0 5-3 8-7 10-4-2-7-5-7-10v-5L12 3Z"/>',
  flame: '<path class="fl" d="M12 3c1 3 4 4 4 8a4 4 0 0 1-8 0c0-1.5.5-2.5 1-3 .3 1 .8 1.5 1.5 1.5C11 8 10 6 12 3Z"/><path class="ln" d="M12 21a5 5 0 0 0 5-5c0-4-3-5-4-9"/>',
  bolt: '<path class="fl" d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/>',
  turtle: '<path class="ln" d="M4 15a6 4 0 0 1 12 0Z"/><path class="ln" d="M16 13c2 0 3-1 4-1M4 15l-1 3M8 19v-2M12 19v-2"/><circle class="fl" cx="19" cy="12.5" r="1"/>',
  runner: '<circle class="fl" cx="14" cy="5" r="2"/><path class="ln" d="M14 8l-3 4 3 2v5M11 12l-4 1M14 14l4 2"/>',

  // ── Hockey towers ────────────────────────────────────────────────────────
  stick: '<path class="ln" d="M17 3 8 16H5l-2 4h5l2-3 9-13Z"/>',
  target: '<circle class="ln" cx="12" cy="12" r="8"/><circle class="ln" cx="12" cy="12" r="4"/><circle class="fl" cx="12" cy="12" r="1.4"/>',
  fist: '<path class="ln" d="M7 11V8a1.5 1.5 0 0 1 3 0M10 8V6.5a1.5 1.5 0 0 1 3 0V8m0 0V7a1.5 1.5 0 0 1 3 0v5a6 6 0 0 1-6 6H9a5 5 0 0 1-3.5-1.5L4 15l1-1 2 1.5"/>',
  snowflake: '<path class="ln" d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9M12 6l-2 2m2-2 2 2M12 18l-2-2m2 2 2-2M6 9l.5 2.8M18 9l-.5 2.8M6 15l.5-2.8M18 15l-.5-2.8"/>',
  net: '<path class="ln" d="M4 19V9a8 4 0 0 1 16 0v10M4 19h16M7 19v-8M12 19v-9M17 19v-8M4.5 13h15"/>',
  // ── Soccer towers ────────────────────────────────────────────────────────
  ball: '<circle class="ln" cx="12" cy="12" r="8"/><path class="ln" d="m12 8 3 2-1 3.5h-4L9 10Z"/><path class="ln" d="m12 8V4.2M15 10l3.3-1.8M14 13.5l2.4 3M10 13.5l-2.4 3M9 10 5.7 8.2"/>',
  medcross: '<rect class="ln" x="4" y="4" width="16" height="16" rx="3"/><path class="ln" d="M12 8v8M8 12h8"/>',
  foot: '<path class="ln" d="M7 4c3 0 5 2 6 5l1.5 4c.5 1.5-.5 3-2 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z"/><path class="ln" d="M14.5 13H18M15.5 16H18"/>',
  glove: '<path class="ln" d="M8 21v-5l-2-2a2 2 0 0 1 3-3l1 1V6a1.5 1.5 0 0 1 3 0v3l1-1a2 2 0 0 1 3 3v4a5 5 0 0 1-5 5Z"/>',
  cycle: '<path class="ln" d="M20 12a8 8 0 0 1-14 5.7M4 12a8 8 0 0 1 14-5.7"/><path class="ln" d="M18 3v3.3h-3.3M6 21v-3.3h3.3"/>',

  // ── Space towers ─────────────────────────────────────────────────────────
  diamond: '<path class="ln" d="M12 3 21 12 12 21 3 12Z"/>',
  plasma: '<circle class="ln" cx="12" cy="12" r="7"/><path class="ln" d="M12 8v8M8 12h8"/>',
  spiral: '<path class="ln" d="M12 12a2 2 0 1 1 2 2 4 4 0 0 1-4-4 6 6 0 0 1 6-6 8 8 0 0 1 8 8"/>',
  atom: '<circle class="fl" cx="12" cy="12" r="1.6"/><ellipse class="ln" cx="12" cy="12" rx="9" ry="3.6"/><ellipse class="ln" cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)"/><ellipse class="ln" cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)"/>',
  comet: '<circle class="fl" cx="16" cy="8" r="3.2"/><path class="ln" d="M13 11 4 20M12 9 6 15M15 12l-4 4"/>',
  sparkle: '<path class="fl" d="M12 3l1.8 6.2L20 11l-6.2 1.8L12 19l-1.8-6.2L4 11l6.2-1.8Z"/>',

  // ── Theme / brand ────────────────────────────────────────────────────────
  satellite: '<rect class="ln" x="10" y="10" width="4" height="4" rx="1" transform="rotate(45 12 12)"/><path class="ln" d="m6 6 3 3M15 15l3 3M5 11 3 9l2-2 2 2M13 19l2 2 2-2-2-2"/><path class="ln" d="M15 9a3 3 0 0 1 0 4"/>',

  trophy: '<path class="ln" d="M7 4h10v5a5 5 0 0 1-10 0V4Z"/><path class="ln" d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M10 14v3M14 14v3M8 20h8M9 17h6"/>',

  // ── Controls ─────────────────────────────────────────────────────────────
  pause: '<rect class="fl" x="6" y="5" width="4" height="14" rx="1"/><rect class="fl" x="14" y="5" width="4" height="14" rx="1"/>',
  map: '<path class="ln" d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path class="ln" d="M9 4v14M15 6v14"/>',
  gear: '<circle class="ln" cx="12" cy="12" r="3"/><path class="ln" d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
  check: '<path class="ln" d="M4 12.5 9 17.5 20 6.5"/>',
  close: '<path class="ln" d="M6 6l12 12M18 6 6 18"/>',

  // ── Achievements ─────────────────────────────────────────────────────────
  build: '<path class="ln" d="M4 20v-6l8-8 4 4-8 8H4Z"/><path class="ln" d="M14 6l3-3 4 4-3 3M13 9l2 2"/>',
  medal: '<circle class="ln" cx="12" cy="15" r="5"/><path class="ln" d="M9 3l3 6 3-6M8 4l2 4M16 4l-2 4"/><path class="fl" d="M12 13l.9 1.8 2 .3-1.4 1.4.3 2-1.8-1-1.8 1 .3-2-1.4-1.4 2-.3Z"/>',
  trend: '<path class="ln" d="M4 17l5-5 3 3 7-7"/><path class="ln" d="M15 8h4v4"/>',
};

/** Tower config `icon` strings map to these keys; see towers.js. */

/**
 * Build an inline SVG string for `name`.
 * @param {string} name - key in PATHS
 * @param {{size?:number, cls?:string, title?:string}} [opts]
 * @returns {string} <svg>…</svg>
 */
export function icon(name, opts = {}) {
  const body = PATHS[name] || '<circle class="fl" cx="12" cy="12" r="3"/>';
  const size = opts.size || 24;
  const cls = opts.cls ? ` ${opts.cls}` : '';
  const title = opts.title ? `<title>${opts.title}</title>` : '';
  return (
    `<svg class="icon${cls}" viewBox="0 0 24 24" width="${size}" height="${size}" ` +
    `aria-hidden="true" focusable="false">${title}${body}</svg>`
  );
}

/** True if a key exists (lets callers fall back gracefully). */
export function hasIcon(name) {
  return Object.prototype.hasOwnProperty.call(PATHS, name);
}

/**
 * Fill every `[data-icon="name"]` placeholder in the document (or a subtree)
 * with its SVG. Keeps the static HUD markup as one-line placeholders instead of
 * duplicating path data into index.html. Idempotent.
 * @param {ParentNode} [root=document]
 */
export function initIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach(el => {
    const name = el.getAttribute('data-icon');
    if (el.firstElementChild?.tagName === 'svg') return; // already filled
    el.innerHTML = icon(name);
  });
}
