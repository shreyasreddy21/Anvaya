import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Games.css";
import shapememoryimg from '../assets/shapememorygame.png';
import mathfunimg from '../assets/mathfun.png';
import funquizimg from '../assets/funquiz.png';
import wordquestimg from '../assets/wordquest.png';
import syllabletapgameimg from '../assets/syllabletapgame.png';
import letterbridgeimg from '../assets/letterbridge.png';
import mirrorwordgameimg from '../assets/mirrorwordsgame.png';

function Games() {
  const navigate = useNavigate();
  const [emotion, setEmotion] = useState("neutral");

  useEffect(() => {
    document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = "hidden";
    };
  }, []);

  useEffect(() => {
    const selected = localStorage.getItem("selectedEmotion") || "neutral";
    setEmotion(selected);
  }, []);

  const backgroundMap = {
    happy: "url('/backgrounds/happy.jpg')",
    smile: "url('/backgrounds/happy.jpg')",
    neutral: "url('/backgrounds/neutral.jpg')",
    sad: "url('/backgrounds/sad.jpg')",
    angry: "url('/backgrounds/angry.jpg')",
  };

  const backgroundStyle = {
  backgroundImage: backgroundMap[emotion] || backgroundMap["neutral"],
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  minHeight: "100vh",
  minWidth: "100vw",
};

  return (
    <div style={backgroundStyle}>
      <div className="games-page-container">

        <section className="header-container">
          <h1 className="games-page-title">Choose Your Game</h1>
          <p className="games-page-subtitle">Select a game and start your adventure!</p>
        </section>

        <div className="games-page-list">
          <div className="games-page-card games-page-word-game" onClick={() => navigate("/wordpuzzleadventure")}>
            <img src={wordquestimg} alt="Word Quest" className="game-icon" />
            <h2>Word Quest</h2>
          </div>

          <div className="games-page-card games-page-math-game" onClick={() => navigate("/mathgame")}>
            <img src={mathfunimg} alt="Math Fun" className="game-icon" />
            <h2>Math Fun</h2>
          </div>

          <div className="games-page-card games-page-quiz-game" onClick={() => navigate("/quiz")}>
            <img src={funquizimg} alt="Fun Quiz" className="game-icon" />
            <h2>Fun Quiz</h2>
          </div>

          <div className="games-page-card games-page-syllable-game" onClick={() => navigate("/syllabletapgame")}>
            <img src={syllabletapgameimg} alt="Fun with Syllables" className="game-icon" />
            <h2>Fun with Syllables</h2>
          </div>

          <div className="games-page-card games-page-shapememory-game" onClick={() => navigate("/shapememorygame")}>
            <img src={shapememoryimg} alt="Shape Memory Game" className="game-icon" />
            <h2>Shape Memory Game</h2>
          </div>

          <div className="games-page-card games-page-letterbridge-game" onClick={() => navigate("/letterbridge")}>
            <img src={letterbridgeimg} alt="Letter Bridging Game" className="game-icon" />
            <h2>Letter Bridging Game</h2>
          </div>

          <div className="games-page-card games-page-mirrorword-game" onClick={() => navigate("/mirrorword")}>
            <img src={mirrorwordgameimg} alt="Mirror Word Game" className="game-icon" />
            <h2>Mirror Word Game</h2>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Games;