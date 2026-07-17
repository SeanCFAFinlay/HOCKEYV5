---
title: "Space Projectile - headButt"
kind: projectile
theme: space
speed: 8
tags:
  - asset
  - asset/projectile
  - theme/space
---
# headButt

![[space-projectile-headbutt.svg]]

An expanding ring with a shockwave trail.

## Definition

| Field | Value |
|---|---|
| Mesh | `ring` |
| Trail | `gravity` |
| Impact | `gravity` |
| Colour | `#7dd3fc` |
| Speed | 8 u/s |

Fired by: [[Space Tower - Gravity Well|Gravity Well]].

## Links

- Theme: [[Space Theme]]
- Defined in: `src/js/config/visual-profiles.js` → `space.projectiles.headButt`
- Consumed by: `systems/projectiles.js`, `rendering/trails.js`
