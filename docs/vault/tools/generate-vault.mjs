// Generates the asset half of the Obsidian vault from the real game config.
//
//   node docs/vault/tools/generate-vault.mjs
//
// Reads src/js/config/themes.js (which composes towers, enemies, maps and
// visual profiles) and writes:
//
//   docs/vault/Assets/**        one note per asset
//   docs/vault/media/**         one SVG per asset
//
// NOTE: media/ must not be a case-insensitive match for Assets/ — on Windows
// "assets/img" and "Assets/img" are the same directory, which silently nests
// the images inside the notes tree and makes the two cleanup steps collide.
//
// Only those two directories are touched — the hand-written notes (Home,
// Codebase/, Findings) are never overwritten. Prose lives in prose.mjs, art
// recipes in recipes.mjs.

import { mkdir, writeFile, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { THEMES } from '../../../src/js/config/themes.js';
import { makeProjector, renderParts, svgDoc, hex, groundShadow, esc } from './art.mjs';
import { towerBase, towerParts, silhouetteKey, enemyParts, HOCKEY_NAME_OVERRIDES } from './recipes.mjs';
import { TOWER_PROSE, ENEMY_PROSE, LAYOUT_PROSE, PROJECTILE_PROSE, THEME_PROSE } from './prose.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const VAULT = join(HERE, '..');
const NOTES = join(VAULT, 'Assets');
const IMG = join(VAULT, 'media');

const written = [];

async function put(path, body) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, body, 'utf8');
  written.push(path);
}

const slug = s =>
  String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const cap = s => s[0].toUpperCase() + s.slice(1);

// Two hockey assets are both called "Enforcer" (tower t3 and enemy e10), so
// note titles carry their kind. See Findings.
const towerTitle = (theme, t) => `${cap(theme)} Tower - ${t.nm}`;
const enemyTitle = (theme, e) => `${cap(theme)} Enemy - ${e.nm}`;
const mapTitle = (theme, m) => `${cap(theme)} Map - ${m.name}`;
const projTitle = (theme, k) => `${cap(theme)} Projectile - ${k}`;

const fm = (o, tags) =>
  ['---', ...Object.entries(o).map(([k, v]) => `${k}: ${v}`), `tags:`, ...tags.map(t => `  - ${t}`), '---', ''].join(
    '\n'
  );

const table = rows => rows.map(r => `| ${r.join(' | ')} |`).join('\n');

const statTable = (header, rows) =>
  [`| ${header.join(' | ')} |`, `|${header.map(() => '---').join('|')}|`, table(rows)].join('\n');

// ── Art ────────────────────────────────────────────────────────────────────

function towerSvg(theme, td, visuals) {
  const P = makeProjector({ scale: 190, cx: 132, groundY: 236 });
  const palette = {
    base: hex(visuals.towers.base),
    metal: hex(visuals.towers.metal),
    glow: td.clr,
    body: td.clr,
    dark: '#1a1a2a',
    white: '#cbd5e1',
    gold: '#ffcc00'
  };
  const family = visuals.towers.family === 'space' ? 'space' : theme;
  const parts = [...towerBase(0), ...towerParts(family, parseInt(td.id.slice(1)) - 1, td.projectile)];
  return svgDoc({
    w: 264,
    h: 264,
    bg: hex(visuals.map.background),
    accent: td.clr,
    title: `${td.nm} — ${theme} tower`,
    body: `${groundShadow(P)}\n    ${renderParts(parts, P, palette)}`
  });
}

function enemySvg(theme, e, visuals) {
  // One scale for every enemy in the vault, sized so the largest (a boss at
  // sz 2.2, plus its crown ring) still clears the frame. Enemies are drawn at
  // their true relative size — a Boss Puck really is ~2.6x a Puck.
  const P = makeProjector({ scale: 112, cx: 132, groundY: 132 });
  const slot = e.slot || (e.role || 'swarm').toLowerCase();
  const visual = visuals.enemies[slot] || visuals.enemies.swarm;
  const sz = (e.sz || 1) * 0.34;

  let bodyColor = hex(visual.color);
  if (e.fire) bodyColor = '#ff2200';
  if (theme === 'hockey' && HOCKEY_NAME_OVERRIDES[e.nm]) bodyColor = HOCKEY_NAME_OVERRIDES[e.nm];

  const parts = enemyParts({
    body: visual.body,
    sz,
    bodyColor,
    accent: hex(visual.accent || visual.color),
    effects: visual.effects || [],
    fire: !!e.fire,
    boss: !!e.boss
  });

  return svgDoc({
    w: 264,
    h: 264,
    bg: hex(visuals.map.background),
    accent: hex(visual.accent || visual.color),
    title: `${e.nm} — ${theme} enemy`,
    body: renderParts(parts, P, {})
  });
}

