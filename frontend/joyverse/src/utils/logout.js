import { clearSession } from './session';

export function logout() {
  try {
    clearSession();
  } catch (_) {
    // ignore storage errors
  }
  window.location.href = '/loginpage';
}

export default logout;
