// SC-3.4: Currency Fly-to-HUD
// Floating "+$X" text that arcs from enemy death position to money HUD stat

import { getState } from '../engine/state.js';

const POOL_SIZE = 10;
const FLY_DURATION = 800; // ms total
const RISE_AMOUNT = 30;   // px rise before arc begins

// Module-level shared state (initialized by initCurrencyFly)
let _pool = null;
let _moneyEl = null;

/**
 * Convert 3D world position to 2D screen coordinates.
 * @param {number} x - World X
 * @param {number} y - World Y
 * @param {number} z - World Z
 * @param {Object} camera - THREE.Camera
 * @param {Object} canvas - Canvas element
 * @returns {{x: number, y: number}} Screen pixel coordinates
 */
export function worldToScreen(x, y, z, camera, canvas) {
  const T = globalThis.THREE || window.THREE;
  const vec = T?.Vector3 ? new T.Vector3(x, y, z) : { x, y, z };

  if (typeof vec.project === 'function') {
    vec.project(camera);
  } else if (typeof camera?.project === 'function') {
    camera.project(vec);
  }

  const rect = typeof canvas.getBoundingClientRect === 'function'
    ? canvas.getBoundingClientRect()
    : { left: 0, top: 0, width: canvas.width, height: canvas.height };

  return {
    x: rect.left + (vec.x * 0.5 + 0.5) * rect.width,
    y: rect.top + (-vec.y * 0.5 + 0.5) * rect.height
  };
}

/**
 * Create and style a single floating text element.
 * @returns {HTMLElement}
 */
function createFlyElement() {
  const el = document.createElement('div');
  el.style.cssText = [
    'position:fixed',
    'pointer-events:none',
    'font-weight:bold',
    'font-size:14px',
    'color:#ffd700',
    'text-shadow:0 1px 3px rgba(0,0,0,0.8)',
    'z-index:9999',
    'display:none',
    'user-select:none',
    'white-space:nowrap'
  ].join(';');
  return el;
}

/**
 * DOM element pool for floating currency texts.
 * Reuses up to maxSize elements to avoid churn.
 */
export class CurrencyFlyPool {
  constructor(container, maxSize = POOL_SIZE) {
    this._container = container;
    this._maxSize = maxSize;
    this._available = [];
    this._active = new Set();

    for (let i = 0; i < maxSize; i++) {
      const el = createFlyElement();
      container.appendChild(el);
      this._available.push(el);
    }
  }

  /** @returns {HTMLElement|null} */
  acquire() {
    if (this._available.length === 0) return null;
    const el = this._available.pop();
    this._active.add(el);
    return el;
  }

  /** @param {HTMLElement} el */
  release(el) {
    if (!this._active.has(el)) return;
    this._active.delete(el);
    el.style.display = 'none';
    this._available.push(el);
  }

  /** @returns {number} */
  activeCount() {
    return this._active.size;
  }
}

/**
 * Quadratic bezier interpolation.
 * @param {number} p0 - Start
 * @param {number} p1 - Control
 * @param {number} p2 - End
 * @param {number} t  - 0..1
 * @returns {number}
 */
function bezier(p0, p1, p2, t) {
  const u = 1 - t;
  return u * u * p0 + 2 * u * t * p1 + t * t * p2;
}

/**
 * Show a floating "+$X" text that arcs from (startX, startY) toward targetEl.
 * @param {number} amount - Currency amount
 * @param {number} startX - Screen X (px)
 * @param {number} startY - Screen Y (px)
 * @param {HTMLElement} targetEl - Money stat DOM element
 * @param {CurrencyFlyPool} pool - Element pool
 */
export function showCurrencyFly(amount, startX, startY, targetEl, pool) {
  const el = pool.acquire();
  if (!el) return;

  el.textContent = `+$${amount}`;
  el.style.display = 'block';
  el.style.opacity = '1';

  const rect = targetEl.getBoundingClientRect();
  const endX = rect.left;
  const endY = rect.top;

  // Control point: above start for natural arc
  const ctrlX = (startX + endX) / 2;
  const ctrlY = Math.min(startY, endY) - RISE_AMOUNT;

  const startTime = performance.now();
  const fadeStart = FLY_DURATION - 200;

  function animate(now) {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / FLY_DURATION, 1);

    const cx = bezier(startX, ctrlX, endX, t);
    const cy = bezier(startY, ctrlY, endY, t);

    el.style.left = `${cx}px`;
    el.style.top = `${cy}px`;

    if (elapsed >= fadeStart) {
      const fadeT = (elapsed - fadeStart) / 200;
      el.style.opacity = String(Math.max(0, 1 - fadeT));
    }

    if (t < 1) {
      requestAnimationFrame(animate);
      return;
    }

    // Animation complete
    pool.release(el);
    triggerMoneyPulse(targetEl);
  }

  requestAnimationFrame(animate);
}

/**
 * Add pulse-gain class to money stat element, remove after animation.
 * @param {HTMLElement} el
 */
function triggerMoneyPulse(el) {
  if (!el) return;
  el.classList.remove('pulse-gain');
  // Force reflow so re-adding restarts the animation
  void el.offsetWidth;
  el.classList.add('pulse-gain');
}

/**
 * Initialize the shared currency fly system.
 * Call once from HUD init.
 * @param {HTMLElement} moneyStatEl - The #moneyStat element
 */
export function initCurrencyFly(moneyStatEl) {
  _moneyEl = moneyStatEl;

  const container = document.createElement('div');
  container.id = 'currencyFlyContainer';
  container.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;overflow:visible;pointer-events:none;z-index:9999';
  document.body.appendChild(container);

  _pool = new CurrencyFlyPool(container, POOL_SIZE);
}

/**
 * Trigger a currency fly animation from a 3D world position.
 * Called from enemies.js on enemy death.
 * @param {number} amount - Reward amount
 * @param {number} wx - World X
 * @param {number} wy - World Y
 * @param {number} wz - World Z
 */
export function triggerCurrencyFly(amount, wx, wy, wz) {
  if (!_pool || !_moneyEl) return;

  const state = getState();
  const { camera, renderer } = state;
  if (!camera || !renderer) return;

  const canvas = renderer.domElement;
  const screen = worldToScreen(wx, wy, wz, camera, canvas);

  showCurrencyFly(amount, screen.x, screen.y, _moneyEl, _pool);
}
