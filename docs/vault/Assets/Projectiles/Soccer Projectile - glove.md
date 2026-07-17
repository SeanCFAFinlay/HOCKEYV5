---
title: "Soccer Projectile - glove"
kind: projectile
theme: soccer
speed: 8.8
tags:
  - asset
  - asset/projectile
  - theme/soccer
---
# glove

![[soccer-projectile-glove.svg]]

A simple sphere; shared by both goalkeeper towers across themes.

## Definition

| Field | Value |
|---|---|
| Mesh | `sphere` |
| Trail | `aqua` |
| Impact | `save` |
| Colour | `#88eeff` |
| Speed | 8.8 u/s |

Fired by: [[Soccer Tower - Keeper|Keeper]].

## Links

- Theme: [[Soccer Theme]]
- Defined in: `src/js/config/visual-profiles.js` → `soccer.projectiles.glove`
- Consumed by: `systems/projectiles.js`, `rendering/trails.js`
