// Camera controls with smooth easing
// Supports zoom, pan, and rotation with interpolation

import { getState, setCameraState, dispatch, ActionTypes } from './state.js';

// Camera constraints
const MIN_DIST = 8;
const MAX_DIST = 50;
const MIN_HEIGHT = 5;
const MAX_HEIGHT = 38;
const ZOOM_STEP = 2;

// Easing configuration
const CAMERA_LERP_SPEED = 8; // Higher = faster response
const ANGLE_LERP_SPEED = 10;

// Target values for smooth interpolation
let targetAngle = Math.PI / 4;
let targetHeight = 18;
let targetDist = 28;

// ── Cinematic state machine ───────────────────────────────────────────────

/**
 * Cinematic mode: 'none' | 'pullback' | 'bosstrack' | 'orbit' | 'defeat'
 */
let cinematicMode = 'none';
let cinematicElapsed = 0;

// Pullback state
const PULLBACK_IN_MS = 500;
const PULLBACK_OUT_MS = 800;
const PULLBACK_FACTOR = 1.15;
let pullbackBaseDist = 14;
let pullbackBaseHeight = 8;

// Boss track state
let bossTrackDuration = 1500;
let bossTrackX = 0;
let bossTrackZ = 0;
let bossLookX = 0;
let bossLookZ = 0;

// Orbit state
const ORBIT_SPEED = 0.3; // rad/s
const ORBIT_RISE_TARGET = 12;
const ORBIT_DIST_TARGET = 16;

// Defeat state
const DEFEAT_HEIGHT_FACTOR = 0.7;
let defeatBaseDist = 14;
let defeatBaseHeight = 8;
let defeatSettled = false;

/**
 * Get current cinematic mode
 * @returns {string}
 */
export function getCinematicMode() {
  return cinematicMode;
}

/**
 * Cancel any active cinematic and restore normal camera control
 */
export function cancelCinematic() {
  cinematicMode = 'none';
  cinematicElapsed = 0;
  bossLookX = 0;
  bossLookZ = 0;
  defeatSettled = false;
}

// ── Cinematic triggers ────────────────────────────────────────────────────

/**
 * Wave start pull-back: briefly pulls camera out by 15% over 500ms,
 * then eases back to normal over 800ms.
 */
export function cameraWaveStartPullback() {
  pullbackBaseDist = targetDist;
  pullbackBaseHeight = targetHeight;
  cinematicMode = 'pullback';
  cinematicElapsed = 0;
}

/**
 * Boss spawn track: smoothly pans camera lookAt toward boss for duration,
 * then eases back to arena center.
 * @param {number} worldX - Boss world X position
 * @param {number} worldZ - Boss world Z position
 * @param {number} duration - Duration in ms (default 1500)
 */
export function cameraBossTrack(worldX, worldZ, duration = 1500) {
  bossTrackX = worldX;
  bossTrackZ = worldZ;
  bossTrackDuration = duration;
  bossLookX = 0;
  bossLookZ = 0;
  cinematicMode = 'bosstrack';
  cinematicElapsed = 0;
}

/**
 * Game win orbit: slowly orbits camera around arena at cinematic height.
 * Continues until cancelCinematic() is called.
 */
export function cameraVictoryOrbit() {
  cinematicMode = 'orbit';
  cinematicElapsed = 0;
}

/**
 * Game lose drop: tilts camera toward ground, reduces height by 30%.
 * Persists until cancelCinematic() is called.
 */
export function cameraDefeatDrop() {
  defeatBaseDist = targetDist;
  defeatBaseHeight = targetHeight;
  defeatSettled = false;
  cinematicMode = 'defeat';
  cinematicElapsed = 0;
}

// ── Cinematic update helpers ──────────────────────────────────────────────

function updatePullback(dt) {
  cinematicElapsed += dt * 1000;
  const totalMs = PULLBACK_IN_MS + PULLBACK_OUT_MS;

  if (cinematicElapsed <= PULLBACK_IN_MS) {
    // Ease in (pull out)
    const t = cinematicElapsed / PULLBACK_IN_MS;
    const ease = t * t; // ease-in quad
    targetDist = pullbackBaseDist * (1 + (PULLBACK_FACTOR - 1) * ease);
  } else if (cinematicElapsed <= totalMs) {
    // Ease back
    const t = (cinematicElapsed - PULLBACK_IN_MS) / PULLBACK_OUT_MS;
    const ease = 1 - (1 - t) * (1 - t); // ease-out quad
    targetDist = pullbackBaseDist * (PULLBACK_FACTOR - (PULLBACK_FACTOR - 1) * ease);
  } else {
    // Done
    targetDist = pullbackBaseDist;
    targetHeight = pullbackBaseHeight;
    cancelCinematic();
  }
}

