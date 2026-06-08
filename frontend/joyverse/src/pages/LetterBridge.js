import React, { useState, useRef, useEffect } from 'react';
import { difficultyData } from './letterBridgingData';
import LineDrawer from '../components/LineDrawer';
import './LetterBridge.css';
import useEmotionDetection from "../hooks/useEmotionDetection";
import useGameSessionLogger from "../hooks/useGameSessionLogger";

const GAME_DURATION = 60;

const LetterBridge = () => {
  const { emotion, videoRef, canvasRef } = useEmotionDetection();
  const [difficulty, setDifficulty] = useState('easy');
  const [letters, setLetters] = useState([]);
  const [validWords, setValidWords] = useState([]);
  const [selected, setSelected] = useState({});
  const [formedWords, setFormedWords] = useState([]);
  const [positions, setPositions] = useState([]);
  const [isValid, setIsValid] = useState(true);
  const [blinkingCols, setBlinkingCols] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameOver, setGameOver] = useState(false);

  const wrapperRef = useRef(null);
  const letterRefs = useRef({});
    const username = localStorage.getItem("username");
  const { endSession } = useGameSessionLogger({ username, difficulty, expression: emotion ,score});
  const initializeGame = () => {
    const difficultySets = difficultyData[difficulty];
    const randomSet = difficultySets[Math.floor(Math.random() * difficultySets.length)];
    const { letters, words } = randomSet;

    setLetters(letters);
    setValidWords(words);
    setTimeLeft(GAME_DURATION);
    setScore(0);
    setFormedWords([]);
    setSelected({});
    setGameOver(false);
    setPositions([]);
  };

  useEffect(() => {
    initializeGame();
  }, [difficulty]);

  useEffect(() => {
    if (timeLeft <= 0) {
      setGameOver(true);
          endSession();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (Object.keys(selected).length === letters.length && !gameOver) {
      const word = letters.map((_, col) => selected[col]).join('');
      const valid = validWords.includes(word);
      setIsValid(valid);

      if (valid) {
        setFormedWords(prev => {
          if (!prev.includes(word)) {
            setScore(prevScore => prevScore + 10);
            return [...prev, word];
          }
          return prev;
        });
      } else {
        setBlinkingCols(Object.keys(selected).map(Number));
        setTimeout(() => setBlinkingCols([]), 500);
      }

      setTimeout(() => {
        setSelected({});
        setPositions([]);
      }, 1000);
    }
  }, [selected, gameOver, letters, validWords]);

  useEffect(() => {
    const wrapperRect = wrapperRef.current?.getBoundingClientRect();
    const newPositions = [];

    for (let i = 0; i < letters.length; i++) {
      const char = selected[i];
      if (char && letterRefs.current[`${i}-${char}`]) {
        const rect = letterRefs.current[`${i}-${char}`].getBoundingClientRect();
        const x = rect.left - wrapperRect.left + rect.width / 2;
        const y = rect.top - wrapperRect.top + rect.height / 2;
        newPositions.push({ x, y });
      }
    }

    setPositions(newPositions);
  }, [selected, letters]);

  const handleSelect = (column, letter) => {
    if (gameOver) return;

    const nextColumnToSelect = Object.keys(selected).length;
    if (parseInt(column) === nextColumnToSelect) {
      setSelected(prev => ({ ...prev, [column]: letter }));
    }
  };

  const handleRestart = () => {
    initializeGame();
  };

  const handleDifficultyChange = (e) => {
    setDifficulty(e.target.value);
  };
  const getEmotionStyles = (emotion) => {
  switch (emotion) {
    case "Happy":
      return { backgroundColor: "#F8FD89", color: "#333333" }; 
    case "Sad":
      return { backgroundColor: "#D8FAD2", color: "#3B2F2F" }; 
    case "Angry":
      return { backgroundColor: "#A5F7E1", color: "#223344" }; 
    case "Surprise":
      return { backgroundColor: "#FFDAB9", color: "#4B0082" }; 
    case "Neutral":
    default:
      return { backgroundColor: "#F9F9F3", color: "#2C2C2C" }; 
  }
};
  return (
    <div className="game-card" style={{
    backgroundColor: getEmotionStyles(emotion).backgroundColor,
    color: getEmotionStyles(emotion).color,
    '--text-color': getEmotionStyles(emotion).color,
  }}>
      <h1 className="game-title">Letter Bridging Game</h1>
      <p className="game-instructions">Tap one letter from each column, left to right, to form a valid word!</p>

      <div className="game-info-bar">
        <p>⏱️ Time Left: <strong>{timeLeft}s</strong></p>
        <p>⭐ Score: <strong>{score}</strong></p>

        <div className="game-difficulty-select">
          <label htmlFor="difficulty">Difficulty:</label>
          <select id="difficulty" value={difficulty} onChange={handleDifficultyChange}>
            <option value="easy">🟢 Easy</option>
            <option value="medium">🟡 Medium</option>
            <option value="hard">🔴 Hard</option>
          </select>
        </div>
      </div>

      <div className="game-grid-wrapper" ref={wrapperRef}>
        <div className="game-grid">
          {letters.map((col, colIndex) => (
            <div key={colIndex} className="game-column">
              {col.map((letter, rowIndex) => {
                const isSelected = selected[colIndex] === letter;
                const isBlinking = blinkingCols.includes(colIndex) && isSelected;
                return (
                  <div
                    key={rowIndex}
                    className={`game-letter ${isSelected ? 'selected' : ''} ${isBlinking ? 'blink-red' : ''}`}
                    onClick={() => handleSelect(colIndex, letter)}
                    ref={(el) => (letterRefs.current[`${colIndex}-${letter}`] = el)}
                  >
                    {letter}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <LineDrawer positions={positions} isValid={isValid} />
      </div>

      <div className="game-word-list">
        <h3>Words Formed:</h3>
        {formedWords.map((word, idx) => (
          <span key={idx} className="game-word-pill">{word}</span>
        ))}
      </div>

      {gameOver && (
        <div className="game-over">
          <h2>⏰ Time’s Up!</h2>
          <p>Your final score: <strong>{score}</strong></p>
          <button className="game-btn" onClick={handleRestart}>Play Again</button>
        </div>
      )}

      <video ref={videoRef} autoPlay style={{ display: "none" }} />
      <canvas ref={canvasRef} width={640} height={480} style={{ display: "none" }} />
    </div>
  );
};

export default LetterBridge;
