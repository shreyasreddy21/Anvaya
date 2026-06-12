import React, { useState, useEffect, useRef } from 'react';
import SpeechService from '../services/SpeechService';
import './TTSButton.css';

/**
 * TTSButton — read-aloud button.
 *
 * Props:
 *   text      {string}  Text to speak. Required.
 *   label     {string}  aria-label override.
 *   className {string}  Extra class.
 *   size      {string}  'sm' | 'md' (default 'md').
 *   rate      {number}  Speech rate (default 0.85).
 */
export default function TTSButton({
  text,
  label     = 'Read aloud',
  className = '',
  size      = 'md',
  rate      = 0.85,
}) {
  const [speaking, setSpeaking] = useState(false);
  const safetyRef = useRef(null);

  const done = () => {
    setSpeaking(false);
    if (safetyRef.current) {
      clearTimeout(safetyRef.current);
      safetyRef.current = null;
    }
  };

  // Stop & reset if component unmounts while speaking
  useEffect(() => {
    return () => {
      SpeechService.stop();
      if (safetyRef.current) clearTimeout(safetyRef.current);
    };
  }, []);

  if (!SpeechService.isSupported()) return null;

  const handleClick = (e) => {
    e.stopPropagation();

    if (speaking) {
      SpeechService.stop();
      done();
      return;
    }

    if (!text?.toString().trim()) return;

    setSpeaking(true);
    SpeechService.speak(text, { rate, onEnd: done });

    // Failsafe: if onEnd never fires (platform silently discards utterance),
    // reset after 30 s so the button is never permanently stuck.
    safetyRef.current = setTimeout(done, 30_000);
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
