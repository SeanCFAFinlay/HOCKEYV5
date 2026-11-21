// Arena loading screen: shown the moment a map is picked, held while the 3D
// arena is built, then faded away once the first frame is on screen.
//
// Building the scene (board, crowd, props, towers) blocks the main thread for a
// moment, longer on a phone. Without a cover that showed up as the map list
// sliding off and the game popping in; now it is a themed card naming the arena
// with a real progress bar.

import { icon } from './icons.js';

const MIN_SHOW_MS = 1000;
const FADE_MS = 380;

const TIPS = [
  'Tap a placed tower to upgrade it, sell it or change who it targets.',
  'A boss turns up every fifth wave. Save a little cash for it.',
  'Slowing towers make every other tower around them hit harder.',
  'Towers on a corner cover two stretches of the path at once.',
  'Splash towers shine where the path bunches enemies together.',
  'Upgrading a tower is often better value than building a new one.',
  'Selling returns at least 60% of everything you spent on that tower.',
  'Stars from cleared arenas buy permanent Upgrades on the main menu.',
  'Abilities recharge on their own. Use them early and often.',
  'Flying enemies ignore walls and head straight for your base.',
  'Fast towers shred swarms. Snipers and boss killers handle the big ones.',
  'Switch a tower to "Strong" to make it focus the toughest enemy in range.'
];

const MODE_LABEL = { campaign: 'Campaign', endless: 'Endless', sandbox: 'Sandbox' };

let el = null;
let hideTimer = null;
let tipIndex = Math.floor(Math.random() * TIPS.length);

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function ensureEl() {
  if (el && el.isConnected) return el;
  el = document.createElement('div');
  el.id = 'arenaLoader';
  el.className = 'arena-loader';
  el.setAttribute('role', 'status');
  el.setAttribute('aria-live', 'polite');
  document.body.appendChild(el);
  return el;
}

/**
 * Show the loading card for a map. Returns a controller:
 *   step(text, pct) - move the bar and change the caption
 *   done()          - fill the bar, then fade out (never before MIN_SHOW_MS)
 */
export function showArenaLoader({ themeData, mapData, mapIndex = 0, mode = 'campaign' }) {
  if (typeof document === 'undefined' || !document.body) {
    return { step() {}, done() {} };
  }
  const root = ensureEl();
  clearTimeout(hideTimer);

  const color = themeData?.color || '#38bdf8';
  const boss = (themeData?.enemies || []).find(e => e.boss || e.role === 'BOSS' || e.id === 'e7');
  const towers = (themeData?.towers || []).slice(0, 8);
  const diff = Math.max(0, Math.min(5, mapData?.diff || 0));
  const pips = [1, 2, 3, 4, 5].map(n => `<i class="${n <= diff ? 'on' : ''}"></i>`).join('');
  const tip = TIPS[tipIndex++ % TIPS.length];

  root.style.setProperty('--al-c', color);
  root.innerHTML = `
    <div class="al-glow"></div>
    <div class="al-rings"><span></span><span></span><span></span></div>
    <div class="al-card">
      <div class="al-world"><span class="al-world-icon">${icon(themeData?.icon)}</span>${esc(themeData?.name)}</div>
      <div class="al-num">Arena ${String(mapIndex + 1).padStart(2, '0')}</div>
      <h2 class="al-map">${esc(mapData?.name)}</h2>
      ${mapData?.description ? `<p class="al-desc">${esc(mapData.description)}</p>` : ''}
      <div class="al-chips">
        <span>${mapData?.waves || 0} waves</span>
        <span class="al-diff" title="Difficulty ${diff} of 5">${pips}</span>
        <span>${MODE_LABEL[mode] || mode}</span>
      </div>
      <div class="al-roster">
        ${towers.map((t, i) => `<span class="al-tower" style="--tc:${esc(t.clr || color)};--i:${i}" title="${esc(t.nm)}">${icon(t.icon)}</span>`).join('')}
      </div>
      ${boss ? `<div class="al-boss">Boss <b>${esc(boss.nm)}</b></div>` : ''}
      <div class="al-bar"><i></i></div>
      <div class="al-step">Getting ready…</div>
    </div>
    <div class="al-tip"><b>Tip</b><span>${esc(tip)}</span></div>
  `;

  root.classList.remove('leaving');
  root.hidden = false;
  // Next frame, so the entrance transition runs from the hidden state.
  requestAnimationFrame(() => root.classList.add('show'));

  const shownAt = performance.now();
  const bar = root.querySelector('.al-bar i');
  const caption = root.querySelector('.al-step');
  let finished = false;

  const step = (text, pct) => {
    if (finished) return;
    if (caption && text) caption.textContent = text;
    if (bar && pct != null) bar.style.width = `${Math.max(0, Math.min(100, pct))}%`;
  };

  const done = () => {
    if (finished) return;
    step('Game on!', 100);
    finished = true;
    root.classList.add('ready');
    const wait = Math.max(260, MIN_SHOW_MS - (performance.now() - shownAt));
    hideTimer = setTimeout(() => {
      root.classList.add('leaving');
      root.classList.remove('show');
      hideTimer = setTimeout(() => { root.hidden = true; root.classList.remove('leaving', 'ready'); }, FADE_MS);
    }, wait);
  };

  return { step, done };
}

/** Drop the loader straight away (used when leaving a game mid-load). */
export function hideArenaLoader() {
  if (!el) return;
  clearTimeout(hideTimer);
  el.classList.remove('show', 'ready', 'leaving');
  el.hidden = true;
}
