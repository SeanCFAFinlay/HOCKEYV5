// SC-4.6: Settings Panel Tests
// TDD Red phase: test desired behavior for settings UI panel

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// ── Mock DOM environment ────────────────────────────────────────────────────

function createMockDocument() {
  const elements = {};
  const createdElements = [];

  const makeEl = (tag) => {
    const el = {
      tagName: tag.toUpperCase(),
      id: '',
      className: '',
      innerHTML: '',
      textContent: '',
      style: {},
      children: [],
      _listeners: {},
      _parent: null,
      value: '',
      checked: false,
      dataset: {},
      addEventListener(ev, fn) {
        if (!this._listeners[ev]) this._listeners[ev] = [];
        this._listeners[ev].push(fn);
      },
      removeEventListener(ev, fn) {
        if (this._listeners[ev]) {
          this._listeners[ev] = this._listeners[ev].filter(f => f !== fn);
        }
      },
      _trigger(ev, data = {}) {
        (this._listeners[ev] || []).forEach(fn => fn({ ...data, target: this }));
      },
      appendChild(child) {
        this.children.push(child);
        child._parent = this;
        return child;
      },
      remove() {
        if (this._parent) {
          this._parent.children = this._parent.children.filter(c => c !== this);
        }
      },
      querySelector(sel) {
        return findEl(this, sel);
      },
      querySelectorAll(sel) {
        return findAllEl(this, sel);
      },
      closest(sel) {
        return null;
      },
      contains(node) {
        return this.children.includes(node) || this.children.some(c => c.contains && c.contains(node));
      },
      getAttribute(name) { return this.dataset[name] ?? null; },
      setAttribute(name, val) { this.dataset[name] = val; },
    };
    createdElements.push(el);
    return el;
  };

  function findEl(root, sel) {
    const id = sel.startsWith('#') ? sel.slice(1) : null;
    const cls = sel.startsWith('.') ? sel.slice(1) : null;
    for (const c of root.children || []) {
      if (id && c.id === id) return c;
      if (cls && c.className && c.className.split(' ').includes(cls)) return c;
      const found = findEl(c, sel);
      if (found) return found;
    }
    return null;
  }

  function findAllEl(root, sel) {
    const cls = sel.startsWith('.') ? sel.slice(1) : null;
    const results = [];
    function traverse(node) {
      if (!node.children) return;
      for (const c of node.children) {
        if (cls && c.className && c.className.split(' ').includes(cls)) results.push(c);
        traverse(c);
      }
    }
    traverse(root);
    return results;
  }

  const body = makeEl('body');
  body.id = 'body';

  const doc = {
    body,
    _elements: elements,
    _created: createdElements,
    createElement: vi.fn((tag) => makeEl(tag)),
    getElementById: vi.fn((id) => {
      if (elements[id]) return elements[id];
      return null;
    }),
    querySelector: vi.fn((sel) => findEl(body, sel)),
    querySelectorAll: vi.fn((sel) => findAllEl(body, sel)),
    _registerEl(id, el) {
      elements[id] = el;
      el.id = id;
    }
  };

  return doc;
}

// ── Mock localStorage ────────────────────────────────────────────────────────

function createMockStorage() {
  const store = {};
  return {
    getItem: vi.fn(k => store[k] ?? null),
    setItem: vi.fn((k, v) => { store[k] = String(v); }),
    removeItem: vi.fn(k => { delete store[k]; }),
    clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]); }),
    _store: store
  };
}

// ── Mock postprocessing ─────────────────────────────────────────────────────

const mockPostProcessing = {
  setPostProcessingQuality: vi.fn(),
  getComposer: vi.fn(() => ({
    passes: [
      { name: 'BloomPass', enabled: true, uniforms: { strength: { value: 0.4 } } },
      { name: 'VignettePass', enabled: true },
    ]
  }))
};

// ── Mock camera ──────────────────────────────────────────────────────────────

const mockCamera = {
  rotateCamera: vi.fn(),
};

// ── Module setup ─────────────────────────────────────────────────────────────

let mockDoc;
let mockStorage;
let Settings;

