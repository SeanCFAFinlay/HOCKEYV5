---
title: "Home"
tags:
  - index
---
# Hockey vs Soccer TD — Vault

A map of this repository: what the code is, and what the game is made of.

Open `docs/vault/` as an Obsidian vault (Open folder as vault). Graph view is the
point — every asset links to its theme, its role siblings and the module that
builds it; every module links to what it imports and what imports it.

## Start here

- **[[Codebase Map]]** — 66 modules, how a frame runs, what the layering actually is
- **[[Asset Index]]** — every tower, enemy, map, projectile and theme, with pictures
- **[[Findings]]** — 10 bugs fixed, 13 still open

## The game in one paragraph

A 3D tower defense built on vanilla ES modules and Three.js r128 loaded from a
CDN, with Vite for dev/build and Vitest for tests. You pick a content pack
(hockey, soccer, or the stub space pack), play a campaign of maps, place towers
on a grid, and A* re-paths enemies around whatever you build. There are three
content packs, 24 towers, 24 enemies and 23 maps — and **not one image, model,
audio file or font in the repository**. Every visible thing is built from
Three.js primitives at runtime and coloured from a per-theme visual profile.

## Layout

| Folder | What |
|---|---|
| [[Codebase Map\|Codebase/]] | One note per module, plus a note per layer |
| [[Asset Index\|Assets/]] | One note per asset, each with a generated picture |
| `media/` | Generated SVGs — do not edit by hand |
| `tools/` | The generators. See [[Regenerating]] |

## Reading order, if you're new to the code

1. [[Codebase Map]] — get the shape
2. [[engine-state|engine/state.js]] — everything hangs off this
3. [[engine-loop|engine/loop.js]] — the fixed-timestep loop that drives every system
4. [[config-themes|config/themes.js]] — how a content pack is assembled
5. [[Hockey Theme]] — then follow the links out to towers and enemies

## Caveats

The pictures are **schematics, not renders** — see [[Regenerating]] for exactly
what that means and what they're derived from.
