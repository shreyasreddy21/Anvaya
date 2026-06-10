/**
 * deprecated_games strategy
 *
 * Games in DEPRECATED_GAME_KEYS are hidden from the production UI.
 * Their code, routes, and backend data are fully preserved.
 *
 * Clinical rationale:
 *   mathgame        — Arithmetic; not evidence-based for dyslexia (dyscalculia is a separate condition)
 *   quiz            — General-knowledge trivia; no phonological or decoding component
 *   shapememorygame — Visual-spatial shape memory; not phonics-aligned
 *
 * ROLLBACK: remove a key from the Set below. No other code changes are needed.
 * Routes in App.js remain registered; game files are untouched; DB data is intact.
 */
export const DEPRECATED_GAME_KEYS = new Set([
  'mathgame',
  'quiz',
  'shapememorygame',
]);

export function isDeprecated(gameKey) {
  return DEPRECATED_GAME_KEYS.has(gameKey);
}
