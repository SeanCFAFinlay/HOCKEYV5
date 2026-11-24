// Behaviour that only applies inside the store app (Capacitor's Android or iOS
// shell). On the web every call here is a no-op.
//
//   - the phone's Back button steps back through the game (closes a panel,
//     pauses a match, leaves the map list) instead of quitting the app
//   - the system status bar is hidden so the arena fills the screen

import { getState } from '../engine/state.js';
import { showScreen, exitGame } from '../ui/screens.js';
import { closePauseMenu, openPauseMenu } from '../ui/pause-sheet.js';
import { hideUpgrade } from '../ui/upgrade-sheet.js';

export const isNativeApp = () => !!(typeof window !== 'undefined' && window.Capacitor?.isNativePlatform?.());

const activeScreen = () => document.querySelector('.screen.active')?.id;
const shown = (sel) => !!document.querySelector(sel);

function onBack() {
  const settings = document.getElementById('settingsOverlay');
  if (settings?.classList.contains('show')) {
    settings.classList.remove('show');
    document.body.style.overflow = '';
    return;
  }
  if (shown('#winModal.show, #loseModal.show')) { exitGame(); return; }
  if (document.body.classList.contains('game-paused')) { closePauseMenu(); return; }
  if (shown('#upgradeSheet.show')) { hideUpgrade(); return; }

  const screen = activeScreen();
  if (screen === 'gameScreen' && getState().running) { openPauseMenu(); return; }
  if (screen === 'gameScreen') { exitGame(); return; }
  if (screen === 'mapScreen') { showScreen('menuScreen'); return; }
  // On the first screen, Back sends the app to the background like any game.
  window.Capacitor.Plugins.App?.minimizeApp?.();
}

export function initAppShell() {
  if (!isNativeApp()) return;
  const { App, StatusBar } = window.Capacitor.Plugins;
  document.documentElement.classList.add('native-app');
  try { StatusBar?.hide?.(); } catch { /* plugin missing */ }
  try { App?.addListener?.('backButton', onBack); } catch { /* plugin missing */ }
}
