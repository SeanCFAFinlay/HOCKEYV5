---
title: "Space Enemy - Heavy Drone"
kind: enemy
theme: space
id: e4
role: ARMORED
hp: 280
tags:
  - asset
  - asset/enemy
  - theme/space
  - role/armored
  - threat/ground
  - threat/armor
  - threat/tank
---
# Heavy Drone

![[space-enemy-e4-heavy-drone.svg]]

Inherited wholesale from the soccer roster with "Ball" renamed to "Drone" — stats, roles and wave weights are untouched. The space pack has no speedster or bruiser, because those exist only in hockey.

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

Body `orb`, colour `#4c1d95`, accent `#c084fc`, effects `armorPlates`. Resolved through the `armored` slot of the [[Space Theme]] visual profile and
built by `createEnemyMesh` in [[rendering-enemy-meshes|rendering/enemy-meshes.js]].

## Links

- Theme: [[Space Theme]]
- Threat tags: `ground`, `armor`, `tank`
- Defined in: `src/js/config/enemies.js`
