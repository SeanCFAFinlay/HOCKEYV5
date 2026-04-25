// Camera controls with smooth easing
// Supports zoom, pan, and rotation with interpolation

import { getState, setCameraState, dispatch, ActionTypes } from './state.js';

// Camera constraints
const MIN_DIST = 8;
const MAX_DIST = 40;
const MIN_HEIGHT = 5;
const MAX_HEIGHT = 30;
const ZOOM_STEP = 2;

// Easing configuration
const CAMERA_LERP_SPEED = 8; // Higher = faster response
const ANGLE_LERP_SPEED = 10;

// Target values for smooth interpolation
let targetAngle = Math.PI / 4;
let targetHeight = 14;
let targetDist = 22;

/**
 * Update camera position with smooth interpolation
 * @param {number} dt - Delta time
 */
export function updateCamera(dt = 0.016) {
  const state = getState();
  const { camera, camAngle, camDist, camHeight } = state;

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

  // Apply camera position and look at center
  camera.position.set(x, y, z);
  camera.lookAt(0, 0, 0);
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
  targetAngle = Math.PI / 4;
  targetHeight = 14;
  targetDist = 22;
}

/**
 * Rotate camera by angle delta
 * @param {number} deltaAngle - Angle change in radians
 */
export function rotateCamera(deltaAngle) {
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
 * Initialize camera state on game start
 */
export function initCameraState() {
  targetAngle = Math.PI / 4;
  targetHeight = 14;
  targetDist = 22;

  const state = getState();
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
