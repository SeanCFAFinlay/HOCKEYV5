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

  // ── Kitchen Nightmare ────────────────────────────────────────────────────
  toaster: '<rect class="ln" x="3" y="9" width="18" height="10" rx="3"/><path class="ln" d="M7 9V6h4v3M13 9V5h4v4M17 13v3M5 21h2M17 21h2"/>',
  grinder: '<path class="ln" d="M9 21h6l-1-7c2-1 2-4 0-5l1-3H9l1 3c-2 1-2 4 0 5l-1 7Z"/><path class="ln" d="M12 6V3M12 3h4"/>',
  whisk: '<path class="ln" d="M12 3v7"/><path class="ln" d="M12 10c-4 2-4 8 0 11 4-3 4-9 0-11Z"/><path class="ln" d="M12 10c-1.5 3-1.5 8 0 11M12 10c1.5 3 1.5 8 0 11"/>',
  spray: '<path class="ln" d="M8 21h8v-9l-2-3h-4l-2 3v9Z"/><path class="ln" d="M10 9V5h5l2-1M10 6H7l-1 3"/><path class="ln" d="M19 3l1.5-.5M19.5 5.5 21 6M19 8l1.5.8"/>',
  pan: '<circle class="ln" cx="9" cy="14" r="6"/><path class="ln" d="M14 10l7-6"/><circle class="fl" cx="9" cy="14" r="2"/>',
  microwave: '<rect class="ln" x="2.5" y="6" width="19" height="12" rx="2"/><rect class="ln" x="5" y="8.5" width="9" height="7" rx="1"/><path class="ln" d="M17.5 9v.01M17.5 12v.01M17.5 15v.01M6 20h2M16 20h2"/>',
  torch: '<path class="ln" d="M5 21h6v-8l-1-2H6l-1 2v8Z"/><path class="ln" d="M8 11V8h4l3-2"/><path class="fl" d="M16 6c2-1 3-3 2.5-4.5 1.8 1 3 3.5 1 5.5-1 1-2.6.6-3.500-1Z"/>',
  pot: '<path class="ln" d="M4 10h16v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-6Z"/><path class="ln" d="M3 10h18M2 13h2M20 13h2M10 7h4M12 7V4"/><path class="ln" d="M9 3c0 1 1 1 1 2M14 2c0 1 1 1 1 2"/>',
  bug: '<ellipse class="ln" cx="12" cy="14" rx="4.5" ry="6"/><circle class="ln" cx="12" cy="6.500" r="2.2"/><path class="ln" d="M7.500 11 4 9M7.500 14H3.500M8 17.500l-3 2M16.500 11 20 9M16.500 14h4M16 17.500l3 2M10.500 4.500 9 2.500M13.500 4.500 15 2.500"/>',

  // ── Kaiju Mini-Golf ──────────────────────────────────────────────────────
  golfflag: '<path class="ln" d="M8 21V3"/><path class="fl" d="M8 3l10 3.500L8 10Z"/><ellipse class="ln" cx="11" cy="20" rx="7" ry="2"/>',
  windmill: '<path class="ln" d="M9 21l1.500-9h3L15 21Z"/><circle class="fl" cx="12" cy="9" r="1.300"/><path class="ln" d="M12 9 5 4l1.800-1.500L12 9ZM12 9l7-5-1.800-1.500L12 9ZM12 9l-7 5 1.800 1.500L12 9ZM12 9l7 5-1.800 1.500L12 9Z"/>',
  clown: '<circle class="ln" cx="12" cy="12" r="8"/><circle class="fl" cx="12" cy="12.500" r="1.800"/><path class="ln" d="M7.500 15c2.500 3 6.500 3 9 0"/><path class="ln" d="M8.500 9v.01M15.500 9v.01"/><path class="ln" d="M4 9 2 7M20 9l2-2"/>',
  loop: '<circle class="ln" cx="12" cy="10" r="6"/><path class="ln" d="M2 20h7c5 0 7-4 7-8M22 20h-6"/>',
  volcano: '<path class="ln" d="M3 21 9 9h6l6 12Z"/><path class="fl" d="M9 9c1-2 0-3 1.500-5 .500 1.500 1.500 1.500 1.500 3 1-1 1-2.500 2.500-3-.500 2 1 3 .500 5Z"/><path class="ln" d="M11 9l-1 5M14 9l1 4"/>',
  putter: '<path class="ln" d="M16 3 9 17"/><path class="ln" d="M9 17H4v3h6l-1-3Z"/><circle class="ln" cx="18" cy="18" r="2.500"/>',
  cannon: '<path class="ln" d="M4 12 16 6l3 5-12 6Z"/><circle class="ln" cx="8" cy="18" r="3"/><path class="ln" d="M19 5l2-1M20 8h2"/>',
  monster: '<path class="ln" d="M6 21v-8a6 6 0 0 1 12 0v8l-2-2-2 2-2-2-2 2-2-2-2 2Z"/><path class="ln" d="M9.500 12v.01M14.500 12v.01"/><path class="ln" d="M7 8 5 4l3.500 2M17 8l2-4-3.500 2"/><path class="ln" d="M10 16l2 1.500 2-1.500"/>',

  // ── Haunted Bowling Alley ────────────────────────────────────────────────
  pin: '<path class="ln" d="M10 3h4c1 2-1 4-1 6 3 3 3 8 1 12h-4c-2-4-2-9 1-12 0-2-2-4-1-6Z"/><path class="ln" d="M10.500 8h3"/>',
  jukebox: '<path class="ln" d="M5 21V10a7 7 0 0 1 14 0v11Z"/><path class="ln" d="M8 21v-9a4 4 0 0 1 8 0v9M5 17h14"/><circle class="fl" cx="12" cy="12.500" r="1.400"/>',
  cheese: '<path class="ln" d="M3 17 19 6l2 11Z"/><path class="ln" d="M3 17v3h18v-3"/><circle class="ln" cx="13" cy="14" r="1.300"/><circle class="ln" cx="17" cy="12" r="1"/>',
  disco: '<circle class="ln" cx="12" cy="13" r="7"/><path class="ln" d="M12 6V2M5 13h14M6.500 9h11M6.500 17h11M9 6.700c-1.500 4-1.500 9 0 12.600M15 6.700c1.500 4 1.500 9 0 12.600"/><path class="ln" d="M20 4l1-1M3 5 2 4"/>',
  claw: '<path class="ln" d="M12 2v6"/><rect class="ln" x="9" y="8" width="6" height="3" rx="1"/><path class="ln" d="M10 11c-3 2-4 5-3 9l2-2M14 11c3 2 4 5 3 9l-2-2M12 11v8"/>',
  ghost: '<path class="ln" d="M5 21V11a7 7 0 0 1 14 0v10l-2.300-2-2.300 2-2.400-2-2.400 2-2.300-2Z"/><path class="fl" d="M9.500 9.500a1.200 1.600 0 1 0 .01 0ZM14.500 9.500a1.200 1.600 0 1 0 .01 0Z"/><path class="ln" d="M10.500 15c1 .800 2 .800 3 0"/>',
  bowlball: '<circle class="ln" cx="12" cy="12" r="8.500"/><circle class="fl" cx="10" cy="8.500" r="1.100"/><circle class="fl" cx="13.800" cy="8" r="1.100"/><circle class="fl" cx="12.500" cy="11.500" r="1.100"/>',
  shoe: '<path class="ln" d="M3 17v-6l4-1 3 3 8 2a3 3 0 0 1 3 3v1H3v-2Z"/><path class="ln" d="M3 15h18M9 12l1.500-1.500M11.500 13.500 13 12"/>',

  // ── Bathtub Navy ─────────────────────────────────────────────────────────
  duck: '<path class="ln" d="M6.500 11.500A4 4 0 1 1 13 9v2.500c2 0 4 .500 5 1.500l3-1c0 5-3 8-7 8h-3c-4 0-7-2-7-5 0-1.500 1-2.800 2.500-3.500Z"/><path class="ln" d="M5.200 8H2.500l2.200 2.200"/><circle class="fl" cx="8.500" cy="7.500" r="1"/>',
  pistol: '<path class="ln" d="M3 8h14l3 1.500V12H11l-1 2.500H7.500L8.500 20H4.500L3 12V8Z"/><path class="ln" d="M7 8V5h7v3M11 12v2"/><path class="ln" d="M22 14.500v.01M21.500 17.500v.01"/>',
  shower: '<path class="ln" d="M5 21V8a4 4 0 0 1 8 0v1"/><path class="ln" d="M8.500 13a4.500 4 0 0 1 9 0Z"/><path class="ln" d="M10 15.500l-.800 2M13 15.500v2.500M16 15.500l.800 2M11 20l-.400 1.500M15 20l.400 1.500"/>',
  bathbomb: '<circle class="ln" cx="10.500" cy="14" r="6.500"/><path class="ln" d="M4.500 12c4 2 8 2 12 0"/><circle class="ln" cx="18.500" cy="6" r="1.800"/><circle class="ln" cx="14" cy="3.500" r="1"/><path class="ln" d="M20.500 11v.01"/>',
  tap: '<path class="ln" d="M4 21v-3h6v3M7 18v-7"/><path class="ln" d="M7 11h9a4 4 0 0 1 4 4v1h-3v-1a1 1 0 0 0-1-1H7"/><path class="ln" d="M3 7h8M7 7v4M18.500 19v2"/>',
  plunger: '<path class="ln" d="M12 2v11"/><path class="ln" d="M5 20c0-4 3-7 7-7s7 3 7 7Z"/><path class="ln" d="M3 20h18"/>',
  dryer: '<path class="ln" d="M6 6.500 14 4a5 5 0 0 1 0 10l-8-2.500v-5Z"/><path class="ln" d="M12 14l1 7h4l-1.500-7.500"/><circle class="ln" cx="14.500" cy="9" r="1.800"/><path class="ln" d="M3.500 7 2 6.500M3.500 9H1.500M3.500 11 2 11.500"/>',
  iron: '<path class="ln" d="M2.500 18c0-4 2.500-6 6.500-6h11l1 6h-18.500Z"/><path class="ln" d="M20 12a5 5 0 0 0-5-4H9M9 8V6h5"/><path class="ln" d="M6 21v.01M10 21v.01M14 21v.01"/>',
  rocket: '<path class="ln" d="M12 2c3 3 4 7 4 11H8c0-4 1-8 4-11Z"/><path class="ln" d="M8 13l-3 4h4M16 13l3 4h-4M10 17h4"/><path class="fl" d="M12 18c1 1.500 1 3 0 4-1-1-1-2.500 0-4Z"/><circle class="ln" cx="12" cy="8.500" r="1.500"/>',

  trophy: '<path class="ln" d="M7 4h10v5a5 5 0 0 1-10 0V4Z"/><path class="ln" d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M10 14v3M14 14v3M8 20h8M9 17h6"/>',

  // ── Garden Gnome Uprising ────────────────────────────────────────────────
  gnome: '<path class="fl" d="M12 2 7.500 11h9Z"/><circle class="ln" cx="12" cy="13" r="3.500"/><path class="ln" d="M8.500 14.500 12 22l3.500-7.500"/>',
  fishrod: '<path class="ln" d="M4 21 15 4c3 0 5 2 5 5v6"/><path class="ln" d="M20 15v2.500a2 2 0 0 1-4 0"/><circle class="fl" cx="7.500" cy="16" r="1.600"/>',
  seedbomb: '<circle class="ln" cx="10.500" cy="14" r="6.500"/><path class="ln" d="M15 9.500 17.500 7"/><path class="fl" d="M17.500 7c0-2.500 1.500-4 4-4 0 2.500-1.500 4-4 4Z"/><path class="ln" d="M8.500 12v.01M12.500 13v.01M9.500 16.500v.01"/>',
  wateringcan: '<path class="ln" d="M6 9h9v11H6Z"/><path class="ln" d="M15 16.500 20 8M18 6.500l4 2.500"/><path class="ln" d="M6 11H4.500a2.500 2.500 0 0 0 0 5H6M8 9c0-3.500 5-3.500 5 0"/>',
  welly: '<path class="ln" d="M8 3h6v10l5 3a2 2 0 0 1 1 2v3H8Z"/><path class="ln" d="M8 6.500h6M8 18h12"/>',
  zapper: '<path class="ln" d="M7 7h10v11H7ZM5 7h14M9 18v2.500h6V18M12 3v4"/><path class="fl" d="M13 9l-3 4h2l-1 3.500 3-4.500h-2Z"/>',
  tiki: '<path class="ln" d="M9 21V10.500h6V21M8 10.500h8"/><path class="fl" d="M12 2c2 2 3 3.500 3 5a3 3 0 0 1-6 0c0-1 .500-2 1.200-2.500.200.800.600 1.200 1 1.200.400-1-.200-2.200.800-3.700Z"/><path class="ln" d="M10.500 14v.01M13.500 14v.01M10.500 17.500h3"/>',

  // ── Sushi Conveyor ───────────────────────────────────────────────────────
  nigiri: '<path class="ln" d="M4 14v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/><path class="ln" d="M3 12c1-5 17-5 18 0 0 3-18 3-18 0Z"/><path class="ln" d="M9 9l-1 4.500M13 8.500l-1 5.500M17 9.500l-1 4"/>',
  chopsticks: '<path class="ln" d="M4 21 18 3M9 21 21 7"/><ellipse class="fl" cx="18.500" cy="6" rx="2.300" ry="1.400" transform="rotate(-45 18.500 6)"/>',
  sashimiknife: '<path class="ln" d="M3 21l5.500-5.500"/><path class="ln" d="M7 14 20 3c1 5-3 10-10 14Z"/><path class="ln" d="M7.500 15.500l1.500 1.500"/>',
  ricecooker: '<path class="ln" d="M4 11h16v6a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3Z"/><path class="ln" d="M5 11a7 5 0 0 1 14 0M10 15.500h4M2.500 13.500H4M20 13.500h1.500"/><path class="ln" d="M10 2.500c0 1 1 1 1 2M14 2c0 1 1 1 1 2"/>',
  kakigori: '<path class="ln" d="M4 13h16l-3 6H7Z"/><path class="ln" d="M6 13c0-5 3-9 6-9s6 4 6 9"/><path class="ln" d="M9 21.500h6M10 8l1 1.500M14 7.500l-1 2M12 10.500v.01"/>',
  mochimallet: '<rect class="ln" x="3" y="3.500" width="11" height="6.500" rx="1.500" transform="rotate(-20 8.500 6.750)"/><path class="ln" d="M9.500 9.500 16 20"/><path class="ln" d="M12 21h9M14 21c0-3 5-3 5 0"/>',
  eeljar: '<rect class="ln" x="6" y="7" width="12" height="14" rx="2"/><path class="ln" d="M8 7V5h8v2"/><path class="ln" d="M9 18c2-3 4 1 6-2s-4-2-3-5"/><path class="fl" d="M13 0 10.500 3H12l-.500 2.500L14 2.500h-1.500Z"/>',
  konro: '<path class="ln" d="M5 12h14l-1.500 8h-11Z"/><path class="ln" d="M3.500 12h17M10 16h4"/><path class="fl" d="M12 2c1.500 2 3 3 3 5.500a3 3 0 0 1-6 0c0-1 .500-2 1-2.500.300.800.700 1.200 1.200 1.200C11.500 5 11 3.500 12 2Z"/>',
  luckycat: '<path class="ln" d="M5 10 4.500 4.500 8 7a6 6 0 0 1 5 0l3.500-2.500L16 10a5.500 5 0 1 1-11 0Z"/><path class="ln" d="M8.500 10.500v.01M12.500 10.500v.01M9.500 13c.700.700 1.300.700 2 0"/><path class="ln" d="M17 13.500c2 0 3.500-1.500 3.500-3.500V6a1.500 1.500 0 0 0-3 0v3"/><path class="ln" d="M7 17v4h7v-4"/>',
  maki: '<circle class="ln" cx="12" cy="12" r="8.500"/><circle class="ln" cx="12" cy="12" r="5.500"/><circle class="fl" cx="12" cy="12" r="2.200"/>',

  // ── Haunted Library ──────────────────────────────────────────────────────
  grimoire: '<path class="ln" d="M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2Z"/><path class="ln" d="M5 18a2 2 0 0 1 2-2h12"/><circle class="ln" cx="12" cy="9.500" r="3"/><circle class="fl" cx="12" cy="9.500" r="1.200"/>',
  bookmark: '<path class="ln" d="M7 3h10v18l-5-4-5 4Z"/><path class="ln" d="M10 8h4M10 11h4"/>',
  quill: '<path class="ln" d="M20 3C12 4 7 9 5 17l2 0c5-1 10-6 13-14Z"/><path class="ln" d="M4 21l4-8M9 13l4-1"/>',
  inkbottle: '<path class="ln" d="M5 12a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3Z"/><path class="ln" d="M9.500 9V6h5v3M8.500 3.500h7"/><path class="fl" d="M12 12.500c1.500 1.800 2 2.800 2 3.600a2 2 0 0 1-4 0c0-.800.500-1.800 2-3.600Z"/>',
  hushowl: '<path class="ln" d="M6 4l2 3a6 6 0 0 1 8 0l2-3v9a6 7 0 0 1-12 0Z"/><path class="ln" d="M7.500 11c1 .800 2 .800 3 0M13.500 11c1 .800 2 .800 3 0"/><path class="fl" d="M12 12.500l1 1.500h-2Z"/><path class="ln" d="M4 21h16"/>',
  bookend: '<path class="ln" d="M4 21h16M15 21V7h4v14"/><path class="ln" d="M5 21V9h3v12M8.500 21 11 8l3 .600L11.500 21"/>',
  lampglobe: '<circle class="ln" cx="12" cy="9" r="6"/><path class="ln" d="M12 15v3M8 21h8l-1.500-3h-5Z"/><path class="fl" d="M13 5l-3 4h2l-1 3.500 3-4.500h-2Z"/>',
  candelabra: '<path class="ln" d="M12 9v9M5 9c0 4 3 5 7 5s7-1 7-5M8 21h8l-4-3Z"/><path class="ln" d="M4 9h2M11 9h2M18 9h2"/><path class="fl" d="M5 3c1 1.200 1.300 2 1.300 2.700a1.300 1.300 0 0 1-2.600 0C3.700 5 4 4.200 5 3ZM12 2c1 1.200 1.300 2 1.300 2.700a1.300 1.300 0 0 1-2.600 0C10.700 4 11 3.200 12 2ZM19 3c1 1.200 1.300 2 1.300 2.700a1.300 1.300 0 0 1-2.600 0C17.700 5 18 4.200 19 3Z"/>',
  overduestamp: '<path class="ln" d="M9 3h6v4l-1 1v4h-4V8L9 7Z"/><path class="ln" d="M5 12h14v4H5ZM3 20h18"/><path class="fl" d="M7 17.500h10v1H7Z"/>',

  // ── Pizza Delivery Dash ──────────────────────────────────────────────────
  pizzaslice: '<path class="ln" d="M12 21 3.500 5.500c5-3 12-3 17 0Z"/><path class="ln" d="M4.800 8c4.500-2.300 9.900-2.300 14.400 0"/><circle class="fl" cx="10" cy="10.500" r="1.300"/><circle class="fl" cx="14.200" cy="11" r="1.200"/><circle class="fl" cx="12" cy="15" r="1.100"/>',
  standmixer: '<path class="ln" d="M4 21h14M7 21V7a3 3 0 0 1 3-3h8a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-8"/><path class="ln" d="M9 13h10l-1.500 5h-7Z"/><path class="ln" d="M14 10v4"/>',
  pizzapeel: '<path class="ln" d="M3 21l7.500-7.500"/><rect class="ln" x="11" y="3" width="10" height="10" rx="3" transform="rotate(45 16 8)"/><circle class="fl" cx="16" cy="8" r="2"/>',
  sauceladle: '<path class="ln" d="M20 3 12.500 13"/><path class="ln" d="M5 13h10a5 5 0 0 1-10 0Z"/><path class="fl" d="M7 15h6a3 2 0 0 1-6 0Z"/>',
  cheesepull: '<path class="ln" d="M4 3v5M6 3v5M8 3v5M4 8a2 2 0 0 0 4 0M6 10v11"/><path class="ln" d="M16 3v5M18 3v5M20 3v5M16 8a2 2 0 0 0 4 0M18 10v11"/><path class="ln" d="M8 10c2 4 6 4 8 0M8 12c2 6 6 6 8 0"/>',
  rollingpin: '<rect class="ln" x="6" y="9" width="12" height="6" rx="2" transform="rotate(-30 12 12)"/><path class="ln" d="M2.500 17.500 6.400 15.200M17.600 8.800 21.500 6.500"/>',
  garlicbulb: '<path class="ln" d="M12 3c0 3 7 5 7 11a7 6 0 0 1-14 0c0-6 7-8 7-11Z"/><path class="ln" d="M12 9c-2 3-2 8 0 11M12 9c2 3 2 8 0 11"/><path class="fl" d="M18 1.500 16 5h1.500l-1 3 3-4h-1.500l.800-2.500Z"/>',
  pizzaoven: '<path class="ln" d="M3 20h18M4 20v-6a8 8 0 0 1 16 0v6"/><path class="ln" d="M9 20v-3a3 3 0 0 1 6 0v3"/><path class="ln" d="M15 7V3h3v6.500"/><path class="fl" d="M12 15.500c1 1 1.500 2 1.500 3h-3c0-1 .500-2 1.500-3Z"/>',
  pizzacutter: '<circle class="ln" cx="9" cy="15" r="6"/><circle class="fl" cx="9" cy="15" r="1.500"/><path class="ln" d="M9 15l4.500-4.500M13 11 21 3"/>',

  // ── Arcade Meltdown ──────────────────────────────────────────────────────
  joystick: '<path class="ln" d="M4 16h16v4H4Z"/><path class="ln" d="M12 16V9"/><circle class="fl" cx="12" cy="6.500" r="3.200"/><circle class="fl" cx="17" cy="14" r="1.300"/>',
  lightgun: '<path class="ln" d="M3 7h15l2 2v3H10l-1.500 3H6l1 5H3.500L3 13V7Z"/><path class="ln" d="M20 10.500h1.500M11 12v1.500"/><path class="ln" d="M6 10h9"/>',
  arcadecab: '<path class="ln" d="M7 3h10v4l-1.500 1v5l2.500 2v6H6v-6l2.500-2V8L7 7Z"/><path class="ln" d="M9 9.500h6v3H9ZM7 3h10M10 17v.01M14 17v.01"/>',
  coinpusher: '<rect class="ln" x="4" y="3" width="16" height="18" rx="2"/><path class="ln" d="M4 13h16M8 9h8"/><ellipse class="fl" cx="9" cy="16.500" rx="2.200" ry="1"/><ellipse class="fl" cx="15" cy="16.500" rx="2.200" ry="1"/><ellipse class="fl" cx="12" cy="18.500" rx="2.200" ry="1"/>',
  pausebtn: '<circle class="ln" cx="12" cy="12" r="8.500"/><rect class="fl" x="8.500" y="8" width="2.500" height="8" rx=".600"/><rect class="fl" x="13" y="8" width="2.500" height="8" rx=".600"/>',
  crane: '<path class="ln" d="M3 3h18M12 3v6"/><path class="ln" d="M9 9h6v2H9Z"/><path class="ln" d="M10 11l-3 4 2 4M14 11l3 4-2 4M12 11v6"/>',
  pinball: '<circle class="ln" cx="12" cy="13" r="5"/><circle class="fl" cx="12" cy="13" r="2"/><path class="ln" d="M12 8V4M9 4h6"/><path class="fl" d="M15.500 1 13 4h1.500L14 6l2.500-3H15Z"/><path class="ln" d="M4 21l4-2M20 21l-4-2"/>',
  firestick: '<path class="ln" d="M5 17h14v4H5Z"/><path class="ln" d="M12 17v-5"/><circle class="ln" cx="12" cy="9.500" r="2.500"/><path class="fl" d="M12 1c1.500 2 2.500 3 2.500 4.500a2.500 2.500 0 0 1-5 0c0-.800.400-1.600.900-2 .200.600.500 1 .900 1C11.300 3.500 11 2.300 12 1Z"/>',
  megacab: '<path class="ln" d="M5 6h14v15H5Z"/><path class="ln" d="M8 9h8v5H8ZM8 17.500h2M14 17.500h2"/><path class="fl" d="M12 0.800l1 2 2.200.300-1.600 1.500.400 2.200-2-1.100-2 1.100.400-2.200L8.800 3.100l2.200-.300Z"/>',
  pixelghost: '<path class="fl" fill-rule="evenodd" d="M8 3h8v2h2v2h2v14h-3v-2h-2v2h-2v-2h-2v2H9v-2H7v2H4V7h2V5h2ZM8 9v3h3V9ZM13 9v3h3V9Z"/>',

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
