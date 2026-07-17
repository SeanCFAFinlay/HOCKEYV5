---
title: "Audio Assets"
kind: audio
tags:
  - asset
  - asset/audio
---
# Audio Assets

> [!danger] Every audio file this game references is missing
> 23 sounds are registered across three subsystems. There is no `audio/`
> directory anywhere in the repository, and no `.mp3`, `.ogg` or `.wav` file is
> tracked by git. **The game is completely silent.**

These are the only assets in the project that are *meant* to be binary files
rather than procedural — which is exactly why they're the only ones missing. See
[[Findings]].

## Why it fails quietly

`engine/audio.js` fetches and decodes each sound on demand, and swallows the
failure:

```js
// engine/audio.js:104
async function _fetchBuffer(name) {
  try {
    const resp = await fetch(soundRegistry[name]);
    ...
  } catch (err) {
    console.warn(`[Audio] Failed to load "${name}": ${err.message}`);
  }
}
```

So every `playSound()` call is a no-op preceded by a console warning. Nothing
throws, nothing surfaces in the UI, and the volume settings in
[[ui-settings|ui/settings.js]] all work — they just control silence.

## Sound effects — 12

Registered by [[config-sounds|config/sounds.js]] → `registerAllSounds()`.
`playFireSound()` throttles the fire sound to one per tower per 100 ms.

| Name | Path | Category |
|---|---|---|
| `towerPlace` | `audio/sfx/tower-place.mp3` | sfx |
| `towerFire` | `audio/sfx/tower-fire.mp3` | sfx |
| `towerSell` | `audio/sfx/tower-sell.mp3` | sfx |
| `enemyDeath` | `audio/sfx/enemy-death.mp3` | sfx |
| `enemyDeathBoss` | `audio/sfx/boss-death.mp3` | sfx |
| `waveStart` | `audio/sfx/wave-start.mp3` | sfx |
| `waveComplete` | `audio/sfx/wave-complete.mp3` | sfx |
| `moneyGain` | `audio/sfx/coin.mp3` | sfx |
| `upgrade` | `audio/sfx/upgrade.mp3` | sfx |
| `uiClick` | `audio/sfx/click.mp3` | sfx |
| `gameWin` | `audio/sfx/victory.mp3` | sfx |
| `gameLose` | `audio/sfx/defeat.mp3` | sfx |

## Ambient — 6

Registered by [[engine-ambient|engine/ambient.js]]. Note these paths are
**absolute** (`/audio/...`) where the SFX paths are **relative** (`audio/...`) —
if the files are ever added, the two sets will resolve differently under a
non-root base path.

| Name | Path |
|---|---|
| `ambient_crowd_hockey` | `/audio/ambient/crowd_hockey.ogg` |
| `ambient_skates` | `/audio/ambient/skates.ogg` |
| `ambient_arena_echo` | `/audio/ambient/arena_echo.ogg` |
| `ambient_crowd_soccer` | `/audio/ambient/crowd_soccer.ogg` |
| `ambient_vuvuzela` | `/audio/ambient/vuvuzela.ogg` |
| `ambient_wind` | `/audio/ambient/wind.ogg` |

## Music — 5

Registered by [[engine-music|engine/music.js]], driven by a state machine
(`setMusicState`) that swaps tracks on menu / gameplay / boss / victory / defeat.

| Name | Path |
|---|---|
| `music_menu` | `/audio/music/menu.ogg` |
| `music_gameplay` | `/audio/music/gameplay.ogg` |
| `music_boss` | `/audio/music/boss.ogg` |
| `music_victory` | `/audio/music/victory.ogg` |
| `music_defeat` | `/audio/music/defeat.ogg` |

## Notes

- The `space` content pack registers no ambient sounds — `ambient.js` only maps
  hockey and soccer.
- There is no attribution or licence file for any of this, which suggests the
  audio was planned but never sourced.
- Tests `audio-sc51`, `sounds-sc52`, `music-sc53` and `ambient-sc54` all pass,
  because they test the registry and state machine — not the files.

## Links

- [[config-sounds|config/sounds.js]] · [[engine-audio|engine/audio.js]] · [[engine-ambient|engine/ambient.js]] · [[engine-music|engine/music.js]]
- [[Asset Index]] · [[Findings]]
