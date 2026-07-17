// Generates the codebase half of the vault by parsing src/js/**/*.js.
//
//   node docs/vault/tools/generate-codebase.mjs
//
// One note per module, carrying its purpose, exports, imports and — the useful
// part — its "imported by" backlinks, so Obsidian's graph view shows the real
// dependency web. Writes docs/vault/Codebase/ only.
//
// This is regex parsing, not a real parser. It is accurate for this codebase's
// style (static top-level imports, `export function|const|class`, `export {}`)
// and would need replacing if the code started doing anything exotic.

import { mkdir, writeFile, readFile, readdir, rm } from 'node:fs/promises';
import { dirname, join, relative, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const VAULT = join(HERE, '..');
const SRC = join(VAULT, '..', '..', 'src', 'js');
const OUT = join(VAULT, 'Codebase');

const LAYER_BLURB = {
  config: 'Static game data. Intended to be a pure leaf layer — you add a content pack by editing these files and nothing else. Two files break that intent.',
  engine: 'Scene, loop, state, input, audio, camera, post-processing. The runtime substrate the rest of the game sits on.',
  rendering: 'Turns game data into Three.js meshes and per-frame visual updates. All art is procedural — there are no model files.',
  systems: 'Game mechanics: pathfinding, waves, towers, enemies, damage, particles, progression, persistence.',
  ui: 'DOM overlay — HUD, screens, modals, tower bar, upgrade sheet, minimap, tooltips.',
  utils: 'Small helpers: seeded RNG, math, device detection, assertions.',
  '.': 'Entry point.'
};

// ── Scan ───────────────────────────────────────────────────────────────────

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (e.name.endsWith('.js')) out.push(p);
  }
  return out;
}

const files = (await walk(SRC)).sort();

const modules = new Map(); // rel path -> record

for (const abs of files) {
  const rel = relative(SRC, abs).replace(/\\/g, '/');
  const src = await readFile(abs, 'utf8');
  const layer = rel.includes('/') ? rel.split('/')[0] : '.';

  // Purpose: the leading line comments, before any code.
  const lead = [];
  for (const line of src.split('\n')) {
    const t = line.trim();
    if (t.startsWith('//')) lead.push(t.replace(/^\/\/\s?/, ''));
    else if (t === '' && lead.length === 0) continue;
    else break;
  }
  const purpose = lead.join(' ').replace(/\s+/g, ' ').trim();

  // Exports.
  const exports = new Set();
  for (const m of src.matchAll(/^export\s+(?:async\s+)?(?:const|let|var|function|class)\s+([A-Za-z0-9_$]+)/gm)) {
    exports.add(m[1]);
  }
  for (const m of src.matchAll(/^export\s*\{([^}]+)\}/gm)) {
    for (const part of m[1].split(',')) {
      const name = part.trim().split(/\s+as\s+/).pop().trim();
      if (name) exports.add(name);
    }
  }

  // Local imports (static + dynamic), resolved to repo-relative module paths.
  const imports = new Set();
  const addImport = spec => {
    if (!spec.startsWith('.')) return;
    const resolved = join(dirname(abs), spec);
    const r = relative(SRC, resolved).replace(/\\/g, '/');
    imports.add(r.endsWith('.js') ? r : `${r}.js`);
  };
  for (const m of src.matchAll(/^\s*import\s[\s\S]*?from\s*['"]([^'"]+)['"]/gm)) addImport(m[1]);
  for (const m of src.matchAll(/import\s*\(\s*['"]([^'"]+)['"]\s*\)/g)) addImport(m[1]);

  modules.set(rel, {
    rel,
    layer,
    purpose,
    exports: [...exports],
    imports: [...imports],
    importedBy: [],
    loc: src.split('\n').length
  });
}

// Backlinks.
for (const m of modules.values()) {
  for (const dep of m.imports) {
    const target = modules.get(dep);
    if (target) target.importedBy.push(m.rel);
  }
}

// ── Naming ─────────────────────────────────────────────────────────────────
// Several basenames collide across layers (towers.js, enemies.js, waves.js and
// settings.js each exist twice), so note names carry the layer.

const noteName = rel => {
  const layer = rel.includes('/') ? rel.split('/')[0] : 'root';
  return `${layer}-${basename(rel, '.js')}`;
};
const link = rel => (modules.has(rel) ? `[[${noteName(rel)}|${rel}]]` : `\`${rel}\``);

// ── Emit ───────────────────────────────────────────────────────────────────

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

const put = async (p, b) => {
  await mkdir(dirname(p), { recursive: true });
  await writeFile(p, b, 'utf8');
};

const table = (head, rows) =>
  [`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`, ...rows.map(r => `| ${r.join(' | ')} |`)].join(
    '\n'
  );

for (const m of modules.values()) {
  const name = noteName(m.rel);
  const fanIn = m.importedBy.length;
  const fanOut = m.imports.length;

  await put(
    join(OUT, 'Modules', `${name}.md`),
    `---
title: "${m.rel}"
layer: ${m.layer}
loc: ${m.loc}
fan_in: ${fanIn}
fan_out: ${fanOut}
tags:
  - code
  - layer/${m.layer === '.' ? 'root' : m.layer}
---
# \`${m.rel}\`

${m.purpose || '_No leading comment._'}

**${m.loc} lines · imports ${fanOut} · imported by ${fanIn}**

## Exports

${m.exports.length ? m.exports.map(e => `- \`${e}\``).join('\n') : '_None — side-effect module._'}

## Imports

${m.imports.length ? m.imports.map(d => `- ${link(d)}`).join('\n') : '_None. This is a leaf module._'}

