// Minimap drawing primitives — SC-4.4
// Pure canvas drawing helpers, no state dependencies.

const TOWER_DOT_RADIUS = 3.5;
const ENEMY_DOT_RADIUS = 2;
const SPAWN_SIZE = 5;
const BASE_SIZE  = 5;

export const MINIMAP_COLORS = {
  ENEMY_NORMAL: '#ef4444',
  ENEMY_BOSS:   '#f5c518',
  SPAWN:        '#22c55e',
  BASE:         '#ffffff',
  GRID_LINE:    'rgba(255,255,255,0.05)',
  OBSTACLE:     'rgba(80,80,80,0.6)'
};

export function drawTowerDot(ctx, x, y, color) {
  ctx.beginPath();
  ctx.arc(x, y, TOWER_DOT_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = color || '#ffffff';
  ctx.fill();
}

export function drawEnemyDot(ctx, x, y, isBoss) {
  ctx.beginPath();
  ctx.arc(x, y, ENEMY_DOT_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = isBoss ? MINIMAP_COLORS.ENEMY_BOSS : MINIMAP_COLORS.ENEMY_NORMAL;
  ctx.fill();
}

export function drawSpawnMarker(ctx, x, y) {
  const s = SPAWN_SIZE;
  ctx.beginPath();
  ctx.moveTo(x, y - s);
  ctx.lineTo(x + s, y + s);
  ctx.lineTo(x - s, y + s);
  ctx.closePath();
  ctx.fillStyle = MINIMAP_COLORS.SPAWN;
  ctx.fill();
}

export function drawBaseMarker(ctx, x, y) {
  const s = BASE_SIZE;
  ctx.beginPath();
  ctx.moveTo(x, y - s);
  ctx.lineTo(x + s, y);
  ctx.lineTo(x, y + s);
  ctx.lineTo(x - s, y);
  ctx.closePath();
  ctx.fillStyle = MINIMAP_COLORS.BASE;
  ctx.fill();
}

export function drawGrid(ctx, cellW, cellH, cols, rows, size) {
  ctx.strokeStyle = MINIMAP_COLORS.GRID_LINE;
  ctx.lineWidth = 1;
  for (let c = 0; c <= cols; c++) {
    ctx.beginPath();
    ctx.moveTo(c * cellW, 0);
    ctx.lineTo(c * cellW, size);
    ctx.stroke();
  }
  for (let r = 0; r <= rows; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * cellH);
    ctx.lineTo(size, r * cellH);
    ctx.stroke();
  }
}

export function drawObstacles(ctx, grid, cellW, cellH, cols) {
  if (!grid || !grid.length) return;
  ctx.fillStyle = MINIMAP_COLORS.OBSTACLE;
  grid.forEach((cell, idx) => {
    if (!cell || cell.walkable !== false) return;
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    ctx.fillRect(col * cellW, row * cellH, cellW, cellH);
  });
}
