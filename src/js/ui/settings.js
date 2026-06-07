/**
 * Settings Panel UI — SC-4.6
 * Modal overlay for graphics, camera, audio, and reset controls.
 * Exports: openSettings(), closeSettings(), getSettings(), saveSettings(), applySettings()
 */

import { setPostProcessingQuality, getComposer } from '../engine/postprocessing.js';
import { resetAllProgress } from '../systems/storage.js';

// ── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'hockeyTD_settings';

const QUALITY_PRESETS = {
  low:    { bloom: false, shadows: false, vignette: false, particles: 'low' },
  medium: { bloom: true,  shadows: false, vignette: false, particles: 'medium' },
  high:   { bloom: true,  shadows: true,  vignette: true,  particles: 'high' },
  ultra:  { bloom: true,  shadows: true,  vignette: true,  particles: 'high' },
};

export const DEFAULT_SETTINGS = {
  graphicsQuality:   'high',
  shadows:           true,
  bloom:             true,
  particles:         'medium',
  vignette:          true,
  cameraSensitivity: 1.0,
  uiScale:           1.0,
  sfxVolume:         80,
  musicVolume:       70,
  ambientVolume:     50,
};

// ── Module state ──────────────────────────────────────────────────────────────

let overlayEl = null;
let panelEl   = null;
let confirmEl = null;

// Camera sensitivity multiplier, readable by input.js
export let cameraSensitivityMultiplier = 1.0;

// ── Persistence ───────────────────────────────────────────────────────────────

/** Load settings from localStorage, merging with defaults. */
export function getSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

/** Persist settings to localStorage. */
export function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('[Settings] Failed to save:', e);
  }
}

// ── Apply effects ─────────────────────────────────────────────────────────────

/** Apply settings to rendering and UI systems immediately. */
export function applySettings(settings) {
  _applyQuality(settings);
  _applyBloom(settings.bloom);
  _applyVignette(settings.vignette);
  _applyCameraSensitivity(settings.cameraSensitivity);
  _applyUIScale(settings.uiScale);
}

function _applyQuality(settings) {
  setPostProcessingQuality(settings.graphicsQuality);
  // Sync individual toggles to renderer shadow map
  try {
    const state = globalThis.__gameState;
    if (state && state.renderer) {
      state.renderer.shadowMap.enabled = !!settings.shadows;
    }
  } catch { /* renderer not ready */ }
}

function _applyBloom(enabled) {
  const composer = getComposer();
  if (!composer) return;
  const pass = composer.passes.find(p => p.name === 'BloomPass');
  if (pass) pass.enabled = !!enabled;
}

function _applyVignette(enabled) {
  const composer = getComposer();
  if (!composer) return;
  const pass = composer.passes.find(p => p.name === 'VignettePass');
  if (pass) pass.enabled = !!enabled;
}

function _applyCameraSensitivity(val) {
  cameraSensitivityMultiplier = Math.max(0.5, Math.min(2.0, Number(val) || 1.0));
}

function _applyUIScale(val) {
  const scale = Math.max(0.8, Math.min(1.2, Number(val) || 1.0));
  const hud = document.querySelector('.hud');
  if (hud) hud.style.transform = scale === 1.0 ? '' : `scale(${scale})`;
  const bottomUI = document.querySelector('.bottom-ui');
  if (bottomUI) bottomUI.style.transform = scale === 1.0 ? '' : `scale(${scale})`;
}

// ── Panel DOM construction ────────────────────────────────────────────────────

function buildPanel(settings) {
  const overlay = document.createElement('div');
  overlay.className = 'settings-overlay';
  overlay.id = 'settingsOverlay';

  const panel = document.createElement('div');
  panel.className = 'settings-panel';

  panel.appendChild(_buildHeader());
  panel.appendChild(_buildBody(settings));
  panel.appendChild(_buildConfirmDialog());

  overlay.appendChild(panel);

  // Close on backdrop click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeSettings();
  });

  document.body.appendChild(overlay);
  overlayEl = overlay;
  panelEl = panel;
  confirmEl = panel.querySelector('.settings-confirm');
  return overlay;
}

