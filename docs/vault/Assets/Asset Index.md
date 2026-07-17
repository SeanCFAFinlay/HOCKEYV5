---
title: "Asset Index"
tags:
  - asset
  - index
---
# Asset Index

Every asset in the game, generated from `src/js/config/`. Nothing here is hand-counted —
re-run `node docs/vault/tools/generate-vault.mjs` after changing config and this updates.

**3 themes · 24 towers · 24 enemies · 23 maps · 24 projectile definitions**

There are no binary assets in this repository — no images, models, audio or fonts.
Every asset is procedural: built from Three.js primitives at runtime, coloured from
[[Hockey Theme|visual profiles]]. See [[Findings]] for what that implies.

## Themes

| Theme | Status | Towers | Enemies | Maps |
|---|---|---|---|---|
| [[Hockey Theme]] | `playable` | 8 | 10 | 10 |
| [[Soccer Theme]] | `playable` | 8 | 7 | 10 |
| [[Space Theme]] | `stub-playable` | 8 | 7 | 3 |

## Towers

| Tower | Theme | Role | Cost | DMG L1→L4 | Range L1 | Projectile |
|---|---|---|---|---|---|---|
| [[Hockey Tower - Slap Shot|🏒 Slap Shot]] | hockey | `ANTI-SWARM` | $80 | 25→90 | 2.8 | `puck` |
| [[Hockey Tower - Sniper|🎯 Sniper]] | hockey | `SNIPER` | $150 | 70→250 | 4.5 | `dart` |
| [[Hockey Tower - Enforcer|👊 Enforcer]] | hockey | `SPLASH` | $120 | 45→160 | 2.5 | `hammer` |
| [[Hockey Tower - Ice Spray|❄️ Ice Spray]] | hockey | `CROWD_CONTROL` | $90 | 18→60 | 3 | `shard` |
| [[Hockey Tower - Goalie|🥅 Goalie]] | hockey | `CHOKEPOINT` | $200 | 100→350 | 2 | `glove` |
| [[Hockey Tower - Power Play|⚡ Power Play]] | hockey | `CHAIN` | $160 | 35→125 | 3.5 | `lightning` |
| [[Hockey Tower - Hot Stick|🔥 Hot Stick]] | hockey | `DOT` | $140 | 15→52 | 2.6 | `fireball` |
| [[Hockey Tower - Captain|👑 Captain]] | hockey | `BOSS_KILLER` | $280 | 200→720 | 5.5 | `star` |
| [[Soccer Tower - Striker|⚽ Striker]] | soccer | `ANTI-SWARM` | $80 | 28→100 | 2.6 | `ball` |
| [[Soccer Tower - Free Kick|🎯 Free Kick]] | soccer | `SNIPER` | $150 | 75→265 | 4.8 | `curveBall` |
| [[Soccer Tower - Header|🤕 Header]] | soccer | `SPLASH` | $120 | 50→178 | 2.8 | `headButt` |
| [[Soccer Tower - Tackle|🦶 Tackle]] | soccer | `CROWD_CONTROL` | $90 | 20→70 | 2.8 | `tackle` |
| [[Soccer Tower - Keeper|🧤 Keeper]] | soccer | `CHOKEPOINT` | $200 | 110→385 | 1.8 | `glove` |
| [[Soccer Tower - Playmaker|🔄 Playmaker]] | soccer | `CHAIN` | $160 | 38→135 | 3.8 | `chain` |
| [[Soccer Tower - Flare|🔥 Flare]] | soccer | `DOT` | $140 | 16→58 | 2.4 | `flare` |
| [[Soccer Tower - Legend|👑 Legend]] | soccer | `BOSS_KILLER` | $280 | 220→790 | 5.2 | `legend` |
| [[Space Tower - Laser Emitter|🔷 Laser Emitter]] | space | `ANTI-SWARM` | $80 | 28→100 | 2.6 | `ball` |
| [[Space Tower - Plasma Cannon|🟣 Plasma Cannon]] | space | `SNIPER` | $150 | 75→265 | 4.8 | `curveBall` |
| [[Space Tower - Gravity Well|🌀 Gravity Well]] | space | `SPLASH` | $120 | 50→178 | 2.8 | `headButt` |
| [[Space Tower - Ion Snare|⚛️ Ion Snare]] | space | `CROWD_CONTROL` | $90 | 20→70 | 2.8 | `tackle` |
| [[Space Tower - Shield Node|🛡️ Shield Node]] | space | `CHOKEPOINT` | $200 | 110→385 | 1.8 | `glove` |
| [[Space Tower - Arc Relay|⚡ Arc Relay]] | space | `CHAIN` | $160 | 38→135 | 3.8 | `chain` |
| [[Space Tower - Nova Flare|☄️ Nova Flare]] | space | `DOT` | $140 | 16→58 | 2.4 | `flare` |
| [[Space Tower - Command Core|✦ Command Core]] | space | `BOSS_KILLER` | $280 | 220→790 | 5.2 | `legend` |

