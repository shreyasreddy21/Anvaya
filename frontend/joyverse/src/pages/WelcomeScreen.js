import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./WelcomeScreen.css";

const WelcomeScreen = () => {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [emotion, setEmotion] = useState("neutral");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    setUsername(storedUsername || "Guest");

    const selectedEmotion = localStorage.getItem("selectedEmotion") || "neutral";
    setEmotion(selectedEmotion);
  }, []);
  useEffect(() => {
    document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = "hidden";
    };
  }, []);

  const showMessage = (mood) => {
    const messages = {
      happy: "Yay! You're feeling great! Keep smiling! ",
      smile: "Nice! A smile makes everything better ",
      neutral: "That's okay! Let’s make your day better ",
      sad: "Oh no! Big hugs coming your way ",
      angry: "It's okay to feel angry. Take deep breaths ",
    };
    setMessage(messages[mood]);
    localStorage.setItem("selectedEmotion", mood);
    setEmotion(mood);
  };

//  const backgroundMap = {
//     happy: "url('https://i.pinimg.com/736x/21/01/cc/2101cc1cb0e93c8d9f04145946118c7f.jpg')", 
//     smile: "url('https://i.pinimg.com/736x/8d/40/84/8d4084f141bce06f25e99b44956790d3.jpg')",
//     neutral: "url('https://i.pinimg.com/736x/65/6b/e4/656be4ba10df99f7849a609f4bac3f36.jpg')",
//     sad: "url('https://i.pinimg.com/736x/7a/7c/2a/7a7c2a56165f9015ad57e4cebb16c022.jpg')",
//     angry: "url('https://i.pinimg.com/736x/4b/06/6a/4b066a49cbe4ff6061c742fa23858687.jpg')",
//   };

//   const backgroundStyle = {
//     backgroundImage: backgroundMap[emotion],
//     backgroundSize: "cover",
//     backgroundPosition: "center",
//     minHeight: "100vh",
//     width: "100%",
//   };

  const handleStartPlaying = () => {
    navigate("/games");
  };

  return (
    <div className="welcomescreen">
      <section className="header">
        <div className="welcometext">
          <h3 className="welcome-to-joyverse-container">
            <p className="welcome-to-joyverse">{`Welcome to JoyVerse, ${username}!`}</p>
          </h3>
          <div className="lets-play-and">Let's play and learn together :)</div>
        </div>
      </section>

      <section className="emojiselectorcontainer">
        <div className="emojiselector">
          <h2 className="how-are-you">How are you feeling today?</h2>
          <div className="emojibuttons">
            <div className="happybutton" onClick={() => showMessage("happy")}>
              <img className="happyicon" alt="happy" src="/images/happy.png" />
            </div>
            <div className="smilebutton" onClick={() => showMessage("smile")}>
              <img className="happyicon" alt="Smile" src="/images/smile.png" />
            </div>
            <div className="neutralbutton" onClick={() => showMessage("neutral")}>
              <img className="happyicon" alt="Neutral" src="/images/neutral.png" />
            </div>
            <div className="sadbutton" onClick={() => showMessage("sad")}>
              <img className="happyicon" alt="Sad" src="/images/sad.png" />
            </div>
            <div className="angrybutton" onClick={() => showMessage("angry")}>
              <img className="happyicon" alt="Angry" src="/images/angry.png" />
            </div>
          </div>
        </div>
      </section>

      {message && <div className="welcome-message-box">{message}</div>}

      <button className="startplayingbutton" onClick={handleStartPlaying}>
        <div className="startplayingtext">
          <div className="start-playing">Start Playing</div>
        </div>
      </button>
    </div>
  );
};

export default WelcomeScreen;
