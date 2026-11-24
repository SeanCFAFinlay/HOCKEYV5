// First-match tutorial: a few coach marks that point at the real controls and
// move on as soon as the player does the thing (no "Next" button to mash).
//
// Shown once, at the start of the first match ever played (not in sandbox).
// "Skip" ends it for good; Settings > Data can show it again.

import { getState } from '../engine/state.js';
import { on, GameEvents } from '../engine/events.js';

const DONE_KEY = 'hockeyTD_tutorial';

const touch = () => typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;

// Each step: what to say, what to point at, and when it's done. `done` is
// polled; `after` is how long a step with nothing to do stays up.
const STEPS = [
  {
    title: 'Pick a tower',
    text: () => 'Your towers are down here. Tap one you can afford.',
    target: () => document.querySelector('#towerBar .tower-btn:not(.disabled):not(.unaffordable)') || document.querySelector('#towerBar .tower-btn'),
    done: s => !!s.selectedTower || s.towers.length > 0
  },
  {
    title: 'Place it',
    text: () => {
      const confirm = document.getElementById('buildConfirm');
      if (confirm && !confirm.hidden) return 'Happy with the spot? Tap Build. Enemies walk the open ice, so build beside their route.';
      return touch()
        ? 'Tap a tile on the board, or slide your finger to aim. Build beside the route from their gate to your goal.'
        : 'Click a tile on the board. Enemies come from the gate and head for your goal.';
    },
    target: () => {
      const confirm = document.getElementById('buildConfirm');
      return confirm && !confirm.hidden ? confirm : null;
    },
    done: s => s.towers.length > 0,
    // Lost the tower in hand (cancelled)? Go back a step.
    back: s => !s.selectedTower && s.towers.length === 0
  },
  {
    title: 'Start the wave',
    text: () => 'Tap Start when you are ready. You can keep building while they come.',
    target: () => document.getElementById('startBtn'),
    done: s => s.waveActive || s.wave > 0
  },
  {
    title: 'Guard your trophies',
    text: () => 'They are after the trophies on your goal. One that gets there grabs a trophy and runs back to its gate. Knock it out and the trophy floats home.',
    target: () => document.getElementById('livesStat'),
    done: () => false,
    after: 9000
  },
  {
    title: 'Build a maze',
    text: () => 'Enemies walk round your towers, never through. Line towers up to make them take the long way, past more of your guns.',
    target: () => null,
    done: () => false,
    after: 8000
  },
  {
    title: 'Abilities',
    text: () => 'These recharge on their own. The first one drops a strike where you tap; the others freeze every enemy or speed up your towers. Try one!',
    target: () => document.getElementById('abilityBar'),
    done: () => abilityUsed,
    after: 14000
  },
  {
    title: 'Upgrade',
    text: () => 'Tap a tower you built to upgrade it, sell it, or change what it aims at.',
    target: () => null,
    done: () => !!document.querySelector('#upgradeSheet.show'),
    after: 12000
  },
  {
    title: "You're ready!",
    text: () => 'Keep every trophy for 3 stars. Once a wave is all on the board, Next wave calls the next one early for bonus cash.',
    target: () => null,
    done: () => false,
    after: 6000
  }
];

let active = false;
let index = 0;
let stepStart = 0;
let timer = null;
let card = null;
let ring = null;
let abilityUsed = false;
let lastText = '';

export function tutorialDone() {
  try { return localStorage.getItem(DONE_KEY) === 'done'; } catch { return true; }
}

export function resetTutorial() {
  try { localStorage.removeItem(DONE_KEY); } catch { /* storage blocked */ }
}

function markDone() {
  try { localStorage.setItem(DONE_KEY, 'done'); } catch { /* storage blocked */ }
}

function build() {
  if (!card || !card.isConnected) {
    card = document.createElement('div');
    card.className = 'tut-card';
    card.id = 'tutorialCard';
    card.setAttribute('role', 'status');
    card.setAttribute('aria-live', 'polite');
    document.body.appendChild(card);
    card.addEventListener('click', e => {
      if (e.target.closest('.tut-skip')) { markDone(); stop(); }
      else if (e.target.closest('.tut-ok')) next();
    });
  }
  if (!ring || !ring.isConnected) {
    ring = document.createElement('div');
    ring.className = 'tut-ring';
    document.body.appendChild(ring);
  }
}

function paint() {
  const step = STEPS[index];
  const s = getState();
  const text = step.text(s);
  const last = index === STEPS.length - 1;
  const key = index + '|' + text;
  if (key !== lastText) {
    lastText = key;
    card.innerHTML = `
      <div class="tut-step">${index + 1} / ${STEPS.length}</div>
      <div class="tut-title">${step.title}</div>
      <div class="tut-text">${text}</div>
      <div class="tut-actions">
        ${last ? '' : '<button class="tut-skip" type="button">Skip tutorial</button>'}
        ${step.after || last ? `<button class="tut-ok" type="button">${last ? 'Play!' : 'Got it'}</button>` : ''}
      </div>`;
  }
  card.hidden = false;

  // Point at the target, and park the card where it doesn't cover it.
  const target = step.target(s);
  const r = target && target.getBoundingClientRect ? target.getBoundingClientRect() : null;
  const visible = r && r.width > 0 && r.height > 0;
  ring.hidden = !visible;
  const vh = window.innerHeight;
  if (visible) {
    const pad = 6;
    ring.style.left = `${r.left - pad}px`;
    ring.style.top = `${r.top - pad}px`;
    ring.style.width = `${r.width + pad * 2}px`;
    ring.style.height = `${r.height + pad * 2}px`;
  }
  // Card: above a target in the lower half, below one in the upper half,
  // otherwise in the band just under the HUD.
  const ch = card.offsetHeight || 140;
  let top;
  if (visible && r.top > vh / 2) top = Math.max(70, r.top - ch - 18);
  else if (visible) top = Math.min(vh - ch - 12, r.bottom + 18);
  else top = Math.min(vh * 0.3, 140);
  card.style.top = `${top}px`;
}

function tick() {
  if (!active) return;
  const s = getState();
  if (!s.running) return;
  const step = STEPS[index];
  if (step.back && step.back(s) && index > 0) {
    index -= 1;
    stepStart = performance.now();
  } else if (step.done(s) || (step.after && performance.now() - stepStart > step.after)) {
    next();
    return;
  }
  paint();
}

function next() {
  index += 1;
  stepStart = performance.now();
  if (index >= STEPS.length) {
    markDone();
    stop();
    return;
  }
  paint();
}

function start() {
  if (typeof document === 'undefined') return;
  build();
  active = true;
  index = 0;
  abilityUsed = false;
  lastText = '';
  stepStart = performance.now();
  clearInterval(timer);
  timer = setInterval(tick, 200);
  // Let the arena loader clear first.
  card.hidden = true;
  ring.hidden = true;
  setTimeout(() => { if (active) paint(); }, 1400);
}

function stop() {
  active = false;
  clearInterval(timer);
  timer = null;
  if (card) card.hidden = true;
  if (ring) ring.hidden = true;
}

export function initTutorial() {
  on(GameEvents.GAME_START, ({ mode } = {}) => {
    if (tutorialDone() || mode === 'sandbox') return;
    start();
  });
  on(GameEvents.GAME_RESET, stop);
  on(GameEvents.GAME_WIN, stop);
  on(GameEvents.GAME_LOSE, stop);
  document.addEventListener('click', e => {
    if (active && e.target.closest?.('.ability-btn')) abilityUsed = true;
  }, true);
}
