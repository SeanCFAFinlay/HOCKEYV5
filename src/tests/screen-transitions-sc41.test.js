// SC-4.1: Animated Screen Transitions Tests
// TDD Red phase: describe desired behavior for screen transition animations

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// ── Minimal DOM stubs ──────────────────────────────────────────────────────

function makeClassList(initial = []) {
  const set = new Set(initial);
  return {
    _set: set,
    add(...classes) { classes.forEach(c => set.add(c)); },
    remove(...classes) { classes.forEach(c => set.delete(c)); },
    contains(c) { return set.has(c); },
    toggle(c, force) {
      const val = force !== undefined ? force : !set.has(c);
      val ? set.add(c) : set.delete(c);
    }
  };
}

function makeElement(id, classes = []) {
  const el = {
    id,
    style: {},
    classList: makeClassList(classes),
    _listeners: {},
    addEventListener(ev, fn) {
      this._listeners[ev] = this._listeners[ev] || [];
      this._listeners[ev].push(fn);
    },
    removeEventListener(ev, fn) {
      if (this._listeners[ev]) {
        this._listeners[ev] = this._listeners[ev].filter(f => f !== fn);
      }
    },
    dispatchEvent(ev) {
      const handlers = this._listeners[ev.type] || [];
      handlers.forEach(fn => fn(ev));
    }
  };
  return el;
}

function makeEvent(type) {
  return { type };
}

// ── DOM environment setup ──────────────────────────────────────────────────

let elements;

function setupDOM() {
  elements = {
    menuScreen: makeElement('menuScreen', ['screen', 'active']),
    mapScreen:  makeElement('mapScreen',  ['screen']),
    gameScreen: makeElement('gameScreen', ['screen']),
    winModal:   makeElement('winModal',   ['modal']),
    loseModal:  makeElement('loseModal',  ['modal']),
  };

  globalThis.document = {
    getElementById(id) { return elements[id] || null; },
    querySelectorAll(sel) {
      if (sel === '.screen') {
        return Object.values(elements).filter(el =>
          el.classList.contains('screen')
        );
      }
      return [];
    }
  };
}

function teardownDOM() {
  delete globalThis.document;
}

// ── Helpers ────────────────────────────────────────────────────────────────

async function importTransitions() {
  vi.resetModules();
  return import('../js/ui/transitions.js');
}

// ── Exports ────────────────────────────────────────────────────────────────

describe('SC-4.1 — transitions module exports', () => {
  beforeEach(setupDOM);
  afterEach(teardownDOM);

  it('exports showScreenAnimated as a function', async () => {
    const mod = await importTransitions();
    expect(typeof mod.showScreenAnimated).toBe('function');
  });

  it('exports isTransitioning as a function', async () => {
    const mod = await importTransitions();
    expect(typeof mod.isTransitioning).toBe('function');
  });

  it('exports cancelTransition as a function', async () => {
    const mod = await importTransitions();
    expect(typeof mod.cancelTransition).toBe('function');
  });

  it('exports showResultsModal as a function', async () => {
    const mod = await importTransitions();
    expect(typeof mod.showResultsModal).toBe('function');
  });
});

// ── showScreenAnimated — basic switching ────────────────────────────────────

describe('SC-4.1 — showScreenAnimated basic behavior', () => {
  beforeEach(setupDOM);
  afterEach(() => { vi.useRealTimers(); teardownDOM(); });

  it('activates the target screen after transition', async () => {
    vi.useFakeTimers();
    const mod = await importTransitions();

    mod.showScreenAnimated('mapScreen');
    vi.advanceTimersByTime(700);

    expect(elements.mapScreen.classList.contains('active')).toBe(true);
  });

  it('removes active class from current screen after transition', async () => {
    vi.useFakeTimers();
    const mod = await importTransitions();

    mod.showScreenAnimated('mapScreen');
    vi.advanceTimersByTime(700);

    expect(elements.menuScreen.classList.contains('active')).toBe(false);
  });

  it('works when no screen is currently active', async () => {
    elements.menuScreen.classList.remove('active');
    vi.useFakeTimers();
    const mod = await importTransitions();

    expect(() => mod.showScreenAnimated('menuScreen')).not.toThrow();
    vi.advanceTimersByTime(700);
    expect(elements.menuScreen.classList.contains('active')).toBe(true);
  });

  it('does not throw when target screen does not exist', async () => {
    const mod = await importTransitions();
    expect(() => mod.showScreenAnimated('nonExistentScreen')).not.toThrow();
  });
});

// ── Transition classes — Menu → Map ────────────────────────────────────────

describe('SC-4.1 — Menu→Map slide transition classes', () => {
  beforeEach(setupDOM);
  afterEach(teardownDOM);

  it('adds screen-exit-left to current screen when transitioning menu→map', async () => {
    const mod = await importTransitions();
    mod.showScreenAnimated('mapScreen');

    expect(elements.menuScreen.classList.contains('screen-exit-left')).toBe(true);
  });

  it('adds screen-enter-right to target screen when transitioning menu→map', async () => {
    const mod = await importTransitions();
    mod.showScreenAnimated('mapScreen');

    expect(elements.mapScreen.classList.contains('screen-enter-right')).toBe(true);
  });
});

// ── Transition classes — Map → Game ────────────────────────────────────────

describe('SC-4.1 — Map→Game zoom-fade transition classes', () => {
  beforeEach(() => {
    setupDOM();
    elements.menuScreen.classList.remove('active');
    elements.mapScreen.classList.add('active');
  });
  afterEach(teardownDOM);

  it('adds screen-zoom-out to mapScreen when transitioning map→game', async () => {
    const mod = await importTransitions();
    mod.showScreenAnimated('gameScreen');

    expect(elements.mapScreen.classList.contains('screen-zoom-out')).toBe(true);
  });

  it('adds screen-fade-in to gameScreen when transitioning map→game', async () => {
    const mod = await importTransitions();
    mod.showScreenAnimated('gameScreen');

    expect(elements.gameScreen.classList.contains('screen-fade-in')).toBe(true);
  });
});

