import { useEffect } from 'react';
import { useBuddy } from './BuddyContext';

/**
 * FeedbackGif — feedback *controller* (renders nothing visible).
 *
 * Kept as a drop-in with the same API the games already use:
 *   <FeedbackGif result={isCorrect ? 'correct' : answered ? 'wrong' : null} />
 *
 * Instead of drawing its own GIF, it forwards the result to the single buddy
 * that GameShell renders (GameBuddy), so the companion is consistent across
 * every game and there is never a duplicate floating GIF. Anything that isn't an
 * explicit answer state clears the result, returning the buddy to its calm
 * "working" companion. Outside a GameShell it is a harmless no-op.
 */
export default function FeedbackGif({ result }) {
  const { setResult } = useBuddy();
  const norm = result === 'correct' || result === 'wrong' ? result : null;

  useEffect(() => {
    setResult(norm);
  }, [norm, setResult]);

  // Clear the result when the game (or this feedback view) unmounts, so the
  // buddy falls back to "working" rather than getting stuck on correct/wrong.
  useEffect(() => () => setResult(null), [setResult]);

  return null;
}
