---
title: "Findings"
tags:
  - index
  - findings
---
# Findings

Everything here was verified against the source, not inferred from the docs.

**Fixed** is work that has been done and verified. **Open** is untouched — a
map, not a fix.

---

# Fixed

## F1. The game rendered as a smeared, tiled mess

Every frame was smeared across itself horizontally, so the rink, the spawn label
and the towers all appeared repeated 4-5 times behind a washed-out haze. It read
as a broken camera or duplicated geometry. It was neither — the scene graph was
correct all along (exactly 5 RingGeometry meshes, one arena) and the camera was
fine.

**Cause.** The depth-of-field pass, enabled by default:

```glsl
vec2 samplePos = vUv + vec2(t * blurAmount, 0.0);
```

`t` runs -1→1 and `blurAmount` reached `maxBlur`, defaulting to **1.0**. The
offset is in **UV units**, so every pixel averaged samples taken up to ±100% of
the screen width away. Not a blur radius — the whole frame composited over
itself.

**Root cause, and why the other three effects went too.** DoF sampled `tDepth`.
SSAO sampled `tNormalDepth`. SSR sampled `tPosition`. Motion blur sampled
`tVelocity`. **None of those textures were ever rendered or bound anywhere** —
they sat at `{ value: null }` and read back blank. All four were GPU cost
producing garbage, and their `set*()` configurators were never called from
anywhere, so their defaults stood forever.

Verified by bisection: enabling each pass alone against the render pass, only
DoF reproduced the smear. Re-enabling all shipped passes and changing *only*
`maxBlur` to `0.004` rendered the game correctly.

**Fix.** All four removed. Re-adding any of them needs a real depth+normal
prepass first. See [[engine-postprocessing|engine/postprocessing.js]].

## F2. The "glow" pass tinted the whole arena olive

```glsl
vec3 glow = glowColor * glowStrength * 0.5;   // gold: (0.25, 0.20, 0.05)
vec3 finalColor = color.rgb + glow;           // added to EVERY pixel
```

Not a glow — a flat gold constant added unconditionally to every pixel, with no
threshold and no notion of bright areas. It lifted the arena's near-black
(0.02, 0.07, 0.12) to olive (0.27, 0.27, 0.17). `setGlowEffect()` was never
called, and the tier switched it on at `high`.

**Fix.** Removed; bloom is the pass that actually glows, because it thresholds.
The dead `setGlowEffect()` is replaced by `setBloomStrength()`.

`postprocessing.js` went from **1451 to 887 lines** across F1 and F2.

## F3. The whole test suite was red for one reason

46 failed / 557 passed across 5 files, two of which wouldn't even load. Every
one traced back to `new THREE.Vector2()` at **module scope** in the SSAO and SSR
shaders: THREE is a CDN global that doesn't exist under vitest, so importing
`postprocessing.js` threw at import time and took out everything downstream.

**Fix.** Fell out of F1 for free — those shaders are gone. **649 tests now pass,
0 fail.**

## F4. Render scale compounded on every quality change

```js
composer.setSize(Math.floor(composer._width * 0.75), ...)  // scales the CURRENT size
```

`setPostProcessingQuality('medium')` scaled the buffer to 0.75x of whatever it
was *now*, not of the true size — so calling it twice gave 0.5625x, three times
0.42x, and the game progressively softened.

**Fix.** `baseWidth`/`baseHeight` now track the unscaled size and the tier's
`renderScale` applies relative to that. Tiers are declared in one `TIER_CONFIG`
table instead of a switch that set each pass by hand.

## F5. The ice was blown out to white — and worse on the other themes

Four spotlights all aim at the arena centre, so their intensities **stack**
there. At hockey's 6 the ice clipped to flat white and lost its markings. Soccer
and space set no `spotIntensity` at all and hit the `?? (isHockey ? 8 : 18)`
fallback — **18**, seven times hockey's.

