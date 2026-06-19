import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isDeprecated } from "../config/deprecatedGames";
import { applyEmotionTheme } from "../utils/EmotionThemeMap";
import { logout } from "../utils/logout";
import TTSButton from "../components/TTSButton";
import "./Games.css";
import shapememoryimg     from '../assets/shapememorygame.png';
import mathfunimg         from '../assets/mathfun.png';
import funquizimg         from '../assets/funquiz.png';

const MOOD_TO_EMOTION = {
  happy:   'Happy',
  smile:   'Happy',
  neutral: 'Neutral',
  sad:     'Sad',
  angry:   'Angry',
  surprise:'Surprise',
};

const ALL_GAMES = [
  { key: 'wordpuzzleadventure', label: 'Word Quest',          route: '/wordpuzzleadventure', image: null, emoji: '🗺️', cssClass: 'games-page-word-game',         description: 'Unscramble the jumbled letters to make a word.' },
  { key: 'mathgame',            label: 'Math Fun',            route: '/mathgame',            image: mathfunimg,         cssClass: 'games-page-math-game',           description: 'Solve playful number puzzles and count along.' },
  { key: 'quiz',                label: 'Fun Quiz',            route: '/quiz',                image: funquizimg,         cssClass: 'games-page-quiz-game',           description: 'Answer fun questions and learn new things.' },
  { key: 'syllabletapgame',     label: 'Fun with Syllables',  route: '/syllabletapgame',     image: null, emoji: '🎵', cssClass: 'games-page-syllable-game',     description: 'Tap out the beats you hear in each word.' },
  { key: 'shapememorygame',     label: 'Shape Memory',        route: '/shapememorygame',     image: shapememoryimg,     cssClass: 'games-page-shapememory-game',    description: 'Remember where the shapes are and match them.' },
  { key: 'letterbridge',        label: 'Letter Bridging',     route: '/letterbridge',        image: null, emoji: '🌉', cssClass: 'games-page-letterbridge-game', description: 'Join letters together to build words.' },
  { key: 'mirrorword',          label: 'Mirror Words',        route: '/mirrorword',          image: null, emoji: '🪞', cssClass: 'games-page-mirrorword-game',   description: 'Spot the word that is written the right way.' },
  { key: 'phonemetap',          label: 'Phoneme Tap',         route: '/phonemetap',          image: null, emoji: '👂', cssClass: 'games-page-phonemetap-game',   description: 'Tap once for each sound you hear in a word.' },
  { key: 'lettersound',         label: 'Letter Sound Match',  route: '/lettersound',         image: null, emoji: '🔤', cssClass: 'games-page-lettersound-game',  description: 'Match each letter to the sound it makes.' },
  { key: 'confusableletter',    label: 'Letter Trainer',      route: '/confusableletter',    image: null, emoji: '🔡', cssClass: 'games-page-confusable-game',   description: 'Practice tricky look-alike letters like b and d.' },
  { key: 'ran',                 label: 'Rapid Naming',        route: '/ran',                 image: null, emoji: '⚡', cssClass: 'games-page-ran-game',          description: 'Name the pictures and colors as fast as you can.' },
  { key: 'verbalmemory',        label: 'Sequence Memory',     route: '/verbalmemory',        image: null, emoji: '🧠', cssClass: 'games-page-verbalmemory-game', description: 'Listen, then repeat the sequence in order.' },
  { key: 'readingfluency',     label: 'Reading Fluency',     route: '/reading-fluency',     image: null, emoji: '📖', cssClass: 'games-page-verbalmemory-game', description: 'Read short sentences smoothly out loud.' },
  { key: 'sightword',          label: 'Sight Words',         route: '/sight-words',         image: null, emoji: '📝', cssClass: 'games-page-lettersound-game',  description: 'Learn common words you see every day.' },
  { key: 'morphology',         label: 'Word Builder',        route: '/morphology-builder',  image: null, emoji: '🧩', cssClass: 'games-page-confusable-game',   description: 'Build bigger words with prefixes and suffixes.' },
];

const ACTIVE_GAMES = ALL_GAMES.filter(g => !isDeprecated(g.key));

export default function Games() {
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = "auto";

    // Apply the background the child chose on the WelcomeScreen
    const mood    = localStorage.getItem("selectedEmotion") || "neutral";
    const emotion = MOOD_TO_EMOTION[mood.toLowerCase()] || "Neutral";
    applyEmotionTheme(emotion);

    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="games-page-container">
      <section className="header-container">
        <h1 className="games-page-title">Choose Your Game</h1>
        <p className="games-page-subtitle">Pick a game and start learning!</p>

        <div className="games-header-nav">
          <button
            className="games-nav-btn games-nav-btn--progress"
            onClick={() => navigate('/my-progress')}
            aria-label="View my progress"
          >
            🌟 My Progress
          </button>
          <button
            className="games-nav-btn games-nav-btn--achievements"
            onClick={() => navigate('/achievements')}
            aria-label="View my achievements"
          >
            🏆 My Achievements
          </button>
          <button
            className="games-nav-btn games-nav-btn--logout"
            onClick={logout}
            aria-label="Log out and return to login"
          >
            🚪 Logout
          </button>
        </div>
      </section>

      <div className="games-page-list" role="list">
        {ACTIVE_GAMES.map(game => (
          <div
            key={game.key}
            role="listitem"
            className={`games-page-card ${game.cssClass}`}
            onClick={() => navigate(game.route)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(game.route); }
            }}
            tabIndex={0}
            aria-label={`Play ${game.label}. ${game.description}`}
          >
            {/* Read-aloud the game's name + description. Stops click/keydown from
                bubbling so tapping the speaker never launches the game. */}
            <span
              className="games-page-card-tts"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <TTSButton
                text={`${game.label}. ${game.description}`}
                size="sm"
                label={`Hear about ${game.label}`}
              />
            </span>

            {game.image
              ? <img src={game.image} alt="" className="game-icon" />
              : <span className="game-icon-emoji" aria-hidden="true">{game.emoji}</span>
            }
            <h2>{game.label}</h2>
            <span className="games-page-card-desc">{game.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
