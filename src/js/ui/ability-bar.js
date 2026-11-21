// The three ability buttons, with a cooldown ring on each, and the banner that
// shows while a strike is being aimed.

import { getState, setSelectedTower } from '../engine/state.js';
import { abilitiesForWorld } from '../config/abilities.js';
import {
  pressAbility, cancelTargeting, getCooldown, getCooldownMax, getTargeting, getRallyLeft,
  setAbilityListener, resetAbilities
} from '../systems/abilities.js';
import { icon } from './icons.js';
import { buzz } from './mobile.js';
import { clearPreview } from '../engine/input.js';
import { on, GameEvents } from '../engine/events.js';

let wired = false;

let barEl = null;
let aimEl = null;
let defs = [];
let lastAim = undefined;
const lastPaint = {};

function ensureEls() {
  const screen = document.getElementById('gameScreen');
  if (!screen) return false;
  if (!barEl || !barEl.isConnected) {
    barEl = document.createElement('div');
    barEl.className = 'ability-bar';
    barEl.id = 'abilityBar';
    barEl.setAttribute('role', 'toolbar');
    barEl.setAttribute('aria-label', 'Abilities');
    screen.appendChild(barEl);
    barEl.addEventListener('click', e => {
      const btn = e.target.closest('.ability-btn');
      if (!btn) return;
      const id = btn.dataset.ability;
      if (pressAbility(id)) {
        buzz(id === 'strike' ? 'tick' : 'upgrade');
        // Aiming a strike and holding a tower are two different "next tap"s.
        if (getTargeting() && getState().selectedTower) {
          setSelectedTower(null);
          clearPreview();
          import('./hud.js').then(({ renderTowers }) => renderTowers());
        }
      } else {
        btn.classList.remove('nope');
        void btn.offsetWidth;
        btn.classList.add('nope');
      }
    });
  }
  if (!aimEl || !aimEl.isConnected) {
    aimEl = document.createElement('div');
    aimEl.className = 'ability-aim';
    aimEl.id = 'abilityAim';
    aimEl.setAttribute('role', 'status');
    aimEl.hidden = true;
    screen.appendChild(aimEl);
    aimEl.addEventListener('click', e => {
      if (e.target.closest('.ability-aim-cancel')) cancelTargeting();
    });
  }
  return true;
}

/** Build the buttons for the world being played. Called when a match starts. */
export function initAbilityBar() {
  if (typeof document === 'undefined' || !ensureEls()) return;
  const state = getState();
  const themeId = state.theme || state.themeData?.id;
  if (!wired) {
    wired = true;
    // Picking a tower while a strike is being aimed puts the strike away.
    on(GameEvents.UI_TOWER_SELECT, ({ tower } = {}) => { if (tower) cancelTargeting(); });
  }
  defs = abilitiesForWorld(themeId);
  barEl.style.setProperty('--ab-c', state.themeData?.color || '#38bdf8');
  barEl.innerHTML = defs.map(d => `
    <button class="ability-btn ${d.id}" type="button" data-ability="${d.id}"
            aria-label="${d.name}: ${d.blurb}" title="${d.name} — ${d.blurb}">
      <span class="ab-ring"></span>
      <span class="ab-icon">${icon(d.icon)}</span>
      <span class="ab-time"></span>
    </button>`).join('');
  for (const k of Object.keys(lastPaint)) delete lastPaint[k];
  lastAim = undefined;
  resetAbilities();
  setAbilityListener(paint);
  barEl.hidden = false;
  paint();
}

export function hideAbilityBar() {
  if (barEl) barEl.hidden = true;
  if (aimEl) aimEl.hidden = true;
  cancelTargeting();
}

/** Repaint rings and labels. Cheap; called every frame from the loop. */
export function paint() {
  if (!barEl || barEl.hidden) return;
  const aiming = getTargeting();
  for (const d of defs) {
    const btn = barEl.querySelector(`.ability-btn.${d.id}`);
    if (!btn) continue;
    const left = getCooldown(d.id);
    const frac = left > 0 ? Math.min(1, left / getCooldownMax(d.id)) : 0;
    const key = `${Math.round(frac * 100)}|${Math.ceil(left)}|${aiming === d.id}|${d.id === 'rally' ? Math.ceil(getRallyLeft()) : ''}`;
    if (lastPaint[d.id] === key) continue;
    const wasCooling = lastPaint[d.id] && !lastPaint[d.id].startsWith('0|');
    lastPaint[d.id] = key;
    btn.style.setProperty('--cd', frac.toFixed(3));
    btn.classList.toggle('cooling', left > 0);
    btn.classList.toggle('aiming', aiming === d.id);
    btn.classList.toggle('active', d.id === 'rally' && getRallyLeft() > 0);
    btn.querySelector('.ab-time').textContent = left > 0 ? String(Math.ceil(left)) : '';
    if (left <= 0 && wasCooling) {
      btn.classList.remove('ready-pop');
      void btn.offsetWidth;
      btn.classList.add('ready-pop');
    }
  }
  if (aimEl && lastAim !== aiming) {
    lastAim = aiming;
    const d = defs.find(x => x.id === aiming);
    aimEl.hidden = !d;
    if (d) {
      aimEl.style.setProperty('--ab-c', getState().themeData?.color || '#38bdf8');
      aimEl.innerHTML = `<span class="ability-aim-icon">${icon(d.icon)}</span>
        <span class="ability-aim-text"><strong>${d.name}</strong><span>Tap the board where it should land</span></span>
        <button class="ability-aim-cancel" type="button" aria-label="Cancel">×</button>`;
    }
  }
}
