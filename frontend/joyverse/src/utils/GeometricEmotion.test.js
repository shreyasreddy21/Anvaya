import { describe, it, expect } from 'vitest';
import { classifyEmotion, computeFeatures } from './GeometricEmotion';

// A plausible neutral face in MediaPipe-normalized [0,1] coordinates.
// Only the landmark indices the classifier actually reads are set; the rest
// default to face-centre. Passed through classifyEmotion with a 640×480 frame.
const NEUTRAL = {
  10:  [0.50, 0.20],  // forehead
  152: [0.50, 0.85],  // chin
  61:  [0.42, 0.70],  // mouth corner L
  291: [0.58, 0.70],  // mouth corner R
  13:  [0.50, 0.685], // inner upper lip
  14:  [0.50, 0.705], // inner lower lip
  159: [0.40, 0.42],  // L eye top
  145: [0.40, 0.45],  // L eye bottom
  386: [0.60, 0.42],  // R eye top
  374: [0.60, 0.45],  // R eye bottom
  105: [0.40, 0.35],  // L brow mid
  334: [0.60, 0.35],  // R brow mid
  55:  [0.44, 0.35],  // L brow inner
  285: [0.56, 0.35],  // R brow inner
};

function makeFace(overrides = {}) {
  const pts = Array.from({ length: 478 }, () => ({ x: 0.5, y: 0.5 }));
  for (const [idx, [x, y]] of Object.entries({ ...NEUTRAL, ...overrides })) {
    pts[idx] = { x, y };
  }
  return pts;
}

const classify = (overrides) => classifyEmotion(makeFace(overrides), 640, 480);

describe('GeometricEmotion', () => {
  it('returns null for too-few landmarks', () => {
    expect(computeFeatures([{ x: 0.5, y: 0.5 }])).toBeNull();
  });

  it('classifies a neutral face as Neutral', () => {
    expect(classify().emotion).toBe('Neutral');
  });

  it('classifies raised mouth corners as Happy', () => {
    // corners lifted (smaller y) and slightly wider
    const r = classify({ 61: [0.40, 0.64], 291: [0.60, 0.64] });
    expect(r.emotion).toBe('Happy');
  });

  it('REGRESSION: a smile is never read as Angry or Sad', () => {
    // This was the original production bug (smiles → Angry, neutral → Sad).
    const r = classify({ 61: [0.40, 0.64], 291: [0.60, 0.64] });
    expect(r.emotion).not.toBe('Angry');
    expect(r.emotion).not.toBe('Sad');
  });

  it('classifies down-turned mouth corners as Sad', () => {
    const r = classify({ 61: [0.42, 0.74], 291: [0.58, 0.74] });
    expect(r.emotion).toBe('Sad');
  });

  it('classifies raised brows + wide eyes + open mouth as Surprise', () => {
    const r = classify({
      105: [0.40, 0.28], 334: [0.60, 0.28],   // brows up
      55:  [0.44, 0.28], 285: [0.56, 0.28],
      145: [0.40, 0.49], 374: [0.60, 0.49],   // eyes wider
      14:  [0.50, 0.78],                        // mouth open
    });
    expect(r.emotion).toBe('Surprise');
  });

  it('always returns a normalized probability vector', () => {
    const r = classify();
    expect(r.probabilities).toHaveLength(6);
    const sum = r.probabilities.reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 5);
  });
});
