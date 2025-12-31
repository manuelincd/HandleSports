import { create } from 'zustand';
import { teamService } from '@/services/teamService';
import { Team } from '@/types/Team';

interface TeamsState {
  teams: Team[];
  isLoading: boolean;

  // Acciones
  fetchTeams: () => Promise<void>;
  addTeam: (team: Omit<Team, 'id' | 'stats'>) => Promise<void>;
  updateTeam: (id: string, team: Partial<Team>) => Promise<void>;
  deleteTeam: (id: string) => Promise<void>;
  
  // --- NUEVA FUNCIÓN NECESARIA PARA GRUPOS ---
  updateTeamGroup: (id: string, group: string | null) => Promise<void>;
}

export const useTeamsStore = create<TeamsState>((set, get) => ({
  teams: [],
  isLoading: false,

  fetchTeams: async () => {
    set({ isLoading: true });
    try {
      const data = await teamService.getAll();
      set({ teams: data, isLoading: false });
    } catch (error) {
      console.error("Error fetching teams:", error);
      set({ isLoading: false });
    }
  },

  addTeam: async (data) => {
    set({ isLoading: true });
    try {
      const newTeamBase = {
        ...data,
        stats: {
          played: 0, won: 0, drawn: 0, lost: 0,
          goalsFor: 0, goalsAgainst: 0, points: 0
        }
      };
      
      const newId = await teamService.create(newTeamBase as Team);
      const newTeam = { ...newTeamBase, id: newId } as Team;
      
      set((state) => ({ 
        teams: [...state.teams, newTeam],
        isLoading: false 
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateTeam: async (id, data) => {
    set({ isLoading: true });
    try {
      await teamService.update(id, data);
      set((state) => ({
        teams: state.teams.map((t) => (t.id === id ? { ...t, ...data } : t)),
        isLoading: false
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  deleteTeam: async (id) => {
    set({ isLoading: true });
    try {
      await teamService.delete(id);
      set((state) => ({
        teams: state.teams.filter((t) => t.id !== id),
        isLoading: false
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  // --- IMPLEMENTACIÓN DE updateTeamGroup ---
  updateTeamGroup: async (id: string, group: string | null) => {
    try {
      await teamService.update(id, { group: group });

      set((state) => ({
        teams: state.teams.map((t) => 
          t.id === id ? { ...t, group: group } : t
        )
      }));
    } catch (error) {
      console.error("Error updating group:", error);
    }
  }
}));