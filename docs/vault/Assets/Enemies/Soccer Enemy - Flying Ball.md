---
title: "Soccer Enemy - Flying Ball"
kind: enemy
theme: soccer
id: e3
role: FLYING
hp: 40
tags:
  - asset
  - asset/enemy
  - theme/soccer
  - role/flying
  - threat/air
  - threat/flying
---
# Flying Ball

![[soccer-enemy-e3-flying-ball.svg]]

The fastest flyer in either theme at 3.0 speed, and the flimsiest at 40 HP. Bypasses pathing entirely.

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

Body `ball`, colour `#c7f9ff`, accent `#44d3ff`, effects `wings`. Resolved through the `flying` slot of the [[Soccer Theme]] visual profile and
built by `createEnemyMesh` in [[rendering-enemy-meshes|rendering/enemy-meshes.js]].

## Links

- Theme: [[Soccer Theme]]
- Threat tags: `air`, `flying`
- Defined in: `src/js/config/enemies.js`
