// Tests for SC-4.5: Enhanced Wave Preview
// TDD: Red → Green → Refactor

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ── Minimal DOM stubs ──────────────────────────────────────────────────────

function makeClassList(initial = []) {
  const set = new Set(initial);
  return {
    _set: set,
    add(...c) { c.forEach(x => set.add(x)); },
    remove(...c) { c.forEach(x => set.delete(x)); },
    contains(c) { return set.has(c); },
    toggle(c, force) {
      const val = force !== undefined ? force : !set.has(c);
      val ? set.add(c) : set.delete(c);
    },
    [Symbol.iterator]() { return set[Symbol.iterator](); }
  };
}

function makeElement(tag = 'div', id = '') {
  const children = [];
  const el = {
    tag,
    id,
    textContent: '',
    innerHTML: '',
    style: { display: '', opacity: '' },
    dataset: {},
    classList: makeClassList(),
    children,
    _listeners: {},
    querySelector(sel) { return findInTree(this, sel); },
    querySelectorAll(sel) { return findAllInTree(this, sel); },
    appendChild(child) { children.push(child); return child; },
    removeChild(child) {
      const i = children.indexOf(child);
      if (i !== -1) children.splice(i, 1);
    },
    addEventListener(ev, fn) {
      this._listeners[ev] = this._listeners[ev] || [];
      this._listeners[ev].push(fn);
    },
    removeEventListener() {},
    get offsetWidth() { return 100; },
    getBoundingClientRect() { return { left: 0, top: 0, width: 100, height: 40 }; }
  };
  return el;
}

function matchesSelector(el, sel) {
  if (sel.startsWith('#')) return el.id === sel.slice(1);
  if (sel.startsWith('.')) {
    const classes = sel.split('.').filter(Boolean);
    return classes.every(c => el.classList.contains(c));
  }
  return el.tag === sel;
}

function findInTree(root, sel) {
  for (const child of root.children || []) {
    if (matchesSelector(child, sel)) return child;
    const found = findInTree(child, sel);
    if (found) return found;
  }
  return null;
}

function findAllInTree(root, sel) {
  const results = [];
  for (const child of root.children || []) {
    if (matchesSelector(child, sel)) results.push(child);
    results.push(...findAllInTree(child, sel));
  }
  return results;
}

// ── DOM reset ─────────────────────────────────────────────────────────────

let wavePreviewEl;
let wavePreviewHeaderEl;
let wavePreviewBodyEl;
let bodyEl;
let gameScreenEl;

function resetDOM() {
  wavePreviewEl = makeElement('div', 'wavePreview');
  wavePreviewEl.style.display = 'none';

  wavePreviewHeaderEl = makeElement('div', 'wavePreviewHeader');
  wavePreviewEl.appendChild(wavePreviewHeaderEl);

  wavePreviewBodyEl = makeElement('div', 'wavePreviewBody');
  wavePreviewEl.appendChild(wavePreviewBodyEl);

  gameScreenEl = makeElement('div', 'gameScreen');
  gameScreenEl.appendChild(wavePreviewEl);

  bodyEl = makeElement('body');
  bodyEl.appendChild(gameScreenEl);

  global.document = {
    getElementById: vi.fn(id => {
      const map = {
        wavePreview: wavePreviewEl,
        wavePreviewHeader: wavePreviewHeaderEl,
        wavePreviewBody: wavePreviewBodyEl,
        gameScreen: gameScreenEl
      };
      return map[id] || null;
    }),
    createElement: vi.fn(tag => makeElement(tag)),
    querySelector: vi.fn(sel => findInTree(bodyEl, sel)),
    querySelectorAll: vi.fn(sel => findAllInTree(bodyEl, sel)),
    body: bodyEl
  };

  global.window = global.window || {};
}

// ── State factory ─────────────────────────────────────────────────────────

const HOCKEY_ENEMIES_STUB = [
  { id: 'e1', nm: 'Puck', role: 'SWARM', hp: 50, spd: 2.4, threatTags: ['ground', 'swarm'], speedClass: 'fast' },
  { id: 'e4', nm: 'Heavy Puck', role: 'ARMORED', hp: 250, spd: 0.7, armor: 0.4, threatTags: ['ground', 'armor', 'tank'], speedClass: 'slow' },
  { id: 'e3', nm: 'Flying Puck', role: 'FLYING', hp: 45, spd: 2.8, flying: true, threatTags: ['air', 'flying'], speedClass: 'fast' },
  { id: 'e2', nm: 'Hot Puck', role: 'FIRE', hp: 70, spd: 2.0, fire: true, threatTags: ['ground', 'fire'], speedClass: 'normal' },
  { id: 'e7', nm: 'Boss Puck', role: 'BOSS', hp: 2500, spd: 0.35, armor: 0.35, boss: true, threatTags: ['ground', 'armor', 'boss'], speedClass: 'slow' }
];

