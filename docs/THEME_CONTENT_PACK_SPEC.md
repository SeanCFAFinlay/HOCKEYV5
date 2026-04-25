# Theme Content Pack Spec

Each theme exports a pack through `src/js/config/themes.js`.

## Pack Fields

- `id`: stable pack id.
- `name`, `shortName`, `icon`, `description`, `color`: UI metadata.
- `groundColor`, `pathColor`, `envColor`: rendering palette.
- `meta`: normalized metadata used by validation and future registries.
- `maps`: campaign maps.
- `towers`: playable tower definitions.
- `enemies`: enemy definitions.
- `balance`: wave and mode settings.
- `skins`: visual hints for environment, enemies, and towers.

## Enemy Required Fields

- `id`, `nm`, `hp`, `spd`, `rwd`, `sz`
- `role`
- `threatTags`
- `unlockWave`
- `waveWeight`
- `speedClass`
- `rewardClass`

Current roles: `SWARM`, `FIRE`, `FLYING`, `ARMORED`, `ELITE`, `FLYING_FIRE`, `BOSS`, `SPEEDSTER`, `BRUISER`.

## Map Metadata

Every map is normalized with:

- `id`
- `campaignIndex`
- `difficulty`
- `layoutType`
- `recommendedTowers`
- `pressureType`
- `unlock`
- `metadata`

## Future Theme Pattern

Add a pack object with maps/towers/enemies and include it in `CONTENT_PACKS`. Do not change the wave generator for theme-specific enemies; use enemy metadata.
