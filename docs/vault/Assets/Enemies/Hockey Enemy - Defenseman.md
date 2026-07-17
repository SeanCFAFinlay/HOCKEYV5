---
title: "Hockey Enemy - Defenseman"
kind: enemy
theme: hockey
id: e9
role: ARMORED
hp: 350
tags:
  - asset
  - asset/enemy
  - theme/hockey
  - role/armored
  - threat/ground
  - threat/armor
  - threat/tank
---
# Defenseman

![[hockey-enemy-e9-defenseman.svg]]

The heaviest armor in either theme at 45% reduction, on 350 HP. Hockey-only; the soccer pack has no equivalent.

## Stats

| Stat | Value |
|---|---|
| Base HP | 350 |
| Effective HP | 636 |
| Speed | 0.6 (slow) |
| Reward | $50 (medium) |
| Size | 1.6 |
| Armor | 45% |
| Unlocks at wave | 7 |
| Wave weight | 0.45 |

Base HP is scaled per wave in `systems/enemies.js`:
`hp * (1 + wave * 0.07 + (wave/25)^1.6 * 0.6)`.

## Traits

- **Armor** — takes 45% less damage (636 effective HP).

## Appearance

Body `puck`, colour `#1a3f8f`, accent `#bddcff`, effects `armorPlates`. Resolved through the `armored` slot of the [[Hockey Theme]] visual profile and
built by `createEnemyMesh` in [[rendering-enemy-meshes|rendering/enemy-meshes.js]].

## Links

- Theme: [[Hockey Theme]]
- Threat tags: `ground`, `armor`, `tank`
- Defined in: `src/js/config/enemies.js`
