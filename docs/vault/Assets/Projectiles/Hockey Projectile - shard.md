---
title: "Hockey Projectile - shard"
kind: projectile
theme: hockey
speed: 9.5
tags:
  - asset
  - asset/projectile
  - theme/hockey
---
# shard

![[hockey-projectile-shard.svg]]

An ice shard leaving a frost trail, freezing on contact.

## Definition

| Field | Value |
|---|---|
| Mesh | `shard` |
| Trail | `frost` |
| Impact | `freeze` |
| Colour | `#aaffff` |
| Speed | 9.5 u/s |

Fired by: [[Hockey Tower - Ice Spray|Ice Spray]].

## Links

- Theme: [[Hockey Theme]]
- Defined in: `src/js/config/visual-profiles.js` → `hockey.projectiles.shard`
- Consumed by: `systems/projectiles.js`, `rendering/trails.js`
