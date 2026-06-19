// Session TTL matches the backend JWT_EXPIRES_IN default (8h).
const EMOTION_TTL_MS = 8 * 60 * 60 * 1000;

export function getToken() {
  return localStorage.getItem('token');
}

export function getUserRole() {
  return localStorage.getItem('userRole');
}

export function setSelectedEmotion(key) {
  localStorage.setItem('selectedEmotion', key);
  localStorage.setItem('selectedEmotionExpiry', String(Date.now() + EMOTION_TTL_MS));
}

export function getSelectedEmotion() {
  const key    = localStorage.getItem('selectedEmotion');
  const expiry = localStorage.getItem('selectedEmotionExpiry');
  if (!key) return null;
  // No expiry = stored before TTL was introduced → treat as expired
  if (!expiry || Date.now() > Number(expiry)) {
    localStorage.removeItem('selectedEmotion');
    localStorage.removeItem('selectedEmotionExpiry');
    return null;
  }
  return key;
}

export function clearSession() {
  ['token', 'username', 'therapistId', 'userRole', 'selectedEmotion', 'selectedEmotionExpiry']
    .forEach(k => localStorage.removeItem(k));
}
