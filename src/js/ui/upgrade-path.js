// Upgrade path visualization — SC-4.3
// Renders 4-level upgrade nodes, handles MAX state, animates stat counters.

const LEVELS = 4;

// ── Node builders ─────────────────────────────────────────────────────────────

function buildConnector(filled) {
  const el = document.createElement('div');
  el.classList.add('upgrade-connector');
  if (filled) el.classList.add('filled');
  return el;
}

function buildNode(level, currentLevel, dmg, isLast) {
  const node = document.createElement('div');
  node.classList.add('upgrade-node');

  if (level < currentLevel) {
    node.classList.add('completed');
  } else if (level === currentLevel) {
    node.classList.add('current');
  }

  const label = document.createElement('span');
  label.classList.add('upgrade-node-label');
  label.textContent = String(dmg);
  node.appendChild(label);

  if (isLast) {
    const maxBadge = document.createElement('span');
    maxBadge.classList.add('upgrade-node-max');
    maxBadge.textContent = 'MAX';
    node.appendChild(maxBadge);
  }

  return node;
}

// ── Public: render upgrade path ───────────────────────────────────────────────

export function renderUpgradePath(towerDef, currentLevel) {
  const container = document.getElementById('upgradePath');
  if (!container) return;

  // Clear previous content
  container.innerHTML = '';
  if (container._children) container._children.length = 0;

  for (let i = 0; i < LEVELS; i++) {
    if (i > 0) {
      const filled = i <= currentLevel;
      container.appendChild(buildConnector(filled));
    }
    const isLast = i === LEVELS - 1;
    container.appendChild(buildNode(i, currentLevel, towerDef.dmg[i], isLast));
  }
}

// ── Public: apply MAX level state ─────────────────────────────────────────────

export function applyMaxLevelState(isMax) {
  const btn = document.getElementById('upBtn');
  const sheet = document.getElementById('upgradeSheet');

  if (!btn || !sheet) return;

  if (isMax) {
    btn.style.display = 'none';
    sheet.classList.add('max-level');
  } else {
    btn.style.display = '';
    sheet.classList.remove('max-level');
  }
}

// ── Public: animate stat counter ─────────────────────────────────────────────

export function animateStat(el, fromVal, toVal, duration, decimals = 0) {
  let startTime = null;

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function frame(timestamp) {
    if (startTime === null) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeOut(progress);
    const current = fromVal + (toVal - fromVal) * eased;

    el.textContent = decimals > 0
      ? current.toFixed(decimals)
      : String(Math.round(current));

    if (progress < 1) {
      requestAnimationFrame(frame);
    }
  }

  requestAnimationFrame(frame);
}
