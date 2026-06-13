/**
 * Centralised API base URL.
 * Override at build time by setting REACT_APP_API_URL (or VITE_API_URL) in .env.
 * Default falls back to localhost for local development.
 */
export const API_BASE =
  import.meta.env.REACT_APP_API_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:4000";
