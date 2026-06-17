import React, { useEffect, useRef, useState } from 'react';
import './EmotionBackground.css';

/**
 * EmotionBackground — a subtle, dyslexia-friendly section background that fades
 * between emotion-specific tiling patterns + a soft theme tint, with the game
 * content rendered clearly on top.
 *
 * Design goals (per spec):
 *   • Pattern image per emotion, REPEATED (tiled) — never stretched.
 *   • 500–800ms crossfade between emotions (a tint layer that transitions its
 *     colour, plus a second pattern layer that fades in over the current one).
 *   • Low contrast (pattern ~12% / tint ~10% opacity) so it never competes with
 *     the readable game card above it.
 *   • Responsive tile sizing for desktop / tablet / mobile.
 *   • Honors prefers-reduced-motion (instant swap, no animation).
 *
 * Missing image files degrade gracefully: the pattern layer simply shows nothing
 * and the tint alone provides the emotional cue — nothing breaks.
 *
 * Props:
 *   emotion   {string}  e.g. 'Happy' | 'Sad' | 'Neutral' | 'Confused' | 'Angry'
 *   children  {node}    the game card / content rendered above the background
 *   basePath  {string}  folder holding the pattern images (default /emotionPatterns/)
 *   theme     {object}  optional per-emotion overrides: { Happy: { image, tint }, … }
 *   patternOpacity {number} 0–1 (default 0.12 — within the 5–15% target)
 *   tintOpacity    {number} 0–1 (default 0.10)
 *   className {string}  extra class on the root
 */

// Emotion → { pattern filename, soft theme tint }. Tints follow the spec and are
// deliberately muted; the low opacity keeps them gentle for dyslexic readers.
const DEFAULT_THEME = {
  Happy:    { image: 'happy.jpeg',    tint: '#FFB74D' }, // warm yellow / orange
  Sad:      { image: 'sad.jpeg',      tint: '#7FAEDB' }, // soft blue
  Neutral:  { image: 'neutral.jpeg',  tint: '#D7D0C2' }, // light gray / beige
  Confused: { image: 'confused.jpeg', tint: '#B39DDB' }, // lavender / purple
  Angry:    { image: 'angry.jpeg',    tint: '#F4978E' }, // soft red / coral
  // Graceful fallback for the 6th class the detector can emit.
  Surprise: { image: 'neutral.jpeg',  tint: '#FFCC80' },
};

const FADE_MS = 650; // within the requested 500–800ms range

export default function EmotionBackground({
  emotion = 'Neutral',
  children,
  basePath = '/emotionPatterns/',
  theme,
  patternOpacity = 0.12,
  tintOpacity = 0.10,
  className = '',
}) {
  const merged = { ...DEFAULT_THEME, ...(theme || {}) };
  const norm = (e) => (e && merged[e] ? e : 'Neutral');
  const conf = (e) => merged[norm(e)];
  const url  = (e) => `url("${basePath}${conf(e).image}")`;

  const current = norm(emotion);

  // `base` is the settled pattern; `incoming` (when set) fades in over it, then
  // a timer promotes it to `base`. Decoupling pattern (not CSS-transitionable)
  // from the tint (which IS colour-transitionable) keeps the crossfade smooth.
  const [base, setBase] = useState(current);
  const [incoming, setIncoming] = useState(null);
  const prev = useRef(current);
  const timer = useRef(null);

  useEffect(() => {
    if (current === prev.current) return;
    prev.current = current;
    setIncoming(current);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setBase(current);
      setIncoming(null);
    }, FADE_MS + 60);
    return () => clearTimeout(timer.current);
  }, [current]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const rootStyle = {
    '--eb-fade': `${FADE_MS}ms`,
    '--eb-pattern-opacity': patternOpacity,
    '--eb-tint-opacity': tintOpacity,
  };

  return (
    <div className={`emotion-bg ${className}`.trim()} data-emotion={current} style={rootStyle}>
      <div
        className="emotion-bg__pattern"
        style={{ backgroundImage: url(base) }}
        aria-hidden="true"
      />
      {incoming && (
        <div
          key={incoming}
          className="emotion-bg__pattern emotion-bg__pattern--in"
          style={{ backgroundImage: url(incoming) }}
          aria-hidden="true"
        />
      )}
      <div
        className="emotion-bg__tint"
        style={{ backgroundColor: conf(current).tint }}
        aria-hidden="true"
      />
      <div className="emotion-bg__content">{children}</div>
    </div>
  );
}
