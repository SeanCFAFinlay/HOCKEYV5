export const VISUAL_PROFILES = {
  hockey: {
    map: {
      background: 0x06111f,
      fog: 0x071626,
      fogDensity: 0.007,
      floor: {
        // Near-white ice with a cool tint. Kept a step below white on purpose:
        // the rink is a large, bright, near-flat surface and clips easily.
        base: '#e9f2f7',
        line: 'rgba(120, 165, 195, 0.10)',
        scratch: 'rgba(120, 150, 175, 0.20)',
        meshColor: 0xa9c2d1,
        // Low roughness for a wet-ice sheen. Reads as polished only because
        // scene.environment now gives it something to reflect (see scene.js
        // _generateEnvMap); the scratch normal map keeps it from mirroring.
        roughness: 0.28,
        metalness: 0.05
      },
      path: {
        color: 0x80dfff,
        emissive: 0x0c5b7a,
        opacity: 0.38,
        edge: 0x1e90ff
      },
      buildZone: {
        color: 0xeaf9ff,
        opacity: 0.08,
        line: 0x6ddcff
      },
      obstacle: { accent: 0x00d4ff },
      base: { color: 0xfbbf24, icon: 'DEFEND HOCKEY' },
      spawn: { color: 0xef4444, icon: 'PUCKS' }
    },
    lighting: {
      hemiSky: 0xaedcff,
      hemiGround: 0x263955,
      hemiIntensity: 0.24,
      sun: 0xe5f7ff,
      sunIntensity: 0.55,
      rim: 0x1e88ff,
      rimIntensity: 0.22,
      accent: 0x00d4ff,
      // Four spots all aim at rink centre, so their intensities stack there.
      // Anything much above this clips the ice to white and destroys the
      // markings — the rink is a large, bright, near-flat surface.
      spotIntensity: 2.5,
      exposure: 0.62
    },
    ui: { accent: '#00d4ff', dark: '#06111f' },
    projectiles: {
      puck: { mesh: 'puck', flight: 'slide', trail: 'ice', impact: 'frost', color: 0x35d6ff, speed: 10.5, model: 'puck', debris: 'ice' },
      dart: { mesh: 'tracer', flight: 'tracer', trail: 'line', impact: 'spark', color: 0xff5a36, speed: 13, model: 'wrister', debris: 'ice' },
      hammer: { mesh: 'block', flight: 'lob', trail: 'shock', impact: 'ring', color: 0xff8a3c, speed: 8, size: 1.15, model: 'heavyPuck', debris: 'chunks', debrisColor: 0xd8eef8 },
      shard: { mesh: 'shard', flight: 'spray', trail: 'frost', impact: 'freeze', color: 0x7fe9ff, speed: 9.5, model: 'icicle', debris: 'ice' },
      glove: { mesh: 'sphere', flight: 'punch', trail: 'gold', impact: 'slam', color: 0xb779ff, speed: 8.8, size: 1.1, model: 'trapper', debris: 'ice' },
      lightning: { mesh: 'bolt', flight: 'bolt', trail: 'electric', impact: 'chain', color: 0xf2ff3a, speed: 16, debris: 'sparks' },
      fireball: { mesh: 'plasma', flight: 'flame', trail: 'fire', impact: 'burn', color: 0xff5a14, speed: 11, size: 0.85, model: 'flamingPuck', debris: 'embers' },
      star: { mesh: 'star', flight: 'heavy', trail: 'gold', impact: 'crit', color: 0xffc928, speed: 11.5, size: 1.25, model: 'captainC', debris: 'sparks', debrisColor: 0xffd34d }
    },
    enemies: {
      swarm: { body: 'puck', color: 0x111111, accent: 0x00d4ff },
      fire: { body: 'puck', color: 0xff3b18, accent: 0xffd166 },
      speedster: { body: 'puck', color: 0x00eaff, accent: 0xc8ffff, effects: ['speedLines'] },
      armored: { body: 'puck', color: 0x1a3f8f, accent: 0xbddcff, effects: ['armorPlates'] },
      bruiser: { body: 'puck', color: 0xcc2936, accent: 0xff8080, effects: ['spikes'] },
      elite: { body: 'puck', color: 0xff6b1a, accent: 0x334466, effects: ['armorPlates'] },
      flying: { body: 'puck', color: 0x77ccff, accent: 0xd9f7ff, effects: ['wings'] },
      flying_fire: { body: 'puck', color: 0xff7a18, accent: 0x9be8ff, effects: ['wings'] },
      boss: { body: 'puck', color: 0x070707, accent: 0xffd700, effects: ['crown'] },
      splitter: { body: 'puck', color: 0x1c1f26, accent: 0xff9a1f },
      splitling: { body: 'puck', color: 0x1c1f26, accent: 0xff9a1f },
      shielder: { body: 'puck', color: 0x1f5fd6, accent: 0x7cc4ff },
      healer: { body: 'puck', color: 0xf2f6ff, accent: 0x34e07a }
    },
    towers: { family: 'hockey', base: 0x071426, metal: 0x8fb8cc, levelGlow: 0x00d4ff }
  },
  soccer: {
    map: {
      background: 0x061407,
      fog: 0x071807,
      fogDensity: 0.006,
      floor: {
        base: '#247a39',
        alt: '#1d6630',
        blade: 'rgba(93, 180, 87, 0.14)',
        meshColor: 0x228743,
        roughness: 0.86,
        metalness: 0.0
      },
      path: { color: 0xf7f0c4, emissive: 0x304a12, opacity: 0.32, edge: 0xffffff },
      buildZone: { color: 0x3ad65d, opacity: 0.10, line: 0xe9fbe7 },
      obstacle: { accent: 0xfbbf24 },
      base: { color: 0xffffff, icon: 'DEFEND GOAL' },
      spawn: { color: 0xffb020, icon: 'BALLS' }
    },
    lighting: {
      hemiSky: 0xd8ffd6,
      hemiGround: 0x1b3f20,
      hemiIntensity: 0.43,
      sun: 0xfff4d0,
      sunIntensity: 1.08,
      rim: 0x37d957,
      rimIntensity: 0.28,
      accent: 0x22c55e,
      // Explicit, because the fallback in scene.js is 18 for non-hockey themes,
      // which stacks four ways over the pitch centre and blows it out.
      spotIntensity: 3.2,
      exposure: 0.82
    },
    ui: { accent: '#22c55e', dark: '#061407' },
    projectiles: {
      ball: { mesh: 'ball', flight: 'curve', trail: 'spin', impact: 'grassKick', color: 0x4ade80, speed: 9.5, curve: 0.5, model: 'ball', debris: 'dirt', debrisColor: 0x3f7a2c },
      curveBall: { mesh: 'ball', flight: 'curve', trail: 'curve', impact: 'spark', color: 0x5fd4ff, speed: 12, curve: 1.7, size: 1.25, model: 'swerveBall', debris: 'dirt', debrisColor: 0x3f7a2c },
      headButt: { mesh: 'ring', flight: 'ring', trail: 'shock', impact: 'ring', color: 0x22dddd, speed: 8.5, debris: 'dirt', debrisColor: 0x3f7a2c },
      tackle: { mesh: 'cone', flight: 'slide', trail: 'dust', impact: 'slam', color: 0xf08a2c, speed: 9, model: 'boot', debris: 'dirt', debrisColor: 0x5a3d22 },
      glove: { mesh: 'sphere', flight: 'punch', trail: 'aqua', impact: 'save', color: 0xb779ff, speed: 8.8, size: 1.1, model: 'keeperGlove', debris: 'dirt', debrisColor: 0x3f7a2c },
      chain: { mesh: 'beam', flight: 'bolt', trail: 'electric', impact: 'chain', color: 0x6ff0ff, speed: 13, debris: 'sparks' },
      flare: { mesh: 'plasma', flight: 'lob', trail: 'firework', impact: 'burn', color: 0xff4444, speed: 9.5, size: 0.9, model: 'flareStick', debris: 'embers' },
      legend: { mesh: 'star', flight: 'heavy', trail: 'gold', impact: 'crit', color: 0xffc928, speed: 11.5, size: 1.25, model: 'goldenBoot', debris: 'sparks', debrisColor: 0xffd34d }
    },
    enemies: {
      swarm: { body: 'ball', color: 0xffffff, accent: 0x111111 },
      fire: { body: 'ball', color: 0xff5522, accent: 0xffdd66 },
      armored: { body: 'ball', color: 0x264d2e, accent: 0xd9f99d, effects: ['armorPlates'] },
      elite: { body: 'ball', color: 0xf97316, accent: 0xfef08a, effects: ['armorPlates'] },
      flying: { body: 'ball', color: 0xc7f9ff, accent: 0x44d3ff, effects: ['wings'] },
      flying_fire: { body: 'ball', color: 0xff7a33, accent: 0x7dd3fc, effects: ['wings'] },
      boss: { body: 'ball', color: 0xffffff, accent: 0xffd700, effects: ['crown'] },
      splitter: { body: 'ball', color: 0xffd23a, accent: 0x14161a },
      splitling: { body: 'ball', color: 0xffd23a, accent: 0x14161a },
      shielder: { body: 'ball', color: 0x1d4ed8, accent: 0x84cc16 },
      healer: { body: 'ball', color: 0xf6f6f2, accent: 0x22c55e }
    },
    towers: { family: 'soccer', base: 0x102812, metal: 0xd6d6d6, levelGlow: 0x22c55e }
  },
  space: {
    map: {
      background: 0x05040d,
      fog: 0x090616,
      fogDensity: 0.005,
      floor: {
        base: '#24273f',
        alt: '#17192b',
        line: 'rgba(171, 124, 255, 0.35)',
        meshColor: 0x30344f,
        roughness: 0.48,
        metalness: 0.38
      },
      path: { color: 0x9d7cff, emissive: 0x5b21b6, opacity: 0.42, edge: 0x67e8f9 },
      buildZone: { color: 0x67e8f9, opacity: 0.11, line: 0xc084fc },
      obstacle: { accent: 0xc084fc },
      base: { color: 0x67e8f9, icon: 'DEFEND CORE' },
      spawn: { color: 0xff3d81, icon: 'DRONES' }
    },
    lighting: {
      hemiSky: 0xbda4ff,
      hemiGround: 0x111827,
      hemiIntensity: 0.34,
      sun: 0xddd6ff,
      sunIntensity: 0.9,
      rim: 0x67e8f9,
      rimIntensity: 0.52,
      accent: 0xc084fc,
      spotIntensity: 2.8,
      exposure: 0.86
    },
    ui: { accent: '#c084fc', dark: '#05040d' },
    projectiles: {
      ball: { mesh: 'laser', flight: 'tracer', trail: 'laser', impact: 'spark', color: 0x67e8f9, speed: 20, beam: true, debris: 'sparks' },
      curveBall: { mesh: 'orb', flight: 'orb', trail: 'plasma', impact: 'plasma', color: 0xc084fc, speed: 12, size: 1.15, model: 'plasmaSlug', debris: 'ecto' },
      headButt: { mesh: 'ring', flight: 'ring', trail: 'gravity', impact: 'gravity', color: 0x7dd3fc, speed: 8, debris: 'ecto' },
      tackle: { mesh: 'shard', flight: 'spray', trail: 'ion', impact: 'slam', color: 0x38bdf8, speed: 10, model: 'ionSnare', debris: 'sparks' },
      glove: { mesh: 'sphere', flight: 'punch', trail: 'shield', impact: 'save', color: 0x93c5fd, speed: 9, size: 1.1, model: 'shieldPlate', debris: 'chunks', debrisColor: 0x8b9bb8 },
      chain: { mesh: 'bolt', flight: 'bolt', trail: 'electric', impact: 'chain', color: 0xf0abfc, speed: 15, debris: 'sparks' },
      flare: { mesh: 'plasma', flight: 'flame', trail: 'plasma', impact: 'burn', color: 0xff5ca8, speed: 11, size: 0.85, model: 'novaPod', debris: 'embers' },
      legend: { mesh: 'star', flight: 'heavy', trail: 'gold', impact: 'crit', color: 0xffc928, speed: 12, size: 1.25, model: 'commandMissile', debris: 'sparks', debrisColor: 0xffd34d }
    },
    enemies: {
      swarm: { body: 'orb', color: 0x67e8f9, accent: 0xffffff },
      fire: { body: 'orb', color: 0xff5ca8, accent: 0xffd1e3 },
      armored: { body: 'orb', color: 0x4c1d95, accent: 0xc084fc, effects: ['armorPlates'] },
      elite: { body: 'orb', color: 0x7c3aed, accent: 0xff5ca8, effects: ['armorPlates'] },
      flying: { body: 'orb', color: 0x93c5fd, accent: 0x67e8f9, effects: ['wings'] },
      flying_fire: { body: 'orb', color: 0xff5ca8, accent: 0x67e8f9, effects: ['wings'] },
      boss: { body: 'orb', color: 0x111827, accent: 0xffd700, effects: ['crown'] },
      splitter: { body: 'orb', color: 0xa3e635, accent: 0x67e8f9 },
      splitling: { body: 'orb', color: 0xa3e635, accent: 0x67e8f9 },
      shielder: { body: 'orb', color: 0x3b82f6, accent: 0x93c5fd },
      healer: { body: 'orb', color: 0xe9fbff, accent: 0x4ade80 }
    },
    towers: { family: 'space', base: 0x101827, metal: 0x8b9bb8, levelGlow: 0xc084fc }
  }
};

export function getVisualProfile(themeData) {
  return themeData?.visuals || VISUAL_PROFILES.hockey;
}
