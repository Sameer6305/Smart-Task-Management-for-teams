// ─────────────────────────────────────────────────────────────────────────────
// TaskFlow Pro — Authentication Utilities
// ─────────────────────────────────────────────────────────────────────────────
// These functions are a higher-level auth layer built on top of localStorage.
// Key names intentionally match storage.js so both files share the same data.
// ─────────────────────────────────────────────────────────────────────────────

const TOKEN_KEY = 'taskflow_token'
const USER_KEY  = 'taskflow_user'

// ─────────────────────────────────────────────────────────────────────────────
// Token helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Persist a JWT to localStorage.
 * @param {string} token
 */
export function setToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch (err) {
    console.error('[auth] setToken failed:', err)
  }
}

/**
 * Retrieve the stored JWT, or `null` if absent.
 * @returns {string|null}
 */
export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch (err) {
    console.error('[auth] getToken failed:', err)
    return null
  }
}

/**
 * Remove the JWT from localStorage.
 */
export function removeToken() {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch (err) {
    console.error('[auth] removeToken failed:', err)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// User helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Persist user data to localStorage as JSON.
 * @param {object} user
 */
export function setUser(user) {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  } catch (err) {
    console.error('[auth] setUser failed:', err)
  }
}

/**
 * Retrieve and parse stored user data, or `null` if absent / corrupt.
 * @returns {object|null}
 */
export function getUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch (err) {
    // Malformed JSON — clear it so the app doesn't stay broken
    console.warn('[auth] getUser — corrupted data cleared:', err)
    localStorage.removeItem(USER_KEY)
    return null
  }
}

/**
 * Remove user data from localStorage.
 */
export function removeUser() {
  try {
    localStorage.removeItem(USER_KEY)
  } catch (err) {
    console.error('[auth] removeUser failed:', err)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Auth state
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns `true` when a JWT is present in storage.
 * For stricter checks use `decodeToken()` to also verify expiry.
 * @returns {boolean}
 */
export function isAuthenticated() {
  const token = getToken()
  if (!token) return false

  // Also guard against obviously expired tokens
  try {
    const payload = decodeToken(token)
    if (payload?.exp && payload.exp * 1000 < Date.now()) {
      // Token has expired — clean up silently
      removeToken()
      removeUser()
      return false
    }
  } catch {
    // decodeToken will log its own warning; treat as unauthenticated
    return false
  }

  return true
}

/**
 * Retrieve the `role` field from the stored user object.
 * Falls back to `'user'` when no role is present.
 * @returns {string}
 */
export function getUserRole() {
  const user = getUser()
  return user?.role ?? 'user'
}

// ─────────────────────────────────────────────────────────────────────────────
// Session management
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Clear both the JWT and the user record from localStorage.
 * @returns {true} Always returns `true` for easy chaining / conditional use.
 */
export function logout() {
  removeToken()
  removeUser()
  return true
}

// ─────────────────────────────────────────────────────────────────────────────
// JWT decoding (client-side only — NO signature verification)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Manually decode a JWT and return its payload.
 *
 * ⚠️  This does NOT verify the signature. Use only for reading claims
 *     (e.g. `exp`, `sub`, `role`). Trust comes from the server response,
 *     not from decoding here.
 *
 * @param {string} token  Raw JWT string (3 base64url parts separated by '.')
 * @returns {object|null} Parsed payload, or `null` on any failure.
 */
export function decodeToken(token) {
  if (!token || typeof token !== 'string') return null

  const parts = token.split('.')
  if (parts.length !== 3) {
    console.warn('[auth] decodeToken — malformed JWT (expected 3 parts)')
    return null
  }

  try {
    // Convert base64url → base64 → binary string → UTF-8
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    // Pad to a multiple of 4
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const decoded = atob(padded)
    // Handle multi-byte characters
    const json = decodeURIComponent(
      decoded
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    )
    return JSON.parse(json)
  } catch (err) {
    console.warn('[auth] decodeToken — failed to parse payload:', err)
    return null
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Composite helper — initialise session from a login / register response
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convenience function: store both token and user in one call.
 * Typically called right after a successful login or register response.
 *
 * @param {{ token: string, user: object }} session
 */
export function saveSession({ token, user }) {
  if (token) setToken(token)
  if (user)  setUser(user)
}
