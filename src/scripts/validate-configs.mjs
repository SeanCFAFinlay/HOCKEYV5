import { THEMES } from '../js/config/themes.js';
import { validateAllConfigs, validateWave } from '../js/config/validation.js';
import { generateWaves } from '../js/config/waves.js';

const result = validateAllConfigs(THEMES);
const errors = [...result.errors];

for (const [themeId, theme] of Object.entries(THEMES)) {
  for (const map of theme.maps) {
    const waves = generateWaves(map.waves, theme, { mode: 'campaign' });
    waves.forEach((waveData, index) => {
      errors.push(...validateWave(waveData, theme.enemies, `${themeId}/${map.name}/${index + 1}`));
    });
  }
}

if (errors.length > 0) {
  console.error('Config validation failed:');
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}

if (result.warnings.length > 0) {
  console.warn('Config validation warnings:');
  result.warnings.forEach(warning => console.warn(`- ${warning}`));
}

console.log(`Config validation passed for ${Object.keys(THEMES).length} content packs.`);