// Schematic map plan: the grid at true aspect, with spawn and base markers.
// Cell layout is generated at runtime by systems/map.js, so this shows the
// declared shape, not the actual maze.
function mapSvg(theme, m, visuals) {
  const W = 360;
  const pad = 14;
  const cell = (W - pad * 2) / m.cols;
  const H = Math.round(cell * m.rows + pad * 2);
  const floor = hex(visuals.map.floor.meshColor);
  const pathC = hex(visuals.map.path.color);
  const grid = [];

  for (let r = 0; r < m.rows; r++) {
    for (let c = 0; c < m.cols; c++) {
      grid.push(
        `<rect x="${(pad + c * cell).toFixed(1)}" y="${(pad + r * cell).toFixed(1)}" width="${(
          cell - 1
        ).toFixed(1)}" height="${(cell - 1).toFixed(1)}" fill="${floor}" opacity="0.5"/>`
      );
    }
  }

  // Spawns spread down the left edge; base centred on the right.
  const marks = [];
  for (let s = 0; s < m.spawns; s++) {
    const y = pad + ((s + 1) / (m.spawns + 1)) * (m.rows * cell);
    marks.push(
      `<circle cx="${(pad + cell / 2).toFixed(1)}" cy="${y.toFixed(1)}" r="${(cell * 0.42).toFixed(
        1
      )}" fill="${hex(visuals.map.spawn.color)}"/>`,
      `<line x1="${(pad + cell).toFixed(1)}" y1="${y.toFixed(1)}" x2="${(
        W - pad - cell
      ).toFixed(1)}" y2="${(pad + (m.rows * cell) / 2).toFixed(1)}" stroke="${pathC}" stroke-width="${(
        cell * 0.28
      ).toFixed(1)}" opacity="0.32" stroke-linecap="round" stroke-dasharray="${(cell * 0.6).toFixed(1)} ${(
        cell * 0.4
      ).toFixed(1)}"/>`
    );
  }
  marks.push(
    `<rect x="${(W - pad - cell * 1.6).toFixed(1)}" y="${(
      pad + (m.rows * cell) / 2 - cell * 0.8
    ).toFixed(1)}" width="${(cell * 1.6).toFixed(1)}" height="${(cell * 1.6).toFixed(1)}" rx="${(
      cell * 0.3
    ).toFixed(1)}" fill="${hex(visuals.map.base.color)}"/>`
  );

  return svgDoc({
    w: W,
    h: H,
    bg: hex(visuals.map.background),
    accent: hex(visuals.map.path.color),
    title: `${m.name} — ${m.cols}x${m.rows} ${m.layoutType} plan`,
    body: `${grid.join('')}\n  ${marks.join('\n  ')}`
  });
}

