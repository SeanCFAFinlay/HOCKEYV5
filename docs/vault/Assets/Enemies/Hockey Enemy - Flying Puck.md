---
title: "Hockey Enemy - Flying Puck"
kind: enemy
theme: hockey
id: e3
role: FLYING
hp: 45
tags:
  - asset
  - asset/enemy
  - theme/hockey
  - role/flying
  - threat/air
  - threat/flying
---
# Flying Puck

![[hockey-enemy-e3-flying-puck.svg]]

Ignores the maze entirely — flying enemies bypass pathing, so every wall you built stops mattering. Rewards slightly more than a ground Puck to compensate for the defences it walks past.

## Stats

| Stat | Value |
|---|---|
| Base HP | 45 |
| Effective HP | 45 |
| Speed | 2.8 (fast) |
| Reward | $14 (low) |
| Size | 0.9 |
| Armor | — |
| Unlocks at wave | 4 |
| Wave weight | 0.75 |

Base HP is scaled per wave in `systems/enemies.js`:
`hp * (1 + wave * 0.07 + (wave/25)^1.6 * 0.6)`.

## Traits

- **Flying** — ignores obstacles and pathing entirely.

## Appearance

Body `puck`, colour `#77ccff`, accent `#d9f7ff`, effects `wings`. Resolved through the `flying` slot of the [[Hockey Theme]] visual profile and
built by `createEnemyMesh` in [[rendering-enemy-meshes|rendering/enemy-meshes.js]].

## Links

- Theme: [[Hockey Theme]]
- Threat tags: `air`, `flying`
- Defined in: `src/js/config/enemies.js`
