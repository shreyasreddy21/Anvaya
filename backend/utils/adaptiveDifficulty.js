/**
 * Adaptive difficulty engine — pure, side-effect-free decision logic.
 *
 * Turns recent performance + affect into a difficulty recommendation, so the
 * rich data the app already collects (accuracy, emotion) actively personalizes
 * the experience instead of just being logged.
 *
 * Kept pure (no DB, no I/O) so it is fully unit-testable. The route layer is
 * responsible for fetching the inputs and persisting nothing.
 */

export const DIFFICULTY_LADDER = ['easy', 'medium', 'hard'];

const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

/**
 * @param {object}   input
 * @param {number[]} input.recentAccuracies  recent accuracy values (0–100), newest-last or any order
 * @param {number}   input.frustrationScore  0–1 proportion of negative affect (angry/sad) in recent play
 * @param {string}   input.currentDifficulty 'easy' | 'medium' | 'hard'
 * @param {number}   [input.minSessions=2]   minimum sessions before any change is suggested
 * @returns {{ recommended:string, current:string, reason:string,
 *             avgAccuracy:number, frustrationScore:number, shouldPrompt:boolean }}
 */
export function recommendDifficulty({
  recentAccuracies = [],
  frustrationScore = 0,
  currentDifficulty = 'easy',
  minSessions = 2,
} = {}) {
  const current = DIFFICULTY_LADDER.includes(currentDifficulty) ? currentDifficulty : 'easy';
  const idx = DIFFICULTY_LADDER.indexOf(current);
  const avgAccuracy = Math.round(mean(recentAccuracies));
  const frustration = Math.max(0, Math.min(1, frustrationScore));

  const base = {
    recommended: current,
    current,
    avgAccuracy,
    frustrationScore: Math.round(frustration * 100) / 100,
  };

  // Not enough evidence — never nudge a child on one data point.
  if (recentAccuracies.length < minSessions) {
    return { ...base, reason: 'not_enough_data', shouldPrompt: false };
  }

  // Struggling or frustrated → ease off (highest priority: protect the child).
  if (frustration >= 0.5 && idx > 0) {
    return { ...base, recommended: DIFFICULTY_LADDER[idx - 1], reason: 'frustration', shouldPrompt: true };
  }
  if (avgAccuracy <= 50 && idx > 0) {
    return { ...base, recommended: DIFFICULTY_LADDER[idx - 1], reason: 'struggling', shouldPrompt: true };
  }

  // Mastering it with positive/neutral affect → offer to level up.
  if (avgAccuracy >= 85 && frustration < 0.25 && idx >= 0 && idx < DIFFICULTY_LADDER.length - 1) {
    return { ...base, recommended: DIFFICULTY_LADDER[idx + 1], reason: 'mastery', shouldPrompt: true };
  }

  return { ...base, reason: 'maintain', shouldPrompt: false };
}

/**
 * Compute a 0–1 frustration score from an array of expression samples.
 * Each sample may be a string ('angry') or an object ({ expression: 'angry' }).
 * Counts 'angry' and 'sad' (case-insensitive) as negative affect.
 */
export function frustrationFromExpressions(expressions = []) {
  if (!Array.isArray(expressions) || expressions.length === 0) return 0;
  let negative = 0;
  for (const e of expressions) {
    const label = (typeof e === 'string' ? e : e?.expression || '').toLowerCase();
    if (label === 'angry' || label === 'sad' || label === 'confused') negative++;
  }
  return negative / expressions.length;
}
