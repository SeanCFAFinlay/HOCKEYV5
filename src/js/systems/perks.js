// Permanent upgrades bought with stars ("Upgrades" on the main menu).
//
// Stars come from clearing arenas (systems/progression.js) and are never
// spent from the save itself: what's been bought is kept separately here, and
// stars available = stars earned - stars spent. Refunding is free.

import { getSaveData } from './storage.js';

const KEY = 'hockeyTD_perks';

// cost[i] is the price of level i+1; per is the effect of each level.
export const PERKS = [
  { id: 'cash',     name: 'War Chest',     icon: 'coin',      desc: 'More money at the start of every match',
    per: 50,   max: 5, cost: [1, 2, 3, 4, 5], fmt: v => `+$${v}` },
  { id: 'lives',    name: 'Thick Skin',    icon: 'heart',     desc: 'Extra lives in every match',
    per: 2,    max: 5, cost: [1, 2, 3, 4, 5], fmt: v => `+${v} lives` },
  { id: 'damage',   name: 'Hard Hitters',  icon: 'fist',      desc: 'All towers deal more damage',
    per: 0.04, max: 5, cost: [2, 3, 4, 5, 6], fmt: v => `+${Math.round(v * 100)}% damage` },
  { id: 'bounty',   name: 'Bounty Hunter', icon: 'trend',     desc: 'More money for every enemy defeated',
    per: 0.05, max: 4, cost: [2, 3, 4, 5],    fmt: v => `+${Math.round(v * 100)}% money` },
  { id: 'cooldown', name: 'Quick Charge',  icon: 'bolt',      desc: 'Abilities recharge faster',
    per: 0.08, max: 4, cost: [2, 3, 4, 5],    fmt: v => `-${Math.round(v * 100)}% recharge` },
  { id: 'refund',   name: 'Trade-in',      icon: 'cycle',     desc: 'Selling a tower returns more',
    per: 0.05, max: 3, cost: [1, 2, 3],       fmt: v => `${Math.round((0.6 + v) * 100)}% back` }
];

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch { return {}; }
}

function save(levels) {
  try { localStorage.setItem(KEY, JSON.stringify(levels)); } catch { /* storage blocked */ }
}

export function getPerkLevels() {
  const raw = load();
  const out = {};
  for (const p of PERKS) out[p.id] = Math.max(0, Math.min(p.max, raw[p.id] | 0));
  return out;
}

export function getPerkLevel(id) {
  return getPerkLevels()[id] || 0;
}

/** Stars earned across every world. */
export function starsEarned() {
  try {
    const prog = getSaveData().progression || {};
    let n = 0;
    for (const theme of Object.values(prog)) {
      for (const m of Object.values(theme || {})) n += m?.stars || 0;
    }
    return n;
  } catch { return 0; }
}

export function starsSpent(levels = getPerkLevels()) {
  let n = 0;
  for (const p of PERKS) for (let i = 0; i < levels[p.id]; i++) n += p.cost[i];
  return n;
}

export function starsAvailable() {
  return Math.max(0, starsEarned() - starsSpent());
}

/** Price of the next level, or null at max. */
export function nextCost(id) {
  const p = PERKS.find(x => x.id === id);
  const lv = getPerkLevel(id);
  return p && lv < p.max ? p.cost[lv] : null;
}

export function buyPerk(id) {
  const cost = nextCost(id);
  if (cost == null || cost > starsAvailable()) return false;
  const levels = getPerkLevels();
  levels[id] += 1;
  save(levels);
  return true;
}

export function refundAllPerks() {
  save({});
}

/** Current effect value of a perk (level x per-level). */
export function perkValue(id, levels = getPerkLevels()) {
  const p = PERKS.find(x => x.id === id);
  return p ? p.per * (levels[id] || 0) : 0;
}

/**
 * Bonuses for a match, read once when it starts and copied onto the game
 * state, so the systems that use them need no import of this module.
 */
export function matchBonuses() {
  const lv = getPerkLevels();
  return {
    cash: perkValue('cash', lv),
    lives: perkValue('lives', lv),
    perkDamage: 1 + perkValue('damage', lv),
    perkBounty: 1 + perkValue('bounty', lv),
    perkCooldown: 1 - perkValue('cooldown', lv),
    sellRate: 0.6 + perkValue('refund', lv)
  };
}
