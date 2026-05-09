import { create } from 'zustand'

/**
 * useToastStore
 *
 * Lightweight toast notification system — no external library needed.
 *
 * State:
 *   toasts[]  — array of { id, message, type, icon }
 *
 * Actions:
 *   toast(message, options)  — show a toast
 *   success / error / info / warning — convenience wrappers
 *   dismiss(id)              — remove one toast
 *   dismissAll()             — clear all
 *
 * Usage:
 *   const { success } = useToastStore()
 *   success('Item added to cart!')
 */

let _id = 0
const nextId = () => `toast-${++_id}`

const useToastStore = create((set) => ({
  toasts: [],

  // ── Core ──────────────────────────────────────────────────────────────────
  toast: (message, { type = 'default', icon, duration = 3000 } = {}) => {
    const id = nextId()
    set((s) => ({ toasts: [...s.toasts, { id, message, type, icon }] }))
    // Auto-dismiss
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
    }, duration)
    return id
  },

  dismiss: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  dismissAll: () => set({ toasts: [] }),

  // ── Convenience ───────────────────────────────────────────────────────────
  success: (message, opts) =>
    useToastStore.getState().toast(message, { type: 'success', icon: '✅', ...opts }),

  error: (message, opts) =>
    useToastStore.getState().toast(message, { type: 'error', icon: '❌', ...opts }),

  info: (message, opts) =>
    useToastStore.getState().toast(message, { type: 'info', icon: 'ℹ️', ...opts }),

  warning: (message, opts) =>
    useToastStore.getState().toast(message, { type: 'warning', icon: '⚠️', ...opts }),

  cart: (message, opts) =>
    useToastStore.getState().toast(message, { type: 'cart', icon: '🛒', ...opts }),
}))

export default useToastStore
