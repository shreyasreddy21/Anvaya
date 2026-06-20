import axios from 'axios';
import { clearSession } from './session';
import { API_BASE } from '../config/api';

export function logout() {
  // Ask the server to clear the HttpOnly jv_token cookie, then wipe localStorage.
  // If the request fails (e.g. offline), we still clear local state and redirect.
  axios.post(`${API_BASE}/api/auth/logout`).catch(() => {}).finally(() => {
    clearSession();
    window.location.href = '/loginpage';
  });
}

export default logout;