function projectileSvg(theme, key, p, visuals) {
  const c = hex(p.color);
  const bg = hex(visuals.map.background);
  const shapes = {
    puck: `<ellipse cx="150" cy="80" rx="26" ry="11" fill="${c}"/>`,
    ball: `<circle cx="150" cy="80" r="20" fill="${c}"/><circle cx="150" cy="80" r="20" fill="none" stroke="#111" stroke-width="2" opacity="0.5"/>`,
    tracer: `<rect x="122" y="74" width="56" height="12" rx="6" fill="${c}"/>`,
    block: `<rect x="130" y="60" width="40" height="40" rx="4" fill="${c}"/>`,
    shard: `<polygon points="150,54 168,80 150,106 132,80" fill="${c}"/>`,
    sphere: `<circle cx="150" cy="80" r="20" fill="${c}"/>`,
    bolt: `<polygon points="158,52 136,84 150,84 142,110 168,76 152,76" fill="${c}"/>`,
    plasma: `<circle cx="150" cy="80" r="20" fill="${c}"/><circle cx="150" cy="80" r="30" fill="${c}" opacity="0.25"/>`,
    star: `<polygon points="150,52 158,74 181,74 162,88 169,110 150,96 131,110 138,88 119,74 142,74" fill="${c}"/>`,
    ring: `<circle cx="150" cy="80" r="20" fill="none" stroke="${c}" stroke-width="8"/>`,
    cone: `<polygon points="150,54 170,106 130,106" fill="${c}"/>`,
    beam: `<rect x="112" y="76" width="76" height="8" rx="4" fill="${c}"/>`,
    laser: `<rect x="100" y="77" width="92" height="6" rx="3" fill="${c}"/><rect x="100" y="72" width="92" height="16" rx="8" fill="${c}" opacity="0.22"/>`
  };
  const trail = `<path d="M 40 80 L 118 80" stroke="${c}" stroke-width="10" stroke-linecap="round" opacity="0.28"/><path d="M 66 80 L 118 80" stroke="${c}" stroke-width="5" stroke-linecap="round" opacity="0.5"/>`;
  return svgDoc({
    w: 220,
    h: 160,
    bg,
    accent: c,
    title: `${key} — ${theme} projectile`,
    body: `${trail}\n  ${shapes[p.mesh] || shapes.sphere}\n  <text x="110" y="140" text-anchor="middle" font-family="ui-monospace,monospace" font-size="13" fill="${c}" opacity="0.75">${esc(
      p.mesh
    )} · ${p.speed} u/s</text>`
  });
}

function themeSvg(theme, pack) {
  const v = pack.visuals;
  const sw = [
    ['background', hex(v.map.background)],
    ['floor', hex(v.map.floor.meshColor)],
    ['path', hex(v.map.path.color)],
    ['accent', v.ui.accent],
    ['tower base', hex(v.towers.base)],
    ['tower metal', hex(v.towers.metal)],
    ['glow', hex(v.towers.levelGlow)],
    ['spawn', hex(v.map.spawn.color)],
    ['base', hex(v.map.base.color)]
  ];
  const cells = sw
    .map(([label, c], i) => {
      const x = 20 + (i % 3) * 128;
      const y = 56 + Math.floor(i / 3) * 92;
      return `<rect x="${x}" y="${y}" width="108" height="52" rx="8" fill="${c}" stroke="#ffffff" stroke-opacity="0.16"/>
  <text x="${x}" y="${y + 68}" font-family="ui-monospace,monospace" font-size="11" fill="#ffffff" opacity="0.72">${esc(
        label
      )}</text>
  <text x="${x}" y="${y + 82}" font-family="ui-monospace,monospace" font-size="11" fill="${c}">${esc(c)}</text>`;
    })
    .join('\n  ');
  return svgDoc({
    w: 404,
    h: 340,
    bg: hex(v.map.background),
    accent: v.ui.accent,
    title: `${pack.name} palette`,
    body: `<text x="20" y="34" font-family="ui-sans-serif,system-ui" font-size="19" font-weight="600" fill="${v.ui.accent}">${esc(
      pack.icon + ' ' + pack.name
    )}</text>\n  ${cells}`
  });
}

// ── Notes ──────────────────────────────────────────────────────────────────

const LEVELS = ['L1', 'L2', 'L3', 'L4'];

