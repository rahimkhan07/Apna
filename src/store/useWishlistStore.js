import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * useWishlistStore
 *
 * Manages the user's wishlist (saved / favourite products).
 * Persisted to localStorage under "fh_wishlist".
 *
 * State:
 *   items[]         — array of saved product objects
 *
 * Actions:
 *   toggleWishlist(product) — add if absent, remove if present
 *   addToWishlist(product)  — add a product (no-op if already saved)
 *   removeFromWishlist(id)  — remove by product id
 *   clearWishlist()         — empty the list
 *
 * Derived (called as functions):
 *   isWishlisted(id)        — true if the product is in the wishlist
 *   totalWishlisted()       — count of saved items
 */
const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],

      // ── Toggle ───────────────────────────────────────────────────────────
      toggleWishlist: (product) => {
        const exists = get().items.some((i) => i.id === product.id)
        if (exists) {
          set((state) => ({ items: state.items.filter((i) => i.id !== product.id) }))
        } else {
          set((state) => ({
            items: [...state.items, { ...product, savedAt: new Date().toISOString() }],
          }))
        }
      },

      // ── Add ──────────────────────────────────────────────────────────────
      addToWishlist: (product) => {
        if (get().items.some((i) => i.id === product.id)) return
        set((state) => ({
          items: [...state.items, { ...product, savedAt: new Date().toISOString() }],
        }))
      },

      // ── Remove ───────────────────────────────────────────────────────────
      removeFromWishlist: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      // ── Clear ────────────────────────────────────────────────────────────
      clearWishlist: () => set({ items: [] }),

      // ── Derived ──────────────────────────────────────────────────────────
      isWishlisted:    (id) => get().items.some((i) => i.id === id),
      totalWishlisted: ()   => get().items.length,
    }),
    { name: 'fh_wishlist' }
  )
)

export default useWishlistStore
