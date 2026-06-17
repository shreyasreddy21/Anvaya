import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import EmotionBackground from './EmotionBackground';
import GameBuddy from './GameBuddy';
import { BuddyContext } from './BuddyContext';
import './GameShell.css';

const EMOTION_EMOJI = {
  Happy:   '😄',
  Sad:     '😢',
  Angry:   '😠',
  Surprise:'😲',
  Neutral: '😊',
  Confused:'🤔',
};

/**
 * GameShell — unified page wrapper for every game.
 *
 * Props:
 *   title     {string}  Game title shown in the nav bar.
 *   emotion   {string}  Current detected emotion label (optional).
 *   confidence{number}  Emotion confidence 0–1 (optional).
 *   children  {node}    Game content — rendered inside .game-shell__content.
 */
export default function GameShell({ title, emotion, confidence, children }) {
  const navigate = useNavigate();

  // The single shared "learning buddy". Games signal correct/wrong by rendering
  // <FeedbackGif result="…" /> (a context controller); games that don't simply
  // show the calm "working" companion. Either way the buddy is consistent
  // everywhere. setResult from useState is stable, so the context value is too.
  const [buddyResult, setBuddyResult] = useState(null);
  const buddyCtx = useMemo(() => ({ setResult: setBuddyResult }), []);

  return (
    <div className="game-shell">
      <nav className="game-shell__nav">
        <button
          className="game-shell__back"
          onClick={() => navigate('/games')}
          aria-label="Back to games list"
        >
          ← Games
        </button>

        {title && <h1 className="game-shell__title">{title}</h1>}

        {emotion ? (
          <span className="game-shell__emotion-badge" title={`Detected emotion: ${emotion}`}>
            {EMOTION_EMOJI[emotion] ?? '🎮'} {emotion}
            {confidence > 0 && (
              <small>{Math.round(confidence * 100)}%</small>
            )}
          </span>
        ) : (
          <span style={{ width: 80 }} />
        )}
      </nav>

      <main className="game-shell__content">
        {/* Dynamic, dyslexia-friendly background that fades with the detected
            emotion. The game content renders clearly above it. */}
        <EmotionBackground emotion={emotion || 'Neutral'}>
          <BuddyContext.Provider value={buddyCtx}>
            {children}
          </BuddyContext.Provider>
        </EmotionBackground>
      </main>

      {/* One shared buddy for every game — driven by BuddyContext above. */}
      <GameBuddy result={buddyResult} />
    </div>
  );
}