function updateBossTrack(dt) {
  cinematicElapsed += dt * 1000;

  if (cinematicElapsed >= bossTrackDuration) {
    // Restore look target to origin
    bossLookX = 0;
    bossLookZ = 0;
    cancelCinematic();
    return;
  }

  const halfDur = bossTrackDuration * 0.5;
  if (cinematicElapsed <= halfDur) {
    // Pan toward boss
    const t = cinematicElapsed / halfDur;
    bossLookX = bossTrackX * t;
    bossLookZ = bossTrackZ * t;
  } else {
    // Pan back to center
    const t = (cinematicElapsed - halfDur) / halfDur;
    bossLookX = bossTrackX * (1 - t);
    bossLookZ = bossTrackZ * (1 - t);
  }
}

function updateOrbit(dt) {
  targetAngle += ORBIT_SPEED * dt;
  if (targetHeight < ORBIT_RISE_TARGET) {
    targetHeight = Math.min(ORBIT_RISE_TARGET, targetHeight + 2 * dt);
  }
  if (targetDist < ORBIT_DIST_TARGET) {
    targetDist = Math.min(ORBIT_DIST_TARGET, targetDist + 3 * dt);
  }
}

function updateDefeat(dt) {
  if (!defeatSettled) {
    const goalHeight = defeatBaseHeight * DEFEAT_HEIGHT_FACTOR;
    const goalDist = defeatBaseDist * 1.1;
    targetHeight = Math.max(goalHeight, targetHeight - 8 * dt);
    targetDist = Math.min(goalDist, targetDist + 4 * dt);
    if (targetHeight <= goalHeight + 0.05) {
      targetHeight = goalHeight;
      defeatSettled = true;
    }
  }
}

/**
 * Dispatch cinematic logic for the current frame
 * @param {number} dt - Delta time in seconds
 */
function updateCinematic(dt) {
  switch (cinematicMode) {
    case 'pullback':   updatePullback(dt);   break;
    case 'bosstrack':  updateBossTrack(dt);  break;
    case 'orbit':      updateOrbit(dt);      break;
    case 'defeat':     updateDefeat(dt);     break;
    default: break;
  }
}

/**
 * Update camera position with smooth interpolation
 * @param {number} dt - Delta time
 */
export function updateCamera(dt = 0.016) {
  const state = getState();
  const { camera, camAngle, camDist, camHeight } = state;

  // Update zoom pulse animation before interpolating
  updateZoomPulse(dt);

  // Update cinematic behaviors
  updateCinematic(dt);

  if (!camera) return;

  // Smooth interpolation towards target values
  const lerpFactor = 1 - Math.exp(-CAMERA_LERP_SPEED * dt);
  const angleLerpFactor = 1 - Math.exp(-ANGLE_LERP_SPEED * dt);

  // Interpolate camera values
  const newAngle = lerp(camAngle, targetAngle, angleLerpFactor);
  const newHeight = lerp(camHeight, targetHeight, lerpFactor);
  const newDist = lerp(camDist, targetDist, lerpFactor);

  // Update state (using direct state update for performance)
  state.camAngle = newAngle;
  state.camHeight = newHeight;
  state.camDist = newDist;

  // Calculate camera position from spherical coordinates
  let x = Math.sin(newAngle) * newDist;
  let y = newHeight;
  let z = Math.cos(newAngle) * newDist;

  // Apply screen shake
  if (shakeDuration > 0) {
    shakeDuration -= dt;
    const decay = Math.max(0, shakeDuration / shakeMaxDuration);
    const intensity = shakeIntensity * decay;
    x += (Math.random() - 0.5) * 2 * intensity;
    y += (Math.random() - 0.5) * 2 * intensity * 0.5;
    z += (Math.random() - 0.5) * 2 * intensity;
    if (shakeDuration <= 0) {
      shakeIntensity = 0;
      shakeDuration = 0;
      shakeMaxDuration = 0;
    }
  }

  // Apply camera position
  camera.position.set(x, y, z);

  // Apply lookAt — boss track pans to boss, otherwise look at origin
  camera.lookAt(bossLookX, 0, bossLookZ);
}

/**
 * Zoom in
 */
export function zoomIn() {
  targetDist = Math.max(MIN_DIST, targetDist - ZOOM_STEP);
  targetHeight = Math.max(MIN_HEIGHT, targetHeight - ZOOM_STEP * 0.5);
}

