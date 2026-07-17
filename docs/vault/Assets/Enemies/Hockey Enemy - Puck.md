---
title: "Hockey Enemy - Puck"
kind: enemy
theme: hockey
id: e1
role: SWARM
hp: 50
tags:
  - asset
  - asset/enemy
  - theme/hockey
  - role/swarm
  - threat/ground
  - threat/swarm
---
# Puck

![[hockey-enemy-e1-puck.svg]]

The baseline threat and the tutorial for everything else. Arrives from wave 1 in numbers, with the highest wave weight in the roster.

## Stats

| Stat | Value |
|---|---|
| Base HP | 50 |
| Effective HP | 50 |
| Speed | 2.4 (fast) |
| Reward | $10 (low) |
| Size | 1 |
| Armor | — |
| Unlocks at wave | 1 |
| Wave weight | 1.4 |

Base HP is scaled per wave in `systems/enemies.js`:
`hp * (1 + wave * 0.07 + (wave/25)^1.6 * 0.6)`.


## Appearance

Body `puck`, colour `#111111`, accent `#00d4ff`. Resolved through the `swarm` slot of the [[Hockey Theme]] visual profile and
built by `createEnemyMesh` in [[rendering-enemy-meshes|rendering/enemy-meshes.js]].

## Links

- Theme: [[Hockey Theme]]
- Threat tags: `ground`, `swarm`
- Defined in: `src/js/config/enemies.js`
