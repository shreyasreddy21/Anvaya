import React, { useEffect, useRef, useState } from 'react';
import './EmotionBackground.css';

/**
 * EmotionBackground — a subtle, dyslexia-friendly section background that fades
 * between emotion-specific tiling patterns + a soft theme tint, with the game
 * content rendered clearly on top.
 *
 * Design goals (per spec):
 *   • Pattern image per emotion, REPEATED (tiled) — never stretched.
 *   • 500–800ms crossfade between emotions.
 *   • Low contrast (pattern ~12% / tint ~10% opacity) so it never competes with
 *     the readable game card above it.
 *   • Responsive tile sizing for desktop / tablet / mobile.
 *   • Honors prefers-reduced-motion (instant swap, no animation).
 *
 * Crossfade design (robust to rapid/oscillating emotion changes):
 *   Two PERSISTENT pattern layers crossfade by transitioning CSS opacity. On an
 *   emotion change we paint the new image onto the hidden ("back") layer and flip
 *   which layer is visible. There are no remounts and no timers, so the visible
 *   layer always shows a valid pattern (it never blanks out) and always reflects
 *   the latest emotion — even if emotions change faster than the fade duration.
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

  // Two persistent crossfading layers. `frontB` says which layer is currently
  // visible; the other (hidden) layer is the one we repaint before flipping.
  const [layerA, setLayerA] = useState(current);
  const [layerB, setLayerB] = useState(null);
  const [frontB, setFrontB] = useState(false);
  const prev = useRef(current);
  const frontBRef = useRef(false);

  useEffect(() => {
    if (current === prev.current) return;
    prev.current = current;

    // Paint the new pattern onto the hidden (about-to-become-front) layer, then
    // flip. No remount, no timer → the crossfade can be interrupted/retargeted
    // smoothly by the browser without ever blanking the visible layer.
    const nextFrontB = !frontBRef.current;
    if (nextFrontB) setLayerB(current);
    else setLayerA(current);
    frontBRef.current = nextFrontB;
    setFrontB(nextFrontB);
  }, [current]);

  const rootStyle = {
    '--eb-fade': `${FADE_MS}ms`,
    '--eb-tint-opacity': tintOpacity,
  };
  const layerStyle = (emo, visible) => ({
    backgroundImage: emo ? url(emo) : 'none',
    opacity: visible ? patternOpacity : 0,
  });

  return (
    <div className={`emotion-bg ${className}`.trim()} data-emotion={current} style={rootStyle}>
      <div className="emotion-bg__pattern" style={layerStyle(layerA, !frontB)} aria-hidden="true" />
      <div className="emotion-bg__pattern" style={layerStyle(layerB, frontB)} aria-hidden="true" />
      <div
        className="emotion-bg__tint"
        style={{ backgroundColor: conf(current).tint }}
        aria-hidden="true"
      />
      <div className="emotion-bg__content">{children}</div>
    </div>
  );
}
