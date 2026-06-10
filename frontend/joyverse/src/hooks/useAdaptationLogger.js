import { useCallback } from 'react';
import axios from 'axios';

export function useAdaptationLogger(gameKey) {
  const username = localStorage.getItem('username');

  const logAdaptation = useCallback(async ({
    emotionDetected = null,
    previousDifficulty = null,
    newDifficulty = null,
    backgroundChange = false,
    triggerType = 'emotion',
    sessionId = null,
  } = {}) => {
    if (!username) return;
    try {
      await axios.post('http://localhost:4000/api/adaptation-log', {
        username,
        gameKey,
        emotionDetected,
        previousDifficulty,
        newDifficulty,
        backgroundChange,
        triggerType,
        sessionId,
      });
    } catch {
      // non-blocking — adaptation logging is best-effort
    }
  }, [username, gameKey]);

  return { logAdaptation };
}
