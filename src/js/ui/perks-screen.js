// The Upgrades screen: spend stars on permanent boosts (systems/perks.js).

import { PERKS, getPerkLevels, nextCost, buyPerk, refundAllPerks, starsAvailable, starsEarned, perkValue } from '../systems/perks.js';
import { icon } from './icons.js';
import { buzz } from './mobile.js';

let overlay = null;
let lastFocus = null;

function el() {
  if (overlay && overlay.isConnected) return overlay;
  overlay = document.createElement('div');
  overlay.className = 'perks-overlay';
  overlay.id = 'perksOverlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'perksTitle');
  overlay.hidden = true;
  document.body.appendChild(overlay);

  overlay.addEventListener('click', e => {
    if (e.target === overlay || e.target.closest('.perks-close')) { closeUpgrades(); return; }
    const buy = e.target.closest('.perk-buy');
    if (buy) {
      const card = buy.closest('.perk-card');
      if (buyPerk(buy.dataset.perk)) {
        buzz('upgrade');
        render(buy.dataset.perk);
      } else if (card) {
        card.classList.remove('nope');
        void card.offsetWidth;
        card.classList.add('nope');
      }
      return;
    }
    if (e.target.closest('.perks-refund')) {
      refundAllPerks();
      render();
    }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay && !overlay.hidden) closeUpgrades();
  });
  return overlay;
}

function pips(level, max) {
  let h = '';
  for (let i = 0; i < max; i++) h += `<i class="${i < level ? 'on' : ''}"></i>`;
  return h;
}

function render(justBought) {
  const root = el();
  const levels = getPerkLevels();
  const avail = starsAvailable();
  const earned = starsEarned();
  const anyBought = Object.values(levels).some(v => v > 0);

  root.innerHTML = `
    <div class="perks-sheet">
      <header class="perks-head">
        <div>
          <h2 id="perksTitle">Upgrades</h2>
          <p>Permanent boosts for every world. Earn stars by clearing arenas.</p>
        </div>
        <button class="perks-close" type="button" aria-label="Close">×</button>
      </header>
      <div class="perks-wallet">
        <span class="perks-stars"><span class="perks-star-ic">${icon('star')}</span><b>${avail}</b> to spend</span>
        <span class="perks-earned">${earned} earned</span>
      </div>
      ${earned === 0 ? '<p class="perks-empty">Clear an arena to earn your first stars. Up to three per arena.</p>' : ''}
      <div class="perks-list">
        ${PERKS.map(p => {
          const lv = levels[p.id];
          const cost = nextCost(p.id);
          const maxed = cost == null;
          const can = !maxed && cost <= avail;
          const now = lv > 0 ? p.fmt(perkValue(p.id, levels)) : 'Not bought';
          const next = maxed ? '' : p.fmt(p.per * (lv + 1));
          return `
          <div class="perk-card ${maxed ? 'maxed' : ''} ${justBought === p.id ? 'bought' : ''}" data-perk="${p.id}">
            <span class="perk-icon">${icon(p.icon)}</span>
            <div class="perk-body">
              <div class="perk-name">${p.name}</div>
              <div class="perk-desc">${p.desc}</div>
              <div class="perk-pips" aria-label="Level ${lv} of ${p.max}">${pips(lv, p.max)}</div>
              <div class="perk-now ${lv > 0 ? '' : 'none'}">${now}${maxed ? '' : ` <span class="perk-next">→ ${next}</span>`}</div>
            </div>
            ${maxed
              ? '<span class="perk-max">MAX</span>'
              : `<button class="perk-buy ${can ? 'can' : ''}" type="button" data-perk="${p.id}" ${can ? '' : 'aria-disabled="true"'}>
                   <span class="perk-buy-ic">${icon('star')}</span>${cost}
                 </button>`}
          </div>`;
        }).join('')}
      </div>
      ${anyBought ? '<button class="perks-refund" type="button">Refund all stars</button>' : ''}
    </div>`;
  refreshUpgradesButton();
}

export function openUpgrades() {
  if (typeof document === 'undefined') return;
  lastFocus = document.activeElement;
  render();
  el().hidden = false;
  el().querySelector('.perks-close')?.focus();
}

export function closeUpgrades() {
  if (!overlay) return;
  overlay.hidden = true;
  refreshUpgradesButton();
  if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
}

/** The menu button shows how many stars are waiting to be spent. */
export function refreshUpgradesButton() {
  if (typeof document === 'undefined') return;
  const btn = document.getElementById('upgradesBtn');
  if (!btn) return;
  const avail = starsAvailable();
  const count = btn.querySelector('.upg-count');
  if (count) count.textContent = avail > 0 ? `${avail} to spend` : 'Boost every world';
  btn.classList.toggle('has-stars', avail > 0);
}

export function initUpgradesButton() {
  const btn = document.getElementById('upgradesBtn');
  if (!btn) return;
  btn.addEventListener('click', openUpgrades);
  refreshUpgradesButton();
}
