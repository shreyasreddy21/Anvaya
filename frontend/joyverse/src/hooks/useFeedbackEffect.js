import { useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';

// ── Confetti singleton ────────────────────────────────────────────────────────
// One canvas shared across all game components so rapid calls don't stack up.
let _canvas = null;
let _confetti = null;

function getConfettiInstance() {
  if (_confetti) return _confetti;
  _canvas = document.createElement('canvas');
  Object.assign(_canvas.style, {
    position: 'fixed', inset: '0',
    width: '100%', height: '100%',
    pointerEvents: 'none', zIndex: '9999',
  });
  document.body.appendChild(_canvas);
  _confetti = confetti.create(_canvas, { resize: true, useWorker: true });
  return _confetti;
}

// ── Amber overlay singleton ───────────────────────────────────────────────────
// One div shared across all game components. The CSS animation is re-triggered
// by removing the class, forcing a reflow, then re-adding it.
let _overlay = null;

function getOverlay() {
  if (_overlay) return _overlay;
  _overlay = document.createElement('div');
  _overlay.id = 'jv-wrong-overlay';
  document.body.appendChild(_overlay);
  return _overlay;
}

/**
 * useFeedbackEffect — non-alarming answer feedback for dyslexic children.
 *
 * triggerFeedback('correct') → rainbow confetti burst (three cannons)
 * triggerFeedback('wrong')   → warm amber screen-edge pulse (not alarming)
 *
 * Respects prefers-reduced-motion by skipping animations silently.
 */
export default function useFeedbackEffect() {
  const reduceMotion = useRef(
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );

  const trigger = useCallback((result) => {
    if (reduceMotion.current) return;

    if (result === 'correct') {
      const fire = getConfettiInstance();
      fire({
        particleCount: 120,
        angle: 60,
        spread: 70,
        origin: { x: 0, y: 1 },
        colors: ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#c77dff'],
        scalar: 1.4,
        gravity: 0.8,
        ticks: 300,
        startVelocity: 55,
      });
      fire({
        particleCount: 120,
        angle: 120,
        spread: 70,
        origin: { x: 1, y: 1 },
        colors: ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#c77dff'],
        scalar: 1.4,
        gravity: 0.8,
        ticks: 300,
        startVelocity: 55,
      });
      fire({
        particleCount: 60,
        angle: 90,
        spread: 100,
        origin: { x: 0.5, y: 1 },
        colors: ['#ffffff', '#ffd93d', '#6bcb77'],
        scalar: 1.2,
        gravity: 0.7,
        ticks: 260,
        startVelocity: 65,
      });
    } else if (result === 'wrong') {
      const overlay = getOverlay();
      // Reset the animation so it replays even if triggered in quick succession.
      overlay.classList.remove('jv-wrong-active');
      void overlay.offsetWidth; // force reflow
      overlay.classList.add('jv-wrong-active');
    }
  }, []);

  return trigger;
}
