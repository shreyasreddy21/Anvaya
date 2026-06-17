import React from 'react';
import successGif from '../assets/successGif.gif';
import failureGif from '../assets/failureGif.gif';
import workingGif from '../assets/working.gif';
import './FeedbackGif.css';

/**
 * GameBuddy — the single, visible "learning buddy" companion.
 *
 * Rendered once by GameShell so it appears consistently in every game. It sits
 * on a soft, theme-tinted stage (borrowing the active emotion's --card-color) so
 * it reads as part of the interface, not a sticker, and changes expression with
 * the child's progress:
 *
 *   • working  — calm, while the child reads / solves (default)
 *   • correct  — celebrates a right answer
 *   • wrong    — gently encourages another try
 *
 * The result is driven via BuddyContext; games signal it by rendering
 * <FeedbackGif result="correct|wrong" /> (see FeedbackGif.js).
 */
const GIFS = { working: workingGif, correct: successGif, wrong: failureGif };
const CAPTION = { correct: 'Great job!', wrong: 'Keep trying!' };

export default function GameBuddy({ result }) {
  const state = result === 'correct' || result === 'wrong' ? result : 'working';
  const caption = CAPTION[state];

  return (
    <div
      className={`buddy buddy--${state}`}
      aria-hidden={state === 'working' ? 'true' : undefined}
    >
      <div className="buddy__stage">
        <img key={state} src={GIFS[state]} alt="" className="buddy__img" draggable="false" />
      </div>
      {caption && (
        <span className="buddy__caption" role="status" aria-live="polite">{caption}</span>
      )}
    </div>
  );
}
