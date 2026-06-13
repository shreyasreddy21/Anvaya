import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE } from '../config/api';

/**
 * useAdaptiveDifficulty — fetches a data-driven difficulty recommendation for
 * the current child + game from /api/adaptive. Fully non-blocking: if the
 * request fails it simply returns null and the game behaves as before.
 *
 * @param {string} gameKey          e.g. 'phonemetap'
 * @param {string} currentDifficulty 'easy' | 'medium' | 'hard'
 * @param {object} opts
 * @param {boolean} opts.enabled    gate the fetch (default true)
 * @param {any}     opts.refreshKey change to re-fetch (e.g. after a session ends)
 * @returns {object|null} recommendation { recommended, current, reason, shouldPrompt, ... }
 */
export default function useAdaptiveDifficulty(gameKey, currentDifficulty, { enabled = true, refreshKey } = {}) {
  const [recommendation, setRecommendation] = useState(null);
  const username = localStorage.getItem('username');

  useEffect(() => {
    if (!enabled || !username || !gameKey || !currentDifficulty) {
      setRecommendation(null);
      return;
    }
    let cancelled = false;
    const url = `${API_BASE}/api/adaptive/${encodeURIComponent(username)}/recommendation`
      + `?game=${encodeURIComponent(gameKey)}&current=${encodeURIComponent(currentDifficulty)}`;
    axios.get(url)
      .then((r) => { if (!cancelled) setRecommendation(r.data); })
      .catch(() => { if (!cancelled) setRecommendation(null); });
    return () => { cancelled = true; };
  }, [gameKey, currentDifficulty, enabled, username, refreshKey]);

  return recommendation;
}
