---
title: "Hockey Projectile - puck"
kind: projectile
theme: hockey
speed: 10.5
tags:
  - asset
  - asset/projectile
  - theme/hockey
---
# puck

![[hockey-projectile-puck.svg]]

A flat disc with an ice trail and a frost impact.

## Definition

| Field | Value |
|---|---|
| Mesh | `puck` |
| Trail | `ice` |
| Impact | `frost` |
| Colour | `#9be8ff` |
| Speed | 10.5 u/s |

Fired by: [[Hockey Tower - Slap Shot|Slap Shot]].

## Links

- Theme: [[Hockey Theme]]
- Defined in: `src/js/config/visual-profiles.js` → `hockey.projectiles.puck`
- Consumed by: `systems/projectiles.js`, `rendering/trails.js`
