// Tower info tooltips — SC-4.2
// Show rich tower stats on hover (300ms) or long-press (400ms)

import { icon } from './icons.js';

const SHOW_DELAY_DESKTOP = 300;
const SHOW_DELAY_MOBILE = 400;
const TOOLTIP_WIDTH = 180;
const TOOLTIP_GAP = 8;  // px gap between tooltip and button top

// Role label mappings
const ROLE_LABELS = {
  'ANTI-SWARM': 'FAST',
  'SNIPER': 'SNIPER',
  'SPLASH': 'AOE',
  'CROWD_CONTROL': 'SLOW',
  'CHOKEPOINT': 'GUARD',
  'CHAIN': 'CHAIN',
  'DOT': 'BURN',
  'BOSS_KILLER': 'BOSS'
};

// Role descriptions
const ROLE_DESC = {
  'ANTI-SWARM': 'Fast-firing. Great vs hordes of weak enemies.',
  'SNIPER': 'High damage, long range. Targets high-HP enemies.',
  'SPLASH': 'Area damage on impact. Clears tightly packed groups.',
  'CROWD_CONTROL': 'Slows enemies, letting other towers deal more damage.',
  'CHOKEPOINT': 'Massive damage at short range. Holds the line.',
  'CHAIN': 'Chains lightning between nearby enemies.',
  'DOT': 'Burns targets over time. Excels vs tanky enemies.',
  'BOSS_KILLER': 'Devastating critical hits. Built for boss waves.'
};

// ── Singleton tooltip element ──────────────────────────────────────────────

let tooltipEl = null;
let showTimer = null;

// ── Public API ────────────────────────────────────────────────────────────

/**
 * Create the shared tooltip DOM element and append to body.
 * Call once on game init.
 */
export function initTooltips() {
  if (tooltipEl) return;

  tooltipEl = document.createElement('div');
  tooltipEl.classList.add('tower-tooltip');
  tooltipEl.style.display = 'none';
  tooltipEl.style.position = 'fixed';
  tooltipEl.style.zIndex = '9000';
  tooltipEl.style.pointerEvents = 'none';

  document.body.appendChild(tooltipEl);
}

/**
 * Attach hover/long-press tooltip behaviour to a tower button.
 * @param {HTMLElement} btn  - The tower button element
 * @param {Object}      tower - Tower config object
 */
export function attachTooltip(btn, tower) {
  btn.addEventListener('mouseenter', () => onMouseEnter(btn, tower));
  btn.addEventListener('mouseleave', onMouseLeave);
  btn.addEventListener('touchstart', (e) => onTouchStart(e, btn, tower), { passive: true });
  btn.addEventListener('touchend', onTouchEnd);
  btn.addEventListener('touchcancel', onTouchEnd);
}

/**
 * Hide the tooltip immediately and cancel any pending show.
 */
export function hideTooltip() {
  cancelShowTimer();
  if (tooltipEl) tooltipEl.style.display = 'none';
}

/**
 * Build tooltip inner HTML for a tower config.
 * @param {Object} tower - Tower config object
 * @returns {string} HTML string
 */
export function buildTooltipContent(tower) {
  const dmg = Array.isArray(tower.dmg) ? tower.dmg[0] : tower.dmg;
  const rng = Array.isArray(tower.rng) ? tower.rng[0] : tower.rng;
  const rate = Array.isArray(tower.rate) ? tower.rate[0] : tower.rate;
  const role = ROLE_LABELS[tower.role] || tower.role || '';
  const special = getSpecialAbilityText(tower);
  const desc = ROLE_DESC[tower.role] || '';

  return `
    <div class="tooltip-arrow"></div>
    <div class="tooltip-icon">${icon(tower.icon)}</div>
    <div class="tooltip-header">
      <span class="tooltip-name">${tower.nm}</span>
      ${role ? `<span class="tooltip-role">${role}</span>` : ''}
    </div>
    <div class="tooltip-stats">
      <div>DMG: ${dmg}</div>
      <div>RNG: ${rng}</div>
      <div>RATE: ${rate}/s</div>
    </div>
    ${special ? `<div class="tooltip-special">${special}</div>` : ''}
    <div class="tooltip-desc">${desc}</div>
    <div class="tooltip-cost">$${tower.cost}</div>
  `.trim();
}

/**
 * Get the special ability description for a tower.
 * @param {Object} tower - Tower config
 * @returns {string}
 */
export function getSpecialAbilityText(tower) {
  if (tower.splash) {
    const radius = Array.isArray(tower.splash) ? tower.splash[0] : tower.splash;
    return `splash radius: ${radius} (AOE damage)`;
  }
  if (tower.slow) {
    return `slow: ${Math.round(tower.slow * 100)}% speed reduction`;
  }
  if (tower.burn) {
    const burnDmg = Array.isArray(tower.burn) ? tower.burn[0] : tower.burn;
    return `burn: ${burnDmg} dmg over ${tower.burnDur || 3}s`;
  }
  if (tower.chain) {
    const chains = Array.isArray(tower.chain) ? tower.chain[0] : tower.chain;
    return `chain lightning: hits ${chains} targets`;
  }
  if (tower.crit) {
    return `crit chance: ${Math.round(tower.crit * 100)}%`;
  }
  return 'Consistent single-target damage';
}

/**
 * Calculate tooltip position above the button rect.
 * Clamps to screen edges.
 * @param {DOMRect} btnRect
 * @param {number} viewportWidth
 * @param {number} tooltipWidth
 * @param {number} viewportHeight
 * @returns {{ top: number, left: number }}
 */
export function getTooltipPosition(btnRect, viewportWidth, tooltipWidth, viewportHeight) {
  const TOOLTIP_HEIGHT_ESTIMATE = 180;
  const btnCenterX = btnRect.left + btnRect.width / 2;
  let left = btnCenterX - tooltipWidth / 2;
  const top = btnRect.top - TOOLTIP_HEIGHT_ESTIMATE - TOOLTIP_GAP;

  // Clamp horizontal
  const margin = 4;
  if (left < margin) left = margin;
  if (left + tooltipWidth > viewportWidth - margin) {
    left = viewportWidth - tooltipWidth - margin;
  }

  return { top, left };
}

// ── Internal helpers ──────────────────────────────────────────────────────

function onMouseEnter(btn, tower) {
  cancelShowTimer();
  showTimer = setTimeout(() => showTooltip(btn, tower), SHOW_DELAY_DESKTOP);
}

function onMouseLeave() {
  hideTooltip();
}

function onTouchStart(e, btn, tower) {
  cancelShowTimer();
  showTimer = setTimeout(() => showTooltip(btn, tower), SHOW_DELAY_MOBILE);
}

function onTouchEnd() {
  hideTooltip();
}

function cancelShowTimer() {
  if (showTimer !== null) {
    clearTimeout(showTimer);
    showTimer = null;
  }
}

function showTooltip(btn, tower) {
  if (!tooltipEl) return;

  const vw = (typeof window !== 'undefined' && window.innerWidth) || 390;
  const vh = (typeof window !== 'undefined' && window.innerHeight) || 700;
  const btnRect = btn.getBoundingClientRect();

  tooltipEl.innerHTML = buildTooltipContent(tower);

  const pos = getTooltipPosition(btnRect, vw, TOOLTIP_WIDTH, vh);
  tooltipEl.style.top = `${pos.top}px`;
  tooltipEl.style.left = `${pos.left}px`;
  tooltipEl.style.width = `${TOOLTIP_WIDTH}px`;
  tooltipEl.style.display = 'block';
}
