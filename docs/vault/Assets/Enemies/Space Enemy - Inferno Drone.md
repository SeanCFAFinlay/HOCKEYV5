---
title: "Space Enemy - Inferno Drone"
kind: enemy
theme: space
id: e5
role: ELITE
hp: 450
tags:
  - asset
  - asset/enemy
  - theme/space
  - role/elite
  - threat/ground
  - threat/fire
  - threat/armor
  - threat/elite
---
# Inferno Drone

![[space-enemy-e5-inferno-drone.svg]]

Inherited wholesale from the soccer roster with "Ball" renamed to "Drone" — stats, roles and wave weights are untouched. The space pack has no speedster or bruiser, because those exist only in hockey.

## Stats

| Stat | Value |
|---|---|
| Base HP | 450 |
| Effective HP | 692 |
| Speed | 0.5 (slow) |
| Reward | $65 (high) |
| Size | 1.5 |
| Armor | 35% |
| Unlocks at wave | 10 |
| Wave weight | 0.35 |

Base HP is scaled per wave in `systems/enemies.js`:
`hp * (1 + wave * 0.07 + (wave/25)^1.6 * 0.6)`.

## Traits

- **Armor** — takes 35% less damage (692 effective HP).
- **Fire** — burn effect on death.

## Appearance

Body `orb`, colour `#7c3aed`, accent `#ff5ca8`, effects `armorPlates`. Resolved through the `elite` slot of the [[Space Theme]] visual profile and
built by `createEnemyMesh` in [[rendering-enemy-meshes|rendering/enemy-meshes.js]].

## Links

- Theme: [[Space Theme]]
- Threat tags: `ground`, `fire`, `armor`, `elite`
- Defined in: `src/js/config/enemies.js`
