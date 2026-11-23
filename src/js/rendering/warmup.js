// Shader warm-up, run under the arena loading screen.
//
// WebGL compiles a shader program the first time something with a new kind of
// material is drawn. Mid-match that meant a freeze the first time each enemy,
// tower and shot type appeared — on a phone, up to a second or more, right as
// a wave arrived. Here one of each is built, compiled and drawn once while the
// loader still covers the canvas, so the program cache is full before play.
//
// Enemy bodies go back into the enemy mesh pool afterwards, so the first
// spawns reuse them instead of building them again.

import { getState } from '../engine/state.js';
import { createEnemyMesh, returnEnemyMesh } from './enemy-meshes.js';
import { createTowerMesh } from './tower-meshes.js';
import { createShotMesh } from './projectile-models.js';
import { burstDebris, muzzleFlash, landingMarker, clearImpactFx } from '../systems/impact-fx.js';
import { getVisualProfile } from '../config/visual-profiles.js';
import { getComposer, isPostProcessingEnabled } from '../engine/postprocessing.js';

const first = v => (Array.isArray(v) ? v[0] : v);

export function warmUpShaders() {
  const state = getState();
  const { renderer, scene, camera, themeData } = state;
  if (!renderer || !scene || !camera || !themeData) return;

  const started = performance.now();
  const enemies = [];
  const towers = [];
  const shots = [];

  try {
    for (const ed of Object.values(themeData.enemies || {})) {
      if (!ed || typeof ed !== 'object') continue;
      const e = {
        type: ed.id, configId: ed.id, nm: ed.nm, role: ed.role,
        slot: ed.slot || ed.role?.toLowerCase(), speed: ed.speed,
        sz: ed.sz || 1, fire: !!ed.fire, flying: !!ed.flying, boss: !!ed.boss,
        speedClass: ed.speedClass, aura: ed.aura || null,
        x: 0, y: 0.2, z: 0, hp: 1, maxHp: 1, mesh: null
      };
      try {
        e.mesh = createEnemyMesh(e);
        if (e.mesh) {
          // Hidden parts are skipped by the renderer, so the shield bubble
          // would otherwise compile the first time a shielder protects someone.
          if (e.shieldBubble) e.shieldBubble.visible = true;
          scene.add(e.mesh);
          enemies.push(e);
        }
      } catch { /* one odd enemy must not stop the match from starting */ }
    }

    const visuals = getVisualProfile(themeData);
    for (const td of themeData.towers || []) {
      try {
        const t = { type: td.id, x: Math.floor((state.COLS || 12) / 2), y: Math.floor((state.ROWS || 10) / 2), lv: 0, rng: first(td.rng) || 2 };
        const mesh = createTowerMesh(t);   // adds itself to the scene
        if (mesh) towers.push(mesh);
      } catch { /* ignore */ }
      try {
        const profile = visuals.projectiles?.[td.projectile] || Object.values(visuals.projectiles || {})[0];
        if (profile) {
          const color = profile.color ?? new THREE.Color(td.clr).getHex();
          const shot = createShotMesh(state.theme, profile, color, profile.size || 1);
          shot.position.set(0, 1, 0);
          scene.add(shot);
          shots.push(shot);
        }
      } catch { /* ignore */ }
    }

    // One of each effect family (systems/impact-fx.js): solid and flat debris,
    // glowing sparks, a muzzle flash and a landing marker.
    try {
      burstDebris(0, 1, 0, 'chunks', 0xffffff, 1);
      burstDebris(0, 1, 0, 'paper', 0xffffff, 1);
      burstDebris(0, 1, 0, 'embers', 0xffffff, 1);
      muzzleFlash(0, 1, 0, 0xffffff, 0, 1);
      landingMarker(0, 0, 1, 0xffffff, 1);
    } catch { /* effects are optional */ }

    // Draw one frame exactly the way the game loop does. renderer.compile()
    // is not enough: the post-processing pipeline draws the scene into an
    // offscreen target, which needs different shader variants from drawing
    // straight to the screen, and compile() also skips the shadow pass.
    const composer = isPostProcessingEnabled() ? getComposer() : null;
    if (composer) {
      composer.render();
    } else {
      renderer.setRenderTarget(null);
      renderer.render(scene, camera);
    }
  } catch (err) {
    console.warn('[warmup] skipped:', err);
  } finally {
    try { clearImpactFx(); } catch { /* ignore */ }
    for (const e of enemies) {
      if (e.shieldBubble) e.shieldBubble.visible = false;
      scene.remove(e.mesh);
      try { returnEnemyMesh(e); } catch { /* ignore */ }
    }
    for (const m of towers) {
      scene.remove(m);
      // Geometry only: materials may be shared with real towers, and freeing
      // them would throw away the very programs this just compiled.
      m.traverse(o => { if (o.geometry && !o.userData?.sharedResources) o.geometry.dispose?.(); });
    }
    for (const s of shots) scene.remove(s);
  }
  if (typeof window !== 'undefined' && window.__PERF_DEBUG__) {
    console.log(`[warmup] ${enemies.length} enemies, ${towers.length} towers, ${shots.length} shots in ${Math.round(performance.now() - started)}ms`);
  }
}