function makeDefaultState(overrides = {}) {
  return {
    wave: 1,
    mapData: { waves: 20 },
    themeData: { enemies: HOCKEY_ENEMIES_STUB, towers: [] },
    theme: 'hockey',
    WAVES: [
      { e1: 5, e4: 2 },  // wave index 0 (next after wave 0 complete)
      { e3: 8, e1: 3 },  // wave index 1
      { e7: 1, e1: 4 },  // wave index 2 (boss wave)
    ],
    waveActive: false,
    running: true,
    money: 500,
    lives: 20,
    score: 0,
    kills: 0,
    enemies: [],
    spawnsPending: 0,
    autoWave: false,
    selectedTower: null,
    sellMode: false,
    ...overrides
  };
}

// ── Mocks ─────────────────────────────────────────────────────────────────

let mockState = makeDefaultState();

vi.mock('../js/engine/state.js', () => ({
  getState: vi.fn(() => mockState),
  subscribeToState: vi.fn(),
  setSelectedTower: vi.fn(),
  setSellMode: vi.fn(),
  setRunning: vi.fn()
}));

vi.mock('../js/engine/events.js', () => ({
  on: vi.fn(),
  emit: vi.fn(),
  GameEvents: {
    WAVE_START: 'WAVE_START',
    WAVE_END: 'WAVE_END',
    WAVE_COMPLETE: 'WAVE_COMPLETE',
    GAME_LOSE: 'GAME_LOSE',
    GAME_WIN: 'GAME_WIN',
    ENEMY_DEATH: 'ENEMY_DEATH'
  }
}));

vi.mock('../js/config/waves.js', () => ({
  getWaveThemeName: vi.fn((wave) => {
    if (wave % 5 === 0) return 'BOSS';
    if (wave % 3 === 0) return 'Heavy';
    return 'Swarm';
  }),
  getWavePreview: vi.fn((waveData, enemies) => {
    const byId = new Map(enemies.map(e => [e.id, e]));
    const entries = Object.entries(waveData || {}).map(([id, count]) => {
      const enemy = byId.get(id);
      if (!enemy) return null;
      return {
        id,
        count,
        name: enemy.nm,
        role: enemy.role,
        hp: enemy.hp,
        tags: enemy.threatTags || [],
        boss: !!enemy.boss,
        flying: !!enemy.flying,
        armor: !!enemy.armor,
        fire: !!enemy.fire,
        speedClass: enemy.speedClass || 'normal'
      };
    }).filter(Boolean);
    const pressureTags = [...new Set(entries.flatMap(e => e.tags))].slice(0, 5);
    return { entries, pressureTags };
  })
}));

vi.mock('../js/systems/particles.js', () => ({
  createDefeatEffect: vi.fn()
}));

vi.mock('../js/ui/upgrade-sheet.js', () => ({
  hideUpgrade: vi.fn()
}));

vi.mock('../js/ui/currency-fly.js', () => ({
  initCurrencyFly: vi.fn()
}));

vi.mock('../js/ui/tooltips.js', () => ({
  initTooltips: vi.fn(),
  attachTooltip: vi.fn(),
  hideTooltip: vi.fn()
}));

// ── Helper: import fresh hud module ──────────────────────────────────────

async function importHud() {
  const { buildEnhancedWavePreview, computeWaveDifficulty, getWaveTypeClass, getSpeedIndicator } =
    await import('../js/ui/hud.js');
  return { buildEnhancedWavePreview, computeWaveDifficulty, getWaveTypeClass, getSpeedIndicator };
}

// ── Tests: computeWaveDifficulty ──────────────────────────────────────────

describe('computeWaveDifficulty', () => {
  afterEach(() => vi.resetModules());

  it('returns 1 for very low total HP', async () => {
    const { computeWaveDifficulty } = await importHud();
    // 5 × 50hp = 250 total
    const entries = [{ count: 5, hp: 50 }];
    const rating = computeWaveDifficulty(entries, 500);
    expect(rating).toBeGreaterThanOrEqual(1);
    expect(rating).toBeLessThanOrEqual(5);
  });

  it('returns 5 for extremely high total HP', async () => {
    const { computeWaveDifficulty } = await importHud();
    // 1 boss × 2500hp = 2500 total, averageHpPerWave = 200
    const entries = [{ count: 1, hp: 2500 }];
    const rating = computeWaveDifficulty(entries, 200);
    expect(rating).toBe(5);
  });

  it('scales linearly with totalHp vs averageHpPerWave', async () => {
    const { computeWaveDifficulty } = await importHud();
    const average = 600;
    const entries = [{ count: 12, hp: 75 }]; // 900 hp total
    const rating = computeWaveDifficulty(entries, average);
    // 900 / (600 * 1.5) = 1 → ceil = 1 → min(5,1) = 1
    expect(rating).toBe(1);
  });

  it('clamps maximum at 5', async () => {
    const { computeWaveDifficulty } = await importHud();
    const entries = [{ count: 100, hp: 500 }]; // 50000 hp
    const rating = computeWaveDifficulty(entries, 300);
    expect(rating).toBe(5);
  });

  it('returns minimum 1 even for empty wave', async () => {
    const { computeWaveDifficulty } = await importHud();
    const rating = computeWaveDifficulty([], 300);
    expect(rating).toBeGreaterThanOrEqual(1);
  });
});

