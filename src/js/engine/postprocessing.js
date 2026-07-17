/**
 * Post-processing pipeline for bloom, vignette, FXAA, and dynamic screen effects.
 * Self-contained implementation using Three.js r128 globals (window.THREE).
 *
 * Quality tiers (see TIER_CONFIG, the single source of truth):
 *   low    — pipeline bypassed entirely, straight to screen
 *   medium — bloom + vignette at 0.75x render scale
 *   high   — bloom + vignette + FXAA at full scale
 *   ultra  — as high, with stronger bloom
 *
 * SC-3.7 additions:
 *   setDangerVignette(active)           — red pulse vignette when lives ≤ 3
 *   triggerScreenFlash(color, duration) — brief white overlay
 *   triggerChromaticAberration(i, dur)  — brief RGB channel split
 *   setSpeedEffect(speedMultiplier)     — edge darkening at high speed
 *   updateScreenEffects(dt)             — per-frame effect animation
 */

// ── Module state ─────────────────────────────────────────────────────────────

let composer = null;
let ppEnabled = false;
let bloomStrength = 0.26;

// The drawing-buffer size the composer would use at renderScale 1. Kept separate
// from the composer's current size because render scale is applied relative to
// THIS, not to whatever the buffer happens to be now — scaling off the current
// size compounds every time the tier is re-applied.
let baseWidth = 0;
let baseHeight = 0;
let renderScale = 1;

/** Per-tier pipeline config. The single source of truth for what each tier does. */
const TIER_CONFIG = {
  low:    { pp: false, renderScale: 1,    bloom: null,                                vignette: false, fxaa: false },
  medium: { pp: true,  renderScale: 0.75, bloom: { strength: 0.14, threshold: 0.94 }, vignette: true,  fxaa: false },
  high:   { pp: true,  renderScale: 1,    bloom: { strength: 0.26, threshold: 0.92 }, vignette: true,  fxaa: true  },
  ultra:  { pp: true,  renderScale: 1,    bloom: { strength: 0.32, threshold: 0.88 }, vignette: true,  fxaa: true  }
};

function _applyRenderScale() {
  if (!composer || !baseWidth || !baseHeight) return;
  composer.setSize(
    Math.max(1, Math.floor(baseWidth * renderScale)),
    Math.max(1, Math.floor(baseHeight * renderScale))
  );
}

// SC-3.7 effect state
const effectState = {
  dangerActive:  false,
  dangerTime:    0,
  flashActive:   false,
  flashTime:     0,
  flashDuration: 0.1,   // seconds
  chromaActive:  false,
  chromaTime:    0,
  chromaDuration: 0.2,  // seconds
  chromaInitial:  0,
  speedMult:      1
};

// ── Vignette GLSL Shader ─────────────────────────────────────────────────────

