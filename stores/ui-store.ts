import { create } from 'zustand'

type Theme = 'light' | 'dark' | 'system'

interface UIState {
  theme: Theme
  setTheme: (theme: Theme) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  treeOpen: boolean
  setTreeOpen: (open: boolean) => void
  searchOpen: boolean
  setSearchOpen: (open: boolean) => void
}

const THEME_STORAGE_KEY = 'amby-theme'

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') {
    return 'system'
  }

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY) as Theme | null

  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored
  }

  return 'system'
}

const applyThemeClass = (theme: Theme) => {
  if (typeof window === 'undefined') return

  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  document.documentElement.classList.toggle('dark', isDark)
}

export const useUIStore = create<UIState>((set) => ({
  theme: getInitialTheme(),
  setTheme: (theme) => {
    set({ theme })

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    }

    applyThemeClass(theme)
  },
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  treeOpen: true,
  setTreeOpen: (open) => set({ treeOpen: open }),
  searchOpen: false,
  setSearchOpen: (open) => set({ searchOpen: open }),
}))
