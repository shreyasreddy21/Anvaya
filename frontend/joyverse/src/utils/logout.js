/**
 * Clear the session and return to the login page.
 * Uses a full navigation so all in-memory state (and any webcam stream)
 * is torn down cleanly on sign-out.
 */
export function logout() {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('therapistId');
    localStorage.removeItem('selectedEmotion');
  } catch (_) {
    // ignore storage errors
  }
  window.location.href = '/loginpage';
}

export default logout;