const VignetteShader = {
  uniforms: {
    tDiffuse:      { value: null },
    offset:        { value: 0.95 },
    darkness:      { value: 0.4 },
    dangerMode:    { value: 0 },       // SC-3.7: 0=off 1=on
    speedDarkness: { value: 0.0 }      // SC-3.7: extra darkness from speed
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float offset;
    uniform float darkness;
    uniform float dangerMode;
    uniform float speedDarkness;
    varying vec2 vUv;

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      vec2 uv = (vUv - 0.5) * 2.0;
      float dist = dot(uv, uv) * 0.5 + 0.3;
      float vignette = smoothstep(offset, offset - 0.05, dist);

      float totalDark = darkness + speedDarkness;
      vec3 darkColor = mix(
        vec3(0.3, 0.0, 0.0) * dangerMode,
        vec3(0.0),
        1.0 - dangerMode
      );
      vec3 vignetteColor = mix(color.rgb * (1.0 - totalDark), color.rgb, vignette);
      vec3 dangerTint = mix(vignetteColor, darkColor, (1.0 - vignette) * dangerMode * 0.5);

      gl_FragColor = vec4(mix(vignetteColor, dangerTint, dangerMode), color.a);
    }
  `
};

// ── FXAA GLSL Shader ─────────────────────────────────────────────────────────

const FXAAShader = {
  uniforms: {
    tDiffuse:   { value: null },
    resolution: { value: null } // initialized in createFXAAPass
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 resolution;
    varying vec2 vUv;

    #define FXAA_REDUCE_MIN   (1.0 / 128.0)
    #define FXAA_REDUCE_MUL   (1.0 / 8.0)
    #define FXAA_SPAN_MAX     8.0

    void main() {
      vec2 rcpFrame = vec2(1.0) / resolution;

      vec3 rgbNW = texture2D(tDiffuse, vUv + vec2(-1.0, -1.0) * rcpFrame).rgb;
      vec3 rgbNE = texture2D(tDiffuse, vUv + vec2( 1.0, -1.0) * rcpFrame).rgb;
      vec3 rgbSW = texture2D(tDiffuse, vUv + vec2(-1.0,  1.0) * rcpFrame).rgb;
      vec3 rgbSE = texture2D(tDiffuse, vUv + vec2( 1.0,  1.0) * rcpFrame).rgb;
      vec3 rgbM  = texture2D(tDiffuse, vUv).rgb;

      vec3 luma = vec3(0.299, 0.587, 0.114);
      float lumaNW = dot(rgbNW, luma);
      float lumaNE = dot(rgbNE, luma);
      float lumaSW = dot(rgbSW, luma);
      float lumaSE = dot(rgbSE, luma);
      float lumaM  = dot(rgbM,  luma);

      float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));
      float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));

      vec2 dir;
      dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));
      dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));

      float dirReduce = max(
        (lumaNW + lumaNE + lumaSW + lumaSE) * (0.25 * FXAA_REDUCE_MUL),
        FXAA_REDUCE_MIN
      );
      float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);
      dir = min(vec2(FXAA_SPAN_MAX), max(vec2(-FXAA_SPAN_MAX), dir * rcpDirMin)) * rcpFrame;

      vec3 rgbA = 0.5 * (
        texture2D(tDiffuse, vUv + dir * (1.0 / 3.0 - 0.5)).rgb +
        texture2D(tDiffuse, vUv + dir * (2.0 / 3.0 - 0.5)).rgb
      );
      vec3 rgbB = rgbA * 0.5 + 0.25 * (
        texture2D(tDiffuse, vUv + dir * -0.5).rgb +
        texture2D(tDiffuse, vUv + dir *  0.5).rgb
      );

      float lumaB = dot(rgbB, luma);
      if (lumaB < lumaMin || lumaB > lumaMax) {
        gl_FragColor = vec4(rgbA, 1.0);
      } else {
        gl_FragColor = vec4(rgbB, 1.0);
      }
    }
  `
};

// ── SC-3.7 Flash Shader ───────────────────────────────────────────────────────

