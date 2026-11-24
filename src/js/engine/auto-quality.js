/**
 * SC-5.5: Frame-time monitoring and automatic quality reduction.
 *
 * When the smoothed frame time stays above 33ms (under 30fps) for about four
 * seconds, the quality tier steps down one notch. It can step down twice
 * (high -> medium -> low), then as a last resort drops the render resolution.
 *
 * It used to need five seconds in which *every* frame was slow. A phone running
 * at a juddery 25-40fps still has the odd quick frame, which reset the count,
 * so the safety net almost never caught the phones it was written for.
 */

import { getState } from './state.js';
import { setPostProcessingQuality } from './postprocessing.js';
import { applyRendererQuality, getQualityName, getQualityTier, setQualityTier } from '../rendering/quality.js';

// ── Module state ──────────────────────────────────────────────────────────────

let _enabled = false;
let _hasReducedOnce = false;      // true once there is nothing left to reduce
let _consecutiveSlowSeconds = 0;  // seconds the smoothed frame time has been slow
let _smoothedMs = 16;
let _steps = 0;
let _resolutionDropped = false;
let _pinned = false;
let _sinceEnabled = 0;
// The first moments of an arena are always rough (textures uploading, the
// first frames of a fresh scene) and say nothing about how it will play.
const GRACE_SECONDS = 1.5;
const SLOW_THRESHOLD_MS = 33;
const SLOW_WINDOW_SECONDS = 4;
const MAX_TIER_STEPS = 2;
const SMOOTHING_SECONDS = 1;

// ── Tier order for downgrade ──────────────────────────────────────────────────

const TIER_ORDER = ['low', 'medium', 'high', 'ultra'];

function _nextLowerTier(current) {
  const idx = TIER_ORDER.indexOf(current);
  if (idx <= 0) return null; // already at lowest
  return TIER_ORDER[idx - 1];
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Enable or disable automatic quality reduction based on frame time.
 * @param {boolean} enabled
 */
export function enableAutoQuality(enabled) {
  _enabled = !!enabled;
  _sinceEnabled = 0;
  _smoothedMs = 16;
  _consecutiveSlowSeconds = 0;
}

/**
 * Reset the one-shot flag so auto-reduction can fire again.
 * Useful for testing.
 */
export function resetAutoQuality() {
  _hasReducedOnce = false;
  _consecutiveSlowSeconds = 0;
  _smoothedMs = 16;
  _steps = 0;
  _resolutionDropped = false;
}

/**
 * Per-frame update. Call from the main game loop.
 * @param {number} dt - delta time in seconds
 */
/**
 * The player picked a graphics level in Settings: respect it and stop
 * stepping down on their behalf.
 * @param {boolean} pinned
 */
export function setAutoQualityPinned(pinned) {
  _pinned = !!pinned;
}

export function updateAutoQuality(dt) {
  if (!_enabled || _hasReducedOnce || _pinned) return;

  _sinceEnabled += dt;
  if (_sinceEnabled < GRACE_SECONDS) return;
  const frameMs = dt * 1000;
  _smoothedMs += (frameMs - _smoothedMs) * Math.min(1, dt / SMOOTHING_SECONDS);

  if (_smoothedMs > SLOW_THRESHOLD_MS) {
    _consecutiveSlowSeconds += dt;
  } else {
    // Recovering bleeds the count off rather than wiping it, so a brief
    // calm patch doesn't hide a phone that is struggling overall.
    _consecutiveSlowSeconds = Math.max(0, _consecutiveSlowSeconds - dt);
  }

  if (_consecutiveSlowSeconds >= SLOW_WINDOW_SECONDS) {
    _triggerQualityReduction();
  }
}

// ── Private ───────────────────────────────────────────────────────────────────

function _triggerQualityReduction() {
  const current = getQualityName();
  const next = _nextLowerTier(current);

  _consecutiveSlowSeconds = 0;
  _smoothedMs = 16;   // judge the new setting on its own frames

  if (!next || _steps >= MAX_TIER_STEPS) {
    // Lowest tier already: render fewer pixels as the last resort.
    if (!_resolutionDropped) {
      _resolutionDropped = true;
      try {
        const { renderer } = getState();
        if (renderer && renderer.getPixelRatio?.() > 1) {
          renderer.__resolutionCap = 1;
          renderer.setPixelRatio(1);
          console.warn('[AutoQuality] Still slow at the lowest tier - rendering at pixel ratio 1');
        }
      } catch { /* ignore */ }
    }
    _hasReducedOnce = true;
    return;
  }

  setQualityTier(next);
  applyActiveQuality(next);
  _steps++;

  console.warn(
    `[AutoQuality] Average frame time exceeded ${SLOW_THRESHOLD_MS}ms for ` +
    `${SLOW_WINDOW_SECONDS}s — auto-reduced quality from '${current}' to '${next}'`
  );
}

function applyActiveQuality(next) {
  try {
    const { renderer, scene } = getState();
    if (renderer) applyRendererQuality(renderer);
    // Turning the shadow map off under a live scene is not enough on its own:
    // every material is still compiled to sample shadows, and now samples a map
    // nothing renders to, which paints the floor in dark bands. Stop the lights
    // casting and recompile the materials without shadow code.
    if (scene && typeof scene.traverse === 'function' && !getQualityTier().shadows) {
      scene.traverse(obj => {
        if (obj.isLight && obj.castShadow) obj.castShadow = false;
        const mats = Array.isArray(obj.material) ? obj.material : (obj.material ? [obj.material] : []);
        for (const mat of mats) mat.needsUpdate = true;
      });
    }
    setPostProcessingQuality(next);
  } catch (e) {
    console.warn('[AutoQuality] Quality tier changed, but runtime application failed:', e);
  }
}