function towerNote(theme, pack, td) {
  const title = towerTitle(theme, td);
  const img = `${theme}-tower-${td.id}-${slug(td.nm)}.svg`;
  const prose = TOWER_PROSE[theme]?.[td.id];
  const sharedNote = TOWER_PROSE[theme]?._shared;
  const dps = td.dmg.map((d, i) => (d * td.rate[i]).toFixed(1));
  const totalCost = td.cost + td.up.reduce((a, b) => a + b, 0);

  const rows = [
    ['Damage', ...td.dmg],
    ['Range', ...td.rng],
    ['Fire rate /s', ...td.rate],
    ['Burst DPS', ...dps]
  ];
  if (td.splash) rows.push(['Splash radius', ...td.splash]);
  if (td.chain) rows.push(['Chain targets', ...td.chain]);
  if (td.burn) rows.push(['Burn /s', ...td.burn]);
  if (td.slowDur) rows.push(['Slow duration', ...td.slowDur]);

  const special = [];
  if (td.splash) special.push(`Area damage on hit.`);
  if (td.slow) special.push(`Slows by ${(td.slow * 100).toFixed(0)}% for ${td.slowDur[0]}–${td.slowDur[3]}s.`);
  if (td.chain) special.push(`Chains to ${td.chain[0]}–${td.chain[3]} targets within ${td.chainRng} units.`);
  if (td.burn) special.push(`Burns for ${td.burn[0]}–${td.burn[3]}/s over ${td.burnDur}s.`);
  if (td.crit) special.push(`${(td.crit * 100).toFixed(0)}% critical hit chance.`);

  const family = pack.visuals.towers.family === 'space' ? 'space' : theme;
  const sil = silhouetteKey(family, parseInt(td.id.slice(1)) - 1, td.projectile);
  const builder = `build${cap(family)}TowerMesh`;

  return `${fm(
    {
      title: `"${title}"`,
      kind: 'tower',
      theme,
      id: td.id,
      role: td.role,
      cost: td.cost
    },
    ['asset', 'asset/tower', `theme/${theme}`, `role/${slug(td.role)}`]
  )}# ${td.icon} ${td.nm}

![[${img}]]

${prose?.blurb || sharedNote || ''}

${prose?.tactics ? `**How it plays.** ${prose.tactics}\n` : ''}
## Stats

Build cost **$${td.cost}**, upgrades **$${td.up.join(' → $')}**, **$${totalCost}** to max.
Fires [[${projTitle(theme, td.projectile)}|${td.projectile}]].

${statTable(['', ...LEVELS], rows)}

${special.length ? `## Special\n\n${special.map(s => `- ${s}`).join('\n')}\n` : ''}
## Appearance

Colour \`${td.clr}\`, on the [[${cap(theme)} Theme]] palette. Mesh built by
\`${builder}\` in [[rendering-tower-meshes|rendering/tower-meshes.js]]
(silhouette \`${sil}\`), on the shared hex plinth every tower gets from
\`createTowerMesh()\`. Scale grows 8% per upgrade level and a gold star is added per level.

## Links

- Theme: [[${cap(theme)} Theme]]
- Same role elsewhere — ${Object.keys(THEMES)
    .filter(t => t !== theme)
    .map(t => {
      const match = THEMES[t].towers.find(x => x.role === td.role);
      return match ? `[[${towerTitle(t, match)}|${t}/${match.nm}]]` : null;
    })
    .filter(Boolean)
    .join(', ')}
- Defined in: \`src/js/config/towers.js\`
`;
}

function enemyNote(theme, pack, e) {
  const title = enemyTitle(theme, e);
  const img = `${theme}-enemy-${e.id}-${slug(e.nm)}.svg`;
  const prose = ENEMY_PROSE[theme]?.[e.id] || ENEMY_PROSE[theme]?._shared || '';
  const slot = e.slot || (e.role || 'swarm').toLowerCase();
  const visual = pack.visuals.enemies[slot];
  const eff = (e.hp / (1 - (e.armor || 0))).toFixed(0);

  const traits = [];
  if (e.armor) traits.push(`**Armor** — takes ${(e.armor * 100).toFixed(0)}% less damage (${eff} effective HP).`);
  if (e.fire) traits.push('**Fire** — burn effect on death.');
  if (e.flying) traits.push('**Flying** — ignores obstacles and pathing entirely.');
  if (e.boss) traits.push('**Boss** — spawns only on boss waves.');

  return `${fm(
    {
      title: `"${title}"`,
      kind: 'enemy',
      theme,
      id: e.id,
      role: e.role,
      hp: e.hp
    },
    ['asset', 'asset/enemy', `theme/${theme}`, `role/${slug(e.role)}`, ...(e.threatTags || []).map(t => `threat/${t}`)]
  )}# ${e.nm}

![[${img}]]

${prose}

## Stats

${statTable(
    ['Stat', 'Value'],
    [
      ['Base HP', e.hp],
      ['Effective HP', eff],
      ['Speed', `${e.spd} (${e.speedClass})`],
      ['Reward', `$${e.rwd} (${e.rewardClass})`],
      ['Size', e.sz],
      ['Armor', e.armor ? `${(e.armor * 100).toFixed(0)}%` : '—'],
      ['Unlocks at wave', e.unlockWave],
      ['Wave weight', e.waveWeight]
    ]
  )}

Base HP is scaled per wave in \`systems/enemies.js\`:
\`hp * (1 + wave * 0.07 + (wave/25)^1.6 * 0.6)\`.

${traits.length ? `## Traits\n\n${traits.map(t => `- ${t}`).join('\n')}\n` : ''}
## Appearance

Body \`${visual?.body}\`, colour \`${hex(visual?.color)}\`, accent \`${hex(visual?.accent)}\`${
    visual?.effects?.length ? `, effects \`${visual.effects.join('`, `')}\`` : ''
  }. Resolved through the \`${slot}\` slot of the [[${cap(theme)} Theme]] visual profile and
built by \`createEnemyMesh\` in [[rendering-enemy-meshes|rendering/enemy-meshes.js]].

## Links

- Theme: [[${cap(theme)} Theme]]
- Threat tags: ${(e.threatTags || []).map(t => `\`${t}\``).join(', ') || '—'}
- Defined in: \`src/js/config/enemies.js\`
`;
}

