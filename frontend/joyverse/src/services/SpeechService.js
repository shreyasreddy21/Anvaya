/**
 * SpeechService — Web Speech API wrapper.
 *
 * Design principles:
 *  - Never block speech on voice loading state.  Speak immediately and let
 *    the browser use its default voice if no named voice is resolved.
 *  - Wrap every speechSynthesis call in try/catch; Chrome on Linux throws
 *    silently when speech-dispatcher is unconfigured.
 *  - 100 ms delay after cancel() is enough for Chrome's async cancel to settle.
 *  - Expose onError callback so callers can reset UI even when the utterance
 *    is silently discarded by the platform.
 */

function _pickVoice(langPrefix) {
  try {
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;
    return (
      voices.find(v => v.lang.startsWith(langPrefix) && !v.localService) ||
      voices.find(v => v.lang.startsWith(langPrefix)) ||
      voices[0]
    );
  } catch (_) {
    return null;
  }
}

const SpeechService = {
  isSupported() {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  },

  /**
   * Speak text aloud.
   * @param {string}   text
   * @param {object}   opts
   * @param {number}   opts.rate    — speech rate (default 0.85)
   * @param {number}   opts.pitch   — pitch (default 1)
   * @param {string}   opts.lang    — BCP-47 lang tag (default 'en-US')
   * @param {function} opts.onEnd   — called when utterance ends (or on error)
   */
  speak(text, { rate = 0.85, pitch = 1, lang = 'en-US', onEnd } = {}) {
    if (!this.isSupported() || !text?.toString().trim()) {
      onEnd?.();
      return;
    }

    const cleanText = String(text).trim();
    try { window.speechSynthesis.cancel(); } catch (_) {}

    const _doSpeak = () => {
      try {
        const utt = new SpeechSynthesisUtterance(cleanText);
        utt.rate  = rate;
        utt.pitch = pitch;
        utt.lang  = lang;
        utt.onend   = () => onEnd?.();
        utt.onerror = () => onEnd?.();
        const voice = _pickVoice(lang.slice(0, 2));
        if (voice) utt.voice = voice;
        window.speechSynthesis.speak(utt);
      } catch (err) {
        console.warn('[TTS] speak failed:', err.message ?? err);
        onEnd?.();
      }
    };

    // Chrome bug: getVoices() returns [] until onvoiceschanged fires.
    // Wait for voices with a 1.5 s fallback that speaks anyway (browser uses default).
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      setTimeout(_doSpeak, 100);
    } else {
      let fired = false;
      const fallback = setTimeout(() => {
        if (!fired) { fired = true; setTimeout(_doSpeak, 100); }
      }, 1500);
      const prev = window.speechSynthesis.onvoiceschanged;
      window.speechSynthesis.onvoiceschanged = () => {
        if (!fired) {
          fired = true;
          clearTimeout(fallback);
          window.speechSynthesis.onvoiceschanged = prev ?? null;
          setTimeout(_doSpeak, 100);
        }
      };
    }
  },

  stop() {
    if (!this.isSupported()) return;
    try { window.speechSynthesis.cancel(); } catch (_) {}
  },

  isSpeaking() {
    if (!this.isSupported()) return false;
    try { return window.speechSynthesis.speaking; } catch (_) { return false; }
  },
};

export default SpeechService;
