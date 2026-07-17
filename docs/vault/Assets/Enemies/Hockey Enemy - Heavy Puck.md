---
title: "Hockey Enemy - Heavy Puck"
kind: enemy
theme: hockey
id: e4
role: ARMORED
hp: 250
tags:
  - asset
  - asset/enemy
  - theme/hockey
  - role/armored
  - threat/ground
  - threat/armor
  - threat/tank
---
# Heavy Puck

![[hockey-enemy-e4-heavy-puck.svg]]

The first real wall: 5x a Puck's HP behind 40% damage reduction, moving at under a third of the speed. Tests whether you built sustained DPS or just burst.

## Stats

| Stat | Value |
|---|---|
| Base HP | 250 |
| Effective HP | 417 |
| Speed | 0.7 (slow) |
| Reward | $40 (medium) |
| Size | 1.4 |
| Armor | 40% |
| Unlocks at wave | 6 |
| Wave weight | 0.55 |

Base HP is scaled per wave in `systems/enemies.js`:
`hp * (1 + wave * 0.07 + (wave/25)^1.6 * 0.6)`.

## Traits

- **Armor** — takes 40% less damage (417 effective HP).

## Appearance

Body `puck`, colour `#1a3f8f`, accent `#bddcff`, effects `armorPlates`. Resolved through the `armored` slot of the [[Hockey Theme]] visual profile and
built by `createEnemyMesh` in [[rendering-enemy-meshes|rendering/enemy-meshes.js]].

## Links

- Theme: [[Hockey Theme]]
- Threat tags: `ground`, `armor`, `tank`
- Defined in: `src/js/config/enemies.js`