**Fix.** Tuned against the real render rather than guessed: hockey
`spotIntensity` 6 → 2.5, `exposure` 0.72 → 0.62, `sunIntensity` 0.62 → 0.55.
Soccer and space got explicit values (3.2 / 2.8). The fallback is now a
conservative 3, so a new theme that forgets to set it looks flat rather than
blown out.

## F6. The minimap's inline styles shadowed better CSS

`ui/minimap.js` set `el.style.cssText = 'position:absolute;top:70px;...'`.
`css/hud.css` already had a **better** `#minimapContainer` rule — safe-area
aware (`env(safe-area-inset-right)`), which matters on notched phones. Inline
styles win, so the good CSS never applied.

**Fix.** Inline styles removed; the existing CSS now takes effect and media
queries can finally reach the minimap.

## F7. Mobile: HUD chips wrapped into the minimap

`#minimapContainer` is pinned at `top: 70px`, which assumes a one-row HUD
(`.hud-left` is 69px tall). `.hud-right` is `flex-wrap: wrap; max-width: 50%` —
on a 390px screen that's 195px for ~216px of chips, so they wrapped onto a
second row and collided with the minimap.

**Fix.** At ≤480px the chips shrink instead of wrapping. Verified one row
(h=44), no overlap, no horizontal overflow on iPhone SE / iPhone 13 / Pixel 5.

## F8. Mobile: the camera cropped the arena

`resetCam` used `max(COLS, ROWS) * 0.85` with **no aspect awareness**, so a
portrait phone (aspect 0.59) got the same distance as a widescreen desktop
(1.6) and the rink ran off the left edge — the spawn wasn't visible at all.

**Fix.** New `computeFitDistance(cols, rows, aspect)` pulls back as the viewport
narrows. Tuned empirically against the real render: desktop and landscape are
unchanged at 16.8; iPhone 13 gets 25.6, where the full rink just fits.

## F9. Mobile rendered at 1x on 3x screens

`QUALITY_TIERS.low.maxPixelRatio` was **1**, so an iPhone 13 stretched a 390px
buffer across a 1170px screen — the single biggest hit to how the game looked on
a phone. Meanwhile `utils/device.js` exports `getAdaptivePixelRatio()`, which
says mobile should be **1.5** — and **nothing calls it**. Dead code stating the
right intent while the tier did the opposite.

**Fix.** `low.maxPixelRatio` → 1.5. `low` already drops shadows, spotlights and
all post-processing, so it has the budget.

## F10. The tower bar gave no sign it scrolled

Eight towers never fit a phone's width. The bar scrolls (and snaps), but its
scrollbar is hidden, so towers 6-8 looked simply absent.

**Fix.** A trailing edge-fade on ≤480px, so the row reads as continuing
off-screen. Phone-only — the bar fits on desktop, where a fade would look like a
bug.

> [!success] Verified after all of the above
> 649/649 tests · config validation · clean production build · a real wave
> played through on desktop **and** iPhone 13 — 60fps and zero console errors on
> both.

---

# Open

## 1. Every audio file is missing — the game is silent

23 sounds are registered across three subsystems (12 SFX, 6 ambient, 5 music).
There is no `audio/` directory in the repository and no audio file of any format
is tracked by git. `engine/audio.js` catches the fetch failure and
`console.warn`s, so every `playSound()` is a silent no-op — a 404 for a missing
sound is observable in the console when the game runs.

The audio settings UI, the volume controls, the music state machine and the
per-tower fire-sound throttle are all fully implemented against files that do
not exist. 95 tests pass across `audio-sc51`, `sounds-sc52`, `music-sc53` and
`ambient-sc54`, because they test the registry and the state machine rather than
playback. The test suite cannot see this.

Details: [[Audio Assets]].

## 2. `src/README.md` is materially out of date

| README says | Actually |
|---|---|
| "2 themes (Hockey and Soccer)" | **3** — there is a `space` pack, [[Space Theme]] |
| "7 enemy types per theme" | hockey **10**, soccer 7, space 7 |
| "10 maps per theme" | hockey 10, soccer 10, space **3** |
| Project tree | Omits `scripts/`, `tests/`, and 4 of 9 `config/` files |