/**
 * Zoom out
 */
export function zoomOut() {
  targetDist = Math.min(MAX_DIST, targetDist + ZOOM_STEP);
  targetHeight = Math.min(MAX_HEIGHT, targetHeight + ZOOM_STEP * 0.5);
}

/**
 * Reset camera to default position
 */
export function resetCam() {
  const state = getState();
  const defaultDist = Math.max(state.COLS || 12, state.ROWS || 10) * 0.85;
  const defaultHeight = defaultDist * 0.55;
  targetAngle = Math.PI / 4;
  targetDist = defaultDist;
  targetHeight = defaultHeight;
}

/**
 * Rotate camera by angle delta
 * @param {number} deltaAngle - Angle change in radians
 */
export function rotateCamera(deltaAngle) {
  // Player drag cancels boss track cinematic
  if (cinematicMode === 'bosstrack') {
    cancelCinematic();
  }
  targetAngle += deltaAngle;
}

/**
 * Set camera angle directly
 * @param {number} angle - Target angle in radians
 */
export function setCameraAngle(angle) {
  targetAngle = angle;
}

/**
 * Set camera zoom level directly
 * @param {number} dist - Target distance
 * @param {number} height - Target height
 */
export function setCameraZoom(dist, height) {
  targetDist = Math.max(MIN_DIST, Math.min(MAX_DIST, dist));
  targetHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, height));
}

// Zoom pulse state
let zoomPulseActive = false;
let zoomPulseElapsed = 0;
let zoomPulseDuration = 300;
let zoomPulseIntensity = 0.1;
let zoomPulseBaseDist = 14;
let zoomPulseBaseHeight = 8;

/**
 * Trigger a brief camera zoom-in pulse then ease back out.
 * Used for boss death dramatic effect.
 * @param {number} intensity - Fractional zoom amount (0.1 = 10%)
 * @param {number} duration - Total duration in ms
 */
export function cameraZoomPulse(intensity = 0.1, duration = 300) {
  zoomPulseActive = true;
  zoomPulseElapsed = 0;
  zoomPulseDuration = duration;
  zoomPulseIntensity = intensity;
  zoomPulseBaseDist = targetDist;
  zoomPulseBaseHeight = targetHeight;
}

/**
 * Update zoom pulse animation (called from updateCamera)
 * @param {number} dt - Delta time in seconds
 */
function updateZoomPulse(dt) {
  if (!zoomPulseActive) return;

  zoomPulseElapsed += dt * 1000; // convert to ms
  const t = Math.min(1, zoomPulseElapsed / zoomPulseDuration);

  // Ease in then ease out: sin curve over [0, PI]
  const pulse = Math.sin(t * Math.PI) * zoomPulseIntensity;

  targetDist = zoomPulseBaseDist * (1 - pulse);
  targetHeight = zoomPulseBaseHeight * (1 - pulse * 0.5);

  if (t >= 1) {
    zoomPulseActive = false;
    targetDist = zoomPulseBaseDist;
    targetHeight = zoomPulseBaseHeight;
  }
}

/**
 * Shake camera effect
 */
let shakeIntensity = 0;
let shakeDuration = 0;
let shakeMaxDuration = 0;

export function shakeCamera(intensity = 0.5, duration = 0.3) {
  shakeIntensity = Math.max(shakeIntensity, intensity);
  shakeDuration = Math.max(shakeDuration, duration);
  shakeMaxDuration = shakeDuration;
}

/**
 * Trigger camera shake with named intensity levels.
 * Light (0.05, 0.15s): normal hits
 * Medium (0.10, 0.20s): critical hits
 * Heavy (0.15, 0.25s): boss kills and splash damage
 * @param {number} intensity - Shake displacement in world units
 * @param {number} durationMs - Duration in milliseconds
 */
export function triggerCameraShake(intensity = 0.05, durationMs = 150) {
  shakeCamera(intensity, durationMs / 1000);
}

/**
 * Initialize camera state on game start
 */
export function initCameraState() {
  const state = getState();

  targetAngle = Math.PI / 4;
  // Use map-calculated values from init3D if available, otherwise sensible defaults
  targetDist = state.camDist || 14;
  targetHeight = state.camHeight || 8;
  cancelCinematic();

  state.camAngle = targetAngle;
  state.camHeight = targetHeight;
  state.camDist = targetDist;
}

/**
 * Get current target values (for debugging)
 */
export function getCameraTargets() {
  return { targetAngle, targetHeight, targetDist };
}

/**
 * Linear interpolation
 */
function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Window exposure handled by main.js
