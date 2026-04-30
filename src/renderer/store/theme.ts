import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type ThemeMode = 'light' | 'dark'

interface ThemeState {
  themeMode: ThemeMode
  setThemeMode: (mode: ThemeMode) => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      themeMode: 'light',
      setThemeMode: (mode) => set({ themeMode: mode }),
      toggleTheme: () => set({ themeMode: get().themeMode === 'light' ? 'dark' : 'light' })
    }),
    {
      name: 'printbridge-theme'
    }
  )
)