const FlashShader = {
  uniforms: {
    tDiffuse:     { value: null },
    flashColor:   { value: [1, 1, 1] },
    flashOpacity: { value: 0.0 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec3 flashColor;
    uniform float flashOpacity;
    varying vec2 vUv;

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      gl_FragColor = vec4(mix(color.rgb, flashColor, flashOpacity), color.a);
    }
  `
};

// ── SC-3.7 Chromatic Aberration Shader ────────────────────────────────────────

const ChromaticAberrationShader = {
  uniforms: {
    tDiffuse:  { value: null },
    intensity: { value: 0.0 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float intensity;
    varying vec2 vUv;

    void main() {
      vec2 offset = vec2(intensity, 0.0);
      float r = texture2D(tDiffuse, vUv + offset).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv - offset).b;
      float a = texture2D(tDiffuse, vUv).a;
      gl_FragColor = vec4(r, g, b, a);
    }
  `
};

// ── Internal helpers ──────────────────────────────────────────────────────────

function createRenderTarget(width, height) {
  const T = globalThis.THREE || window.THREE;
  return new T.WebGLRenderTarget(width, height, {
    minFilter: T.LinearFilter,
    magFilter: T.LinearFilter,
    format: T.RGBAFormat,
    type: T.UnsignedByteType
  });
}

function createFullscreenPass(name, uniforms, vertexShader, fragmentShader, width, height) {
  const T = globalThis.THREE || window.THREE;

  const resolvedUniforms = {};
  for (const [key, val] of Object.entries(uniforms)) {
    resolvedUniforms[key] = { value: normalizeUniformValue(val.value, T) };
  }

  const material = new T.ShaderMaterial({
    uniforms: resolvedUniforms,
    vertexShader,
    fragmentShader
  });

  const scene   = new T.Scene();
  const camera  = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quad    = new T.Mesh(new T.PlaneGeometry(2, 2), material);
  scene.add(quad);

  return {
    name,
    uniforms:  resolvedUniforms,
    material,
    scene,
    camera,
    enabled:   true,

    render(renderer, readTarget, writeTarget) {
      if (!this.enabled) return;
      resolvedUniforms.tDiffuse && (resolvedUniforms.tDiffuse.value = readTarget.texture);
      renderer.setRenderTarget(writeTarget);
      renderer.clear();
      renderer.render(scene, camera);
    }
  };
}

function normalizeUniformValue(value, T) {
  if (
    value &&
    typeof value === 'object' &&
    'r' in value &&
    'g' in value &&
    'b' in value &&
    typeof value.toArray !== 'function'
  ) {
    return [value.r, value.g, value.b];
  }

  return value;
}

function createRenderPass(scene, camera) {
  return {
    name: 'RenderPass',
    scene,
    camera,
    enabled: true,

    render(renderer, _readTarget, writeTarget) {
      renderer.setRenderTarget(writeTarget);
      renderer.clear();
      renderer.render(scene, camera);
    }
  };
}

function createBloomPass(width, height, threshold, strength, radius) {
  // Simplified single-pass luminance threshold bloom
  const T = globalThis.THREE || window.THREE;

  const uniforms = {
    tDiffuse:  { value: null },
    threshold: { value: threshold },
    strength:  { value: strength },
    radius:    { value: radius }
  };

  const material = new T.ShaderMaterial({
    uniforms,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform float threshold;
      uniform float strength;
      uniform float radius;
      varying vec2 vUv;

      vec4 sampleBlur(sampler2D tex, vec2 uv, vec2 texel) {
        vec4 sum = vec4(0.0);
        float r = radius;
        sum += texture2D(tex, uv + vec2(-r, -r) * texel) * 0.0625;
        sum += texture2D(tex, uv + vec2( 0, -r) * texel) * 0.125;
        sum += texture2D(tex, uv + vec2( r, -r) * texel) * 0.0625;
        sum += texture2D(tex, uv + vec2(-r,  0) * texel) * 0.125;
        sum += texture2D(tex, uv                        ) * 0.25;
        sum += texture2D(tex, uv + vec2( r,  0) * texel) * 0.125;
        sum += texture2D(tex, uv + vec2(-r,  r) * texel) * 0.0625;
        sum += texture2D(tex, uv + vec2( 0,  r) * texel) * 0.125;
        sum += texture2D(tex, uv + vec2( r,  r) * texel) * 0.0625;
        return sum;
      }

      void main() {
        vec4 base = texture2D(tDiffuse, vUv);
        float lum = dot(base.rgb, vec3(0.2126, 0.7152, 0.0722));
        vec2 texel = vec2(1.0 / 800.0, 1.0 / 600.0);
        vec4 blur = sampleBlur(tDiffuse, vUv, texel);
        float bright = max(0.0, lum - threshold);
        vec3 bloom = blur.rgb * bright * strength * 2.0;
        gl_FragColor = vec4(base.rgb + bloom, base.a);
      }
    `
  });

  const sceneQ  = new T.Scene();
  const cameraQ = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quad    = new T.Mesh(new T.PlaneGeometry(2, 2), material);
  sceneQ.add(quad);

  return {
    name: 'BloomPass',
    uniforms,
    material,
    enabled: true,

    render(renderer, readTarget, writeTarget) {
      if (!this.enabled) return;
      uniforms.tDiffuse.value = readTarget.texture;
      renderer.setRenderTarget(writeTarget);
      renderer.clear();
      renderer.render(sceneQ, cameraQ);
    }
  };
}

function createVignettePass(width, height) {
  const T = globalThis.THREE || window.THREE;

  const uniforms = {
    tDiffuse:      { value: null },
    offset:        { value: VignetteShader.uniforms.offset.value },
    darkness:      { value: VignetteShader.uniforms.darkness.value },
    dangerMode:    { value: 0 },
    speedDarkness: { value: 0.0 }
  };

  const material = new T.ShaderMaterial({
    uniforms,
    vertexShader:   VignetteShader.vertexShader,
    fragmentShader: VignetteShader.fragmentShader
  });

  const sceneQ  = new T.Scene();
  const cameraQ = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quad    = new T.Mesh(new T.PlaneGeometry(2, 2), material);
  sceneQ.add(quad);

  return {
    name: 'VignettePass',
    uniforms,
    material,
    enabled: true,

    render(renderer, readTarget, writeTarget) {
      if (!this.enabled) return;
      uniforms.tDiffuse.value = readTarget.texture;
      renderer.setRenderTarget(writeTarget);
      renderer.clear();
      renderer.render(sceneQ, cameraQ);
    }
  };
}

function createFXAAPass(width, height) {
  const T = globalThis.THREE || window.THREE;

  const uniforms = {
    tDiffuse:   { value: null },
    resolution: { value: new T.Vector2(width, height) }
  };

  const material = new T.ShaderMaterial({
    uniforms,
    vertexShader:   FXAAShader.vertexShader,
    fragmentShader: FXAAShader.fragmentShader
  });

  const sceneQ  = new T.Scene();
  const cameraQ = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quad    = new T.Mesh(new T.PlaneGeometry(2, 2), material);
  sceneQ.add(quad);

  return {
    name: 'FXAAPass',
    uniforms,
    material,
    enabled: true,

    render(renderer, readTarget, writeTarget) {
      if (!this.enabled) return;
      uniforms.tDiffuse.value = readTarget.texture;
      renderer.setRenderTarget(writeTarget);
      renderer.clear();
      renderer.render(sceneQ, cameraQ);
    }
  };
}

// ── SC-3.7 Pass factories ─────────────────────────────────────────────────────

function createFlashPass(width, height) {
  const T = globalThis.THREE || window.THREE;

  const uniforms = {
    tDiffuse:     { value: null },
    flashColor:   { value: new T.Vector3(1, 1, 1) },
    flashOpacity: { value: 0.0 }
  };

  const material = new T.ShaderMaterial({
    uniforms,
    vertexShader:   FlashShader.vertexShader,
    fragmentShader: FlashShader.fragmentShader
  });

  const sceneQ  = new T.Scene();
  const cameraQ = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quad    = new T.Mesh(new T.PlaneGeometry(2, 2), material);
  sceneQ.add(quad);

  return {
    name: 'FlashPass',
    uniforms,
    material,
    enabled: false,

    render(renderer, readTarget, writeTarget) {
      if (!this.enabled) return;
      uniforms.tDiffuse.value = readTarget.texture;
      renderer.setRenderTarget(writeTarget);
      renderer.clear();
      renderer.render(sceneQ, cameraQ);
    }
  };
}

function createChromaticAberrationPass(width, height) {
  const T = globalThis.THREE || window.THREE;

  const uniforms = {
    tDiffuse:  { value: null },
    intensity: { value: 0.0 }
  };

  const material = new T.ShaderMaterial({
    uniforms,
    vertexShader:   ChromaticAberrationShader.vertexShader,
    fragmentShader: ChromaticAberrationShader.fragmentShader
  });

  const sceneQ  = new T.Scene();
  const cameraQ = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quad    = new T.Mesh(new T.PlaneGeometry(2, 2), material);
  sceneQ.add(quad);

  return {
    name: 'ChromaticAberrationPass',
    uniforms,
    material,
    enabled: false,

    render(renderer, readTarget, writeTarget) {
      if (!this.enabled) return;
      uniforms.tDiffuse.value = readTarget.texture;
      renderer.setRenderTarget(writeTarget);
      renderer.clear();
      renderer.render(sceneQ, cameraQ);
    }
  };
}

// ── EffectComposer (ping-pong render targets) ─────────────────────────────────

function createComposer(renderer, scene, camera, width, height) {
  const rtA = createRenderTarget(width, height);
  const rtB = createRenderTarget(width, height);

  const renderPass   = createRenderPass(scene, camera);
  const bloomPass    = createBloomPass(width, height, 0.92, bloomStrength, 0.24);
  const vignettePass = createVignettePass(width, height);
  const fxaaPass     = createFXAAPass(width, height);
  const flashPass    = createFlashPass(width, height);
  const chromaPass   = createChromaticAberrationPass(width, height);
  // Order matters: bloom wants the raw render; vignette and FXAA come last so
  // they act on the final composite rather than being blurred by later passes.
  //
  // There were once SSAO / motion-blur / SSR / depth-of-field passes here. They
  // sampled tNormalDepth / tVelocity / tPosition / tDepth — G-buffer textures
  // that were never rendered or bound, so they read blank and produced garbage
  // (DoF in particular smeared the whole frame across itself). Re-adding any of
  // them requires a real depth+normal prepass first.
  //
  // A "glow" pass also lived here. It did `color.rgb + glowColor * strength`
  // with no threshold — a flat gold constant added to every pixel, which lifted
  // the arena's near-black to olive. Bloom is the pass that actually glows.
  const passes = [renderPass, bloomPass, chromaPass, flashPass, vignettePass, fxaaPass];

  // createFullscreenPass defaults to enabled. Flash and chromatic aberration are
  // event-driven — triggerScreenFlash / triggerChromaticAberration switch them
  // on and the update tick switches them back off. Left enabled they'd cost a
  // full-screen pass every frame to composite nothing.
  flashPass.enabled = false;
  chromaPass.enabled = false;

  return {
    renderer,
    passes,
    _rtA: rtA,
    _rtB: rtB,
    _width: width,
    _height: height,

    render() {
      if (!ppEnabled) {
        renderer.setRenderTarget(null);
        renderer.render(scene, camera);
        return;
      }

      // Find the last ENABLED pass index so it renders to screen (null target)
      let lastEnabledIdx = -1;
      for (let i = passes.length - 1; i >= 0; i--) {
        if (passes[i].enabled) { lastEnabledIdx = i; break; }
      }

      if (lastEnabledIdx === -1) {
        // No passes enabled — fallback to direct render
        renderer.setRenderTarget(null);
        renderer.render(scene, camera);
        return;
      }

      let read  = rtA;
      let write = rtB;

      for (let i = 0; i < passes.length; i++) {
        const pass = passes[i];
        if (!pass.enabled) continue;

        const isLast = (i === lastEnabledIdx);
        pass.render(renderer, read, isLast ? null : write);

        if (!isLast) {
          const tmp = read;
          read  = write;
          write = tmp;
        }
      }

      renderer.setRenderTarget(null);
    },

    setSize(w, h) {
      this._width  = w;
      this._height = h;
      rtA.setSize(w, h);
      rtB.setSize(w, h);

      // Every pass carrying a resolution uniform needs it in sync with the
      // drawing buffer, or its texel maths samples the wrong neighbours.
      for (const pass of passes) {
        if (pass.uniforms?.resolution) {
          pass.uniforms.resolution.value.x = w;
          pass.uniforms.resolution.value.y = h;
        }
      }
    },

    dispose() {
      rtA.dispose();
      rtB.dispose();
    }
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Initialize the post-processing pipeline.
 * @param {THREE.WebGLRenderer} renderer
 * @param {THREE.Scene} scene
 * @param {THREE.Camera} camera
 * @returns {object} composer
 */
export function initPostProcessing(renderer, scene, camera) {
  const _size = new THREE.Vector2();
  renderer.getSize(_size);
  const width  = _size.x || 800;
  const height = _size.y || 600;

  baseWidth  = width;
  baseHeight = height;

  composer  = createComposer(renderer, scene, camera, width, height);
  ppEnabled = true;
  _applyRenderScale();

  return composer;
}

/**
 * Update composer and passes on window resize.
 * @param {number} width
 * @param {number} height
 * @returns {boolean} true if resize was applied, false if not initialized
 */
export function resizePostProcessing(width, height) {
  if (!composer) return false;
  // Record the new full-resolution base, then re-apply the tier's render scale
  // on top of it. Passing the scaled size straight through would make the next
  // tier change scale an already-scaled buffer.
  baseWidth  = width;
  baseHeight = height;
  _applyRenderScale();
  return true;
}

/**
 * Set quality tier which gates which effects are active.
 * @param {'low'|'medium'|'high'|'ultra'} tier
 */
export function setPostProcessingQuality(tier) {
  const cfg = TIER_CONFIG[tier] || TIER_CONFIG.high;

  // ppEnabled is meaningful even before a composer exists — callers read it.
  ppEnabled = cfg.pp;
  if (cfg.bloom) bloomStrength = cfg.bloom.strength;

  if (!composer) return;

  const pass = name => composer.passes.find(p => p.name === name);

  const bloomPass = pass('BloomPass');
  if (bloomPass) {
    bloomPass.enabled = !!cfg.bloom;
    if (cfg.bloom) {
      bloomPass.uniforms.strength.value  = cfg.bloom.strength;
      bloomPass.uniforms.threshold.value = cfg.bloom.threshold;
    }
  }

  const vignettePass = pass('VignettePass');
  if (vignettePass) vignettePass.enabled = cfg.vignette;

  const fxaaPass = pass('FXAAPass');
  if (fxaaPass) fxaaPass.enabled = cfg.fxaa;

  // Event-driven passes stay off until something triggers them; the tier must
  // not switch them on, or every frame pays for an effect nobody asked for.
  const flashPass = pass('FlashPass');
  if (flashPass) flashPass.enabled = false;
  const chromaPass = pass('ChromaticAberrationPass');
  if (chromaPass) chromaPass.enabled = false;

  renderScale = cfg.renderScale;
  _applyRenderScale();
}

/**
 * Whether post-processing is currently active.
 * @returns {boolean}
 */
export function isPostProcessingEnabled() {
  return ppEnabled;
}

/**
 * Get the current bloom strength value.
 * @returns {number}
 */
export function getBloomStrength() {
  return bloomStrength;
}

/**
 * Get the active composer instance (or null).
 * @returns {object|null}
 */
export function getComposer() {
  return composer;
}

// ── SC-3.7: Dynamic Screen Effects ───────────────────────────────────────────

/**
 * Enable/disable red danger vignette (lives ≤ 3).
 * @param {boolean} active
 */
export function setDangerVignette(active) {
  effectState.dangerActive = !!active;
  if (!active) effectState.dangerTime = 0;
  if (!composer) return;

  const vp = composer.passes.find(p => p.name === 'VignettePass');
  if (!vp) return;
  vp.uniforms.dangerMode.value = active ? 1 : 0;
}

/**
 * Trigger a brief screen flash overlay.
 * @param {number} color    hex color (default 0xffffff)
 * @param {number} duration milliseconds (default 100)
 */
export function triggerScreenFlash(color = 0xffffff, duration = 100) {
  if (!composer) return;

  const fp = composer.passes.find(p => p.name === 'FlashPass');
  if (!fp) return;

  effectState.flashActive   = true;
  effectState.flashTime     = 0;
  effectState.flashDuration = duration / 1000;
  fp.enabled = true;
  const T = globalThis.THREE || window.THREE;
  const c = new T.Color(color);
  fp.uniforms.flashColor.value.set(c.r, c.g, c.b);
  fp.uniforms.flashOpacity.value = 0;
}

/**
 * Trigger a brief chromatic aberration effect on boss kill.
 * @param {number} intensity UV offset (default 0.005)
 * @param {number} duration  milliseconds (default 200)
 */
export function triggerChromaticAberration(intensity = 0.005, duration = 200) {
  if (!composer) return;

  const cp = composer.passes.find(p => p.name === 'ChromaticAberrationPass');
  if (!cp) return;

  effectState.chromaActive   = true;
  effectState.chromaTime     = 0;
  effectState.chromaDuration = duration / 1000;
  effectState.chromaInitial  = intensity;
  cp.enabled = true;
  cp.uniforms.intensity.value = intensity;
}

/**
 * Adjust speed-based edge darkening.
 * @param {number} speedMultiplier  1 = normal, 2 = subtle, 3 = noticeable
 */
export function setSpeedEffect(speedMultiplier) {
  effectState.speedMult = speedMultiplier;
  if (!composer) return;

  const vp = composer.passes.find(p => p.name === 'VignettePass');
  if (!vp) return;

  // Map: 1x→0, 2x→0.1, 3x→0.25
  const extra = Math.max(0, (speedMultiplier - 1) / 2) * 0.25;
  vp.uniforms.speedDarkness.value = extra;
}

/**
 * Per-frame update for animated screen effects. Call from game loop.
 * @param {number} dt  delta time in seconds
 */
export function updateScreenEffects(dt) {
  if (!composer) return;

  _updateDangerPulse(dt);
  _updateFlash(dt);
  _updateChroma(dt);
}

function _updateDangerPulse(dt) {
  if (!effectState.dangerActive) return;

  effectState.dangerTime += dt;
  const vp = composer.passes.find(p => p.name === 'VignettePass');
  if (!vp) return;

  // Oscillate darkness 0.4 → 0.7 at 1Hz
  const pulse = 0.55 + 0.15 * Math.sin(effectState.dangerTime * 2 * Math.PI);
  vp.uniforms.darkness.value = pulse;
}

function _updateFlash(dt) {
  if (!effectState.flashActive) return;

  const fp = composer && composer.passes.find(p => p.name === 'FlashPass');
  if (!fp) return;

  effectState.flashTime += dt;
  const t = Math.min(effectState.flashTime / effectState.flashDuration, 1);

  // Ramp 0→0.3→0 (triangle)
  const opacity = t < 0.5 ? t * 2 * 0.3 : (1 - t) * 2 * 0.3;
  fp.uniforms.flashOpacity.value = opacity;

  if (t >= 1) {
    fp.uniforms.flashOpacity.value = 0;
    fp.enabled = false;
    effectState.flashActive = false;
  }
}

function _updateChroma(dt) {
  if (!effectState.chromaActive) return;

  const cp = composer && composer.passes.find(p => p.name === 'ChromaticAberrationPass');
  if (!cp) return;

  effectState.chromaTime += dt;
  const t = Math.min(effectState.chromaTime / effectState.chromaDuration, 1);

  // Linear decay from initial to 0
  cp.uniforms.intensity.value = effectState.chromaInitial * (1 - t);

  if (t >= 1) {
    cp.uniforms.intensity.value = 0;
    cp.enabled = false;
    effectState.chromaActive = false;
  }
}


