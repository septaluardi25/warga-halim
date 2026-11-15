import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types'

interface AuthState {
  token: string | null
  user: User | null
  isCheckingAuth: boolean
  setAuth: (token: string, user: User) => void
  updateUser: (user: User) => void
  setCheckingAuth: (checking: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isCheckingAuth: false,
      setAuth: (token, user) => set({ token, user, isCheckingAuth: false }),
      updateUser: (user) => set({ user }),
      setCheckingAuth: (isCheckingAuth) => set({ isCheckingAuth }),
      logout: () => set({ token: null, user: null, isCheckingAuth: false }),
    }),
    {
      name: 'warga-halim-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          state.setCheckingAuth(true)
        }
      },
    },
  ),
)
