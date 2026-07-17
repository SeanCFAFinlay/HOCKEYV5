---
title: "Space Enemy - Flying Drone"
kind: enemy
theme: space
id: e3
role: FLYING
hp: 40
tags:
  - asset
  - asset/enemy
  - theme/space
  - role/flying
  - threat/air
  - threat/flying
---
# Flying Drone

![[space-enemy-e3-flying-drone.svg]]

Inherited wholesale from the soccer roster with "Ball" renamed to "Drone" — stats, roles and wave weights are untouched. The space pack has no speedster or bruiser, because those exist only in hockey.

## Stats

| Stat | Value |
|---|---|
| Base HP | 40 |
| Effective HP | 40 |
| Speed | 3 (fast) |
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

Body `orb`, colour `#93c5fd`, accent `#67e8f9`, effects `wings`. Resolved through the `flying` slot of the [[Space Theme]] visual profile and
built by `createEnemyMesh` in [[rendering-enemy-meshes|rendering/enemy-meshes.js]].

## Links

- Theme: [[Space Theme]]
- Threat tags: `air`, `flying`
- Defined in: `src/js/config/enemies.js`
