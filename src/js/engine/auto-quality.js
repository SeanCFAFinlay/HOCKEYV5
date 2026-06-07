/**
 * SC-5.5: Frame-time monitoring and automatic quality reduction.
 *
 * If the average frame time exceeds 33ms (30fps) for 5 consecutive seconds,
 * the quality tier is downgraded one step. Auto-reduction fires at most once
 * per session.
 */

import { getState } from './state.js';
import { setPostProcessingQuality } from './postprocessing.js';
import { applyRendererQuality, getQualityName, setQualityTier } from '../rendering/quality.js';

// ── Module state ──────────────────────────────────────────────────────────────

let _enabled = false;
let _hasReducedOnce = false;
let _consecutiveSlowSeconds = 0;
const SLOW_THRESHOLD_MS = 33;
const SLOW_WINDOW_SECONDS = 5;

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
  if (!_enabled) {
    _consecutiveSlowSeconds = 0;
  }
}

/**
 * Reset the one-shot flag so auto-reduction can fire again.
 * Useful for testing.
 */
export function resetAutoQuality() {
  _hasReducedOnce = false;
  _consecutiveSlowSeconds = 0;
}

/**
 * Per-frame update. Call from the main game loop.
 * @param {number} dt - delta time in seconds
 */
export function updateAutoQuality(dt) {
  if (!_enabled || _hasReducedOnce) return;

  const frameMs = dt * 1000;

  if (frameMs > SLOW_THRESHOLD_MS) {
    _consecutiveSlowSeconds += dt;
  } else {
    _consecutiveSlowSeconds = 0;
  }

  if (_consecutiveSlowSeconds >= SLOW_WINDOW_SECONDS) {
    _triggerQualityReduction();
  }
}

// ── Private ───────────────────────────────────────────────────────────────────

function _triggerQualityReduction() {
  const current = getQualityName();
  const next = _nextLowerTier(current);

  if (!next) {
    // Already at lowest tier — nothing to do
    _hasReducedOnce = true;
    _consecutiveSlowSeconds = 0;
    return;
  }

  setQualityTier(next);
  applyActiveQuality(next);
  _hasReducedOnce = true;
  _consecutiveSlowSeconds = 0;

  console.warn(
    `[AutoQuality] Average frame time exceeded ${SLOW_THRESHOLD_MS}ms for ` +
    `${SLOW_WINDOW_SECONDS}s — auto-reduced quality from '${current}' to '${next}'`
  );
}

function applyActiveQuality(next) {
  try {
    const renderer = getState().renderer;
    if (renderer) applyRendererQuality(renderer);
    setPostProcessingQuality(next);
  } catch (e) {
    console.warn('[AutoQuality] Quality tier changed, but runtime application failed:', e);
  }
}