## Enemies

| Enemy | Theme | Role | HP | Speed | Armor | Reward | Wave |
|---|---|---|---|---|---|---|---|
| [[Hockey Enemy - Puck|Puck]] | hockey | `SWARM` | 50 | 2.4 | — | $10 | 1 |
| [[Hockey Enemy - Hot Puck|Hot Puck]] | hockey | `FIRE` | 70 | 2 | — | $15 | 2 |
| [[Hockey Enemy - Flying Puck|Flying Puck]] | hockey | `FLYING` | 45 | 2.8 | — | $14 | 4 |
| [[Hockey Enemy - Heavy Puck|Heavy Puck]] | hockey | `ARMORED` | 250 | 0.7 | 40% | $40 | 6 |
| [[Hockey Enemy - Inferno Puck|Inferno Puck]] | hockey | `ELITE` | 400 | 0.55 | 30% | $65 | 10 |
| [[Hockey Enemy - Flying Fire|Flying Fire]] | hockey | `FLYING_FIRE` | 120 | 2.2 | — | $28 | 12 |
| [[Hockey Enemy - Boss Puck|Boss Puck]] | hockey | `BOSS` | 2500 | 0.35 | 35% | $380 | 5 |
| [[Hockey Enemy - Speed Skater|Speed Skater]] | hockey | `SPEEDSTER` | 35 | 3.5 | — | $12 | 4 |
| [[Hockey Enemy - Defenseman|Defenseman]] | hockey | `ARMORED` | 350 | 0.6 | 45% | $50 | 7 |
| [[Hockey Enemy - Enforcer|Enforcer]] | hockey | `BRUISER` | 180 | 1.5 | 25% | $35 | 6 |
| [[Soccer Enemy - Ball|Ball]] | soccer | `SWARM` | 45 | 2.5 | — | $10 | 1 |
| [[Soccer Enemy - Fire Ball|Fire Ball]] | soccer | `FIRE` | 65 | 2.1 | — | $15 | 2 |
| [[Soccer Enemy - Flying Ball|Flying Ball]] | soccer | `FLYING` | 40 | 3 | — | $14 | 4 |
| [[Soccer Enemy - Heavy Ball|Heavy Ball]] | soccer | `ARMORED` | 280 | 0.65 | 45% | $40 | 6 |
| [[Soccer Enemy - Inferno Ball|Inferno Ball]] | soccer | `ELITE` | 450 | 0.5 | 35% | $65 | 10 |
| [[Soccer Enemy - Flying Fire|Flying Fire]] | soccer | `FLYING_FIRE` | 130 | 2.3 | — | $28 | 12 |
| [[Soccer Enemy - Boss Ball|Boss Ball]] | soccer | `BOSS` | 2800 | 0.32 | 38% | $380 | 5 |
| [[Space Enemy - Drone|Drone]] | space | `SWARM` | 45 | 2.5 | — | $10 | 1 |
| [[Space Enemy - Fire Drone|Fire Drone]] | space | `FIRE` | 65 | 2.1 | — | $15 | 2 |
| [[Space Enemy - Flying Drone|Flying Drone]] | space | `FLYING` | 40 | 3 | — | $14 | 4 |
| [[Space Enemy - Heavy Drone|Heavy Drone]] | space | `ARMORED` | 280 | 0.65 | 45% | $40 | 6 |
| [[Space Enemy - Inferno Drone|Inferno Drone]] | space | `ELITE` | 450 | 0.5 | 35% | $65 | 10 |
| [[Space Enemy - Flying Fire|Flying Fire]] | space | `FLYING_FIRE` | 130 | 2.3 | — | $28 | 12 |
| [[Space Enemy - Boss Drone|Boss Drone]] | space | `BOSS` | 2800 | 0.32 | 38% | $380 | 5 |

