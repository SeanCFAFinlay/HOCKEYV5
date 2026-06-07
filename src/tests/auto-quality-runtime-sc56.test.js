import { beforeEach, describe, expect, it, vi } from 'vitest';

const renderer = {
  setPixelRatio: vi.fn(),
  shadowMap: {}
};

let qualityName = 'high';
const setPostProcessingQuality = vi.fn();
const applyRendererQuality = vi.fn();
const setQualityTier = vi.fn((name) => {
  qualityName = name;
  return true;
});

vi.mock('../js/engine/state.js', () => ({
  getState: () => ({ renderer })
}));

vi.mock('../js/engine/postprocessing.js', () => ({
  setPostProcessingQuality
}));

vi.mock('../js/rendering/quality.js', () => ({
  getQualityName: () => qualityName,
  setQualityTier,
  applyRendererQuality
}));

describe('SC-5.6 — adaptive quality runtime application', () => {
  beforeEach(() => {
    qualityName = 'high';
    setPostProcessingQuality.mockClear();
    applyRendererQuality.mockClear();
    setQualityTier.mockClear();
  });

  it('downgrades one tier and applies renderer/postprocessing quality after sustained slow frames', async () => {
    const { enableAutoQuality, resetAutoQuality, updateAutoQuality } = await import('../js/engine/auto-quality.js');

    resetAutoQuality();
    enableAutoQuality(true);

    for (let i = 0; i < 5; i++) {
      updateAutoQuality(1);
    }

    expect(setQualityTier).toHaveBeenCalledWith('medium');
    expect(applyRendererQuality).toHaveBeenCalledWith(renderer);
    expect(setPostProcessingQuality).toHaveBeenCalledWith('medium');
  });
});
