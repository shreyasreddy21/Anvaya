/**
 * SpeechService — thin wrapper around the browser Web Speech API.
 * All TTS in the app goes through this module so behaviour is consistent
 * and the underlying API is only accessed in one place.
 */

const SpeechService = {
  /** Returns true when the browser supports speech synthesis. */
  isSupported() {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  },

  /**
   * Speak the given text aloud.
   * Any in-progress speech is cancelled first so calls never stack.
   *
   * @param {string} text   - The text to speak.
   * @param {object} opts
   * @param {number} opts.rate  - Speaking rate (0.1–10, default 0.85 — slower helps dyslexia).
   * @param {number} opts.pitch - Pitch (0–2, default 1).
   * @param {string} opts.lang  - BCP 47 language tag (default 'en-US').
   * @param {function} opts.onEnd - Callback fired when speech finishes.
   */
  speak(text, { rate = 0.85, pitch = 1, lang = 'en-US', onEnd } = {}) {
    if (!this.isSupported() || !text) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate  = rate;
    utterance.pitch = pitch;
    utterance.lang  = lang;
    if (onEnd) utterance.onend = onEnd;

    window.speechSynthesis.speak(utterance);
  },

  /** Stop any active speech. */
  stop() {
    if (!this.isSupported()) return;
    window.speechSynthesis.cancel();
  },

  /** True while the engine is speaking. */
  isSpeaking() {
    if (!this.isSupported()) return false;
    return window.speechSynthesis.speaking;
  },
};

export default SpeechService;