## Maps

| Map | Theme | Diff | Grid | Layout | Spawns | Waves | Lives |
|---|---|---|---|---|---|---|---|
| [[Hockey Map - Practice Rink|Practice Rink]] | hockey | 1 | 18x11 | `funnel` | 1 | 15 | 20 |
| [[Hockey Map - Local Arena|Local Arena]] | hockey | 2 | 20x12 | `open_center` | 2 | 20 | 18 |
| [[Hockey Map - College Ice|College Ice]] | hockey | 3 | 22x13 | `split_lane` | 2 | 25 | 15 |
| [[Hockey Map - Pro Stadium|Pro Stadium]] | hockey | 4 | 24x14 | `chokepoint` | 3 | 30 | 12 |
| [[Hockey Map - Stanley Cup|Stanley Cup]] | hockey | 5 | 26x15 | `crossover` | 3 | 40 | 10 |
| [[Hockey Map - Frozen Lake|Frozen Lake]] | hockey | 6 | 28x16 | `maze` | 2 | 45 | 8 |
| [[Hockey Map - Winter Classic|Winter Classic]] | hockey | 7 | 30x17 | `gauntlet` | 2 | 50 | 7 |
| [[Hockey Map - World Championships|World Championships]] | hockey | 8 | 32x18 | `split_lane` | 4 | 55 | 6 |
| [[Hockey Map - All-Star Arena|All-Star Arena]] | hockey | 9 | 34x19 | `multi_base` | 3 | 60 | 5 |
| [[Hockey Map - Hall of Fame|Hall of Fame]] | hockey | 10 | 36x20 | `crossover` | 4 | 65 | 4 |
| [[Soccer Map - Backyard|Backyard]] | soccer | 1 | 18x11 | `funnel` | 1 | 15 | 20 |
| [[Soccer Map - School Field|School Field]] | soccer | 2 | 20x12 | `open_center` | 2 | 20 | 18 |
| [[Soccer Map - Club Ground|Club Ground]] | soccer | 3 | 22x13 | `split_lane` | 2 | 25 | 15 |
| [[Soccer Map - Premier League|Premier League]] | soccer | 4 | 24x14 | `chokepoint` | 3 | 30 | 12 |
| [[Soccer Map - World Cup|World Cup]] | soccer | 5 | 26x15 | `crossover` | 3 | 40 | 10 |
| [[Soccer Map - Street Pitch|Street Pitch]] | soccer | 6 | 28x16 | `maze` | 2 | 45 | 8 |
| [[Soccer Map - Beach Field|Beach Field]] | soccer | 7 | 30x17 | `gauntlet` | 2 | 50 | 7 |
| [[Soccer Map - Champions League|Champions League]] | soccer | 8 | 32x18 | `split_lane` | 4 | 55 | 6 |
| [[Soccer Map - Olympic Stadium|Olympic Stadium]] | soccer | 9 | 34x19 | `multi_base` | 3 | 60 | 5 |
| [[Soccer Map - Legendary Final|Legendary Final]] | soccer | 10 | 36x20 | `crossover` | 4 | 65 | 4 |
| [[Space Map - Docking Bay|Docking Bay]] | space | 1 | 18x11 | `funnel` | 1 | 12 | 20 |
| [[Space Map - Solar Yard|Solar Yard]] | space | 2 | 20x12 | `open_center` | 2 | 16 | 18 |
| [[Space Map - Asteroid Gate|Asteroid Gate]] | space | 3 | 22x13 | `split_lane` | 2 | 20 | 15 |

