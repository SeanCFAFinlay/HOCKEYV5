# Balance Model

## Enemy Metadata

Wave composition uses:

- `role`: broad gameplay identity.
- `threatTags`: selectors like `swarm`, `air`, `armor`, `fire`, `speed`, `boss`.
- `unlockWave`: first wave where the enemy may appear.
- `waveWeight`: weighted selection inside a matching wave.
- `speedClass`: readability and tuning cue.
- `rewardClass`: economy cue.

## Wave Themes

- `Mixed`: default pressure.
- `Swarm`: high count weak or fast enemies.
- `Heavy`: armored, tank, bruiser pressure.
- `Air Raid`: flying pressure.
- `Inferno`: fire pressure.
- `Boss`: boss plus support.
- `Breather`: lighter recovery after boss waves.

## Modes

- Campaign uses map wave counts.
- Endless extends generated waves as needed and skips campaign completion saves.
- Sandbox multiplies starting money and lives and skips campaign completion saves.
