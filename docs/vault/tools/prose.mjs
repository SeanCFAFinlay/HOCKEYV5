// Hand-written descriptions. Everything else in the vault is derived from the
// config at generate time; this file is the part a human maintains.
//
// Keep these about INTENT — what the asset is for, how it reads on screen, how
// it plays. Raw numbers are pulled from the config automatically, so repeating
// them here just creates a second source of truth that will drift.

export const TOWER_PROSE = {
  hockey: {
    t1: {
      blurb:
        'The starter tower and the only one you can afford on wave 1. A skater winding up a slap shot, with the puck pulsing at the blade.',
      tactics:
        'Cheap enough to spam early and the fastest-firing option until Hot Stick unlocks. Its damage curve is deliberately unremarkable — it stops scaling around the point Heavy Pucks appear, which is the nudge toward Sniper and Enforcer.'
    },
    t2: {
      blurb:
        'A tripod-mounted rifle with a scope and a red laser sight that blinks between shots. The longest reach in the hockey roster short of Captain.',
      tactics:
        'Built to delete single high-HP targets, and the natural answer to armored enemies that shrug off Slap Shot. Its slow rate makes it dead weight against swarms — pair it with something that clears chaff.'
    },
    t3: {
      blurb:
        'A broad-shouldered bruiser with red gloves that throw punches, ringed by expanding impact rings on the strike side.',
      tactics:
        'The theme\'s only early splash option, so it carries the anti-swarm load once Pucks start arriving in packs. Short range means it wants to sit on the path, not behind it.'
    },
    t4: {
      blurb:
        'A zamboni with a glowing coolant tank and a rake of five nozzles, trailing floating ice crystals.',
      tactics:
        'A force multiplier, not a damage dealer — its damage is the lowest in the roster on purpose. Value comes from the slow, so place it where enemies enter a killzone rather than where they leave it.'
    },
    t5: {
      blurb:
        'Full goalie kit: leg pads, blocker, catching glove and a caged mask. Reads as a wall, which is exactly its job.',
      tactics:
        'The shortest range in the roster paired with the second-highest damage. It only pays off at a genuine chokepoint or as the last line before the base — anywhere else most of its DPS never finds a target.'
    },
    t6: {
      blurb:
        'A tesla coil: six spinning rings climbing a tapered mast to a pulsing electrode, with four grounding rods around the base.',
      tactics:
        'Chain count is the stat that matters, and it more than doubles across upgrades. Best against spread-out lines rather than tight clumps, where splash already wins.'
    },
    t7: {
      blurb:
        'A vented furnace throwing a column of flame, with the vents glowing hot orange through the casing.',
      tactics:
        'By far the fastest fire rate in the game, but the per-hit damage is nearly the lowest — the burn is the real payload. Strong against tanky enemies where the DoT has time to tick, wasted on things that die instantly.'
    },
    t8: {
      blurb:
        'The trophy itself: a gold cup with handles, a spiked crown, a spinning red gem, and sparkles orbiting the whole thing.',
      tactics:
        'The most expensive tower and the slowest-firing by a wide margin. It exists for boss waves — its crit chance and huge per-shot damage are wasted on anything that would have died anyway.'
    }
  },
  soccer: {
    t1: {
      blurb:
        'A striker mid-kick — planted leg, extended leg, ball pulsing at the boot with pentagon decals.',
      tactics:
        'The hockey Slap Shot with the numbers nudged: more damage, slightly less range and a hair slower. Same job, same early-game ceiling.'
    },
    t2: {
      blurb:
        'A ball on a tee behind a target arm, with a blinking laser sight and a spinning reticle downrange.',
      tactics:
        'The longest-reaching non-boss tower in the soccer roster and the hardest-hitting sniper of the two themes. Its curve stat makes the projectile arc rather than fly straight.'
    },
    t3: {
      blurb:
        'A player pitched forward mid-header, arms flung wide, impact rings blooming at the brow.',
      tactics:
        'Wider splash and more damage than hockey\'s Enforcer, with better range too — the soccer pack\'s crowd clear is straightforwardly stronger.'
    },
    t4: {
      blurb:
        'A slide tackle frozen mid-motion: body on its side, leg extended, boot studs glowing, dust kicking up behind.',
      tactics:
        'Same 50% slow as Ice Spray but shorter duration at low levels, traded for slightly more damage. A support piece — its job is to hold enemies inside someone else\'s range.'
    },
    t5: {
      blurb:
        'A goal frame with the keeper diving across it, gloves glowing at full stretch.',
      tactics:
        'The shortest range of any tower in the game (1.8 at level 1) in exchange for the highest chokepoint damage. Even more position-dependent than hockey\'s Goalie.'
    },
    t6: {
      blurb:
        'A hub with three pentagon-flecked balls orbiting a pulsing octahedral core inside two tilted rings.',
      tactics:
        'Chains to more targets than Power Play at max (7 vs 6) and reaches further. The best answer in either theme to enemies arriving in a long strung-out line.'
    },
    t7: {
      blurb:
        'A three-tube launcher venting stacked flares and drifting smoke.',
      tactics:
        'Burns harder and longer than Hot Stick but fires slower and reaches less far. The trade is more damage per tick, fewer ticks.'
    },
    t8: {
      blurb:
        'A gold statue on a plinth with a name plaque, arms raised, crowned, ringed by three pulsing aura bands and eight orbiting sparkles.',
      tactics:
        'The single hardest-hitting tower in the game and the slowest — under one shot every five seconds at level 1. Boss insurance, nothing else.'
    }
  },
  space: {
    _shared:
      'Part of the `space` content pack, which is marked `stub-playable` — a proof that the engine is genuinely content-driven. Its stats are inherited unchanged from the soccer roster; only the name, icon and colour are overridden.'
  }
};

