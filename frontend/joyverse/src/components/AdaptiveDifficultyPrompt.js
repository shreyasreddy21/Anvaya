import React, { useState, useEffect } from 'react';
import useAdaptiveDifficulty from '../hooks/useAdaptiveDifficulty';
import AdaptiveSuggestion from './AdaptiveSuggestion';

/**
 * AdaptiveDifficultyPrompt — drop-in adaptive-difficulty banner for any game.
 *
 * Wraps useAdaptiveDifficulty + AdaptiveSuggestion and normalizes difficulty
 * casing so a game can pass its own difficulty state as-is, whether it stores
 * 'easy' or 'Easy'. The level handed back to onApply matches the casing of the
 * `current` value the game passed in, so it can be assigned directly.
 *
 * Purely additive: renders nothing unless the engine flags shouldPrompt, so a
 * game's existing flow is untouched when there's no recommendation.
 *
 * Props:
 *   gameKey    {string} matches the route path (e.g. 'ran', 'mathgame')
 *   current    {string} the game's current difficulty ('easy' | 'Easy' | …)
 *   enabled    {bool}   gate the fetch (default true; pass `gameOver`)
 *   refreshKey {any}    change to re-fetch after a new session is saved
 *   onApply(level) {fn} called with the recommended level in the game's casing
 *   onDismiss() {fn}
 */
function matchCase(sample, level) {
  if (typeof sample === 'string' && sample && sample[0] === sample[0].toUpperCase()) {
    return level.charAt(0).toUpperCase() + level.slice(1);
  }
  return level;
}

export default function AdaptiveDifficultyPrompt({
  gameKey, current, enabled = true, refreshKey, onApply,
}) {
  // Dismiss state lives here so each game needs no extra state of its own. It
  // resets whenever a new result appears (enabled toggles, or refreshKey
  // changes), so a fresh suggestion can show on the next round.
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => { setDismissed(false); }, [enabled, refreshKey]);

  const normalized = String(current ?? 'easy').toLowerCase();
  const recommendation = useAdaptiveDifficulty(gameKey, normalized, { enabled, refreshKey });

  if (dismissed) return null;

  return (
    <AdaptiveSuggestion
      recommendation={recommendation}
      onAccept={(level) => onApply?.(matchCase(current, level))}
      onDismiss={() => setDismissed(true)}
    />
  );
}