// ── Tests: getWaveTypeClass ───────────────────────────────────────────────

describe('getWaveTypeClass', () => {
  afterEach(() => vi.resetModules());

  it('returns "swarm" for swarm-tagged waves', async () => {
    const { getWaveTypeClass } = await importHud();
    const entries = [
      { tags: ['ground', 'swarm'], boss: false }
    ];
    expect(getWaveTypeClass(entries)).toBe('swarm');
  });

  it('returns "tank" for armor-heavy waves', async () => {
    const { getWaveTypeClass } = await importHud();
    const entries = [
      { tags: ['ground', 'armor', 'tank'], boss: false }
    ];
    expect(getWaveTypeClass(entries)).toBe('tank');
  });

  it('returns "air" for flying waves', async () => {
    const { getWaveTypeClass } = await importHud();
    const entries = [
      { tags: ['air', 'flying'], boss: false }
    ];
    expect(getWaveTypeClass(entries)).toBe('air');
  });

  it('returns "fire" for fire waves', async () => {
    const { getWaveTypeClass } = await importHud();
    const entries = [
      { tags: ['ground', 'fire'], boss: false }
    ];
    expect(getWaveTypeClass(entries)).toBe('fire');
  });

  it('returns "boss" for boss waves', async () => {
    const { getWaveTypeClass } = await importHud();
    const entries = [
      { tags: ['ground', 'armor', 'boss'], boss: true }
    ];
    expect(getWaveTypeClass(entries)).toBe('boss');
  });

  it('returns "mixed" for generic mixed waves', async () => {
    const { getWaveTypeClass } = await importHud();
    const entries = [
      { tags: ['ground'], boss: false },
      { tags: ['ground'], boss: false }
    ];
    expect(getWaveTypeClass(entries)).toBe('mixed');
  });
});

// ── Tests: getSpeedIndicator ──────────────────────────────────────────────

describe('getSpeedIndicator', () => {
  afterEach(() => vi.resetModules());

  it('returns the turtle icon key for slow speed class', async () => {
    const { getSpeedIndicator } = await importHud();
    expect(getSpeedIndicator('slow')).toBe('turtle');
  });

  it('returns the runner icon key for normal speed class', async () => {
    const { getSpeedIndicator } = await importHud();
    expect(getSpeedIndicator('normal')).toBe('runner');
  });

  it('returns the bolt icon key for fast speed class', async () => {
    const { getSpeedIndicator } = await importHud();
    expect(getSpeedIndicator('fast')).toBe('bolt');
  });

  it('returns the bolt icon key for very_fast speed class', async () => {
    const { getSpeedIndicator } = await importHud();
    expect(getSpeedIndicator('very_fast')).toBe('bolt');
  });

  it('returns runner as default', async () => {
    const { getSpeedIndicator } = await importHud();
    expect(getSpeedIndicator('unknown')).toBe('runner');
  });
});

// ── Tests: buildEnhancedWavePreview DOM output ────────────────────────────

describe('buildEnhancedWavePreview — panel visibility', () => {
  beforeEach(() => {
    resetDOM();
    mockState = makeDefaultState({ wave: 1 });
  });

  afterEach(() => vi.resetModules());

  it('makes wavePreview panel visible after wave completes', async () => {
    const { buildEnhancedWavePreview } = await importHud();
    buildEnhancedWavePreview();
    expect(wavePreviewEl.style.display).not.toBe('none');
  });

  it('hides panel when wave is active', async () => {
    mockState = makeDefaultState({ wave: 1, waveActive: true });
    const { buildEnhancedWavePreview } = await importHud();
    buildEnhancedWavePreview();
    expect(wavePreviewEl.style.display).toBe('none');
  });

  it('hides panel when no more waves', async () => {
    mockState = makeDefaultState({ wave: 20, mapData: { waves: 20 } });
    const { buildEnhancedWavePreview } = await importHud();
    buildEnhancedWavePreview();
    expect(wavePreviewEl.style.display).toBe('none');
  });
});

