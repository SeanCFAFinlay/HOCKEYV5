// Game controls - speed buttons, sell mode, auto-wave

import { setGameSpeed } from '../engine/state.js';
import { setSpeedEffect } from '../engine/postprocessing.js';

export function initSpeedButtons() {
  document.querySelectorAll('.speed-btn').forEach(btn => {
    btn.onclick = () => {
      const speed = +btn.dataset.speed;
      setGameSpeed(speed);
      setSpeedEffect(speed);

      document.querySelectorAll('.speed-btn').forEach(b => {
        b.classList.toggle('active', +b.dataset.speed === speed);
      });
    };
  });
}

// Speed button handlers are already set up via onclick
// Additional control functionality can be added here
