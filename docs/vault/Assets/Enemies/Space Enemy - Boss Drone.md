---
title: "Space Enemy - Boss Drone"
kind: enemy
theme: space
id: e7
role: BOSS
hp: 2800
tags:
  - asset
  - asset/enemy
  - theme/space
  - role/boss
  - threat/ground
  - threat/armor
  - threat/boss
---
# Boss Drone

![[space-enemy-e7-boss-drone.svg]]

Inherited wholesale from the soccer roster with "Ball" renamed to "Drone" — stats, roles and wave weights are untouched. The space pack has no speedster or bruiser, because those exist only in hockey.

## Stats

| Stat | Value |
|---|---|
| Base HP | 2800 |
| Effective HP | 4516 |
| Speed | 0.32 (slow) |
| Reward | $380 (boss) |
| Size | 2.2 |
| Armor | 38% |
| Unlocks at wave | 5 |
| Wave weight | 0.08 |

Base HP is scaled per wave in `systems/enemies.js`:
`hp * (1 + wave * 0.07 + (wave/25)^1.6 * 0.6)`.

## Traits

- **Armor** — takes 38% less damage (4516 effective HP).
- **Boss** — spawns only on boss waves.

## Appearance

Body `orb`, colour `#111827`, accent `#ffd700`, effects `crown`. Resolved through the `boss` slot of the [[Space Theme]] visual profile and
built by `createEnemyMesh` in [[rendering-enemy-meshes|rendering/enemy-meshes.js]].

## Links

- Theme: [[Space Theme]]
- Threat tags: `ground`, `armor`, `boss`
- Defined in: `src/js/config/enemies.js`