// ── showResultsModal — Game → Results ──────────────────────────────────────

describe('SC-4.1 — showResultsModal blur+modal transition', () => {
  beforeEach(() => {
    setupDOM();
    elements.menuScreen.classList.remove('active');
    elements.gameScreen.classList.add('active');
  });
  afterEach(teardownDOM);

  it('adds screen-blur to gameScreen when showing results modal', async () => {
    const mod = await importTransitions();
    mod.showResultsModal('winModal');

    expect(elements.gameScreen.classList.contains('screen-blur')).toBe(true);
  });

  it('adds show class to the target modal', async () => {
    const mod = await importTransitions();
    mod.showResultsModal('winModal');

    expect(elements.winModal.classList.contains('show')).toBe(true);
  });

  it('adds modal-slide-up class to the target modal', async () => {
    const mod = await importTransitions();
    mod.showResultsModal('winModal');

    expect(elements.winModal.classList.contains('modal-slide-up')).toBe(true);
  });

  it('does not throw when modal element does not exist', async () => {
    const mod = await importTransitions();
    expect(() => mod.showResultsModal('nonExistentModal')).not.toThrow();
  });
});

// ── transitioning flag ──────────────────────────────────────────────────────

describe('SC-4.1 — transitioning flag prevents double-transitions', () => {
  beforeEach(setupDOM);
  afterEach(() => { vi.useRealTimers(); teardownDOM(); });

  it('isTransitioning returns false initially', async () => {
    const mod = await importTransitions();
    expect(mod.isTransitioning()).toBe(false);
  });

  it('isTransitioning returns true while a transition is in progress', async () => {
    vi.useFakeTimers();
    const mod = await importTransitions();

    mod.showScreenAnimated('mapScreen');
    expect(mod.isTransitioning()).toBe(true);

    vi.advanceTimersByTime(700);
  });

  it('isTransitioning returns false after transition completes', async () => {
    vi.useFakeTimers();
    const mod = await importTransitions();

    mod.showScreenAnimated('mapScreen');
    vi.advanceTimersByTime(700);

    expect(mod.isTransitioning()).toBe(false);
  });

  it('second showScreenAnimated call during transition is ignored', async () => {
    vi.useFakeTimers();
    const mod = await importTransitions();

    mod.showScreenAnimated('mapScreen');
    mod.showScreenAnimated('gameScreen'); // should be ignored

    vi.advanceTimersByTime(700);

    expect(elements.mapScreen.classList.contains('active')).toBe(true);
    expect(elements.gameScreen.classList.contains('active')).toBe(false);
  });
});

// ── cancelTransition ────────────────────────────────────────────────────────

describe('SC-4.1 — cancelTransition', () => {
  beforeEach(setupDOM);
  afterEach(() => { vi.useRealTimers(); teardownDOM(); });

  it('cancelTransition does not throw when no transition is in progress', async () => {
    const mod = await importTransitions();
    expect(() => mod.cancelTransition()).not.toThrow();
  });

  it('cancelTransition resets transitioning flag', async () => {
    vi.useFakeTimers();
    const mod = await importTransitions();

    mod.showScreenAnimated('mapScreen');
    expect(mod.isTransitioning()).toBe(true);

    mod.cancelTransition();
    expect(mod.isTransitioning()).toBe(false);
  });

  it('after cancelTransition a new transition can start', async () => {
    vi.useFakeTimers();
    const mod = await importTransitions();

    mod.showScreenAnimated('mapScreen');
    mod.cancelTransition();

    mod.showScreenAnimated('gameScreen');
    expect(mod.isTransitioning()).toBe(true);

    vi.advanceTimersByTime(700);
  });
});

// ── Animation classes cleaned up after transition ───────────────────────────

describe('SC-4.1 — animation classes cleaned up after transition', () => {
  beforeEach(setupDOM);
  afterEach(() => { vi.useRealTimers(); teardownDOM(); });

  it('screen-exit-left is removed from old screen after transition', async () => {
    vi.useFakeTimers();
    const mod = await importTransitions();

    mod.showScreenAnimated('mapScreen');
    vi.advanceTimersByTime(700);

    expect(elements.menuScreen.classList.contains('screen-exit-left')).toBe(false);
  });

  it('screen-enter-right is removed from new screen after transition', async () => {
    vi.useFakeTimers();
    const mod = await importTransitions();

    mod.showScreenAnimated('mapScreen');
    vi.advanceTimersByTime(700);

    expect(elements.mapScreen.classList.contains('screen-enter-right')).toBe(false);
  });

  it('screen-zoom-out is removed from old screen after map→game transition', async () => {
    elements.menuScreen.classList.remove('active');
    elements.mapScreen.classList.add('active');
    vi.useFakeTimers();
    const mod = await importTransitions();

    mod.showScreenAnimated('gameScreen');
    vi.advanceTimersByTime(700);

    expect(elements.mapScreen.classList.contains('screen-zoom-out')).toBe(false);
  });

  it('screen-fade-in is removed from new screen after map→game transition', async () => {
    elements.menuScreen.classList.remove('active');
    elements.mapScreen.classList.add('active');
    vi.useFakeTimers();
    const mod = await importTransitions();

    mod.showScreenAnimated('gameScreen');
    vi.advanceTimersByTime(700);

    expect(elements.gameScreen.classList.contains('screen-fade-in')).toBe(false);
  });
});
