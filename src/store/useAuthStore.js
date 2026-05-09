import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getFromStorage, saveToStorage } from '../utils/storage'
import { STORAGE_KEYS } from '../utils/seedData'

/**
 * useAuthStore
 *
 * Manages the currently logged-in user session.
 * Persisted to localStorage under "fh_auth".
 *
 * State:
 *   user            — full user object or null when logged out
 *   isAuthenticated — boolean convenience flag
 *
 * Actions:
 *   login(credentials)     — find user by email+phone in storage, set session
 *   loginAsGuest(userData) — set a minimal guest session
 *   logout()               — clear session
 *   updateProfile(updates) — merge updates into current user & persist to fh_users
 *   addAddress(address)    — append a new address to the user's address list
 *   removeAddress(id)      — remove an address by id
 *   setDefaultAddress(id)  — mark an address as default
 */
const useAuthStore = create(
  persist(
    (set, get) => ({
      user:            null,
      isAuthenticated: false,

      // ── Login ────────────────────────────────────────────────────────────
      /**
       * Simulate login by matching email against the seeded users list.
       * Returns { success, message }.
       */
      login: ({ email, phone }) => {
        const users = getFromStorage(STORAGE_KEYS.USERS, [])
        const found = users.find(
          (u) =>
            u.email.toLowerCase() === email?.toLowerCase() ||
            u.phone === phone
        )

        if (!found) {
          return { success: false, message: 'User not found.' }
        }

        set({ user: found, isAuthenticated: true })
        return { success: true, message: `Welcome back, ${found.name}!` }
      },

      // ── Guest login ──────────────────────────────────────────────────────
      loginAsGuest: (userData = {}) => {
        const guest = {
          id:        `guest-${Date.now()}`,
          name:      userData.name  ?? 'Guest User',
          email:     userData.email ?? '',
          phone:     userData.phone ?? '',
          avatar:    '🙂',
          addresses: [],
          isGuest:   true,
          createdAt: new Date().toISOString(),
        }
        set({ user: guest, isAuthenticated: true })
      },

      // ── Logout ───────────────────────────────────────────────────────────
      logout: () => set({ user: null, isAuthenticated: false }),

      // ── Update profile ───────────────────────────────────────────────────
      updateProfile: (updates) => {
        const { user } = get()
        if (!user) return

        const updated = { ...user, ...updates }
        set({ user: updated })

        // Persist back to the users list in localStorage
        if (!user.isGuest) {
          const users = getFromStorage(STORAGE_KEYS.USERS, [])
          saveToStorage(
            STORAGE_KEYS.USERS,
            users.map((u) => (u.id === user.id ? updated : u))
          )
        }
      },

      // ── Address management ───────────────────────────────────────────────
      addAddress: (address) => {
        const { user, updateProfile } = get()
        if (!user) return

        const newAddr = {
          id:        `addr-${Date.now()}`,
          isDefault: user.addresses.length === 0,
          ...address,
        }
        updateProfile({ addresses: [...user.addresses, newAddr] })
      },

      removeAddress: (id) => {
        const { user, updateProfile } = get()
        if (!user) return
        updateProfile({ addresses: user.addresses.filter((a) => a.id !== id) })
      },

      setDefaultAddress: (id) => {
        const { user, updateProfile } = get()
        if (!user) return
        updateProfile({
          addresses: user.addresses.map((a) => ({ ...a, isDefault: a.id === id })),
        })
      },
    }),
    { name: 'fh_auth' }
  )
)

export default useAuthStore
