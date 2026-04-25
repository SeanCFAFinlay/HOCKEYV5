# Mobile QA Checklist

## Devices

- iPhone Safari portrait and landscape.
- Android Chrome portrait and landscape.
- Small width check at 320px, 375px, 390px, and 430px.

## Core Flow

- Select every visible content pack.
- Start campaign, endless, and sandbox from the first unlocked map.
- Select each tower and place on a valid ground cell.
- Tap an invalid path or occupied cell and confirm red preview appears.
- Upgrade, sell, and close the upgrade sheet.
- Start a wave, toggle auto wave, change speed.
- Pinch zoom and drag camera without snap-back.
- Rotate orientation during gameplay.
- Lose a run and verify defeat stats.
- Win a campaign map and verify progress is saved only for campaign.

## HUD Checks

- Money, lives, wave, score, kills, and enemy count are readable.
- Tower bar scrolls horizontally and does not trap page gestures.
- Start button remains reachable above safe area.
- Wave preview does not overlap critical controls.

## Performance Checks

- Run with `?quality=low&perf=1`.
- Confirm FPS overlay appears.
- Confirm no console validation errors on startup.
