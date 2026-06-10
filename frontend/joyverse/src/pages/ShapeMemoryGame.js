// import { useEffect, useState, useRef } from "react";
// import "./ShapeMemoryGame.css";
// import useGameSessionLogger from "../hooks/useGameSessionLogger"; // Adjust path

// const emotionThemes = {
//   Happy: "#ffeaa7",
//   Sad: "#dfe6e9",
//   Angry: "#fab1a0",
//   Disgust: "#81ecec",
//   Fear: "#a29bfe",
//   Neutral: "#ffffff",
// };

// const shapes = ["⬤", "▲", "■", "◆", "★"];
// const totalTiles = 25;

// const levelSettings = {
//   easy: { revealTime: 5000, gameTime: 45, allowedClicks: 15 },
//   medium: { revealTime: 5000, gameTime: 30, allowedClicks: 10 },
//   hard: { revealTime: 2500, gameTime: 30, allowedClicks: 7 },
// };

// function ShapeMemoryGame() {
//   const [tileValues, setTileValues] = useState([]);
//   const [revealed, setRevealed] = useState([]);
//   const [correctTiles, setCorrectTiles] = useState([]);
//   const [wrongTiles, setWrongTiles] = useState([]);
//   const [currentTarget, setCurrentTarget] = useState("");
//   const [score, setScore] = useState(0);
//   const [totalTarget, setTotalTarget] = useState(0);
//   const [timeLeft, setTimeLeft] = useState(0);
//   const [isGameOver, setIsGameOver] = useState(false);
//   const [level, setLevel] = useState("easy");
//   const [isStarting, setIsStarting] = useState(true);
//   const [clicksLeft, setClicksLeft] = useState(0);
//   const [expression, setExpression] = useState("Neutral");

//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);

//   useEffect(() => {
//     setupGame();
//   }, [level]);

//   useEffect(() => {
//     document.body.style.overflow = "auto";
//     return () => {
//       document.body.style.overflow = "hidden";
//     };
//   }, []);

//   useEffect(() => {
//     if (timeLeft > 0 && !isGameOver) {
//       const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
//       return () => clearTimeout(timer);
//     } else if (timeLeft === 0 && !isGameOver && !isStarting) {
//       setIsGameOver(true);
//     }
//   }, [timeLeft, isGameOver, isStarting]);

//   useEffect(() => {
//     const bgColor = emotionThemes[expression] || "#ffffff";
//     document.body.style.setProperty("background-color", bgColor, "important");
//   }, [expression]);

//   // ✅ Webcam stream + emotion capture setup
//   useEffect(() => {
//     let stream;
//     let interval;

//     navigator.mediaDevices.getUserMedia({ video: true }).then((s) => {
//       stream = s;
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//       }
//     });

//     interval = setInterval(() => {
//       captureAndSend();
//     }, 10000);

//     // ✅ Cleanup: stop camera + interval on unmount
//     return () => {
//       if (stream) {
//         stream.getTracks().forEach((track) => track.stop());
//       }
//       clearInterval(interval);
//     };
//   }, []);
//   useEffect(() => {
//     if (isGameOver) {
//       endSession(); // Log session data when game ends
//     }
//   }, [isGameOver]);

//   const captureAndSend = async () => {
//     const canvas = canvasRef.current;
//     const video = videoRef.current;
//     if (!canvas || !video) return;

//     const ctx = canvas.getContext("2d");
//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;

//     ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
//     canvas.toBlob(async (blob) => {
//       const formData = new FormData();
//       formData.append("file", blob, "frame.jpg");

//       try {
//         const response = await fetch("http://127.0.0.1:8000/predict", {
//           method: "POST",
//           body: formData,
//         });

//         const data = await response.json();
//         if (data.expression) {
//           const normalizedExpression =
//             data.expression.charAt(0).toUpperCase() +
//             data.expression.slice(1).toLowerCase();
//           setExpression(normalizedExpression);
//         }
//       } catch (err) {
//         console.error("Failed to detect expression:", err);
//       }
//     }, "image/jpeg");
//   };
//   const username = localStorage.getItem("username");
//   const { endSession } = useGameSessionLogger({ username, difficulty: level, expression });

//   const shuffleArray = (array) => {
//     for (let i = array.length - 1; i > 0; i--) {
//       const j = Math.floor(Math.random() * (i + 1));
//       [array[i], array[j]] = [array[j], array[i]];
//     }
//     return array;
//   };