export const ENEMY_PROSE = {
  hockey: {
    e1: 'The baseline threat and the tutorial for everything else. Arrives from wave 1 in numbers, with the highest wave weight in the roster.',
    e2: 'A Puck that burns. Slower and tougher than the base, and the first enemy that punishes stacking everything into single-target damage.',
    e3: 'Ignores the maze entirely — flying enemies bypass pathing, so every wall you built stops mattering. Rewards slightly more than a ground Puck to compensate for the defences it walks past.',
    e4: 'The first real wall: 5x a Puck\'s HP behind 40% damage reduction, moving at under a third of the speed. Tests whether you built sustained DPS or just burst.',
    e5: 'Fire and armor on one body. Arrives at wave 10 and is the point where an all-in-on-one-tower defence usually falls over.',
    e6: 'Flying plus fire — reaches the base over your obstacles and burns on death. Fast, fragile relative to the ground elites, and easy to miss until it is through.',
    e7: 'The boss. 50x a Puck\'s HP, 35% armor, crawling. Boss-wave only, and worth more than 35 basic Pucks combined.',
    e8: 'The fastest thing in the game at 3.5 speed, and the most fragile at 35 HP. Pure pressure — designed to get past slow-firing towers before they cycle.',
    e9: 'The heaviest armor in either theme at 45% reduction, on 350 HP. Hockey-only; the soccer pack has no equivalent.',
    e10: 'A mid-speed armored disruptor that fills the gap between swarm and tank. Hockey-only.'
  },
  soccer: {
    e1: 'The soccer baseline — marginally faster and squishier than a Puck. Same role, same wave-1 arrival.',
    e2: 'A Ball that burns. The soccer mirror of Hot Puck, a touch faster and slightly less healthy.',
    e3: 'The fastest flyer in either theme at 3.0 speed, and the flimsiest at 40 HP. Bypasses pathing entirely.',
    e4: 'Tankier than its hockey counterpart (280 HP) with more armor (45%). The soccer pack\'s sustained-DPS check.',
    e5: 'The highest non-boss HP in the game at 450, with fire and 35% armor on top.',
    e6: 'Flying plus fire, slightly beefier than the hockey version.',
    e7: 'The largest health pool in the game: 2,800 HP behind 38% armor, moving at 0.32. Boss-wave only.'
  },
  space: {
    _shared:
      'Inherited wholesale from the soccer roster with "Ball" renamed to "Drone" — stats, roles and wave weights are untouched. The space pack has no speedster or bruiser, because those exist only in hockey.'
  }
};

export const LAYOUT_PROSE = {
  funnel: 'Multiple spawns converge on a single chokepoint. The forgiving layout — one killzone covers everything.',
  split_lane: 'Distinct parallel paths to the base. Punishes stacking all your towers in one place.',
  crossover: 'Paths cross in the middle, so centre placements cover several lanes at once. The reward for finding the intersection is real.',
  open_center: 'A wide unobstructed middle with many valid placements. The sandbox layout.',
  chokepoint: 'Natural narrow passages the pathing has to squeeze through. Where short-range, high-damage towers finally pay off.',
  maze: 'Winding paths through obstacles. The layout that maximises path length, and so maximises time-in-range.',
  gauntlet: 'One long path that runs enemies past your whole defence. Favours sustained DPS over burst.',
  multi_base: 'Several base entry points. You cannot cover them all — the layout is about choosing what to concede.'
};

export const PROJECTILE_PROSE = {
  puck: 'A flat disc with an ice trail and a frost impact.',
  dart: 'A fast tracer with a line trail — the second-quickest projectile in the hockey pack.',
  hammer: 'A slow, heavy block with a shockwave trail and a ring impact.',
  shard: 'An ice shard leaving a frost trail, freezing on contact.',
  glove: 'A simple sphere; shared by both goalkeeper towers across themes.',
  lightning: 'The fastest hockey projectile at 16 u/s, arcing between chained targets.',
  fireball: 'A plasma ball trailing fire and burning on impact.',
  star: 'The crit projectile — gold trail, crit impact.',
  ball: 'A spinning ball with a grass-kick impact and a slight curve. In the space pack this same key becomes an instant laser beam instead.',
  curveBall: 'The heaviest curve in the game at 0.9 — visibly arcs toward its target.',
  headButt: 'An expanding ring with a shockwave trail.',
  tackle: 'A cone kicking up a dust trail.',
  chain: 'A beam that arcs between targets on an electric trail.',
  flare: 'A shard trailing firework sparks, burning on impact.',
  legend: 'The soccer crit projectile — identical in behaviour to hockey\'s star.'
};

export const THEME_PROSE = {
  hockey:
    'The default pack and the most developed one. Ice-blue palette, dark rink environment, low exposure (0.72) and heavy fog. It is the only pack with a full ten-enemy roster — the extra three (Speed Skater, Defenseman, Enforcer) exist nowhere else, and are the only enemies in the codebase whose mesh colour is chosen by matching on their display name rather than their role slot.',
  soccer:
    'The second full pack. Grass-green palette, bright daylight lighting (sun intensity 1.08 vs hockey\'s 0.62, exposure 0.9), lighter fog. Ten maps and eight towers matching hockey, but only seven enemies — it has no speedster or bruiser.',
  space:
    'A deliberate proof that the engine is content-driven, marked `stub-playable`. It ships no original content: towers are the soccer roster with new names and colours, enemies are soccer enemies with "Ball" renamed to "Drone", and its three maps are the first three soccer maps re-labelled. Its tower meshes branch on projectile type rather than tower id, so its eight towers render as only five distinct shapes.'
};
