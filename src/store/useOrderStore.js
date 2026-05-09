import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getFromStorage, saveToStorage } from '../utils/storage'
import { STORAGE_KEYS } from '../utils/seedData'

/**
 * useOrderStore
 *
 * Manages order placement and history. Persisted under "fh_orders_store".
 * All placed orders are also written to the shared "fh_orders" key so the
 * Admin dashboard can read them.
 *
 * ── Order shape ──────────────────────────────────────────────────────────────
 * {
 *   id            : "ORD-XXXXXX"          unique order ID
 *   status        : 'pending' | 'confirmed' | 'preparing' | 'on_the_way'
 *                   | 'delivered' | 'cancelled'
 *   placedAt      : ISO timestamp
 *   deliveredAt   : ISO timestamp | null
 *
 *   shopId        : string
 *   shopName      : string
 *   shopLogo      : string (emoji)
 *   shopWhatsapp  : string (phone number for wa.me)
 *
 *   customer: {
 *     name, phone, address, notes
 *   }
 *
 *   items: [{ productId, name, image, price, qty, isVeg }]
 *
 *   subtotal      : number
 *   deliveryFee   : number
 *   discount      : number
 *   couponCode    : string | null
 *   total         : number
 *   paymentMethod : string
 *
 *   whatsappSent  : boolean
 * }
 */

// ─── ID generator ─────────────────────────────────────────────────────────────
const generateOrderId = () => {
  const ts   = Date.now().toString(36).toUpperCase()   // base-36 timestamp
  const rand = Math.random().toString(36).slice(2, 5).toUpperCase()
  return `ORD-${ts}-${rand}`
}

const useOrderStore = create(
  persist(
    (set, get) => ({
      orders:      [],
      activeOrder: null,   // most recently placed — used by OrderTracking
      loading:     false,

      // ── Place order ──────────────────────────────────────────────────────
      /**
       * Creates a new order, persists it to localStorage, and returns it.
       *
       * @param {{
       *   shopId, shopName, shopLogo, shopWhatsapp,
       *   customer: { name, phone, address, notes },
       *   items: Array,
       *   subtotal, deliveryFee, discount, couponCode, total,
       *   paymentMethod,
       * }} payload
       * @returns {object} the created order
       */
      placeOrder: (payload) => {
        const newOrder = {
          id:           generateOrderId(),
          status:       'confirmed',
          placedAt:     new Date().toISOString(),
          deliveredAt:  null,
          whatsappSent: false,
          userId:       'user-1',   // default until auth is wired
          ...payload,
        }

        // Write to shared fh_orders list (Admin reads this)
        const all = getFromStorage(STORAGE_KEYS.ORDERS, [])
        saveToStorage(STORAGE_KEYS.ORDERS, [newOrder, ...all])

        set((state) => ({
          orders:      [newOrder, ...state.orders],
          activeOrder: newOrder,
        }))

        return newOrder
      },

      // ── Mark WhatsApp as sent ────────────────────────────────────────────
      markWhatsAppSent: (orderId) => {
        const patch = (o) =>
          o.id === orderId ? { ...o, whatsappSent: true } : o

        // Update shared storage
        const all = getFromStorage(STORAGE_KEYS.ORDERS, [])
        saveToStorage(STORAGE_KEYS.ORDERS, all.map(patch))

        set((state) => ({
          orders:      state.orders.map(patch),
          activeOrder: state.activeOrder?.id === orderId
            ? { ...state.activeOrder, whatsappSent: true }
            : state.activeOrder,
        }))
      },

      // ── Load user orders ─────────────────────────────────────────────────
      loadUserOrders: (userId) => {
        set({ loading: true })
        const all = getFromStorage(STORAGE_KEYS.ORDERS, [])
        const mine = all
          .filter((o) => o.userId === userId)
          .sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt))
        set({ orders: mine, loading: false })
      },

      // ── Cancel order ─────────────────────────────────────────────────────
      cancelOrder: (orderId) => {
        const patch = (o) =>
          o.id === orderId ? { ...o, status: 'cancelled' } : o

        const all = getFromStorage(STORAGE_KEYS.ORDERS, [])
        saveToStorage(STORAGE_KEYS.ORDERS, all.map(patch))

        set((state) => ({
          orders:      state.orders.map(patch),
          activeOrder: state.activeOrder?.id === orderId
            ? { ...state.activeOrder, status: 'cancelled' }
            : state.activeOrder,
        }))
      },

      // ── Reorder ──────────────────────────────────────────────────────────
      /** Returns items array from a past order for cart re-fill. */
      reorder: (orderId) =>
        get().orders.find((o) => o.id === orderId)?.items ?? null,

      // ── Clear active order ───────────────────────────────────────────────
      clearActiveOrder: () => set({ activeOrder: null }),
    }),
    { name: 'fh_orders_store' }
  )
)

export default useOrderStore
