---
title: "Hockey Projectile - star"
kind: projectile
theme: hockey
speed: 11.5
tags:
  - asset
  - asset/projectile
  - theme/hockey
---
# star

![[hockey-projectile-star.svg]]

The crit projectile — gold trail, crit impact.

## Definition

| Field | Value |
|---|---|
| Mesh | `star` |
| Trail | `gold` |
| Impact | `crit` |
| Colour | `#ffd700` |
| Speed | 11.5 u/s |

Fired by: [[Hockey Tower - Captain|Captain]].

## Links

- Theme: [[Hockey Theme]]
- Defined in: `src/js/config/visual-profiles.js` → `hockey.projectiles.star`
- Consumed by: `systems/projectiles.js`, `rendering/trails.js`