## 3. The "add a theme without touching rendering" claim is false

> "No changes required to engine, systems, or rendering code."
> — `src/README.md`, *Adding New Themes*

Both mesh builders branch on the theme by name: `tower-meshes.js` dispatches to
`buildHockey`/`buildSoccer`/`buildSpaceTowerMesh`, and `enemy-meshes.js`
branches `isHockey` → puck, `isSpace` → orb, else → ball. A new `basketball`
pack would silently render soccer ball enemies on sci-fi space towers.

## 4. Three hockey enemies are coloured by matching their display name

`rendering/enemy-meshes.js:164` does `enemyName.includes('Speed Skater')`, and
the same for `Defenseman` and `Enforcer`. Everything else resolves visuals
through the role `slot` — and the profile *already* defines `speedster`,
`bruiser` and `armored` colours, which this then overrides with **different**
ones (`0x00eaff` vs `0x00ddee`). Renaming an enemy in config silently changes
its colour.

## 5. Some visual-profile enemy colours can never be used

`createEnemyMesh` picks the body material fire-first, so for any enemy with
`fire: true` the `visual.color` branch is unreachable. Every enemy in the
`fire`, `elite` and `flying_fire` slots has `fire: true` — so in all three
themes those slots' `color` values are dead. That's 9 dead colour values.

## 6. Space towers: 8 towers, 5 silhouettes

`buildSpaceTowerMesh` branches on the inherited soccer projectile type, not the
tower id. `tackle`, `glove` and `legend` all fall through to the same generic
turret, so Ion Snare, Shield Node and Command Core are identical apart from tint.

## 7. The space rename misses one enemy

`enemy.nm.replace('Ball', 'Drone')` — six of seven rename cleanly. `Flying Fire`
contains no "Ball", so the space pack has a *Flying Fire* sitting among Drones.

## 8. Two different hockey assets are both called "Enforcer"

Tower `t3` (SPLASH) and enemy `e10` (BRUISER), unrelated. Hence
[[Hockey Tower - Enforcer]] vs [[Hockey Enemy - Enforcer]].

## 9. `systems/highscores.js` is dead code, and deliberately so

Exports 5 functions, imported by nobody. `systems/storage.js` supersedes it and
actively migrates data *away* from it. The replacement landed; the file didn't
get deleted.

## 10. `engine/pools.js` is effectively unused

Its only reachable caller is a debug handler in `main.js`.
`systems/particles.js` and `systems/projectiles.js` each roll their own pooling.

## 11. There is no layering

`engine`, `rendering`, `systems` and `ui` form one mutually dependent cluster.
`config/waves.js` and `config/sounds.js` import from `engine/`; `utils/rng.js`
imports `engine/state.js`; `engine/loop.js` imports `ui/hud.js`. Live cycles
include `scene.js` ⇄ `input.js` and `hud.js` ⇄ `upgrade-sheet.js`. They survive
because the edges are calls made after module evaluation, not at top level.

`engine/state.js` is the real root: **37 inbound imports**, importing only
`events.js`. See [[Codebase Map]].

## 12. `enhanced-lighting-sc22` tests its own copy of the lighting rig

It defines `const HOCKEY_SPOT_INTENSITY = 6` and re-implements the light setup
inside the test rather than importing from `visual-profiles.js`. Its assertion
that the game "uses restrained hockey spotlight intensity to avoid washing out
the rink" passed the entire time the rink *was* washed out (F5), and stayed
green when the real value changed to 2.5. It tests the mock, not the game.

## 13. Four export names are defined twice

| Name | Defined in |
|---|---|
| `updateAmbientParticles` | `engine/scene.js` *and* `systems/particles.js` — unrelated implementations |
| `replayGame` | `ui/modals.js` *and* `ui/screens.js` — `main.js` imports the screens one |
| `getSettings` | `systems/settings.js` *and* `ui/settings.js` |
| `removeEnemy` | `systems/enemies.js` *and* `engine/state.js` |

---

## Links

- [[Codebase Map]] · [[Asset Index]] · [[Audio Assets]] · [[Home]]
