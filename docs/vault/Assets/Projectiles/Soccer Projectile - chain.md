---
title: "Soccer Projectile - chain"
kind: projectile
theme: soccer
speed: 13
tags:
  - asset
  - asset/projectile
  - theme/soccer
---
# chain

![[soccer-projectile-chain.svg]]

A beam that arcs between targets on an electric trail.

## Definition

| Field | Value |
|---|---|
| Mesh | `beam` |
| Trail | `electric` |
| Impact | `chain` |
| Colour | `#ffffff` |
| Speed | 13 u/s |

Fired by: [[Soccer Tower - Playmaker|Playmaker]].

## Links

- Theme: [[Soccer Theme]]
- Defined in: `src/js/config/visual-profiles.js` → `soccer.projectiles.chain`
- Consumed by: `systems/projectiles.js`, `rendering/trails.js`