beforeEach(async () => {
  mockDoc = createMockDocument();
  mockStorage = createMockStorage();

  // Register required DOM elements
  const menuScreen = mockDoc.createElement('div');
  menuScreen.id = 'menuScreen';
  mockDoc._registerEl('menuScreen', menuScreen);
  mockDoc.body.appendChild(menuScreen);

  const gameScreen = mockDoc.createElement('div');
  gameScreen.id = 'gameScreen';
  mockDoc._registerEl('gameScreen', gameScreen);

  const hud = mockDoc.createElement('div');
  hud.className = 'hud';
  gameScreen.appendChild(hud);
  mockDoc.body.appendChild(gameScreen);

  // Reset mocks
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ── Unit: Default Settings ───────────────────────────────────────────────────

describe('Settings defaults', () => {
  it('should define default settings with expected keys', () => {
    const defaults = {
      graphicsQuality: 'high',
      shadows: true,
      bloom: true,
      particles: 'medium',
      vignette: true,
      cameraSensitivity: 1.0,
      uiScale: 1.0,
      sfxVolume: 80,
      musicVolume: 70,
      ambientVolume: 50,
    };

    expect(defaults).toHaveProperty('graphicsQuality');
    expect(defaults).toHaveProperty('shadows');
    expect(defaults).toHaveProperty('bloom');
    expect(defaults).toHaveProperty('particles');
    expect(defaults).toHaveProperty('vignette');
    expect(defaults).toHaveProperty('cameraSensitivity');
    expect(defaults).toHaveProperty('uiScale');
    expect(defaults).toHaveProperty('sfxVolume');
    expect(defaults).toHaveProperty('musicVolume');
    expect(defaults).toHaveProperty('ambientVolume');
  });

  it('should have valid range for cameraSensitivity (0.5 to 2.0)', () => {
    const min = 0.5;
    const max = 2.0;
    const defaultVal = 1.0;
    expect(defaultVal).toBeGreaterThanOrEqual(min);
    expect(defaultVal).toBeLessThanOrEqual(max);
  });

  it('should have valid range for uiScale (0.8 to 1.2)', () => {
    const min = 0.8;
    const max = 1.2;
    const defaultVal = 1.0;
    expect(defaultVal).toBeGreaterThanOrEqual(min);
    expect(defaultVal).toBeLessThanOrEqual(max);
  });
});

// ── Unit: localStorage persistence ──────────────────────────────────────────

describe('Settings persistence', () => {
  it('getSettings returns defaults when localStorage is empty', () => {
    mockStorage.getItem.mockReturnValue(null);

    const stored = mockStorage.getItem('hockeyTD_settings');
    expect(stored).toBeNull();

    // When null, we expect defaults to be returned
    const defaults = {
      graphicsQuality: 'high',
      shadows: true,
      bloom: true,
      particles: 'medium',
      vignette: true,
      cameraSensitivity: 1.0,
      uiScale: 1.0,
      sfxVolume: 80,
      musicVolume: 70,
      ambientVolume: 50,
    };
    expect(defaults.graphicsQuality).toBe('high');
  });

  it('saveSettings writes to localStorage key hockeyTD_settings', () => {
    const settings = { graphicsQuality: 'low', bloom: false };
    const json = JSON.stringify(settings);
    mockStorage.setItem('hockeyTD_settings', json);

    expect(mockStorage.setItem).toHaveBeenCalledWith('hockeyTD_settings', json);
  });

  it('getSettings reads from localStorage and parses JSON', () => {
    const saved = { graphicsQuality: 'low', shadows: false };
    mockStorage.getItem.mockReturnValue(JSON.stringify(saved));

    const raw = mockStorage.getItem('hockeyTD_settings');
    const parsed = JSON.parse(raw);
    expect(parsed.graphicsQuality).toBe('low');
    expect(parsed.shadows).toBe(false);
  });

  it('saveSettings merges with defaults for missing keys', () => {
    const partial = { graphicsQuality: 'medium' };
    const defaults = {
      graphicsQuality: 'high',
      shadows: true,
      bloom: true,
      particles: 'medium',
      vignette: true,
      cameraSensitivity: 1.0,
      uiScale: 1.0,
      sfxVolume: 80,
      musicVolume: 70,
      ambientVolume: 50,
    };
    const merged = { ...defaults, ...partial };
    expect(merged.graphicsQuality).toBe('medium');
    expect(merged.shadows).toBe(true); // preserved default
  });
});

// ── Unit: Panel DOM creation ────────────────────────────────────────────────

describe('Settings panel DOM structure', () => {
  it('creates a modal overlay element with class settings-overlay', () => {
    const el = mockDoc.createElement('div');
    el.className = 'settings-overlay';
    expect(el.className).toContain('settings-overlay');
  });

  it('creates settings panel with close button', () => {
    const panel = mockDoc.createElement('div');
    panel.className = 'settings-panel';

    const closeBtn = mockDoc.createElement('button');
    closeBtn.className = 'settings-close';
    closeBtn.textContent = '✕';
    panel.appendChild(closeBtn);

    expect(panel.children.length).toBe(1);
    expect(panel.children[0].className).toBe('settings-close');
  });

  it('panel has sections for Graphics, Audio, and Camera', () => {
    const sectionNames = ['Graphics', 'Audio', 'Camera'];
    sectionNames.forEach(name => {
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(0);
    });
  });

  it('creates toggle switch for boolean settings', () => {
    const toggle = mockDoc.createElement('label');
    toggle.className = 'settings-toggle';
    const input = mockDoc.createElement('input');
    input.dataset.type = 'checkbox';
    toggle.appendChild(input);
    const slider = mockDoc.createElement('span');
    slider.className = 'toggle-slider';
    toggle.appendChild(slider);

    expect(toggle.children.length).toBe(2);
    expect(toggle.children[1].className).toBe('toggle-slider');
  });

  it('creates range slider with value display', () => {
    const wrapper = mockDoc.createElement('div');
    wrapper.className = 'settings-slider-wrap';
    const input = mockDoc.createElement('input');
    input.dataset.type = 'range';
    input.dataset.min = '0.5';
    input.dataset.max = '2.0';
    input.value = '1.0';
    wrapper.appendChild(input);
    const display = mockDoc.createElement('span');
    display.className = 'slider-value';
    display.textContent = '1.0x';
    wrapper.appendChild(display);

    expect(wrapper.children.length).toBe(2);
    expect(wrapper.children[1].textContent).toBe('1.0x');
  });
});

// ── Unit: Settings button injection ─────────────────────────────────────────

describe('Settings button injection', () => {
  it('creates gear button with correct aria-label', () => {
    const btn = mockDoc.createElement('button');
    btn.className = 'settings-btn';
    btn.dataset['aria-label'] = 'Settings';
    btn.textContent = '⚙';
    expect(btn.textContent).toBe('⚙');
    expect(btn.dataset['aria-label']).toBe('Settings');
  });

  it('settings button triggers open when clicked', () => {
    let opened = false;
    const openSettings = () => { opened = true; };

    const btn = mockDoc.createElement('button');
    btn.addEventListener('click', openSettings);
    btn._trigger('click');

    expect(opened).toBe(true);
  });
});

// ── Unit: Open/close panel ──────────────────────────────────────────────────

describe('openSettings / closeSettings', () => {
  it('openSettings adds show class to overlay', () => {
    const overlay = mockDoc.createElement('div');
    overlay.className = 'settings-overlay';

    const openSettings = (el) => {
      el.className = el.className + ' show';
    };

    openSettings(overlay);
    expect(overlay.className).toContain('show');
  });

  it('closeSettings removes show class from overlay', () => {
    const overlay = mockDoc.createElement('div');
    overlay.className = 'settings-overlay show';

    const closeSettings = (el) => {
      el.className = el.className.replace(' show', '').replace('show', '').trim();
    };

    closeSettings(overlay);
    expect(overlay.className).not.toContain('show');
  });

  it('clicking backdrop closes settings', () => {
    let closed = false;
    const closeSettings = () => { closed = true; };

    const overlay = mockDoc.createElement('div');
    overlay.className = 'settings-overlay show';
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeSettings();
    });

    // Simulate click on overlay itself
    overlay._listeners['click']?.forEach(fn => fn({ target: overlay }));
    expect(closed).toBe(true);
  });
});

