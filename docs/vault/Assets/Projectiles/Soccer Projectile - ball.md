---
title: "Soccer Projectile - ball"
kind: projectile
theme: soccer
speed: 9.5
tags:
  - asset
  - asset/projectile
  - theme/soccer
---
# ball

![[soccer-projectile-ball.svg]]

A spinning ball with a grass-kick impact and a slight curve. In the space pack this same key becomes an instant laser beam instead.

## Definition

| Field | Value |
|---|---|
| Mesh | `ball` |
| Trail | `spin` |
| Impact | `grassKick` |
| Colour | `#ffffff` |
| Speed | 9.5 u/s |
| Curve | 0.55 |

Fired by: [[Soccer Tower - Striker|Striker]].

## Links

- Theme: [[Soccer Theme]]
- Defined in: `src/js/config/visual-profiles.js` → `soccer.projectiles.ball`
- Consumed by: `systems/projectiles.js`, `rendering/trails.js`