describe('buildEnhancedWavePreview — difficulty skulls', () => {
  beforeEach(() => {
    resetDOM();
    mockState = makeDefaultState({ wave: 1 });
  });

  afterEach(() => vi.resetModules());

  it('renders difficulty rating container', async () => {
    const { buildEnhancedWavePreview } = await importHud();
    buildEnhancedWavePreview();
    const header = wavePreviewHeaderEl;
    // Difficulty is now rendered as SVG skull icons rather than the 💀 emoji.
    expect(header.innerHTML).toContain('wp-skulls');
    expect(header.innerHTML).toContain('<svg');
  });

  it('renders between 1 and 5 skull icons', async () => {
    const { buildEnhancedWavePreview } = await importHud();
    buildEnhancedWavePreview();
    const skulls = (wavePreviewHeaderEl.innerHTML.match(/<svg/g) || []).length;
    expect(skulls).toBeGreaterThanOrEqual(1);
    expect(skulls).toBeLessThanOrEqual(5);
  });
});

describe('buildEnhancedWavePreview — enemy rows', () => {
  beforeEach(() => {
    resetDOM();
    mockState = makeDefaultState({ wave: 1 });
  });

  afterEach(() => vi.resetModules());

  it('renders one row per enemy type in next wave', async () => {
    const { buildEnhancedWavePreview } = await importHud();
    buildEnhancedWavePreview();
    // wave 1 (index 1 in WAVES) = { e3: 8, e1: 3 } → 2 enemy types
    // innerHTML is a string; count occurrences of wp-enemy-row class
    const rowCount = (wavePreviewBodyEl.innerHTML.match(/wp-enemy-row/g) || []).length;
    expect(rowCount).toBe(2);
  });

  it('shows count for each enemy type', async () => {
    const { buildEnhancedWavePreview } = await importHud();
    buildEnhancedWavePreview();
    const html = wavePreviewBodyEl.innerHTML;
    expect(html).toContain('×8');
  });

  it('shows speed indicator in each enemy row', async () => {
    const { buildEnhancedWavePreview } = await importHud();
    buildEnhancedWavePreview();
    const html = wavePreviewBodyEl.innerHTML;
    // Speed is now an SVG icon inside .wp-speed rather than the ⚡/🐢/🏃 emoji.
    expect(html).toContain('wp-speed');
    expect(html).toMatch(/wp-speed"><svg/);
  });
});

describe('buildEnhancedWavePreview — wave type border class', () => {
  beforeEach(() => {
    resetDOM();
    mockState = makeDefaultState({ wave: 0 });
  });

  afterEach(() => vi.resetModules());

  it('adds wave-type class to panel element', async () => {
    const { buildEnhancedWavePreview } = await importHud();
    buildEnhancedWavePreview();
    // wave 0, next wave index 0 = { e1: 5, e4: 2 }
    // e1=swarm, e4=armor/tank → mixed or tank
    const hasTypeClass = ['swarm', 'tank', 'air', 'fire', 'boss', 'mixed'].some(
      cls => wavePreviewEl.classList.contains(`wp-type-${cls}`)
    );
    expect(hasTypeClass).toBe(true);
  });

  it('adds boss class for boss waves', async () => {
    mockState = makeDefaultState({ wave: 2 }); // wave index 2 = { e7: 1, e1: 4 }
    const { buildEnhancedWavePreview } = await importHud();
    buildEnhancedWavePreview();
    expect(wavePreviewEl.classList.contains('wp-type-boss')).toBe(true);
  });
});

describe('buildEnhancedWavePreview — special ability badges', () => {
  beforeEach(() => {
    resetDOM();
    mockState = makeDefaultState({ wave: 0 });
  });

  afterEach(() => vi.resetModules());

  it('shows armor badge for armored enemies', async () => {
    // wave index 0 = { e1: 5, e4: 2 } → e4 has armor tag
    const { buildEnhancedWavePreview } = await importHud();
    buildEnhancedWavePreview();
    const html = wavePreviewBodyEl.innerHTML;
    // Armor is now the shield SVG icon in .wp-badges rather than the 🛡️ emoji.
    // Match the shield path's distinctive opening so it's the armor badge, not
    // just any icon.
    expect(html).toContain('wp-badges');
    expect(html).toContain('M12 3l7 2.5');
  });
});

describe('buildEnhancedWavePreview — HP bar', () => {
  beforeEach(() => {
    resetDOM();
    mockState = makeDefaultState({ wave: 0 });
  });

  afterEach(() => vi.resetModules());

  it('renders HP bar element for each enemy row', async () => {
    const { buildEnhancedWavePreview } = await importHud();
    buildEnhancedWavePreview();
    const html = wavePreviewBodyEl.innerHTML;
    expect(html).toContain('wp-hp-bar');
  });
});