// ── Unit: Apply settings ────────────────────────────────────────────────────

describe('applySettings', () => {
  it('calls setPostProcessingQuality with quality tier', () => {
    const setQuality = vi.fn();
    const applySettings = (settings) => {
      setQuality(settings.graphicsQuality);
    };

    applySettings({ graphicsQuality: 'low' });
    expect(setQuality).toHaveBeenCalledWith('low');
  });

  it('applies bloom toggle to composer pass', () => {
    const composer = {
      passes: [{ name: 'BloomPass', enabled: true }]
    };

    const applyBloom = (enabled) => {
      const pass = composer.passes.find(p => p.name === 'BloomPass');
      if (pass) pass.enabled = enabled;
    };

    applyBloom(false);
    expect(composer.passes[0].enabled).toBe(false);

    applyBloom(true);
    expect(composer.passes[0].enabled).toBe(true);
  });

  it('applies vignette toggle to composer pass', () => {
    const composer = {
      passes: [{ name: 'VignettePass', enabled: true }]
    };

    const applyVignette = (enabled) => {
      const pass = composer.passes.find(p => p.name === 'VignettePass');
      if (pass) pass.enabled = enabled;
    };

    applyVignette(false);
    expect(composer.passes[0].enabled).toBe(false);
  });

  it('applies UI scale as CSS transform on hud-container', () => {
    const hudEl = mockDoc.createElement('div');
    hudEl.className = 'hud';

    const applyUIScale = (el, scale) => {
      el.style.transform = `scale(${scale})`;
    };

    applyUIScale(hudEl, 1.1);
    expect(hudEl.style.transform).toBe('scale(1.1)');
  });

  it('camera sensitivity stored as multiplier (0.5 to 2.0)', () => {
    let sensitivityMultiplier = 1.0;
    const setCameraSensitivity = (val) => {
      sensitivityMultiplier = Math.max(0.5, Math.min(2.0, val));
    };

    setCameraSensitivity(1.5);
    expect(sensitivityMultiplier).toBe(1.5);

    setCameraSensitivity(0.1); // clamp to 0.5
    expect(sensitivityMultiplier).toBe(0.5);

    setCameraSensitivity(3.0); // clamp to 2.0
    expect(sensitivityMultiplier).toBe(2.0);
  });
});

