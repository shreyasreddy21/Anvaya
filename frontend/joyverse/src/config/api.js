/**
 * Centralised API base URL.
 *
 * All call sites use it as `${API_BASE}/api/...`.
 *
 * Resolution order:
 *   1. REACT_APP_API_URL / VITE_API_URL  — explicit build-time override.
 *   2. Production build with no override  — '' (same origin). Because the nginx
 *      reverse proxy serves the frontend AND proxies /api/ on the same domain,
 *      a relative '/api/...' request always reaches the backend. This makes
 *      deployment bulletproof: even if the build-arg is forgotten, the app does
 *      NOT fall back to http://localhost:4000 (which would hit the visitor's own
 *      machine and be blocked as mixed content on an HTTPS page).
 *   3. Local dev  — http://localhost:4000 (Vite dev server has no API of its own).
 */
const explicit =
  import.meta.env.REACT_APP_API_URL ||
  import.meta.env.VITE_API_URL ||
  "";

export const API_BASE = explicit
  ? explicit.replace(/\/$/, "")            // tolerate a trailing slash in the env value
  : (import.meta.env.PROD ? "" : "http://localhost:4000");