//   const setupGame = () => {
//     const { revealTime, gameTime, allowedClicks } = levelSettings[level];
//     setIsStarting(true);

//     const pool = [];
//     shapes.forEach((shape) => {
//       for (let i = 0; i < 5; i++) pool.push(shape);
//     });

//     const shuffled = shuffleArray(pool);
//     setTileValues(shuffled);
//     setRevealed(new Array(totalTiles).fill(true));
//     setCorrectTiles(new Array(totalTiles).fill(false));
//     setWrongTiles(new Array(totalTiles).fill(false));
//     setScore(0);
//     setIsGameOver(false);
//     setClicksLeft(allowedClicks);
//     setTimeLeft(revealTime / 1000);

//     let countdown = revealTime / 1000;
//     const interval = setInterval(() => {
//       countdown -= 1;
//       setTimeLeft(countdown);
//     }, 1000);

//     setTimeout(() => {
//       clearInterval(interval);
//       setRevealed(new Array(totalTiles).fill(false));
//       const shape = shapes[Math.floor(Math.random() * shapes.length)];
//       setCurrentTarget(shape);
//       setTotalTarget(pool.filter((v) => v === shape).length);
//       setTimeLeft(gameTime);
//       setIsStarting(false);
//     }, revealTime);
//   };

//   const handleClick = (index) => {
//     if (revealed[index] || correctTiles[index] || isGameOver || isStarting)
//       return;

//     const updatedRevealed = [...revealed];
//     updatedRevealed[index] = true;
//     setRevealed(updatedRevealed);

//     if (tileValues[index] === currentTarget) {
//       const updatedCorrectTiles = [...correctTiles];
//       updatedCorrectTiles[index] = true;
//       setCorrectTiles(updatedCorrectTiles);
//       setScore((prev) => prev + 1);

//       if (score + 1 === totalTarget) {
//         setIsGameOver(true);
//       }
//     } else {
//       const updatedWrongTiles = [...wrongTiles];
//       updatedWrongTiles[index] = true;
//       setWrongTiles(updatedWrongTiles);

//       setClicksLeft((prev) => {
//         const newClicks = prev - 1;
//         if (newClicks <= 0) {
//           setTimeout(() => {
//             setIsGameOver(true);
//           }, 1000);
//         }
//         return newClicks;
//       });

//       setTimeout(() => {
//         setRevealed((prev) => {
//           const temp = [...prev];
//           temp[index] = false;
//           return temp;
//         });
//         setWrongTiles((prev) => {
//           const temp = [...prev];
//           temp[index] = false;
//           return temp;
//         });
//       }, 1000);
//     }
//   };

//   const handleLevelChange = (e) => {
//     setLevel(e.target.value);
//   };

//   return (
//     <div className="smg-container">
//       <h1 className="smg-title">Shape Memory Game</h1>

//       <div className="smg-controls">
//         <label htmlFor="level-select">Choose Level: </label>
//         <select
//           id="level-select"
//           value={level}
//           onChange={handleLevelChange}
//           className="smg-dropdown"
//         >
//           <option value="easy">🟢Easy</option>
//           <option value="medium">🟡Medium</option>
//           <option value="hard">🔴Hard</option>
//         </select>
//       </div>

//       <p className="smg-prompt">
//         {isStarting
//           ? "Memorize the tiles..."
//           : `Find all tiles with: ${currentTarget}`}
//       </p>

//       <p className="smg-timer">
//         {isStarting ? `Memorizing... ${timeLeft}s` : `Time Left: ${timeLeft}s`}
//       </p>

//       <p className="smg-clicks-left">Chances Left: {clicksLeft}</p>
//       <p className="smg-expression">Current Mood: {expression}</p>

//       <div className="smg-grid">
//         {tileValues.map((shape, idx) => {
//           const isRevealed = revealed[idx];
//           const isCorrect = correctTiles[idx];
//           const isWrong = wrongTiles[idx];

//           return (
//             <div
//               key={idx}
//               className={`smg-tile ${
//                 isCorrect
//                   ? "smg-correct"
//                   : isWrong
//                   ? "smg-wrong"
//                   : isRevealed
//                   ? "smg-revealed"
//                   : "smg-hidden"
//               }`}
//               onClick={() => handleClick(idx)}
//             >
//               {isRevealed || isCorrect || isWrong ? shape : ""}
//             </div>
//           );
//         })}
//       </div>

//       <p className="smg-score">
//         Score: {score} / {totalTarget}
//       </p>

