import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import SpeechService from './services/SpeechService';
import "./pages/global.css";
import axios from 'axios';
import { clearSession } from './utils/session';

// Pre-warm TTS voices early so first speak() call has them ready
SpeechService.init();

// Attach JWT Bearer token (stored in localStorage after login) to every request.
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

// On 401 anywhere in the app, clear localStorage session state and go to login.
// Exclude the login endpoint itself — a wrong-password 401 should show an error
// message in the form, not silently reload the page.
axios.interceptors.response.use(
  response => response,
  error => {
    const is401 = error.response?.status === 401;
    const isLoginReq = error.config?.url?.includes('/api/auth/login');
    if (is401 && !isLoginReq) {
      clearSession();
      window.location.href = '/loginpage';
    }
    return Promise.reject(error);
  }
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