function _buildHeader() {
  const header = document.createElement('div');
  header.className = 'settings-header';

  const title = document.createElement('span');
  title.className = 'settings-title';
  title.textContent = 'SETTINGS';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'settings-close';
  closeBtn.setAttribute('aria-label', 'Close settings');
  closeBtn.textContent = '✕';
  closeBtn.addEventListener('click', closeSettings);

  header.appendChild(title);
  header.appendChild(closeBtn);
  return header;
}

function _buildBody(settings) {
  const body = document.createElement('div');
  body.className = 'settings-body';

  body.appendChild(_buildGraphicsSection(settings));
  body.appendChild(_buildCameraSection(settings));
  body.appendChild(_buildAudioSection(settings));
  body.appendChild(_buildDangerSection());

  return body;
}

function _buildGraphicsSection(settings) {
  const section = _makeSection('Graphics');

  // Quality preset row
  const presetRow = document.createElement('div');
  presetRow.className = 'settings-row';
  const presetLabel = _makeLabel('Quality');
  const presetGroup = document.createElement('div');
  presetGroup.className = 'settings-preset-group';

  ['Low', 'Medium', 'High', 'Ultra'].forEach(tier => {
    const btn = document.createElement('button');
    btn.className = 'settings-preset-btn' + (settings.graphicsQuality === tier.toLowerCase() ? ' active' : '');
    btn.textContent = tier;
    btn.dataset.tier = tier.toLowerCase();
    btn.addEventListener('click', () => _onPresetClick(tier.toLowerCase()));
    presetGroup.appendChild(btn);
  });

  presetRow.appendChild(presetLabel);
  presetRow.appendChild(presetGroup);
  section.appendChild(presetRow);

  // Individual toggles
  section.appendChild(_makeToggleRow('Shadows', 'shadows', settings.shadows));
  section.appendChild(_makeToggleRow('Bloom', 'bloom', settings.bloom));
  section.appendChild(_makeToggleRow('Vignette', 'vignette', settings.vignette));

  // Particles select
  section.appendChild(_makeSelectRow('Particles', 'particles', ['low', 'medium', 'high'], settings.particles));

  return section;
}

function _buildCameraSection(settings) {
  const section = _makeSection('Camera');
  section.appendChild(_makeSliderRow('Sensitivity', 'cameraSensitivity', 0.5, 2.0, 0.1, settings.cameraSensitivity, 'x'));
  return section;
}

function _buildAudioSection(settings) {
  const section = _makeSection('Audio');

  const note = document.createElement('div');
  note.className = 'settings-note';
  note.textContent = 'Audio system coming soon — values are saved';

  section.appendChild(_makeSliderRow('SFX', 'sfxVolume', 0, 100, 1, settings.sfxVolume, '%'));
  section.appendChild(_makeSliderRow('Music', 'musicVolume', 0, 100, 1, settings.musicVolume, '%'));
  section.appendChild(_makeSliderRow('Ambient', 'ambientVolume', 0, 100, 1, settings.ambientVolume, '%'));
  section.appendChild(note);

  return section;
}

function _buildDangerSection() {
  const section = _makeSection('Data');

  const resetBtn = document.createElement('button');
  resetBtn.className = 'settings-danger-btn';
  resetBtn.textContent = 'Reset All Progress';
  resetBtn.addEventListener('click', _onResetClick);

  section.appendChild(resetBtn);
  return section;
}

