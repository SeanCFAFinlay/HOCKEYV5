// SC-3.3: Projectile Trail System
// Ribbon trails using THREE.Line with BufferGeometry pool
// SC-5.5: Quality LOD — low=disabled, medium=4 segments, high=8 segments

import { getQualityName } from '../rendering/quality.js';

const MAX_TRAILS = 30;
const TRAIL_SEGMENTS_HIGH   = 8;
const TRAIL_SEGMENTS_MEDIUM = 4;
const TRAIL_FADE_TIME = 0.2;    // 200ms fade after projectile hits

/**
 * Returns the number of trail segments for the current quality tier.
 * Returns 0 on 'low' (trails fully disabled).
 * @returns {number}
 */
export function getTrailSegmentCount() {
  const q = getQualityName();
  if (q === 'low') return 0;
  if (q === 'medium') return TRAIL_SEGMENTS_MEDIUM;
  return TRAIL_SEGMENTS_HIGH; // high / ultra
}

/** Segment count used when building the pool (set at initTrails time). */
let _activeSegments = TRAIL_SEGMENTS_HIGH;

// Module state
let _scene = null;
const _pool = [];               // available trail lines
const _active = [];             // { line, projectile, fading, fadeTimer }

// ── Init ──────────────────────────────────────────────────────────────────

/**
 * Initialize trail pool and add all lines to scene.
 * Call once after scene is created.
 * @param {THREE.Scene} scene
 */
export function initTrails(scene) {
  _scene = scene;
  _pool.length = 0;
  _active.length = 0;
  _activeSegments = getTrailSegmentCount();

  // On low quality, trails are fully disabled — no pool created
  if (_activeSegments === 0) return;

  for (let i = 0; i < MAX_TRAILS; i++) {
    const line = _createTrailLine();
    line.visible = false;
    scene.add(line);
    _pool.push(line);
  }
}

// ── Public API ────────────────────────────────────────────────────────────

/**
 * Attach a ribbon trail to a projectile.
 * Grabs a line from the pool; silently skips if pool is empty.
 * @param {object} projectile - projectile data object ({ x, y, z })
 * @param {number|THREE.Color} color - trail color
 */
export function attachTrail(projectile, color) {
  if (_activeSegments === 0) return; // low quality — trails disabled
  if (_pool.length === 0) return;    // graceful degradation

  const line = _pool.pop();
  _setMaterialColor(line.material, color);
  line.material.opacity = 0.6;
  line.visible = true;

  // Seed all points at projectile's current position
  _seedPositions(line, projectile.x, projectile.y, projectile.z);

  const entry = { line, projectile, fading: false, fadeTimer: 0 };
  _active.push(entry);
  projectile._trail = line;
  projectile._trailEntry = entry;
}

/**
 * Update all active trails each frame.
 * Active (non-fading) trails shift newest point to projectile position.
 * Fading trails decrease opacity and recycle when done.
 * @param {number} dt - delta time in seconds
 */
export function updateTrails(dt) {
  for (let i = _active.length - 1; i >= 0; i--) {
    const entry = _active[i];

    if (entry.fading) {
      _updateFading(entry, dt, i);
    } else {
      _updateActive(entry);
    }
  }
}

/**
 * Begin fading a trail after projectile is removed.
 * Trail stays visible and fades over TRAIL_FADE_TIME, then recycles.
 * @param {object} projectile
 */
export function removeTrail(projectile) {
  if (!projectile._trailEntry) return;
  projectile._trailEntry.fading = true;
  projectile._trailEntry.fadeTimer = 0;
}

/**
 * Dispose all trail objects and clear pool.
 * Call on game reset/cleanup.
 */
export function cleanupTrails() {
  _pool.length = 0;
  _active.length = 0;
  _scene = null;
}

/**
 * Returns diagnostic stats about the trail pool.
 * @returns {{ poolSize: number, activeCount: number, availableCount: number }}
 */
export function getTrailPoolStats() {
  const poolSize = _pool.length + _active.length;
  return {
    poolSize,
    activeCount: _active.length,
    availableCount: _pool.length
  };
}

// ── Private helpers ───────────────────────────────────────────────────────

function _createTrailLine() {
  const segs = _activeSegments || TRAIL_SEGMENTS_HIGH;
  const positions = new Float32Array(segs * 3);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

  const mat = new THREE.LineBasicMaterial({
    color: 0xffffff,
    opacity: 0.6,
    transparent: true,
    depthWrite: false
  });

  const line = new THREE.Line(geo, mat);
  line.renderOrder = 999;
  return line;
}

function _setMaterialColor(material, color) {
  if (material.color && typeof material.color.set === 'function') {
    material.color.set(color);
    return;
  }

  material.color = new THREE.Color(color);
}

function _seedPositions(line, x, y, z) {
  const pos = line.geometry.attributes.position.array;
  const segs = pos.length / 3;
  for (let i = 0; i < segs; i++) {
    pos[i * 3]     = x;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = z;
  }
  line.geometry.attributes.position.needsUpdate = true;
}

function _updateActive(entry) {
  const { line, projectile } = entry;
  const pos = line.geometry.attributes.position.array;
  const segs = pos.length / 3;

  // Shift older points back: index 0 = newest, index N-1 = oldest
  for (let i = segs - 1; i > 0; i--) {
    pos[i * 3]     = pos[(i - 1) * 3];
    pos[i * 3 + 1] = pos[(i - 1) * 3 + 1];
    pos[i * 3 + 2] = pos[(i - 1) * 3 + 2];
  }

  // Newest point = current projectile position
  pos[0] = projectile.x;
  pos[1] = projectile.y;
  pos[2] = projectile.z;

  line.geometry.attributes.position.needsUpdate = true;
}

function _updateFading(entry, dt, activeIndex) {
  entry.fadeTimer += dt;
  const t = Math.min(entry.fadeTimer / TRAIL_FADE_TIME, 1);
  entry.line.material.opacity = 0.6 * (1 - t);

  if (entry.fadeTimer >= TRAIL_FADE_TIME) {
    _recycleEntry(entry, activeIndex);
  }
}

function _recycleEntry(entry, activeIndex) {
  entry.line.visible = false;
  _setMaterialColor(entry.line.material, 0xffffff);
  entry.line.material.opacity = 0.6;
  _active.splice(activeIndex, 1);
  _pool.push(entry.line);
}
