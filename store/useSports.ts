import { create } from 'zustand';
import { Sport } from '@/types/Sport';
import { sportService } from '@/services/sportService';

interface SportsState {
  sports: Sport[];
  isLoading: boolean;
  fetchSports: () => Promise<void>;
}

export const useSportsStore = create<SportsState>((set, get) => ({
  sports: [],
  isLoading: false,

  fetchSports: async () => {
    if (get().sports.length > 0) return; 
    
    set({ isLoading: true });
    try {
      const data = await sportService.getAll();
      set({ sports: data, isLoading: false });
    } catch (error) {
      console.error("Error fetching sports:", error);
      set({ isLoading: false });
    }
  },
}));