---
title: "Soccer Enemy - Boss Ball"
kind: enemy
theme: soccer
id: e7
role: BOSS
hp: 2800
tags:
  - asset
  - asset/enemy
  - theme/soccer
  - role/boss
  - threat/ground
  - threat/armor
  - threat/boss
---
# Boss Ball

![[soccer-enemy-e7-boss-ball.svg]]

The largest health pool in the game: 2,800 HP behind 38% armor, moving at 0.32. Boss-wave only.

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

Body `ball`, colour `#ffffff`, accent `#ffd700`, effects `crown`. Resolved through the `boss` slot of the [[Soccer Theme]] visual profile and
built by `createEnemyMesh` in [[rendering-enemy-meshes|rendering/enemy-meshes.js]].

## Links

- Theme: [[Soccer Theme]]
- Threat tags: `ground`, `armor`, `boss`
- Defined in: `src/js/config/enemies.js`
