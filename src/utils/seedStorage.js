/**
 * seedStorage.js
 *
 * Auto-seeds localStorage with dummy data on the very first app load.
 * Subsequent loads are skipped — the "fh_seeded" flag guards the gate.
 *
 * Call `seedStorage()` once at app startup (main.jsx or App.jsx).
 * Call `resetAndReseed()` during development to wipe and re-seed.
 */

import { saveToStorage, getFromStorage, hasStorageKey, clearAllStorage } from './storage'
import {
  STORAGE_KEYS,
  SEED_CATEGORIES,
  SEED_SHOPS,
  SEED_PRODUCTS,
  SEED_USERS,
  SEED_ORDERS,
  SEED_OFFERS,
} from './seedData'

/** Current schema version — bump this to force a re-seed after data changes */
const SEED_VERSION = '1.0.0'

/**
 * Write all seed collections to localStorage.
 * @param {boolean} silent — suppress console output when true
 */
const writeSeedData = (silent = false) => {
  saveToStorage(STORAGE_KEYS.CATEGORIES, SEED_CATEGORIES)
  saveToStorage(STORAGE_KEYS.SHOPS,      SEED_SHOPS)
  saveToStorage(STORAGE_KEYS.PRODUCTS,   SEED_PRODUCTS)
  saveToStorage(STORAGE_KEYS.USERS,      SEED_USERS)
  saveToStorage(STORAGE_KEYS.ORDERS,     SEED_ORDERS)
  saveToStorage(STORAGE_KEYS.OFFERS,     SEED_OFFERS)

  // Mark as seeded with version + timestamp
  saveToStorage(STORAGE_KEYS.SEEDED, {
    version: SEED_VERSION,
    seededAt: new Date().toISOString(),
  })

  if (!silent) {
    console.info(
      `%c[FoodieHub] LocalStorage seeded (v${SEED_VERSION}) ✓`,
      'color: #22c55e; font-weight: bold;'
    )
  }
}

/**
 * Seed localStorage on first load.
 * Skips if already seeded with the current version.
 */
export const seedStorage = () => {
  const meta = getFromStorage(STORAGE_KEYS.SEEDED)

  // Already seeded with the same version — nothing to do
  if (meta?.version === SEED_VERSION) return

  // Either first load or version mismatch — (re)seed
  writeSeedData()
}

/**
 * Wipe all FoodieHub localStorage keys and re-seed from scratch.
 * Useful during development via the browser console:
 *   import { resetAndReseed } from './utils/seedStorage'
 *   resetAndReseed()
 */
export const resetAndReseed = () => {
  clearAllStorage()
  writeSeedData()
  console.info('%c[FoodieHub] Storage reset & re-seeded ✓', 'color: #f97316; font-weight: bold;')
}

// ─── Typed reader helpers ─────────────────────────────────────────────────────
// Convenience wrappers so components never need to know the key names.

/** @returns {import('./seedData').SEED_CATEGORIES} */
export const getCategories = () => getFromStorage(STORAGE_KEYS.CATEGORIES, [])

/** @returns {import('./seedData').SEED_SHOPS} */
export const getShops = () => getFromStorage(STORAGE_KEYS.SHOPS, [])

/** @returns {import('./seedData').SEED_PRODUCTS} */
export const getProducts = () => getFromStorage(STORAGE_KEYS.PRODUCTS, [])

/** @returns {import('./seedData').SEED_USERS} */
export const getUsers = () => getFromStorage(STORAGE_KEYS.USERS, [])

/** @returns {import('./seedData').SEED_ORDERS} */
export const getOrders = () => getFromStorage(STORAGE_KEYS.ORDERS, [])

/** @returns {import('./seedData').SEED_OFFERS} */
export const getOffers = () => getFromStorage(STORAGE_KEYS.OFFERS, [])

/** Get a single shop by id */
export const getShopById = (id) => getShops().find((s) => s.id === id) ?? null

/** Get all products for a given shopId */
export const getProductsByShop = (shopId) =>
  getProducts().filter((p) => p.shopId === shopId)

/** Get all orders for a given userId */
export const getOrdersByUser = (userId) =>
  getOrders().filter((o) => o.userId === userId)

/** Get only active offers */
export const getActiveOffers = () => getOffers().filter((o) => o.isActive)
