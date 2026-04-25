import { isMobileDevice } from '../utils/device.js';

export const QUALITY_TIERS = {
  low: {
    antialias: false,
    maxPixelRatio: 1,
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
    maxPixelRatio: 1.35,
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
    activeTier = isMobileDevice() ? 'low' : 'high';
  }

  return QUALITY_TIERS[activeTier];
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

export function applyRendererQuality(renderer) {
  const tier = getQualityTier();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, tier.maxPixelRatio));
  renderer.shadowMap.enabled = tier.shadows;
}
