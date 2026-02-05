import { create } from 'zustand'

type Theme = 'light' | 'dark' | 'system'

interface UIState {
  theme: Theme
  setTheme: (theme: Theme) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  treeOpen: boolean
  setTreeOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'system',
  setTheme: (theme) => {
    set({ theme })
    if (theme !== 'system') {
      document.documentElement.classList.toggle('dark', theme === 'dark')
    } else {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.classList.toggle('dark', isDark)
    }
  },
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  treeOpen: true,
  setTreeOpen: (open) => set({ treeOpen: open }),
}))
