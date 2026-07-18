/**
 * PH Interactive Studios brand mark.
 *
 * A self-contained inline-SVG recreation of the studio logo — a pixel "PH" on a
 * green→blue gradient app tile with the "INTERACTIVE STUDIOS" wordmark. Drawn in
 * vector so it's crisp at any size and needs no external asset (the CSP forbids
 * remote images). Swap this for the real PNG whenever it's available on disk;
 * every caller goes through phLogo()/phLogoDataURI() so there's one place to
 * change.
 */

// One shared gradient id would collide if the SVG is inlined more than once, so
// each call mints a unique id.
let _seq = 0;

/**
 * The logo as an <svg> string.
 * @param {{size?:number, cls?:string}} [opts]
 * @returns {string}
 */
export function phLogo(opts = {}) {
  const size = opts.size || 128;
  const cls = opts.cls ? ` ${opts.cls}` : '';
  const gid = `phg${_seq++}`;
  return `<svg class="ph-logo${cls}" viewBox="0 0 120 120" width="${size}" height="${size}" role="img" aria-label="PH Interactive Studios">
  <defs>
    <linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#7ed321"/>
      <stop offset="0.45" stop-color="#35b3e6"/>
      <stop offset="1" stop-color="#1f6fff"/>
    </linearGradient>
  </defs>
  <rect x="6" y="6" width="108" height="108" rx="24" fill="url(#${gid})"/>
  <!-- subtle pixel-mosaic highlights -->
  <g fill="#ffffff" opacity="0.10">
    <rect x="14" y="14" width="10" height="10"/><rect x="34" y="24" width="8" height="8"/>
    <rect x="90" y="18" width="10" height="10"/><rect x="20" y="86" width="8" height="8"/>
    <rect x="96" y="92" width="9" height="9"/><rect x="76" y="100" width="7" height="7"/>
  </g>
  <!-- pixel PH, white with a faint drop -->
  <g fill="#ffffff">
    <!-- P -->
    <rect x="26" y="30" width="10" height="44"/>
    <rect x="26" y="30" width="26" height="10"/>
    <rect x="26" y="45" width="26" height="10"/>
    <rect x="44" y="30" width="8" height="25"/>
    <!-- H -->
    <rect x="64" y="30" width="10" height="44"/>
    <rect x="84" y="30" width="10" height="44"/>
    <rect x="64" y="47" width="30" height="10"/>
  </g>
  <text x="60" y="92" text-anchor="middle" font-family="'Rajdhani','Segoe UI',sans-serif" font-weight="700" font-size="13" letter-spacing="1.2" fill="#ffffff">INTERACTIVE</text>
  <text x="60" y="105" text-anchor="middle" font-family="'Rajdhani','Segoe UI',sans-serif" font-weight="700" font-size="11" letter-spacing="2" fill="#ffffff">STUDIOS</text>
</svg>`;
}

/** The logo as a data: URI, for use as a favicon or CSS background. */
export function phLogoDataURI() {
  const svg = phLogo({ size: 64 }).replace(/\n\s*/g, ' ');
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

/** Set the browser-tab favicon to the brand mark. */
export function applyBrandFavicon() {
  let link = document.querySelector('link[rel="icon"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.type = 'image/svg+xml';
  link.href = phLogoDataURI();
}
