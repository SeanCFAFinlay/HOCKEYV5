---
title: "Space Enemy - Drone"
kind: enemy
theme: space
id: e1
role: SWARM
hp: 45
tags:
  - asset
  - asset/enemy
  - theme/space
  - role/swarm
  - threat/ground
  - threat/swarm
---
# Drone

![[space-enemy-e1-drone.svg]]

Inherited wholesale from the soccer roster with "Ball" renamed to "Drone" — stats, roles and wave weights are untouched. The space pack has no speedster or bruiser, because those exist only in hockey.

## Stats

| Stat | Value |
|---|---|
| Base HP | 45 |
| Effective HP | 45 |
| Speed | 2.5 (fast) |
| Reward | $10 (low) |
| Size | 1 |
| Armor | — |
| Unlocks at wave | 1 |
| Wave weight | 1.4 |

Base HP is scaled per wave in `systems/enemies.js`:
`hp * (1 + wave * 0.07 + (wave/25)^1.6 * 0.6)`.


## Appearance

Body `orb`, colour `#67e8f9`, accent `#ffffff`. Resolved through the `swarm` slot of the [[Space Theme]] visual profile and
built by `createEnemyMesh` in [[rendering-enemy-meshes|rendering/enemy-meshes.js]].

## Links

- Theme: [[Space Theme]]
- Threat tags: `ground`, `swarm`
- Defined in: `src/js/config/enemies.js`