function _buildConfirmDialog() {
  const confirm = document.createElement('div');
  confirm.className = 'settings-confirm';

  const text = document.createElement('div');
  text.className = 'settings-confirm-text';
  text.textContent = 'Are you sure? This will erase all progression, achievements, and high scores.';

  const btns = document.createElement('div');
  btns.className = 'settings-confirm-btns';

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'settings-confirm-btn cancel';
  cancelBtn.textContent = 'Cancel';
  cancelBtn.addEventListener('click', _hideConfirm);

  const confirmBtn = document.createElement('button');
  confirmBtn.className = 'settings-confirm-btn confirm';
  confirmBtn.textContent = 'Reset';
  confirmBtn.addEventListener('click', _executeReset);

  btns.appendChild(cancelBtn);
  btns.appendChild(confirmBtn);
  confirm.appendChild(text);
  confirm.appendChild(btns);
  return confirm;
}

// ── Row helpers ───────────────────────────────────────────────────────────────

function _makeSection(title) {
  const section = document.createElement('div');
  section.className = 'settings-section';

  const heading = document.createElement('div');
  heading.className = 'settings-section-title';
  heading.textContent = title;
  section.appendChild(heading);

  return section;
}

function _makeLabel(text) {
  const label = document.createElement('span');
  label.className = 'settings-label';
  label.textContent = text;
  return label;
}

function _makeToggleRow(labelText, key, initialValue) {
  const row = document.createElement('div');
  row.className = 'settings-row';
  row.appendChild(_makeLabel(labelText));

  const toggle = document.createElement('label');
  toggle.className = 'settings-toggle';

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = !!initialValue;
  input.dataset.settingKey = key;
  input.addEventListener('change', _onToggleChange);

  const slider = document.createElement('span');
  slider.className = 'toggle-slider';

  toggle.appendChild(input);
  toggle.appendChild(slider);
  row.appendChild(toggle);
  return row;
}

function _makeSliderRow(labelText, key, min, max, step, initialValue, unit) {
  const row = document.createElement('div');
  row.className = 'settings-row';
  row.appendChild(_makeLabel(labelText));

  const wrap = document.createElement('div');
  wrap.className = 'settings-slider-wrap';

  const input = document.createElement('input');
  input.type = 'range';
  input.className = 'settings-slider';
  input.min = min;
  input.max = max;
  input.step = step;
  input.value = initialValue;
  input.dataset.settingKey = key;
  input.dataset.unit = unit;

  const display = document.createElement('span');
  display.className = 'slider-value';
  display.textContent = _formatSliderValue(initialValue, unit);

  input.addEventListener('input', (e) => {
    display.textContent = _formatSliderValue(e.target.value, unit);
    _onSliderChange(e);
  });

  wrap.appendChild(input);
  wrap.appendChild(display);
  row.appendChild(wrap);
  return row;
}

function _makeSelectRow(labelText, key, options, initialValue) {
  const row = document.createElement('div');
  row.className = 'settings-row';
  row.appendChild(_makeLabel(labelText));

  const select = document.createElement('select');
  select.className = 'settings-select';
  select.dataset.settingKey = key;

  options.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt;
    option.textContent = opt.charAt(0).toUpperCase() + opt.slice(1);
    option.selected = opt === initialValue;
    select.appendChild(option);
  });

  select.addEventListener('change', _onSelectChange);
  row.appendChild(select);
  return row;
}

function _formatSliderValue(val, unit) {
  const num = parseFloat(val);
  if (unit === 'x') return num.toFixed(1) + 'x';
  return Math.round(num) + unit;
}

// ── Event handlers ────────────────────────────────────────────────────────────

function _onPresetClick(tier) {
  const current = getSettings();
  const presetOverrides = QUALITY_PRESETS[tier] || {};
  const updated = { ...current, graphicsQuality: tier, ...presetOverrides };

  saveSettings(updated);
  applySettings(updated);
  _syncPanelToSettings(updated);
}

function _onToggleChange(e) {
  const key = e.target.dataset.settingKey;
  const value = e.target.checked;
  const current = getSettings();
  const updated = { ...current, [key]: value };

  saveSettings(updated);
  applySettings(updated);
  _syncPresetButtons(updated);
}

function _onSliderChange(e) {
  const key = e.target.dataset.settingKey;
  const value = parseFloat(e.target.value);
  const current = getSettings();
  const updated = { ...current, [key]: value };

  saveSettings(updated);
  applySettings(updated);
}

