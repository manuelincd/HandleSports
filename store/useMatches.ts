import { create } from 'zustand';
import { Match } from '@/types';

interface MatchesState {
  matches: Match[];
  addMatch: (match: Omit<Match, 'id'>) => void;
  updateMatch: (id: string, match: Partial<Match>) => void;
  deleteMatch: (id: string) => void;
  getMatchesByTournament: (tournamentId: string) => Match[];
  getMatchesByMatchday: (tournamentId: string, matchday: number) => Match[];
}

export const useMatchesStore = create<MatchesState>((set, get) => ({
  matches: [],
  
  addMatch: (match) => {
    const newMatch: Match = {
      ...match,
      id: Date.now().toString(),
    };
    set((state) => ({ matches: [...state.matches, newMatch] }));
  },
  
  updateMatch: (id, updates) => {
    set((state) => ({
      matches: state.matches.map((match) =>
        match.id === id ? { ...match, ...updates } : match
      ),
    }));
  },
  
  deleteMatch: (id) => {
    set((state) => ({
      matches: state.matches.filter((match) => match.id !== id),
    }));
  },
  
  getMatchesByTournament: (tournamentId) => {
    return get().matches.filter((match) => match.tournamentId === tournamentId);
  },
  
  getMatchesByMatchday: (tournamentId, matchday) => {
    return get().matches.filter(
      (match) => 
        match.tournamentId === tournamentId && 
        match.matchday === matchday
    );
  },
}));