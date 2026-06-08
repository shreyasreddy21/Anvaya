import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
// import HeroSection from "./pages/HeroSection";
import WordPuzzleAdventure from "./pages/WordPuzzleAdventure";
import MathGame from "./pages/MathGame";
import Games from "./pages/Games";
import Quiz from "./pages/Quiz";
import LoginPage from "./pages/LoginPage";
import TherapistDashboard from "./pages/TherapistDashboard";
import WelcomeScreen from "./pages/WelcomeScreen";
import SyllableTapGame from "./pages/SyllableTapGame";
import ShapeMemoryGame from "./pages/ShapeMemoryGame";
import LetterBridge from "./pages/LetterBridge";
import MirrorWordsGame from "./pages/MirrorWordsGame";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
function App() {
  return (
    <Router>
      <Routes>
         {/* <Route path="/herosection" element={<HeroSection/>}/>  */}
        <Route path="/" element={<Navigate to="/loginpage" />} />
        <Route path="/wordpuzzleadventure" element={<WordPuzzleAdventure />} />
        <Route path="/mathgame" element={<MathGame />} />
        <Route path="/games" element={<Games/>}/>
        <Route path="/quiz" element={<Quiz/>}/>
        <Route path="/loginpage" element={<LoginPage/>}/>
        <Route path="/therapistdashboard" element={<TherapistDashboard/>}/>
        <Route path="/welcomepage" element={<WelcomeScreen/>}/>
        <Route path="/syllabletapgame" element={<SyllableTapGame/>}/>
        <Route path="/shapememorygame" element={<ShapeMemoryGame/>}/>
        <Route path="/letterbridge" element={<LetterBridge/>}/>
        <Route path="/mirrorword" element={<MirrorWordsGame/>}/>
        <Route path="/superadmin" element={<SuperAdminDashboard/>}/>
        <Route path="*" element={<h1>Page Not Found</h1>} />
      </Routes>
    </Router>
  );
}
export default App;

