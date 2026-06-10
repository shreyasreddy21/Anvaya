import React, { useState, useEffect } from 'react';
import SpeechService from '../services/SpeechService';
import './TTSButton.css';

/**
 * TTSButton — read-aloud button for any instructional or question text.
 *
 * Props:
 *   text      {string}  The text to speak when clicked. Required.
 *   label     {string}  Accessible aria-label override (defaults to "Read aloud").
 *   className {string}  Additional CSS class for the host element.
 *   size      {string}  'sm' | 'md' (default 'md').
 *   rate      {number}  Speech rate passed to SpeechService (default 0.85).
 */
export default function TTSButton({
  text,
  label = 'Read aloud',
  className = '',
  size = 'md',
  rate = 0.85,
}) {
  const [speaking, setSpeaking] = useState(false);

  // Reset speaking indicator if component unmounts while speaking
  useEffect(() => {
    return () => {
      if (speaking) SpeechService.stop();
    };
  }, [speaking]);

  if (!SpeechService.isSupported()) return null;

  const handleClick = (e) => {
    e.stopPropagation();
    if (speaking) {
      SpeechService.stop();
      setSpeaking(false);
    } else {
      setSpeaking(true);
      SpeechService.speak(text, {
        rate,
        onEnd: () => setSpeaking(false),
      });
    }
  };

  return (
    <button
      type="button"
      className={`tts-btn tts-btn--${size} ${speaking ? 'tts-btn--speaking' : ''} ${className}`}
      onClick={handleClick}
      aria-label={speaking ? 'Stop reading' : label}
      title={speaking ? 'Stop reading' : label}
    >
      {speaking ? '⏹' : '🔊'}
    </button>
  );
}
