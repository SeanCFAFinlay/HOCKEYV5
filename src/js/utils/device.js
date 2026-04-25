// Device detection utilities
// Provides consistent mobile/tablet/desktop detection across the app

/**
 * Detect if the current device is mobile (phone or tablet)
 * @returns {boolean} True if mobile device
 */
export function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Detect if the current device is a phone (smaller screen mobile)
 * @returns {boolean} True if phone
 */
export function isPhoneDevice() {
  return isMobileDevice() && window.innerWidth < 768;
}

/**
 * Detect if the current device is a tablet
 * @returns {boolean} True if tablet
 */
export function isTabletDevice() {
  return isMobileDevice() && window.innerWidth >= 768;
}

/**
 * Get device pixel ratio capped for performance
 * @returns {number} Capped device pixel ratio
 */
export function getAdaptivePixelRatio() {
  const maxRatio = isMobileDevice() ? 1.5 : 2;
  return Math.min(window.devicePixelRatio || 1, maxRatio);
}