function mapNote(theme, pack, m, index) {
  const title = mapTitle(theme, m);
  const img = `${theme}-map-${index + 1}-${slug(m.name)}.svg`;
  const layout = m.layoutType || m.layout;
  const unlock =
    m.unlock?.type === 'default'
      ? 'Unlocked by default.'
      : `Unlocked by completing **${pack.maps[m.unlock.mapIndex]?.name}**.`;

  return `${fm(
    {
      title: `"${title}"`,
      kind: 'map',
      theme,
      difficulty: m.difficulty,
      layout
    },
    ['asset', 'asset/map', `theme/${theme}`, `layout/${slug(layout)}`]
  )}# ${m.name}

![[${img}]]

${m.description}. ${LAYOUT_PROSE[layout] || ''}

${unlock}

## Setup

${statTable(
    ['Setting', 'Value'],
    [
      ['Grid', `${m.cols} x ${m.rows} (${m.cols * m.rows} cells)`],
      ['Waves', m.waves],
      ['Starting money', `$${m.money}`],
      ['Lives', m.lives],
      ['Difficulty', `${m.difficulty} / 10`],
      ['Layout', `\`${layout}\``],
      ['Spawns', m.spawns],
      ['Campaign slot', `${index + 1} of ${pack.maps.length}`],
      ['Pressure', `\`${m.pressureType}\``]
    ]
  )}

Recommended towers: ${m.recommendedTowers
    .map(id => {
      const t = pack.towers.find(x => x.id === id);
      return t ? `[[${towerTitle(theme, t)}|${t.nm}]]` : id;
    })
    .join(', ')}.

> [!note] The image is the declared grid, not the played maze
> Only \`cols\`, \`rows\` and \`spawns\` are authored here. The actual obstacle
> layout is generated at runtime by \`systems/map.js\` from \`level-layouts.js\`
> plus a seeded RNG, so the paths above are indicative only.

## Links

- Theme: [[${cap(theme)} Theme]]
- Layout family: all \`${layout}\` maps — ${Object.keys(THEMES)
    .flatMap(t =>
      THEMES[t].maps.filter(x => (x.layoutType || x.layout) === layout).map(x => `[[${mapTitle(t, x)}|${x.name}]]`)
    )
    .join(', ')}
- Defined in: \`src/js/config/maps.js\`
`;
}

function projectileNote(theme, key, p, pack) {
  const title = projTitle(theme, key);
  const img = `${theme}-projectile-${slug(key)}.svg`;
  const users = pack.towers.filter(t => t.projectile === key);
  return `${fm(
    { title: `"${title}"`, kind: 'projectile', theme, speed: p.speed },
    ['asset', 'asset/projectile', `theme/${theme}`]
  )}# ${key}

![[${img}]]

${PROJECTILE_PROSE[key] || ''}

## Definition

${statTable(
    ['Field', 'Value'],
    [
      ['Mesh', `\`${p.mesh}\``],
      ['Trail', `\`${p.trail}\``],
      ['Impact', `\`${p.impact}\``],
      ['Colour', `\`${hex(p.color)}\``],
      ['Speed', `${p.speed} u/s`],
      ...(p.curve ? [['Curve', p.curve]] : []),
      ...(p.beam ? [['Beam', 'yes — hits instantly']] : [])
    ]
  )}

Fired by: ${users.map(t => `[[${towerTitle(theme, t)}|${t.nm}]]`).join(', ') || '_nothing_'}.

## Links

