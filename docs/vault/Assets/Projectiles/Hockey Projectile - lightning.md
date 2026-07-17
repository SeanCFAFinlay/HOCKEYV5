---
title: "Hockey Projectile - lightning"
kind: projectile
theme: hockey
speed: 16
tags:
  - asset
  - asset/projectile
  - theme/hockey
---
# lightning

![[hockey-projectile-lightning.svg]]

The fastest hockey projectile at 16 u/s, arcing between chained targets.

## Definition

| Field | Value |
|---|---|
| Mesh | `bolt` |
| Trail | `electric` |
| Impact | `chain` |
| Colour | `#e6ff4a` |
| Speed | 16 u/s |

Fired by: [[Hockey Tower - Power Play|Power Play]].

## Links

- Theme: [[Hockey Theme]]
- Defined in: `src/js/config/visual-profiles.js` → `hockey.projectiles.lightning`
- Consumed by: `systems/projectiles.js`, `rendering/trails.js`
