# Mobile Graphics QA

## Viewports

- 320x568 portrait
- 390x844 portrait
- 430x932 portrait
- 844x390 landscape
- Android Chrome and iOS Safari where available

## Checks

- Start each theme and confirm map palette is distinct.
- Select a tower and confirm placement preview aligns to grid.
- Tap invalid path/occupied cells and confirm red invalid preview.
- Upgrade a tower and confirm level collar/effect appears.
- Start waves and confirm projectiles are visible above the map.
- Confirm enemy health bars and role visuals remain readable.
- Confirm HUD is readable over bright Hockey/Soccer maps.
- Test `?quality=low&perf=1` on mobile and verify reduced lighting/particles remain readable.

## Failure Conditions

- Invisible projectiles.
- Map path not distinguishable from build tiles.
- Tower upgrade button too small or clipped.
- Enemy clipping below floor.
- FPS overlay showing sustained poor performance on low quality.

