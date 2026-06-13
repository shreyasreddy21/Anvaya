import React from 'react';
import './AdaptiveSuggestion.css';

/**
 * AdaptiveSuggestion — a gentle, dismissible banner that suggests moving a
 * child up or down a difficulty level based on their recent performance and
 * mood. Purely additive: renders nothing unless the engine flags shouldPrompt,
 * so existing game flow is untouched when there's no recommendation.
 *
 * Props:
 *   recommendation {object} from useAdaptiveDifficulty
 *   onAccept(level) {fn}    called with the recommended level when accepted
 *   onDismiss() {fn}        called when the child dismisses
 */
export default function AdaptiveSuggestion({ recommendation, onAccept, onDismiss }) {
  if (!recommendation || !recommendation.shouldPrompt) return null;

  const { recommended, reason } = recommendation;
  const levelUp = reason === 'mastery';

  const message = levelUp
    ? `You're doing amazing! 🌟 Want to try the ${recommended} level?`
    : `Let's try the ${recommended} level — it'll feel just right 🌱`;

  return (
    <div className={`adaptive-suggestion adaptive-suggestion--${levelUp ? 'up' : 'down'}`} role="status">
      <span className="adaptive-suggestion__msg">{message}</span>
      <div className="adaptive-suggestion__actions">
        <button
          type="button"
          className="adaptive-suggestion__accept"
          onClick={() => onAccept?.(recommended)}
          aria-label={`Switch to ${recommended} level`}
        >
          {levelUp ? '🚀 Yes!' : '👍 Okay'}
        </button>
        <button
          type="button"
          className="adaptive-suggestion__dismiss"
          onClick={() => onDismiss?.()}
          aria-label="Dismiss this suggestion"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