- Theme: [[${cap(theme)} Theme]]
- Defined in: \`src/js/config/visual-profiles.js\` → \`${theme}.projectiles.${key}\`
- Consumed by: \`systems/projectiles.js\`, \`rendering/trails.js\`
`;
}

function themeNote(theme, pack) {
  const img = `theme-${theme}.svg`;
  const v = pack.visuals;
  return `${fm(
    { title: `"${cap(theme)} Theme"`, kind: 'theme', id: theme, status: pack.meta.status },
    ['asset', 'asset/theme', `theme/${theme}`]
  )}# ${pack.icon} ${pack.name}

![[${img}]]

${pack.description}

${THEME_PROSE[theme] || ''}

## Contents

${statTable(
    ['', 'Count'],
    [
      ['Towers', `${pack.towers.length} — ${pack.towers.map(t => `[[${towerTitle(theme, t)}|${t.nm}]]`).join(', ')}`],
      ['Enemies', `${pack.enemies.length} — ${pack.enemies.map(e => `[[${enemyTitle(theme, e)}|${e.nm}]]`).join(', ')}`],
      ['Maps', `${pack.maps.length} — ${pack.maps.map(m => `[[${mapTitle(theme, m)}|${m.name}]]`).join(', ')}`],
      ['Projectiles', Object.keys(v.projectiles).map(k => `[[${projTitle(theme, k)}|${k}]]`).join(', ')]
    ]
  )}

## Lighting & atmosphere

${statTable(
    ['Setting', 'Value'],
    [
      ['Exposure', v.lighting.exposure],
      ['Sun intensity', v.lighting.sunIntensity],
      ['Hemi intensity', v.lighting.hemiIntensity],
      ['Rim intensity', v.lighting.rimIntensity],
      ['Fog density', v.map.fogDensity],
      ['Arena', `\`${pack.skins.environment.arena}\` / floor \`${pack.skins.environment.floor}\``],
      ['Status', `\`${pack.meta.status}\``]
    ]
  )}

## Links

- Registered in: \`src/js/config/themes.js\`
- Visual profile: \`src/js/config/visual-profiles.js\`
- [[Asset Index]]
`;
}

// ── Main ───────────────────────────────────────────────────────────────────

// Clear only the directories this script owns. Deliberately NOT a recursive
// wipe of Assets/ — anything a human adds alongside the generated notes should
// survive a regenerate.
for (const dir of ['Towers', 'Enemies', 'Maps', 'Projectiles', 'Themes']) {
  await rm(join(NOTES, dir), { recursive: true, force: true });
}
await rm(join(NOTES, 'Asset Index.md'), { force: true });
await rm(IMG, { recursive: true, force: true });

const index = { towers: [], enemies: [], maps: [], projectiles: [], themes: [] };
const silhouettes = new Map();

for (const [theme, pack] of Object.entries(THEMES)) {
  const v = pack.visuals;

  await put(join(IMG, `theme-${theme}.svg`), themeSvg(theme, pack));
  await put(join(NOTES, 'Themes', `${cap(theme)} Theme.md`), themeNote(theme, pack));
  index.themes.push([theme, pack]);

  for (const td of pack.towers) {
    await put(join(IMG, `${theme}-tower-${td.id}-${slug(td.nm)}.svg`), towerSvg(theme, td, v));
    await put(join(NOTES, 'Towers', `${towerTitle(theme, td)}.md`), towerNote(theme, pack, td));
    index.towers.push([theme, td]);
    const key = silhouetteKey(v.towers.family === 'space' ? 'space' : theme, parseInt(td.id.slice(1)) - 1, td.projectile);
    silhouettes.set(key, [...(silhouettes.get(key) || []), `${theme}/${td.nm}`]);
  }

  for (const e of pack.enemies) {
    await put(join(IMG, `${theme}-enemy-${e.id}-${slug(e.nm)}.svg`), enemySvg(theme, e, v));
    await put(join(NOTES, 'Enemies', `${enemyTitle(theme, e)}.md`), enemyNote(theme, pack, e));
    index.enemies.push([theme, e]);
  }

  for (const [i, m] of pack.maps.entries()) {
    await put(join(IMG, `${theme}-map-${i + 1}-${slug(m.name)}.svg`), mapSvg(theme, m, v));
    await put(join(NOTES, 'Maps', `${mapTitle(theme, m)}.md`), mapNote(theme, pack, m, i));
    index.maps.push([theme, m]);
  }

  for (const [key, p] of Object.entries(v.projectiles)) {
    await put(join(IMG, `${theme}-projectile-${slug(key)}.svg`), projectileSvg(theme, key, p, v));
    await put(join(NOTES, 'Projectiles', `${projTitle(theme, key)}.md`), projectileNote(theme, key, p, pack));
    index.projectiles.push([theme, key]);
  }
}