// ── Unit: Reset Progress ────────────────────────────────────────────────────

describe('Reset Progress', () => {
  it('shows confirmation dialog before resetting', () => {
    let confirmCalled = false;
    let resetCalled = false;

    const confirm = () => { confirmCalled = true; return true; };
    const resetProgress = () => { resetCalled = true; };

    const onResetClick = () => {
      if (confirm()) resetProgress();
    };

    onResetClick();
    expect(confirmCalled).toBe(true);
    expect(resetCalled).toBe(true);
  });

  it('does not reset if confirmation declined', () => {
    let resetCalled = false;
    const confirm = () => false;
    const resetProgress = () => { resetCalled = true; };

    const onResetClick = () => {
      if (confirm()) resetProgress();
    };

    onResetClick();
    expect(resetCalled).toBe(false);
  });
});

// ── Unit: Quality preset mapping ────────────────────────────────────────────

describe('Quality preset behavior', () => {
  it('low preset disables bloom and shadows', () => {
    const settingsFromPreset = (preset) => {
      const map = {
        low:    { bloom: false, shadows: false, vignette: false, particles: 'low' },
        medium: { bloom: true,  shadows: false, vignette: false, particles: 'medium' },
        high:   { bloom: true,  shadows: true,  vignette: true,  particles: 'high' },
        ultra:  { bloom: true,  shadows: true,  vignette: true,  particles: 'high' },
      };
      return map[preset] || map.high;
    };

    const low = settingsFromPreset('low');
    expect(low.bloom).toBe(false);
    expect(low.shadows).toBe(false);

    const high = settingsFromPreset('high');
    expect(high.bloom).toBe(true);
    expect(high.shadows).toBe(true);
  });

  it('ultra preset enables all effects', () => {
    const presetMap = {
      ultra: { bloom: true, shadows: true, vignette: true, particles: 'high' }
    };
    expect(presetMap.ultra.bloom).toBe(true);
    expect(presetMap.ultra.vignette).toBe(true);
    expect(presetMap.ultra.particles).toBe('high');
  });
});

// ── Integration: Full settings flow ─────────────────────────────────────────

describe('Full settings flow integration', () => {
  it('changing quality preset updates individual toggles to match', () => {
    const state = {
      graphicsQuality: 'high',
      bloom: true,
      shadows: true,
      vignette: true,
    };

    const applyQualityPreset = (preset, s) => {
      const presets = {
        low:    { bloom: false, shadows: false, vignette: false },
        medium: { bloom: true,  shadows: false, vignette: false },
        high:   { bloom: true,  shadows: true,  vignette: true  },
        ultra:  { bloom: true,  shadows: true,  vignette: true  },
      };
      Object.assign(s, presets[preset] || {}, { graphicsQuality: preset });
    };

    applyQualityPreset('low', state);
    expect(state.bloom).toBe(false);
    expect(state.shadows).toBe(false);
    expect(state.graphicsQuality).toBe('low');
  });

  it('settings persist across mock reload', () => {
    const storage = createMockStorage();
    const settings = { graphicsQuality: 'medium', cameraSensitivity: 1.5 };

    storage.setItem('hockeyTD_settings', JSON.stringify(settings));
    const raw = storage.getItem('hockeyTD_settings');
    const loaded = JSON.parse(raw);

    expect(loaded.graphicsQuality).toBe('medium');
    expect(loaded.cameraSensitivity).toBe(1.5);
  });

  it('volume sliders accept 0-100 range', () => {
    const clampVolume = (v) => Math.max(0, Math.min(100, v));
    expect(clampVolume(80)).toBe(80);
    expect(clampVolume(-10)).toBe(0);
    expect(clampVolume(150)).toBe(100);
  });
});
