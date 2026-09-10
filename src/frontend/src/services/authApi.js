/**
 * authApi.js — Auth service for S.A.M.A.Y
 *
 * All three functions call the real FastAPI backend via the Vite proxy.
 * Cookies are httpOnly so the browser handles them automatically — we never
 * touch or read the cookie value ourselves.
 */

const AUTH_BASE = '/api/auth';

async function authFetch(url, options = {}) {
  const { timeout = 4000, ...fetchOptions } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      credentials: 'include', // send cookies cross-origin in dev
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      ...fetchOptions,
    });
    clearTimeout(timer);

    if (!res.ok) {
      let detail = res.statusText;
      try {
        const body = await res.json();
        detail = body.detail || detail;
      } catch (_) { /* ignore */ }
      throw new Error(detail);
    }
    return res.json();
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

/**
 * POST /api/auth/login
 * Sets an httpOnly JWT cookie. Returns the user object on success.
 *
 * @param {string} username
 * @param {string} password
 * @param {boolean} rememberMe - if true sets a 7-day persistent cookie
 * @returns {Promise<Object>} user
 */
export async function login(username, password, rememberMe = false) {
  const data = await authFetch(`${AUTH_BASE}/login`, {
    method: 'POST',
    body: JSON.stringify({ username, password, remember_me: rememberMe }),
  });
  return data.user;
}

/**
 * POST /api/auth/logout
 * Instructs the server to clear the session cookie.
 */
export async function logout() {
  try {
    await authFetch(`${AUTH_BASE}/logout`, { method: 'POST' });
  } catch (_) {
    // Best-effort — clear local state regardless
  }
}

/**
 * GET /api/auth/me
 * Returns the currently logged-in user from the session cookie, or null
 * if the cookie is absent / expired (401 → caught and returns null).
 *
 * @returns {Promise<Object|null>} user or null
 */
export async function getMe() {
  try {
    return await authFetch(`${AUTH_BASE}/me`);
  } catch (_) {
    return null;
  }
}

