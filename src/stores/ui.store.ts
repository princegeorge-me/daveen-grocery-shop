import { create } from 'zustand'

interface UIStore {
  searchOpen: boolean
  mobileNavOpen: boolean
  openSearch: () => void
  closeSearch: () => void
  toggleSearch: () => void
  openMobileNav: () => void
  closeMobileNav: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  searchOpen: false,
  mobileNavOpen: false,
  openSearch: () => set({ searchOpen: true }),
  closeSearch: () => set({ searchOpen: false }),
  toggleSearch: () => set((state) => ({ searchOpen: !state.searchOpen })),
  openMobileNav: () => set({ mobileNavOpen: true }),
  closeMobileNav: () => set({ mobileNavOpen: false }),
}))
