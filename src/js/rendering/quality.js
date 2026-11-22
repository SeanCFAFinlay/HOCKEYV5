import { isMobileDevice } from '../utils/device.js';

export const QUALITY_TIERS = {
  low: {
    antialias: false,
    // Phones are DPR 2-3. Rendering at 1 makes a 390px buffer stretch across a
    // 1170px screen, which reads as blurry — the single biggest hit to how the
    // game looks on mobile. `low` already drops shadows, spotlights and all
    // post-processing, so it can afford the extra fragments. This matches the
    // intent already stated in utils/device.js getAdaptivePixelRatio().
    maxPixelRatio: 1.5,
    shadows: false,
    shadowMapSize: 512,
    spotLights: false,
    pointLights: false,
    ambientParticles: 24,
    skyParticles: 40,
    anisotropy: 1
  },
  medium: {
    antialias: true,
    // Was 1.35 — lower than `low`, so stepping up a tier made the picture softer.
    maxPixelRatio: 1.5,
    shadows: true,
    shadowMapSize: 1024,
    spotLights: false,
    pointLights: true,
    ambientParticles: 55,
    skyParticles: 90,
    anisotropy: 2
  },
  high: {
    antialias: true,
    maxPixelRatio: 2,
    shadows: true,
    shadowMapSize: 2048,
    spotLights: true,
    pointLights: true,
    ambientParticles: 100,
    skyParticles: 200,
    anisotropy: 4
  }
};

let activeTier = null;

export function getQualityTier() {
  if (activeTier) return QUALITY_TIERS[activeTier];

  const params = new URLSearchParams(window.location.search);
  const requested = params.get('quality');
  if (requested && QUALITY_TIERS[requested]) {
    activeTier = requested;
  } else {
    activeTier = isMobileDevice() ? mobileTier() : 'high';
  }

  return QUALITY_TIERS[activeTier];
}

/**
 * Pick a tier for a phone or tablet from what the device reports, not from the
 * fact that it is one. Every phone used to get `low` (no shadows), which made
 * a current flagship look the same as a five-year-old budget handset.
 *
 * `medium` needs at least six CPU cores and, where the browser reports it
 * (Chrome does, Safari does not), 4 GB of memory. If the guess is too generous
 * the frame-time monitor in engine/auto-quality.js steps it back down.
 */
function mobileTier() {
  const cores = navigator.hardwareConcurrency || 0;
  const memory = navigator.deviceMemory;   // undefined on Safari
  const capable = cores >= 6 && (memory === undefined || memory >= 4);
  return capable ? 'medium' : 'low';
}

export function getQualityName() {
  getQualityTier();
  return activeTier;
}

export function setQualityTier(name) {
  if (!QUALITY_TIERS[name]) return false;
  activeTier = name;
  return true;
}

/** Back to choosing from the device on the next arena. */
export function resetQualityTier() {
  activeTier = null;
}

export function applyRendererQuality(renderer) {
  const tier = getQualityTier();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, tier.maxPixelRatio));
  renderer.shadowMap.enabled = tier.shadows;
}
