import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Theme store — persists dark/light preference to localStorage
 */
const useThemeStore = create(
  persist(
    (set) => ({
      isDark: false,
      toggleTheme: () =>
        set((state) => {
          const next = !state.isDark
          // Apply/remove the 'dark' class on <html> for Tailwind dark mode
          document.documentElement.classList.toggle('dark', next)
          return { isDark: next }
        }),
      initTheme: () =>
        set((state) => {
          document.documentElement.classList.toggle('dark', state.isDark)
          return {}
        }),
    }),
    { name: 'food-theme' }
  )
)

export default useThemeStore