## Projectiles

| Projectile | Theme | Mesh | Trail | Impact | Speed |
|---|---|---|---|---|---|
| [[Hockey Projectile - puck|puck]] | hockey | `puck` | `ice` | `frost` | 10.5 |
| [[Hockey Projectile - dart|dart]] | hockey | `tracer` | `line` | `spark` | 13 |
| [[Hockey Projectile - hammer|hammer]] | hockey | `block` | `shock` | `ring` | 8 |
| [[Hockey Projectile - shard|shard]] | hockey | `shard` | `frost` | `freeze` | 9.5 |
| [[Hockey Projectile - glove|glove]] | hockey | `sphere` | `gold` | `slam` | 8.8 |
| [[Hockey Projectile - lightning|lightning]] | hockey | `bolt` | `electric` | `chain` | 16 |
| [[Hockey Projectile - fireball|fireball]] | hockey | `plasma` | `fire` | `burn` | 11 |
| [[Hockey Projectile - star|star]] | hockey | `star` | `gold` | `crit` | 11.5 |
| [[Soccer Projectile - ball|ball]] | soccer | `ball` | `spin` | `grassKick` | 9.5 |
| [[Soccer Projectile - curveBall|curveBall]] | soccer | `tracer` | `curve` | `spark` | 12 |
| [[Soccer Projectile - headButt|headButt]] | soccer | `ring` | `shock` | `ring` | 8.5 |
| [[Soccer Projectile - tackle|tackle]] | soccer | `cone` | `dust` | `slam` | 9 |
| [[Soccer Projectile - glove|glove]] | soccer | `sphere` | `aqua` | `save` | 8.8 |
| [[Soccer Projectile - chain|chain]] | soccer | `beam` | `electric` | `chain` | 13 |
| [[Soccer Projectile - flare|flare]] | soccer | `shard` | `firework` | `burn` | 9.5 |
| [[Soccer Projectile - legend|legend]] | soccer | `star` | `gold` | `crit` | 11.5 |
| [[Space Projectile - ball|ball]] | space | `laser` | `laser` | `spark` | 20 |
| [[Space Projectile - curveBall|curveBall]] | space | `plasma` | `plasma` | `plasma` | 12 |
| [[Space Projectile - headButt|headButt]] | space | `ring` | `gravity` | `gravity` | 8 |
| [[Space Projectile - tackle|tackle]] | space | `bolt` | `ion` | `slam` | 10 |
| [[Space Projectile - glove|glove]] | space | `sphere` | `shield` | `save` | 9 |
| [[Space Projectile - chain|chain]] | space | `beam` | `electric` | `chain` | 15 |
| [[Space Projectile - flare|flare]] | space | `plasma` | `plasma` | `burn` | 11 |
| [[Space Projectile - legend|legend]] | space | `star` | `gold` | `crit` | 12 |

## Audio

See [[Audio Assets]] — 12 sounds are registered, and none of the files exist.

## Shared silhouettes

Distinct tower meshes: **21** across 24 towers.
These render identically to each other:

- `space:plasma-cannon` — space/Plasma Cannon, space/Nova Flare
- `space:generic-turret` — space/Ion Snare, space/Shield Node, space/Command Core