//       {isGameOver && (
//         <div className="smg-end-screen">
//           <p className="smg-result-text">
//             {score === totalTarget
//               ? "🎉 You Win!"
//               : clicksLeft <= 0
//               ? "❌ No more chances!"
//               : "⏰ Time's Up!"}
//           </p>
//           <button onClick={setupGame} className="smg-reset-button">
//             Reset Game
//           </button>
//         </div>
//       )}

//       {/* Hidden video and canvas for webcam */}
//       <video ref={videoRef} autoPlay playsInline style={{ display: "none" }} />
//       <canvas ref={canvasRef} style={{ display: "none" }} />
//     </div>
//   );
// }

// export default ShapeMemoryGame;








// ShapeMemoryGame.jsx
import { useEffect, useState } from "react";
import "./ShapeMemoryGame.css";
import useEmotionDetection from "../hooks/useEmotionDetection";
import useGameSessionLogger from "../hooks/useGameSessionLogger";
import TTSButton from "../components/TTSButton";

const emotionThemes = {
  Happy: "#ffeaa7",
  Sad: "#dfe6e9",
  Angry: "#fab1a0",
  Disgust: "#81ecec",
  Fear: "#a29bfe",
  Neutral: "#ffffff",
};

const shapes = ["⬤", "▲", "■", "★"];
const totalTiles = 16;

const levelSettings = {
  easy: { revealTime: 5000, gameTime: 45, allowedClicks: 15 },
  medium: { revealTime: 5000, gameTime: 30, allowedClicks: 10 },
  hard: { revealTime: 2500, gameTime: 30, allowedClicks: 7 },
};

