---
title: "Space Enemy - Fire Drone"
kind: enemy
theme: space
id: e2
role: FIRE
hp: 65
tags:
  - asset
  - asset/enemy
  - theme/space
  - role/fire
  - threat/ground
  - threat/fire
---
# Fire Drone

![[space-enemy-e2-fire-drone.svg]]

Inherited wholesale from the soccer roster with "Ball" renamed to "Drone" — stats, roles and wave weights are untouched. The space pack has no speedster or bruiser, because those exist only in hockey.

## Stats

| Stat | Value |
|---|---|
| Base HP | 65 |
| Effective HP | 65 |
| Speed | 2.1 (normal) |
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

Body `orb`, colour `#ff5ca8`, accent `#ffd1e3`. Resolved through the `fire` slot of the [[Space Theme]] visual profile and
built by `createEnemyMesh` in [[rendering-enemy-meshes|rendering/enemy-meshes.js]].

## Links

- Theme: [[Space Theme]]
- Threat tags: `ground`, `fire`
- Defined in: `src/js/config/enemies.js`