// ── Index note ─────────────────────────────────────────────────────────────

const shared = [...silhouettes.entries()].filter(([, v]) => v.length > 1);

await put(
  join(NOTES, 'Asset Index.md'),
  `${fm({ title: '"Asset Index"' }, ['asset', 'index'])}# Asset Index

Every asset in the game, generated from \`src/js/config/\`. Nothing here is hand-counted —
re-run \`node docs/vault/tools/generate-vault.mjs\` after changing config and this updates.

**${index.themes.length} themes · ${index.towers.length} towers · ${index.enemies.length} enemies · ${
    index.maps.length
  } maps · ${index.projectiles.length} projectile definitions**

There are no binary assets in this repository — no images, models, audio or fonts.
Every asset is procedural: built from Three.js primitives at runtime, coloured from
[[Hockey Theme|visual profiles]]. See [[Findings]] for what that implies.

## Themes

${statTable(
    ['Theme', 'Status', 'Towers', 'Enemies', 'Maps'],
    index.themes.map(([t, p]) => [
      `[[${cap(t)} Theme]]`,
      `\`${p.meta.status}\``,
      p.towers.length,
      p.enemies.length,
      p.maps.length
    ])
  )}

## Towers

${statTable(
    ['Tower', 'Theme', 'Role', 'Cost', 'DMG L1→L4', 'Range L1', 'Projectile'],
    index.towers.map(([t, td]) => [
      `[[${towerTitle(t, td)}|${td.icon} ${td.nm}]]`,
      t,
      `\`${td.role}\``,
      `$${td.cost}`,
      `${td.dmg[0]}→${td.dmg[3]}`,
      td.rng[0],
      `\`${td.projectile}\``
    ])
  )}

## Enemies

${statTable(
    ['Enemy', 'Theme', 'Role', 'HP', 'Speed', 'Armor', 'Reward', 'Wave'],
    index.enemies.map(([t, e]) => [
      `[[${enemyTitle(t, e)}|${e.nm}]]`,
      t,
      `\`${e.role}\``,
      e.hp,
      e.spd,
      e.armor ? `${(e.armor * 100).toFixed(0)}%` : '—',
      `$${e.rwd}`,
      e.unlockWave
    ])
  )}

## Maps

${statTable(
    ['Map', 'Theme', 'Diff', 'Grid', 'Layout', 'Spawns', 'Waves', 'Lives'],
    index.maps.map(([t, m]) => [
      `[[${mapTitle(t, m)}|${m.name}]]`,
      t,
      m.difficulty,
      `${m.cols}x${m.rows}`,
      `\`${m.layoutType || m.layout}\``,
      m.spawns,
      m.waves,
      m.lives
    ])
  )}

## Projectiles

${statTable(
    ['Projectile', 'Theme', 'Mesh', 'Trail', 'Impact', 'Speed'],
    index.projectiles.map(([t, k]) => {
      const p = THEMES[t].visuals.projectiles[k];
      return [`[[${projTitle(t, k)}|${k}]]`, t, `\`${p.mesh}\``, `\`${p.trail}\``, `\`${p.impact}\``, p.speed];
    })
  )}

## Audio

See [[Audio Assets]] — 12 sounds are registered, and none of the files exist.

## Shared silhouettes

Distinct tower meshes: **${silhouettes.size}** across ${index.towers.length} towers.
These render identically to each other:

${shared.map(([k, v]) => `- \`${k}\` — ${v.join(', ')}`).join('\n')}
`
);

console.log(`Wrote ${written.length} files.`);
console.log(
  `  ${index.themes.length} themes, ${index.towers.length} towers, ${index.enemies.length} enemies, ` +
    `${index.maps.length} maps, ${index.projectiles.length} projectiles`
);
console.log(`  ${silhouettes.size} distinct tower silhouettes (${shared.length} shared by >1 tower)`);
