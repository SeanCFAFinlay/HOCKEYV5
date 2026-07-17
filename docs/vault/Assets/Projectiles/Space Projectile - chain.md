---
title: "Space Projectile - chain"
kind: projectile
theme: space
speed: 15
tags:
  - asset
  - asset/projectile
  - theme/space
---
# chain

![[space-projectile-chain.svg]]

A beam that arcs between targets on an electric trail.

## Definition

| Field | Value |
|---|---|
| Mesh | `beam` |
| Trail | `electric` |
| Impact | `chain` |
| Colour | `#f0abfc` |
| Speed | 15 u/s |

Fired by: [[Space Tower - Arc Relay|Arc Relay]].

## Links

- Theme: [[Space Theme]]
- Defined in: `src/js/config/visual-profiles.js` → `space.projectiles.chain`
- Consumed by: `systems/projectiles.js`, `rendering/trails.js`