function _onSelectChange(e) {
  const key = e.target.dataset.settingKey;
  const value = e.target.value;
  const current = getSettings();
  const updated = { ...current, [key]: value };

  saveSettings(updated);
  applySettings(updated);
}

function _onResetClick() {
  if (!confirmEl) return;
  confirmEl.classList.add('show');
}

function _hideConfirm() {
  if (!confirmEl) return;
  confirmEl.classList.remove('show');
}

function _executeReset() {
  _hideConfirm();
  resetAllProgress();
  // Reset settings too
  localStorage.removeItem(STORAGE_KEY);
  const fresh = { ...DEFAULT_SETTINGS };
  saveSettings(fresh);
  applySettings(fresh);
  _syncPanelToSettings(fresh);
}

// ── Panel sync ────────────────────────────────────────────────────────────────

function _syncPanelToSettings(settings) {
  if (!panelEl) return;

  // Update preset buttons
  _syncPresetButtons(settings);

  // Update toggle checkboxes
  panelEl.querySelectorAll('input[type="checkbox"][data-setting-key]').forEach(input => {
    const key = input.dataset.settingKey;
    if (key in settings) input.checked = !!settings[key];
  });

  // Update sliders
  panelEl.querySelectorAll('input[type="range"][data-setting-key]').forEach(input => {
    const key = input.dataset.settingKey;
    if (key in settings) {
      input.value = settings[key];
      const display = input.parentElement.querySelector('.slider-value');
      if (display) display.textContent = _formatSliderValue(settings[key], input.dataset.unit);
    }
  });

  // Update selects
  panelEl.querySelectorAll('select[data-setting-key]').forEach(select => {
    const key = select.dataset.settingKey;
    if (key in settings) select.value = settings[key];
  });
}

function _syncPresetButtons(settings) {
  if (!panelEl) return;
  panelEl.querySelectorAll('.settings-preset-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tier === settings.graphicsQuality);
  });
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Open the settings panel (creates it if not yet built). */
export function openSettings() {
  if (!overlayEl) {
    const settings = getSettings();
    buildPanel(settings);
  } else {
    // Sync to latest saved settings
    _syncPanelToSettings(getSettings());
  }

  overlayEl.classList.add('show');
  document.body.style.overflow = 'hidden';
}

/** Close the settings panel. */
export function closeSettings() {
  if (!overlayEl) return;
  overlayEl.classList.remove('show');
  document.body.style.overflow = '';
  _hideConfirm();
}

// ── Settings button injection ─────────────────────────────────────────────────

/**
 * Inject settings gear button into menu screen and in-game HUD.
 * Called once from main.js after DOMContentLoaded.
 */
export function initSettingsButtons() {
  _injectMenuButton();
  _injectHUDButton();
}

function _injectMenuButton() {
  const menuScreen = document.getElementById('menuScreen');
  if (!menuScreen) return;
  if (menuScreen.querySelector('.menu-settings-btn')) return;

  const btn = document.createElement('button');
  btn.className = 'settings-btn menu-settings-btn';
  btn.setAttribute('aria-label', 'Settings');
  btn.textContent = '\u2699';
  btn.addEventListener('click', openSettings);

  menuScreen.style.position = 'relative';
  menuScreen.appendChild(btn);
}

function _injectHUDButton() {
  const hudRight = document.querySelector('.hud-right');
  if (!hudRight) return;
  if (hudRight.querySelector('.settings-btn')) return;

  const btn = document.createElement('button');
  btn.className = 'settings-btn';
  btn.setAttribute('aria-label', 'Settings');
  btn.textContent = '\u2699';
  btn.addEventListener('click', openSettings);
  hudRight.appendChild(btn);
}

/** Initialize settings: load, apply on startup. */
export function initSettings() {
  const settings = getSettings();
  applySettings(settings);
  initSettingsButtons();
}
