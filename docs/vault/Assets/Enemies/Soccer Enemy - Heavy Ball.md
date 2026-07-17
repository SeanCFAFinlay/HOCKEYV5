---
title: "Soccer Enemy - Heavy Ball"
kind: enemy
theme: soccer
id: e4
role: ARMORED
hp: 280
tags:
  - asset
  - asset/enemy
  - theme/soccer
  - role/armored
  - threat/ground
  - threat/armor
  - threat/tank
---
# Heavy Ball

![[soccer-enemy-e4-heavy-ball.svg]]

Tankier than its hockey counterpart (280 HP) with more armor (45%). The soccer pack's sustained-DPS check.

## Stats

| Stat | Value |
|---|---|
| Base HP | 280 |
| Effective HP | 509 |
| Speed | 0.65 (slow) |
| Reward | $40 (medium) |
| Size | 1.4 |
| Armor | 45% |
| Unlocks at wave | 6 |
| Wave weight | 0.55 |

Base HP is scaled per wave in `systems/enemies.js`:
`hp * (1 + wave * 0.07 + (wave/25)^1.6 * 0.6)`.

## Traits

- **Armor** — takes 45% less damage (509 effective HP).

## Appearance

Body `ball`, colour `#264d2e`, accent `#d9f99d`, effects `armorPlates`. Resolved through the `armored` slot of the [[Soccer Theme]] visual profile and
built by `createEnemyMesh` in [[rendering-enemy-meshes|rendering/enemy-meshes.js]].

## Links

- Theme: [[Soccer Theme]]
- Threat tags: `ground`, `armor`, `tank`
- Defined in: `src/js/config/enemies.js`
