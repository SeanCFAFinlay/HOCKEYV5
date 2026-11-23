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
// Completes the transition in flight (swaps the active screen right away).
let _finishPending = null;

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
  _finishPending = null;
  _transitioning = false;
}

export function showScreenAnimated(targetId) {
  const targetEl = document.getElementById(targetId);
  if (!targetEl) return;

  // A new request while one is still animating used to be dropped, so tapping
  // a board during the 400ms slide into the map screen left the game screen
  // hidden and the arena loader waiting forever. Finish the old one at once
  // and run this one.
  if (_transitioning && _finishPending) {
    clearTimeout(_pendingTimer);
    _finishPending();
  }

  const currentEl = getActiveScreen();
  const fromId = currentEl ? currentEl.id : null;
  const { exit: exitClass, enter: enterClass, duration } = resolveTransition(fromId, targetId);

  _transitioning = true;

  // Apply animation classes immediately
  if (currentEl) currentEl.classList.add(exitClass);
  targetEl.classList.add(enterClass);

  // Wait for animation to complete, then swap active state
  const finish = () => {
    if (_finishPending !== finish) return;
    // Swap active classes
    if (currentEl && currentEl !== targetEl) {
      currentEl.classList.remove('active');
    }
    if (currentEl) cleanupClasses(currentEl, exitClass);
    targetEl.classList.add('active');
    cleanupClasses(targetEl, enterClass);

    _transitioning = false;
    _pendingTimer = null;
    _finishPending = null;
  };
  _finishPending = finish;
  _pendingTimer = setTimeout(finish, duration);
}

export function showResultsModal(modalId) {
  const modalEl = document.getElementById(modalId);
  if (!modalEl) return;

  const gameEl = document.getElementById('gameScreen');
  if (gameEl) gameEl.classList.add('screen-blur');

  modalEl.classList.add('show', 'modal-slide-up');
}
