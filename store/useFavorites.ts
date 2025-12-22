import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = '@handlesports:favorites';

interface FavoritesState {
  favorites: string[];
  isLoading: boolean;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  loadFavorites: () => Promise<void>;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  isLoading: true,

  isFavorite: (id: string) => {
    return get().favorites.includes(id);
  },

  toggleFavorite: async (id: string) => {
    const { favorites } = get();
    const newFavorites = favorites.includes(id)
      ? favorites.filter((fav) => fav !== id)
      : [...favorites, id];

    set({ favorites: newFavorites });

    // Persistir en AsyncStorage
    try {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  },

  loadFavorites: async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_KEY);
      if (stored) {
        set({ favorites: JSON.parse(stored), isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      set({ isLoading: false });
    }
  },
}));