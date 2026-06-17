/**
 * Per-child emotion calibration.
 *
 * Every child has a slightly different *resting* face — naturally lowered brows,
 * a faint asymmetry, slightly parted lips. Feeding raw MediaPipe blendshapes to
 * the classifier turns those quirks into false "Angry"/"Confused"/"Sad" reads.
 *
 * Calibration records a short NEUTRAL baseline (the average blendshape vector of
 * the child's calm face) and subtracts it from every live frame, so the
 * classifier sees DEVIATIONS from this child's normal face rather than absolute
 * coefficients. The baseline is stored per child in localStorage (privacy-safe:
 * it's a handful of numbers, never an image) and reused across sessions.
 */

const KEY_PREFIX  = 'joyverse-emotion-baseline:';
const CALIB_FRAMES = 12;   // calm frames to average into a baseline (~5s at 400ms)
const MAX_SMILE    = 0.30; // frames more expressive than this don't count as "neutral"
const MAX_JAW      = 0.30;

export function getBaseline(username) {
  if (!username) return null;
  try {
    const raw = localStorage.getItem(KEY_PREFIX + username);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveBaseline(username, baseline) {
  if (!username || !baseline) return;
  try {
    localStorage.setItem(KEY_PREFIX + username, JSON.stringify(baseline));
  } catch {
    /* storage unavailable — calibration just won't persist this session */
  }
}

/** Let a parent/therapist reset a child's baseline (e.g. new camera/lighting). */
export function clearBaseline(username) {
  try { localStorage.removeItem(KEY_PREFIX + username); } catch (_) {}
}

function toMap(categories) {
  const m = {};
  for (const c of categories) m[c.categoryName] = c.score;
  return m;
}

// Only genuinely calm frames should shape the neutral baseline — otherwise a
// child who smiles during the first seconds would bake a smile into "neutral".
function isCalmFrame(map) {
  const smile = ((map.mouthSmileLeft || 0) + (map.mouthSmileRight || 0)) / 2;
  const frown = ((map.mouthFrownLeft || 0) + (map.mouthFrownRight || 0)) / 2;
  const jaw   = map.jawOpen || 0;
  return smile < MAX_SMILE && frown < MAX_SMILE && jaw < MAX_JAW;
}

/**
 * Accumulates calm frames into a neutral baseline.
 * @returns collector with add(categories) → still-collecting bool, and finalize().
 */
export function createBaselineCollector(targetFrames = CALIB_FRAMES) {
  const sums = {};
  let count = 0;
  return {
    /** Returns true while still collecting, false once enough calm frames seen. */
    add(categories) {
      if (!Array.isArray(categories) || categories.length === 0) return true;
      if (!isCalmFrame(toMap(categories))) return true; // skip expressive frames
      for (const c of categories) {
        sums[c.categoryName] = (sums[c.categoryName] || 0) + c.score;
      }
      count += 1;
      return count < targetFrames;
    },
    get count() { return count; },
    finalize() {
      if (count === 0) return null;
      const baseline = {};
      for (const k of Object.keys(sums)) baseline[k] = sums[k] / count;
      return baseline;
    },
  };
}

/**
 * Subtract the child's neutral baseline from a live blendshape categories array,
 * clamped at 0. Returns a new array of { categoryName, score }. Passing a null
 * baseline returns the input unchanged (so the app works before calibration).
 */
export function applyBaseline(categories, baseline) {
  if (!baseline || !Array.isArray(categories)) return categories;
  return categories.map((c) => ({
    categoryName: c.categoryName,
    score: Math.max(0, c.score - (baseline[c.categoryName] || 0)),
  }));
}
