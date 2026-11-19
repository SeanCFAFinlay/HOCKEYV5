// Build strip: the bar that appears above the dock while a tower is in hand.
//
// It answers the three things a player otherwise has to guess: which tower is
// selected, what the next tap or click will do, and why a spot is refused. On a
// touch screen it also carries a Build button, so placing no longer depends on
// knowing to tap the same tile twice; Cancel puts the tower away.

import { getState, setSelectedTower } from '../engine/state.js';
import { on, GameEvents } from '../engine/events.js';
import { setPreviewListener, confirmPreview, clearPreview } from '../engine/input.js';
import { icon } from './icons.js';

const ROLE_BLURB = {
  'ANTI-SWARM': 'Fast, cheap shots',
  SNIPER: 'Long range, hard hits',
  SPLASH: 'Area damage',
  CROWD_CONTROL: 'Slows enemies',
  CHOKEPOINT: 'Short range, heavy',
  CHAIN: 'Jumps between enemies',
  DOT: 'Sets enemies on fire',
  BOSS_KILLER: 'Huge single hits'
};

const REFUSALS = {
  money: 'Not enough money',
  blocked: 'Would block the path',
  occupied: "Can't build on this tile"
};

let els = null;
let preview = null;

function elements() {
  if (els) return els;
  const strip = document.getElementById('buildStrip');
  if (!strip) return null;
  els = {
    strip,
    icon: document.getElementById('buildIcon'),
    name: document.getElementById('buildName'),
    hint: document.getElementById('buildHint'),
    confirm: document.getElementById('buildConfirm'),
    cancel: document.getElementById('buildCancel')
  };
  return els;
}

function isTouchDevice() {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(hover: none)').matches;
}

function render() {
  const e = elements();
  if (!e) return;

  const state = getState();
  const td = state.selectedTower && state.themeData?.towers.find(t => t.id === state.selectedTower);
  if (!td || !state.running) {
    e.strip.hidden = true;
    return;
  }

  const touch = isTouchDevice();
  const refused = preview && !preview.valid ? REFUSALS[preview.reason] : null;
  let hint;
  if (refused) hint = refused;
  else if (preview && preview.touch) hint = 'Tap Build, or the tile again';
  else if (touch) hint = `${ROLE_BLURB[td.role] || 'Tower'} · tap a tile`;
  else hint = `${ROLE_BLURB[td.role] || 'Tower'} · click a tile · Esc cancels`;

  e.strip.style.setProperty('--c', td.clr);
  e.strip.classList.toggle('invalid', !!refused);
  e.icon.innerHTML = icon(td.icon);
  e.name.textContent = `${td.nm} · $${td.cost}`;
  e.hint.textContent = hint;
  e.confirm.hidden = !(preview && preview.touch && preview.valid);
  e.strip.hidden = false;
}

function cancel() {
  setSelectedTower(null);
  clearPreview();
  // hud.js owns the tower bar; imported lazily because it imports half the UI.
  import('./hud.js').then(({ renderTowers }) => renderTowers());
}

export function initBuildStrip() {
  const e = elements();
  if (!e) return;

  e.confirm.addEventListener('click', () => confirmPreview());
  e.cancel.addEventListener('click', cancel);

  setPreviewListener(info => {
    preview = info;
    render();
  });

  on(GameEvents.UI_TOWER_SELECT, () => {
    preview = null;
    render();
  });
  // Leaving a game (or starting one) must never strand the strip on screen.
  on(GameEvents.GAME_START, render);
  on(GameEvents.GAME_RESET, () => { preview = null; render(); });
  on(GameEvents.GAME_WIN, render);
  on(GameEvents.GAME_LOSE, render);
}
