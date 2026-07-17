---
title: "Hockey Enemy - Hot Puck"
kind: enemy
theme: hockey
id: e2
role: FIRE
hp: 70
tags:
  - asset
  - asset/enemy
  - theme/hockey
  - role/fire
  - threat/ground
  - threat/fire
---
# Hot Puck

![[hockey-enemy-e2-hot-puck.svg]]

A Puck that burns. Slower and tougher than the base, and the first enemy that punishes stacking everything into single-target damage.

## Stats

| Stat | Value |
|---|---|
| Base HP | 70 |
| Effective HP | 70 |
| Speed | 2 (normal) |
| Reward | $15 (low) |
| Size | 1 |
| Armor | — |
| Unlocks at wave | 2 |
| Wave weight | 0.9 |

Base HP is scaled per wave in `systems/enemies.js`:
`hp * (1 + wave * 0.07 + (wave/25)^1.6 * 0.6)`.

## Traits

- **Fire** — burn effect on death.

## Appearance

Body `puck`, colour `#ff3b18`, accent `#ffd166`. Resolved through the `fire` slot of the [[Hockey Theme]] visual profile and
built by `createEnemyMesh` in [[rendering-enemy-meshes|rendering/enemy-meshes.js]].

## Links

- Theme: [[Hockey Theme]]
- Threat tags: `ground`, `fire`
- Defined in: `src/js/config/enemies.js`
