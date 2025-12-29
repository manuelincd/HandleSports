// store/useTeams.ts

import { create } from 'zustand';
import { Team } from '@/types/Team';
import { TEAMS } from '@/data/teams';

interface TeamsState {
  teams: Team[];
  addTeam: (team: Omit<Team, 'id'>) => void;
  updateTeam: (id: string, team: Partial<Team>) => void;
  deleteTeam: (id: string) => void;
  getTeamsByTournament: (tournamentId: string) => Team[];
}

export const useTeamsStore = create<TeamsState>((set, get) => ({
  teams: TEAMS,
  
  addTeam: (team) => {
    const newTeam: Team = {
      ...team,
      id: Date.now().toString(),
      stats: {
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
      },
    };
    
    // Forzar actualización inmutable
    set({ teams: [...get().teams, newTeam] });
  },
  
  updateTeam: (id, updates) => {
    set((state) => {
      const updatedTeams = state.teams.map((team) =>
        team.id === id ? { ...team, ...updates } : team
      );
      return { teams: updatedTeams };
    });
  },
  
  deleteTeam: (id) => {
    console.log('Store: Deleting team', id);
    
    set((state) => {
      const filteredTeams = state.teams.filter((team) => team.id !== id);
      console.log('Store: Teams before:', state.teams.length);
      console.log('Store: Teams after:', filteredTeams.length);
      return { teams: filteredTeams };
    });
  },
  
  getTeamsByTournament: (tournamentId) => {
    return get().teams.filter((team) => team.tournamentId === tournamentId);
  },
}));