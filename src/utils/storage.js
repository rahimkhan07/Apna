/**
 * storage.js — LocalStorage utility functions
 *
 * All functions are safe: they catch parse errors and return sensible
 * defaults so the app never crashes on corrupted or missing data.
 */

// ─── Core CRUD ────────────────────────────────────────────────────────────────

/**
 * Persist any value to localStorage under the given key.
 * @param {string} key
 * @param {*} value  — will be JSON-serialised
 */
export const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    console.error(`[storage] saveToStorage("${key}") failed:`, err)
  }
}

/**
 * Read and deserialise a value from localStorage.
 * @param {string} key
 * @param {*} fallback  — returned when the key is missing or unreadable
 * @returns {*}
 */
export const getFromStorage = (key, fallback = null) => {
  try {
    const raw = localStorage.getItem(key)
    return raw !== null ? JSON.parse(raw) : fallback
  } catch (err) {
    console.error(`[storage] getFromStorage("${key}") failed:`, err)
    return fallback
  }
}

/**
 * Merge a partial update into an existing stored object or array.
 *
 * - Object  → shallow-merges `updates` into the stored object
 * - Array   → replaces the array with `updates` (pass the full new array)
 * - Missing → writes `updates` as the initial value
 *
 * @param {string} key
 * @param {object|Array} updates
 */
export const updateStorage = (key, updates) => {
  try {
    const existing = getFromStorage(key)
    const next =
      existing !== null && !Array.isArray(existing) && typeof existing === 'object'
        ? { ...existing, ...updates }
        : updates
    saveToStorage(key, next)
  } catch (err) {
    console.error(`[storage] updateStorage("${key}") failed:`, err)
  }
}

/**
 * Remove a key entirely from localStorage.
 * @param {string} key
 */
export const deleteFromStorage = (key) => {
  try {
    localStorage.removeItem(key)
  } catch (err) {
    console.error(`[storage] deleteFromStorage("${key}") failed:`, err)
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Check whether a key exists in localStorage.
 * @param {string} key
 * @returns {boolean}
 */
export const hasStorageKey = (key) => localStorage.getItem(key) !== null

/**
 * Wipe every FoodieHub key from localStorage (useful for dev reset).
 * Keys are identified by the shared "fh_" prefix.
 */
export const clearAllStorage = () => {
  Object.keys(localStorage)
    .filter((k) => k.startsWith('fh_'))
    .forEach((k) => localStorage.removeItem(k))
}
