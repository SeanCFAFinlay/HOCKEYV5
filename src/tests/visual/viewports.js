/**
 * The device matrix the mobile UI work is held to.
 *
 * `width`/`height` are CSS pixels. deviceScaleFactor stays at 2 for phones so
 * the screenshots show what a real retina panel shows; it does not affect the
 * layout assertions.
 */
export const VIEWPORTS = [
  { name: 'iphone-se-320',      width: 320,  height: 568,  dsf: 2, phone: true },
  { name: 'iphone-8-375',       width: 375,  height: 667,  dsf: 2, phone: true },
  { name: 'iphone-13-390',      width: 390,  height: 844,  dsf: 3, phone: true },
  { name: 'iphone-pro-max-430', width: 430,  height: 932,  dsf: 3, phone: true },
  { name: 'phone-landscape-844', width: 844, height: 390,  dsf: 3, phone: true, landscape: true },
  { name: 'tablet-portrait',    width: 768,  height: 1024, dsf: 2, phone: false },
  { name: 'tablet-landscape',   width: 1024, height: 768,  dsf: 2, phone: false, landscape: true }
];

/** Minimum comfortable touch target, in CSS px. */
export const MIN_TOUCH_PX = 44;
