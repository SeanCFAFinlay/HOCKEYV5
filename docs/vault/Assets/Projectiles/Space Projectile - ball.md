---
title: "Space Projectile - ball"
kind: projectile
theme: space
speed: 20
tags:
  - asset
  - asset/projectile
  - theme/space
---
# ball

![[space-projectile-ball.svg]]

A spinning ball with a grass-kick impact and a slight curve. In the space pack this same key becomes an instant laser beam instead.

## Definition

| Field | Value |
|---|---|
| Mesh | `laser` |
| Trail | `laser` |
| Impact | `spark` |
| Colour | `#67e8f9` |
| Speed | 20 u/s |
| Beam | yes — hits instantly |

Fired by: [[Space Tower - Laser Emitter|Laser Emitter]].

## Links

- Theme: [[Space Theme]]
- Defined in: `src/js/config/visual-profiles.js` → `space.projectiles.ball`
- Consumed by: `systems/projectiles.js`, `rendering/trails.js`
