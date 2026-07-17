---
title: "Soccer Projectile - tackle"
kind: projectile
theme: soccer
speed: 9
tags:
  - asset
  - asset/projectile
  - theme/soccer
---
# tackle

![[soccer-projectile-tackle.svg]]

A cone kicking up a dust trail.

## Definition

| Field | Value |
|---|---|
| Mesh | `cone` |
| Trail | `dust` |
| Impact | `slam` |
| Colour | `#b58a32` |
| Speed | 9 u/s |

Fired by: [[Soccer Tower - Tackle|Tackle]].

## Links

- Theme: [[Soccer Theme]]
- Defined in: `src/js/config/visual-profiles.js` → `soccer.projectiles.tackle`
- Consumed by: `systems/projectiles.js`, `rendering/trails.js`
