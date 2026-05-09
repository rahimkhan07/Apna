import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * useCartStore
 *
 * Manages the shopping cart. Persisted to localStorage under "fh_cart".
 *
 * State:
 *   items[]         — { ...product, qty, shopId, shopName }
 *   shopId          — active shop (single-shop cart)
 *   shopName        — display name of active shop
 *   coupon          — { code, type, value, maxDiscount } | null
 *   couponError     — string | null
 *
 * Actions:
 *   addItem(product)          — add or increment qty
 *   removeItem(id)            — decrement or remove
 *   deleteItem(id)            — remove entirely
 *   setQty(id, qty)           — set exact quantity (0 = remove)
 *   clearCart()               — empty everything
 *   applyCoupon(code)         — validate & apply coupon code
 *   removeCoupon()            — clear applied coupon
 *
 * Derived (call as functions):
 *   totalItems()              — sum of all qty
 *   subtotal()                — sum of price × qty
 *   deliveryFee()             — 0 if subtotal ≥ 299, else 39
 *   discount()                — coupon discount amount
 *   grandTotal()              — subtotal + deliveryFee - discount
 *   itemQty(id)               — qty of one product
 */

// ─── Valid coupon codes (mirrors SEED_OFFERS) ─────────────────────────────────
const COUPONS = {
  FIRST50:  { type: 'percentage', value: 50, maxDiscount: 100, minOrder: 199,  label: '50% OFF (up to ₹100)' },
  FREEDEL:  { type: 'free_delivery', value: 0, maxDiscount: null, minOrder: 299, label: 'Free Delivery'        },
  CAFEBOGO: { type: 'flat',       value: 50, maxDiscount: 50,  minOrder: 149,  label: '₹50 OFF'               },
  SWEET10:  { type: 'percentage', value: 10, maxDiscount: 50,  minOrder: 0,    label: '10% OFF (up to ₹50)'   },
  FLAT50:   { type: 'flat',       value: 50, maxDiscount: 50,  minOrder: 399,  label: '₹50 OFF'               },
}

const useCartStore = create(
  persist(
    (set, get) => ({
      items:       [],
      shopId:      null,
      shopName:    null,
      coupon:      null,
      couponError: null,

      // ── Add / increment ────────────────────────────────────────────────
      addItem: (product) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === product.id)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === product.id ? { ...i, qty: i.qty + 1 } : i
              ),
            }
          }
          return {
            items:    [...state.items, { ...product, qty: 1 }],
            shopId:   state.shopId   ?? product.shopId   ?? null,
            shopName: state.shopName ?? product.shopName ?? null,
          }
        }),

      // ── Decrement / remove ─────────────────────────────────────────────
      removeItem: (id) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === id)
          if (!existing) return {}
          const updated =
            existing.qty === 1
              ? state.items.filter((i) => i.id !== id)
              : state.items.map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i))
          return {
            items:    updated,
            shopId:   updated.length === 0 ? null : state.shopId,
            shopName: updated.length === 0 ? null : state.shopName,
            coupon:   updated.length === 0 ? null : state.coupon,
          }
        }),

      // ── Delete entirely ────────────────────────────────────────────────
      deleteItem: (id) =>
        set((state) => {
          const updated = state.items.filter((i) => i.id !== id)
          return {
            items:    updated,
            shopId:   updated.length === 0 ? null : state.shopId,
            shopName: updated.length === 0 ? null : state.shopName,
            coupon:   updated.length === 0 ? null : state.coupon,
          }
        }),

      // ── Set exact quantity ─────────────────────────────────────────────
      setQty: (id, qty) => {
        if (qty <= 0) { get().deleteItem(id); return }
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, qty } : i)),
        }))
      },

      // ── Clear ──────────────────────────────────────────────────────────
      clearCart: () =>
        set({ items: [], shopId: null, shopName: null, coupon: null, couponError: null }),

      // ── Coupon ─────────────────────────────────────────────────────────
      applyCoupon: (rawCode) => {
        const code   = rawCode.trim().toUpperCase()
        const coupon = COUPONS[code]
        const sub    = get().subtotal()

        if (!coupon) {
          set({ couponError: 'Invalid coupon code.' })
          return false
        }
        if (sub < coupon.minOrder) {
          set({ couponError: `Minimum order ₹${coupon.minOrder} required.` })
          return false
        }
        set({ coupon: { code, ...coupon }, couponError: null })
        return true
      },

      removeCoupon: () => set({ coupon: null, couponError: null }),

      // ── Derived ────────────────────────────────────────────────────────
      totalItems: () => get().items.reduce((s, i) => s + i.qty, 0),

      subtotal: () => get().items.reduce((s, i) => s + i.price * i.qty, 0),

      deliveryFee: () => {
        const { coupon } = get()
        if (coupon?.type === 'free_delivery') return 0
        return get().subtotal() >= 299 ? 0 : 39
      },

      discount: () => {
        const { coupon } = get()
        if (!coupon) return 0
        const sub = get().subtotal()
        if (coupon.type === 'free_delivery') return 0
        if (coupon.type === 'flat')          return Math.min(coupon.value, coupon.maxDiscount ?? coupon.value)
        if (coupon.type === 'percentage') {
          const raw = Math.round(sub * coupon.value / 100)
          return coupon.maxDiscount ? Math.min(raw, coupon.maxDiscount) : raw
        }
        return 0
      },

      grandTotal: () => {
        const s = get()
        return Math.max(0, s.subtotal() + s.deliveryFee() - s.discount())
      },

      itemQty: (id) => get().items.find((i) => i.id === id)?.qty ?? 0,

      // Legacy alias kept for backward compat
      totalPrice: () => get().grandTotal(),
    }),
    { name: 'fh_cart' }
  )
)

export default useCartStore
