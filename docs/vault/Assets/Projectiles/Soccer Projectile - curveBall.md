---
title: "Soccer Projectile - curveBall"
kind: projectile
theme: soccer
speed: 12
tags:
  - asset
  - asset/projectile
  - theme/soccer
---
# curveBall

![[soccer-projectile-curveball.svg]]

The heaviest curve in the game at 0.9 — visibly arcs toward its target.

## Definition

| Field | Value |
|---|---|
| Mesh | `tracer` |
| Trail | `curve` |
| Impact | `spark` |
| Colour | `#88eeff` |
| Speed | 12 u/s |
| Curve | 0.9 |

Fired by: [[Soccer Tower - Free Kick|Free Kick]].

## Links

- Theme: [[Soccer Theme]]
- Defined in: `src/js/config/visual-profiles.js` → `soccer.projectiles.curveBall`
- Consumed by: `systems/projectiles.js`, `rendering/trails.js`