## Imported by

${m.importedBy.length ? m.importedBy.map(d => `- ${link(d)}`).join('\n') : '> [!warning] Nothing imports this module.'}

## Links

- Layer: [[Layer - ${m.layer === '.' ? 'Root' : m.layer[0].toUpperCase() + m.layer.slice(1)}]]
- [[Codebase Map]]
`
  );
}

// Layer notes.
const layers = [...new Set([...modules.values()].map(m => m.layer))].sort();
for (const layer of layers) {
  const mods = [...modules.values()].filter(m => m.layer === layer).sort((a, b) => b.importedBy.length - a.importedBy.length);
  const title = layer === '.' ? 'Root' : layer[0].toUpperCase() + layer.slice(1);
  await put(
    join(OUT, `Layer - ${title}.md`),
    `---
title: "Layer - ${title}"
tags:
  - code
  - layer-index
---
# ${layer === '.' ? 'Entry point' : `\`${layer}/\``}

${LAYER_BLURB[layer] || ''}

**${mods.length} modules · ${mods.reduce((a, m) => a + m.loc, 0)} lines**

${table(
      ['Module', 'Purpose', 'LOC', 'In', 'Out'],
      mods.map(m => [
        `[[${noteName(m.rel)}\\|${basename(m.rel)}]]`,
        (m.purpose || '').slice(0, 96).replace(/\|/g, '\\|') || '—',
        m.loc,
        m.importedBy.length,
        m.imports.length
      ])
    )}

[[Codebase Map]]
`
  );
}

// ── Codebase Map ───────────────────────────────────────────────────────────

const byFanIn = [...modules.values()].sort((a, b) => b.importedBy.length - a.importedBy.length);
const orphans = [...modules.values()].filter(m => m.importedBy.length === 0 && m.rel !== 'main.js');
const leaves = [...modules.values()].filter(m => m.imports.length === 0);

// Layer-to-layer edge counts, to show what the layering actually is.
const edges = new Map();
for (const m of modules.values()) {
  for (const dep of m.imports) {
    const t = modules.get(dep);
    if (!t || t.layer === m.layer) continue;
    const k = `${m.layer}->${t.layer}`;
    edges.set(k, (edges.get(k) || 0) + 1);
  }
}

const mermaidLayers = [...edges.entries()]
  .sort((a, b) => b[1] - a[1])
  .map(([k, n]) => {
    const [from, to] = k.split('->');
    return `  ${from === '.' ? 'main' : from} -->|${n}| ${to === '.' ? 'main' : to}`;
  })
  .join('\n');

await put(
  join(OUT, 'Codebase Map.md'),
  `---
title: "Codebase Map"
tags:
  - code
  - index
---
# Codebase Map

A dual-theme 3D tower defense game: vanilla ES modules, Three.js r128 from a CDN,
Vite for dev/build, Vitest for tests. No framework, no bundled dependencies,
**no binary assets** — see [[Asset Index]].

**${modules.size} modules · ${[...modules.values()].reduce((a, m) => a + m.loc, 0)} lines**

${table(
    ['Layer', 'Modules', 'Lines'],
    layers.map(l => {
      const mods = [...modules.values()].filter(m => m.layer === l);
      const title = l === '.' ? 'Root' : l[0].toUpperCase() + l.slice(1);
      return [`[[Layer - ${title}]]`, mods.length, mods.reduce((a, m) => a + m.loc, 0)];
    })
  )}

## How a frame runs

\`\`\`mermaid
flowchart LR
  input[engine/input.js] --> state[engine/state.js]
  loop[engine/loop.js] --> waves[systems/waves.js]
  waves --> enemies[systems/enemies.js]
  loop --> towers[systems/towers.js]
  towers --> projectiles[systems/projectiles.js]
  projectiles --> damage[systems/damage.js]
  damage --> particles[systems/particles.js]
  loop --> anim[rendering/animations.js]
  loop --> hud[ui/hud.js]
  state -.-> loop
  state -.-> hud
\`\`\`

\`engine/loop.js\` is a fixed-timestep accumulator. Every system update is called
from it; nothing schedules itself with \`setTimeout\`.

## Actual layer dependencies

Edge labels are import counts. Note the arrows going *both* ways between
\`engine\`, \`rendering\`, \`systems\` and \`ui\` — the nominal layering does not hold.

\`\`\`mermaid
flowchart TD
${mermaidLayers}
\`\`\`

## Hub modules

\`engine/state.js\` is the de facto root of the whole program: it imports only
\`events.js\`, and nearly everything else imports it.

${table(
    ['Module', 'Imported by', 'Imports'],
    byFanIn.slice(0, 12).map(m => [`[[${noteName(m.rel)}\\|${m.rel}]]`, m.importedBy.length, m.imports.length])
  )}

## Leaf modules

${leaves.length} modules import nothing local and are safe to reason about in isolation:

${leaves.map(m => `[[${noteName(m.rel)}|${m.rel}]]`).join(' · ')}

## Modules nothing imports

${orphans.length ? orphans.map(m => `- [[${noteName(m.rel)}|${m.rel}]]`).join('\n') : '_None._'}

See [[Findings]] for what these are and whether they matter.

## Links

- [[Asset Index]] — the data these modules consume
- [[Findings]] — discrepancies found while mapping
- [[Home]]
`
);

console.log(`Wrote ${modules.size} module notes + ${layers.length} layer notes + map.`);
console.log(`  orphans: ${orphans.map(m => m.rel).join(', ') || 'none'}`);
console.log(`  top hub: ${byFanIn[0].rel} (${byFanIn[0].importedBy.length} inbound)`);
