// Pre-warm voices at module load so they are ready on first speak().
let _voicesReady = false;
const _pendingCalls = [];

function _prewarm() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    _voicesReady = true;
  } else {
    const _onReady = () => {
      if (_voicesReady) return;
      _voicesReady = true;
      window.speechSynthesis.onvoiceschanged = null;
      _pendingCalls.splice(0).forEach(fn => fn());
    };
    window.speechSynthesis.onvoiceschanged = _onReady;
    // Fallback: speak even if onvoiceschanged never fires (some Linux configs)
    setTimeout(() => { if (!_voicesReady) _onReady(); }, 3000);
  }
}

if (typeof window !== 'undefined') _prewarm();

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
  /** Call once at app startup (src/index.js) to start voice pre-loading early. */
  init() {
    _prewarm();
  },

  isSupported() {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  },

  /**
   * Speak text aloud.
   * @param {string}   text
   * @param {object}   opts
   * @param {number}   opts.rate        — speech rate (default 0.85)
   * @param {number}   opts.pitch       — pitch (default 1)
   * @param {string}   opts.lang        — BCP-47 tag (default 'en-US')
   * @param {function} opts.onEnd       — called when utterance ends or on error
   * @param {function} opts.onBoundary  — called on word boundary (e.name, e.charIndex, e.charLength)
   */
  speak(text, { rate = 0.85, pitch = 1, lang = 'en-US', onEnd, onBoundary } = {}) {
    if (!this.isSupported() || !text?.toString().trim()) {
      onEnd?.();
      return;
    }

    const cleanText = String(text).trim();

    const _execute = () => {
      const wasBusy = window.speechSynthesis.speaking || window.speechSynthesis.pending;
      try { window.speechSynthesis.cancel(); } catch (_) {}

      // Wait for cancel() to settle: 200ms if something was playing, 50ms otherwise.
      setTimeout(() => {
        let ended = false;
        let watchdog;

        const _done = () => {
          if (ended) return;
          ended = true;
          clearTimeout(watchdog);
          onEnd?.();
        };

        const _attemptSpeak = (isRetry) => {
          try {
            // Chrome/Linux critical fix: Chrome suspends the synthesis engine
            // when idle (PulseAudio / PipeWire). resume() re-activates it.
            // Without this, speak() silently enqueues and never plays.
            window.speechSynthesis.resume();

            const utt = new SpeechSynthesisUtterance(cleanText);
            utt.rate  = rate;
            utt.pitch = pitch;
            utt.lang  = lang;

            const voice = _pickVoice(lang.slice(0, 2));
            if (voice) utt.voice = voice;

            utt.onend   = _done;
            utt.onerror = (e) => { if (e?.error !== 'interrupted') _done(); };
            if (onBoundary) utt.onboundary = onBoundary;

            window.speechSynthesis.speak(utt);

            // Watchdog: force-terminate if utterance gets stuck (network TTS hang, etc.)
            const estimatedMs = Math.max(cleanText.split(/\s+/).length * 700, 6000);
            watchdog = setTimeout(() => {
              try { window.speechSynthesis.cancel(); } catch (_) {}
              _done();
            }, estimatedMs);

            // Silent-failure detection: if not speaking 500ms after speak(), retry once.
            // Catches the case where resume() wasn't enough on first try.
            if (!isRetry) {
              setTimeout(() => {
                if (!ended && !window.speechSynthesis.speaking && !window.speechSynthesis.pending) {
                  clearTimeout(watchdog);
                  try { window.speechSynthesis.cancel(); } catch (_) {}
                  setTimeout(() => { if (!ended) _attemptSpeak(true); }, 150);
                }
              }, 500);
            }
          } catch (err) {
            console.warn('[TTS] speak failed:', err.message ?? err);
            _done();
          }
        };

        _attemptSpeak(false);
      }, wasBusy ? 200 : 50);
    };

    if (_voicesReady) {
      _execute();
    } else {
      _pendingCalls.push(_execute);
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
