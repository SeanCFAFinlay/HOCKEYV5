---
title: "Space Projectile - curveBall"
kind: projectile
theme: space
speed: 12
tags:
  - asset
  - asset/projectile
  - theme/space
---
# curveBall

![[space-projectile-curveball.svg]]

The heaviest curve in the game at 0.9 — visibly arcs toward its target.

## Definition

| Field | Value |
|---|---|
| Mesh | `plasma` |
| Trail | `plasma` |
| Impact | `plasma` |
| Colour | `#c084fc` |
| Speed | 12 u/s |

Fired by: [[Space Tower - Plasma Cannon|Plasma Cannon]].

## Links

- Theme: [[Space Theme]]
- Defined in: `src/js/config/visual-profiles.js` → `space.projectiles.curveBall`
- Consumed by: `systems/projectiles.js`, `rendering/trails.js`
