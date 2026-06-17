import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getConsent, setConsent, CONSENT_EVENT } from '../utils/cameraConsent';
import { requestCameraStream, describeCameraIssue } from '../utils/cameraSupport';
import './CameraConsentModal.css';

// Paths that make up the child games area (mirrors EmotionProvider).
const GAME_PATHS = new Set([
  '/welcomepage', '/games', '/achievements',
  '/wordpuzzleadventure', '/mathgame', '/quiz', '/syllabletapgame',
  '/shapememorygame', '/letterbridge', '/mirrorword', '/phonemetap',
  '/lettersound', '/confusableletter', '/ran', '/verbalmemory',
  '/reading-fluency', '/sight-words', '/morphology-builder',
]);

/**
 * One-time consent prompt for on-device expression sensing.
 * Shown only when the user is in the games area, signed in, and has not yet
 * made a choice. Privacy-first: declining is the safe default and the feature
 * can be toggled later in Accessibility settings.
 */
export default function CameraConsentModal() {
  const location = useLocation();
  const [choice, setChoice] = useState(getConsent());
  const [busy, setBusy]   = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const onChange = () => setChoice(getConsent());
    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, []);

  let hasToken = false;
  try { hasToken = !!localStorage.getItem('token'); } catch (_) {}

  const shouldAsk = hasToken && choice == null && GAME_PATHS.has(location.pathname);
  if (!shouldAsk) return null;

  // Trigger the real browser permission prompt from inside the click (a user
  // gesture — the reliable way to get it to appear). Only record consent once
  // the camera actually starts; otherwise show exactly why it didn't.
  const allow = async () => {
    setBusy(true);
    setError(null);
    try {
      const stream = await requestCameraStream();
      // Release this probe stream immediately; the EmotionProvider opens its
      // own camera now that permission is granted (no second prompt).
      stream.getTracks().forEach((t) => t.stop());
      setConsent('granted');
    } catch (err) {
      console.warn('[camera-consent] permission/probe failed:', err);
      setError(describeCameraIssue(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="cc-overlay" role="dialog" aria-modal="true" aria-labelledby="cc-title">
      <div className="cc-modal">
        <div className="cc-icon" aria-hidden="true">📷✨</div>
        <h2 id="cc-title" className="cc-title">Turn on friendly expression sensing?</h2>
        <p className="cc-body">
          JoyVerse can gently notice when a game feels too hard and adjust to help —
          using your camera to read facial expressions.
        </p>
        <ul className="cc-points">
          <li>🔒 It runs <strong>entirely on this device</strong>.</li>
          <li>🚫 No video or pictures are <strong>ever sent or saved</strong>.</li>
          <li>🎚️ You can turn it on or off anytime in Settings.</li>
        </ul>
        {error && (
          <p className="cc-error" role="alert" style={{ color: '#b91c1c', margin: '0 0 8px' }}>
            {error}
          </p>
        )}
        <div className="cc-actions">
          <button className="cc-btn cc-btn--allow" onClick={allow} disabled={busy}>
            {busy ? 'Starting camera…' : 'Turn it on'}
          </button>
          <button className="cc-btn cc-btn--deny" onClick={() => setConsent('denied')} disabled={busy}>
            Not now
          </button>
        </div>
        <p className="cc-foot">A parent or teacher can decide this with you.</p>
      </div>
    </div>
  );
}
