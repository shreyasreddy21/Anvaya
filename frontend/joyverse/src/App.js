import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { AccessibilityProvider, useAccessibility } from "./context/AccessibilityContext";
import AccessibilitySettingsModal from "./components/AccessibilitySettingsModal";
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
import PhonemeTapGame          from "./pages/PhonemeTapGame";
import LetterSoundGame         from "./pages/LetterSoundGame";
import ConfusableLetterGame    from "./pages/ConfusableLetterGame";
import RANGame                 from "./pages/RANGame";
import VerbalMemoryGame        from "./pages/VerbalMemoryGame";

/** Floating accessibility button — inside provider so it can read context. */
function AccessibilityFAB() {
  const { setModalOpen } = useAccessibility();
  return (
    <button
      className="a11y-fab"
      onClick={() => setModalOpen(true)}
      aria-label="Open accessibility settings"
      title="Accessibility settings"
    >
      ♿
      <span className="a11y-fab-tooltip">Accessibility</span>
    </button>
  );
}

function App() {
  return (
    <AccessibilityProvider>
      <Router>
        <Routes>
          <Route path="/"                    element={<Navigate to="/loginpage" />} />
          <Route path="/loginpage"           element={<LoginPage />} />
          <Route path="/welcomepage"         element={<WelcomeScreen />} />
          <Route path="/games"               element={<Games />} />
          <Route path="/wordpuzzleadventure" element={<WordPuzzleAdventure />} />
          <Route path="/mathgame"            element={<MathGame />} />
          <Route path="/quiz"                element={<Quiz />} />
          <Route path="/syllabletapgame"     element={<SyllableTapGame />} />
          <Route path="/shapememorygame"     element={<ShapeMemoryGame />} />
          <Route path="/letterbridge"        element={<LetterBridge />} />
          <Route path="/mirrorword"          element={<MirrorWordsGame />} />
          <Route path="/phonemetap"          element={<PhonemeTapGame />} />
          <Route path="/lettersound"         element={<LetterSoundGame />} />
          <Route path="/confusableletter"    element={<ConfusableLetterGame />} />
          <Route path="/ran"                 element={<RANGame />} />
          <Route path="/verbalmemory"        element={<VerbalMemoryGame />} />
          <Route path="/therapistdashboard"  element={<TherapistDashboard />} />
          <Route path="/superadmin"          element={<SuperAdminDashboard />} />
          <Route path="*"                    element={<h1>Page Not Found</h1>} />
        </Routes>

        {/* Global accessibility modal + FAB rendered on every route */}
        <AccessibilitySettingsModal />
        <AccessibilityFAB />
      </Router>
    </AccessibilityProvider>
  );
}

export default App;