function ShapeMemoryGame() {
  const { emotion, videoRef, canvasRef } = useEmotionDetection();
  const [tileValues, setTileValues] = useState([]);
  const [revealed, setRevealed] = useState([]);
  const [correctTiles, setCorrectTiles] = useState([]);
  const [wrongTiles, setWrongTiles] = useState([]);
  const [currentTarget, setCurrentTarget] = useState("");
  const [score, setScore] = useState(0);
  const [totalTarget, setTotalTarget] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [level, setLevel] = useState("easy");
  const [isStarting, setIsStarting] = useState(true);
  const [clicksLeft, setClicksLeft] = useState(0);
  const [expression, setExpression] = useState("Neutral");

  // const videoRef = useRef(null);
  // const canvasRef = useRef(null);
  const username = localStorage.getItem("username");
  const { endSession } = useGameSessionLogger({
  username,
  difficulty:level,
  expression: emotion,
  score,
});
  useEffect(() => {
    setupGame();
  }, [level]);

  useEffect(() => {
    document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = "hidden";
    };
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !isGameOver) {
      const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isGameOver && !isStarting) {
      // endSession(score);
      setIsGameOver(true);
    }
  }, [timeLeft, isGameOver, isStarting]);

  useEffect(() => {
    const bgColor = emotionThemes[expression] || "#ffffff";
    document.body.style.setProperty("background-color", bgColor, "important");
  }, [expression]);

  useEffect(() => {
    let stream;
    let interval;

    navigator.mediaDevices.getUserMedia({ video: true }).then((s) => {
      stream = s;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    });

    interval = setInterval(() => {
      captureAndSend();
    }, 10000);

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (isGameOver) {
      endSession(score);
    }
  }, [isGameOver]);

  const captureAndSend = async () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append("file", blob, "frame.jpg");

      try {
        const response = await fetch("http://127.0.0.1:8000/predict", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        if (data.expression) {
          const normalizedExpression =
            data.expression.charAt(0).toUpperCase() +
            data.expression.slice(1).toLowerCase();
          setExpression(normalizedExpression);
        }
      } catch (err) {
        console.error("Failed to detect expression:", err);
      }
    }, "image/jpeg");
  };


  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const setupGame = () => {
    const { revealTime, gameTime, allowedClicks } = levelSettings[level];
    setIsStarting(true);

    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    setCurrentTarget(shape);

    const pool = [];
    for (let i = 0; i < totalTiles; i++) {
      pool.push(shapes[Math.floor(Math.random() * shapes.length)]);
    }

    const shuffled = shuffleArray(pool);
    setTileValues(shuffled);
    setRevealed(new Array(totalTiles).fill(true));
    setCorrectTiles(new Array(totalTiles).fill(false));
    setWrongTiles(new Array(totalTiles).fill(false));
    setScore(0);
    setIsGameOver(false);
    setClicksLeft(allowedClicks);
    setTimeLeft(revealTime / 1000);
    setTotalTarget(shuffled.filter((v) => v === shape).length);

    let countdown = revealTime / 1000;
    const interval = setInterval(() => {
      countdown -= 1;
      setTimeLeft(countdown);
    }, 1000);

    setTimeout(() => {
      clearInterval(interval);
      setRevealed(new Array(totalTiles).fill(false));
      setTimeLeft(gameTime);
      setIsStarting(false);
    }, revealTime);
  };

  const handleClick = (index) => {
    if (revealed[index] || correctTiles[index] || isGameOver || isStarting) return;

    const updatedRevealed = [...revealed];
    updatedRevealed[index] = true;
    setRevealed(updatedRevealed);

    if (tileValues[index] === currentTarget) {
      const updatedCorrectTiles = [...correctTiles];
      updatedCorrectTiles[index] = true;
      setCorrectTiles(updatedCorrectTiles);
      setScore((prev) => prev + 1);

      if (score + 1 === totalTarget) {
        setIsGameOver(true);
      }
    } else {
      const updatedWrongTiles = [...wrongTiles];
      updatedWrongTiles[index] = true;
      setWrongTiles(updatedWrongTiles);

      setClicksLeft((prev) => {
        const newClicks = prev - 1;
        if (newClicks <= 0) {
          setTimeout(() => {
            setIsGameOver(true);
          }, 1000);
        }
        return newClicks;
      });

      setTimeout(() => {
        setRevealed((prev) => {
          const temp = [...prev];
          temp[index] = false;
          return temp;
        });
        setWrongTiles((prev) => {
          const temp = [...prev];
          temp[index] = false;
          return temp;
        });
      }, 1000);
    }
  };

  const handleLevelChange = (e) => {
    setLevel(e.target.value);
  };

  return (
    <div className="smg-container">
      <h1 className="smg-title">Shape Memory Game</h1>
      <div className="smg-controls">
        <label htmlFor="level-select">Choose Level: </label>
        <select id="level-select" value={level} onChange={handleLevelChange} className="smg-dropdown">
          <option value="easy">🟢Easy</option>
          <option value="medium">🟡Medium</option>
          <option value="hard">🔴Hard</option>
        </select>
      </div>

      <div className="tts-inline" style={{ justifyContent: "center" }}>
        <p className="smg-prompt" style={{ margin: 0 }}>
          {isStarting ? `Memorize the tiles! Target shape is:` : `Find all tiles with:`}{' '}
          <span className="smg-target-shape">{currentTarget}</span>
        </p>
        <TTSButton
          text={isStarting
            ? `Memorize the tiles! Target shape is: ${currentTarget}`
            : `Find all tiles with: ${currentTarget}`}
          size="sm"
          label="Read instructions aloud"
        />
      </div>

      <p className="smg-timer">{isStarting ? `Memorizing... ${timeLeft}s` : `Time Left: ${timeLeft}s`}</p>
      <p className="smg-clicks-left">Chances Left: {clicksLeft}</p>
      {/* <p className="smg-expression">Current Mood: {expression}</p> */}

      <div className="smg-grid smg-grid-4x4">
        {tileValues.map((shape, idx) => {
          const isRevealed = revealed[idx];
          const isCorrect = correctTiles[idx];
          const isWrong = wrongTiles[idx];

          return (
            <div
              key={idx}
              className={`smg-tile ${
                isCorrect
                  ? "smg-correct"
                  : isWrong
                  ? "smg-wrong"
                  : isRevealed
                  ? "smg-revealed"
                  : "smg-hidden"
              }`}
              onClick={() => handleClick(idx)}
            >
              {isRevealed || isCorrect || isWrong ? shape : ""}
            </div>
          );
        })}
      </div>

      <p className="smg-score">Score: {score} / {totalTarget}</p>

      {isGameOver && (
        <div className="smg-end-screen">
          <p className="smg-result-text">
            {score === totalTarget ? "🎉 You Win!" : clicksLeft <= 0 ? "❌ No more chances!" : "⏰ Time's Up!"}
          </p>
          <button onClick={setupGame} className="smg-reset-button">Reset Game</button>
        </div>
      )}

      <video ref={videoRef} autoPlay style={{ display: "none" }} />
        <canvas ref={canvasRef} width={640} height={480} style={{ display: "none" }} />
    </div>
  );
}

export default ShapeMemoryGame;

