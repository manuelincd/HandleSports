// store/useAuthStore.ts
import { create } from 'zustand';
import { User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { authService } from '@/services/authService';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  initialize: () => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  initialize: () => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      set({ user, isLoading: false });
    });
    return unsubscribe;
  },

  signOut: async () => {
    await authService.logout();
    set({ user: null });
  }
}));