import React from "react";
import { useNavigate } from "react-router-dom";
import "./HeroSection.css";
import hamepageBackground from '../assets/homeback.jpg';

function HeroSection() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        background: `url(${hamepageBackground}) no-repeat center center`,
        backgroundSize: 'cover',
      }}
    >
    <div className="hero-container">
      <h1 className="hero-title">
        Welcome to JoyVerse
      </h1>

      <p className="hero-subtitle">
        Educational games designed to make learning fun and engaging for every child!
      </p>

      <div className="button-container">
        <button className="play-button" onClick={() => navigate("/loginpage")}>
          Login Here
        </button>
      </div>
    </div>
    </div>
  );
}

export default HeroSection;
