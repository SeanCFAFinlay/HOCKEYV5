// Tests for SC-3.5: Wave Announcements
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
    }
  };
}

function makeElement(tag = 'div', id = '') {
  const children = [];
  const el = {
    tag,
    id,
    textContent: '',
    innerHTML: '',
    style: {},
    dataset: {},
    classList: makeClassList(),
    children,
    _listeners: {},
    querySelector(sel) {
      return findInTree(this, sel);
    },
    querySelectorAll(sel) {
      return findAllInTree(this, sel);
    },
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
  // Support .class, #id, tagname, and compound like .a.b
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

// ── Global document/window stubs ──────────────────────────────────────────

let gameScreen;
let bodyEl;

function resetDOM() {
  gameScreen = makeElement('div', 'gameScreen');
  gameScreen.classList.add('screen', 'active');

  bodyEl = makeElement('body');
  bodyEl.appendChild(gameScreen);

  global.document = {
    getElementById: vi.fn(id => {
      if (id === 'gameScreen') return gameScreen;
      return null;
    }),
    createElement: vi.fn(tag => makeElement(tag)),
    querySelector: vi.fn(sel => findInTree(bodyEl, sel)),
    querySelectorAll: vi.fn(sel => findAllInTree(bodyEl, sel)),
    body: bodyEl
  };

  global.window = global.window || {};
}

// ── Mocks ─────────────────────────────────────────────────────────────────

vi.mock('../js/engine/state.js', () => ({
  getState: vi.fn(() => ({
    wave: 1,
    mapData: { waves: 20 },
    themeData: { enemies: [], towers: [] },
    waveActive: false,
    running: true,
    money: 500,
    lives: 20,
    score: 0,
    kills: 0,
    enemies: [],
    spawnsPending: 0,
    gameSpeed: 1,
    autoWave: false,
    selectedTower: null,
    sellMode: false
  })),
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
  getWavePreview: vi.fn(() => ({ entries: [], pressureTags: [] }))
}));

vi.mock('../js/systems/particles.js', () => ({
  createDefeatEffect: vi.fn()
}));

vi.mock('../js/ui/upgrade-sheet.js', () => ({
  hideUpgrade: vi.fn()
}));

// ── Import module under test ──────────────────────────────────────────────

// We need to test showWaveAnnouncement in isolation.
// Since hud.js has side effects on import (subscribes to events),
// we test by directly calling the exported function.

describe('showWaveAnnouncement — container creation', () => {
  beforeEach(() => {
    resetDOM();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetModules();
  });

  it('creates announcement container div', async () => {
    const { showWaveAnnouncement } = await import('../js/ui/hud.js');
    showWaveAnnouncement(1, 'Swarm', false);

    const container = gameScreen.querySelector('.wave-announce');
    expect(container).not.toBeNull();
  });

  it('appends container inside gameScreen', async () => {
    const { showWaveAnnouncement } = await import('../js/ui/hud.js');
    showWaveAnnouncement(1, 'Swarm', false);

    const container = gameScreen.querySelector('.wave-announce');
    expect(gameScreen.children).toContain(container);
  });

  it('creates wave-announce-number child element', async () => {
    const { showWaveAnnouncement } = await import('../js/ui/hud.js');
    showWaveAnnouncement(1, 'Swarm', false);

    const container = gameScreen.querySelector('.wave-announce');
    const numEl = container.querySelector('.wave-announce-number');
    expect(numEl).not.toBeNull();
  });

  it('creates wave-announce-theme child element', async () => {
    const { showWaveAnnouncement } = await import('../js/ui/hud.js');
    showWaveAnnouncement(1, 'Swarm', false);

    const container = gameScreen.querySelector('.wave-announce');
    const themeEl = container.querySelector('.wave-announce-theme');
    expect(themeEl).not.toBeNull();
  });
});

describe('showWaveAnnouncement — text content', () => {
  beforeEach(() => {
    resetDOM();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetModules();
  });

  it('displays correct wave number', async () => {
    const { showWaveAnnouncement } = await import('../js/ui/hud.js');
    showWaveAnnouncement(3, 'Heavy', false);

    const container = gameScreen.querySelector('.wave-announce');
    const numEl = container.querySelector('.wave-announce-number');
    expect(numEl.textContent).toContain('3');
  });

  it('displays theme name in theme element', async () => {
    const { showWaveAnnouncement } = await import('../js/ui/hud.js');
    showWaveAnnouncement(2, 'Swarm', false);

    const container = gameScreen.querySelector('.wave-announce');
    const themeEl = container.querySelector('.wave-announce-theme');
    expect(themeEl.textContent).toBe('Swarm');
  });

  it('includes WARNING text for boss waves', async () => {
    const { showWaveAnnouncement } = await import('../js/ui/hud.js');
    showWaveAnnouncement(5, 'BOSS', true);

    const container = gameScreen.querySelector('.wave-announce');
    const numEl = container.querySelector('.wave-announce-number');
    expect(numEl.textContent).toContain('WARNING');
  });

  it('does not include WARNING text for normal waves', async () => {
    const { showWaveAnnouncement } = await import('../js/ui/hud.js');
    showWaveAnnouncement(2, 'Swarm', false);

    const container = gameScreen.querySelector('.wave-announce');
    const numEl = container.querySelector('.wave-announce-number');
    expect(numEl.textContent).not.toContain('WARNING');
  });
});

describe('showWaveAnnouncement — CSS classes', () => {
  beforeEach(() => {
    resetDOM();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetModules();
  });

  it('adds active class to trigger animation', async () => {
    const { showWaveAnnouncement } = await import('../js/ui/hud.js');
    showWaveAnnouncement(1, 'Swarm', false);

    const container = gameScreen.querySelector('.wave-announce');
    expect(container.classList.contains('active')).toBe(true);
  });

  it('adds boss class for boss waves', async () => {
    const { showWaveAnnouncement } = await import('../js/ui/hud.js');
    showWaveAnnouncement(5, 'BOSS', true);

    const container = gameScreen.querySelector('.wave-announce');
    expect(container.classList.contains('boss')).toBe(true);
  });

  it('does not add boss class for normal waves', async () => {
    const { showWaveAnnouncement } = await import('../js/ui/hud.js');
    showWaveAnnouncement(2, 'Swarm', false);

    const container = gameScreen.querySelector('.wave-announce');
    expect(container.classList.contains('boss')).toBe(false);
  });

  it('applies theme class to theme element for swarm', async () => {
    const { showWaveAnnouncement } = await import('../js/ui/hud.js');
    showWaveAnnouncement(1, 'Swarm', false);

    const container = gameScreen.querySelector('.wave-announce');
    const themeEl = container.querySelector('.wave-announce-theme');
    expect(themeEl.classList.contains('swarm')).toBe(true);
  });

  it('applies theme class to theme element for heavy', async () => {
    const { showWaveAnnouncement } = await import('../js/ui/hud.js');
    showWaveAnnouncement(3, 'Heavy', false);

    const container = gameScreen.querySelector('.wave-announce');
    const themeEl = container.querySelector('.wave-announce-theme');
    expect(themeEl.classList.contains('heavy')).toBe(true);
  });
});

describe('showWaveAnnouncement — animation lifecycle', () => {
  beforeEach(() => {
    resetDOM();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetModules();
  });

  it('removes active class after 2500ms', async () => {
    const { showWaveAnnouncement } = await import('../js/ui/hud.js');
    showWaveAnnouncement(1, 'Swarm', false);

    const container = gameScreen.querySelector('.wave-announce');
    expect(container.classList.contains('active')).toBe(true);

    vi.advanceTimersByTime(2600);
    expect(container.classList.contains('active')).toBe(false);
  });

  it('reuses existing container on repeated calls', async () => {
    const { showWaveAnnouncement } = await import('../js/ui/hud.js');
    showWaveAnnouncement(1, 'Swarm', false);
    showWaveAnnouncement(2, 'Heavy', false);

    // gameScreen should have exactly one .wave-announce child
    const containers = gameScreen.children.filter(
      c => c.classList.contains('wave-announce')
    );
    expect(containers.length).toBe(1);
  });

  it('updates wave number text on second call', async () => {
    const { showWaveAnnouncement } = await import('../js/ui/hud.js');
    showWaveAnnouncement(1, 'Swarm', false);
    // Call again with new wave — reuses same container, updates text
    showWaveAnnouncement(4, 'Heavy', false);

    const container = gameScreen.querySelector('.wave-announce');
    const numEl = container.querySelector('.wave-announce-number');
    expect(numEl.textContent).toContain('4');
  });
});
