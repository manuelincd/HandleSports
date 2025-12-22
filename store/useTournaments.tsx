// store/useTournaments.ts
import { create } from 'zustand';

interface Tournament {
  id: string;
  name: string;
  sportId: string;
  location: string;
  teamsCount: number;
  createdBy: string; 
}

interface TournamentsState {
  tournaments: Tournament[];
  addTournament: (tournament: Omit<Tournament, 'id'>) => void;
}

export const useTournamentsStore = create<TournamentsState>((set) => ({
  tournaments: [],
  addTournament: (tournament) => {
    const newTournament = {
      ...tournament,
      id: Date.now().toString(),
    };
    set((state) => ({
      tournaments: [...state.tournaments, newTournament],
    }));
  },
}));