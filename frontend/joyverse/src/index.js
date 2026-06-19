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

// Attach JWT to every outgoing request
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// On 401 anywhere in the app, clear session and go to login
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
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
