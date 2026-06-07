// Screen transition animations for SC-4.1
// Provides animated transitions between game screens

// ── Transition type mapping ────────────────────────────────────────────────

const TRANSITION_MAP = {
  menuScreen: {
    mapScreen: { exit: 'screen-exit-left', enter: 'screen-enter-right', duration: 400 }
  },
  mapScreen: {
    gameScreen: { exit: 'screen-zoom-out', enter: 'screen-fade-in', duration: 500 }
  }
};

const DEFAULT_TRANSITION = { exit: 'screen-exit-left', enter: 'screen-enter-right', duration: 400 };

// ── State ──────────────────────────────────────────────────────────────────

let _transitioning = false;
let _pendingTimer = null;

// ── Helpers ────────────────────────────────────────────────────────────────

function getActiveScreen() {
  const screens = document.querySelectorAll('.screen');
  for (const s of screens) {
    if (s.classList.contains('active')) return s;
  }
  return null;
}

function resolveTransition(fromId, toId) {
  return (TRANSITION_MAP[fromId] && TRANSITION_MAP[fromId][toId])
    || DEFAULT_TRANSITION;
}

function cleanupClasses(el, ...classes) {
  if (el) el.classList.remove(...classes);
}

// ── Public API ─────────────────────────────────────────────────────────────

export function isTransitioning() {
  return _transitioning;
}

export function cancelTransition() {
  if (_pendingTimer !== null) {
    clearTimeout(_pendingTimer);
    _pendingTimer = null;
  }
  _transitioning = false;
}

export function showScreenAnimated(targetId) {
  if (_transitioning) return;

  const targetEl = document.getElementById(targetId);
  if (!targetEl) return;

  const currentEl = getActiveScreen();
  const fromId = currentEl ? currentEl.id : null;
  const { exit: exitClass, enter: enterClass, duration } = resolveTransition(fromId, targetId);

  _transitioning = true;

  // Apply animation classes immediately
  if (currentEl) currentEl.classList.add(exitClass);
  targetEl.classList.add(enterClass);

  // Wait for animation to complete, then swap active state
  _pendingTimer = setTimeout(() => {
    // Swap active classes
    if (currentEl) {
      currentEl.classList.remove('active');
      cleanupClasses(currentEl, exitClass);
    }
    targetEl.classList.add('active');
    cleanupClasses(targetEl, enterClass);

    _transitioning = false;
    _pendingTimer = null;
  }, duration);
}

export function showResultsModal(modalId) {
  const modalEl = document.getElementById(modalId);
  if (!modalEl) return;

  const gameEl = document.getElementById('gameScreen');
  if (gameEl) gameEl.classList.add('screen-blur');

  modalEl.classList.add('show', 'modal-slide-up');
}
