// store/usePlayers.ts
import { create } from 'zustand';
import { Player } from '@/types/Player';
import { playerService } from '@/services/playerService';

interface PlayersState {
  players: Player[];
  isLoading: boolean;

  fetchPlayers: () => Promise<void>;
  addPlayer: (player: Omit<Player, 'id' | 'goals' | 'yellowCards' | 'redCards'>) => Promise<void>;
  deletePlayer: (id: string) => Promise<void>;
  updatePlayerStats: (playerId: string, stats: Partial<Player>) => Promise<void>;
  
  getPlayersByTeam: (teamId: string) => Player[];
}

export const usePlayersStore = create<PlayersState>((set, get) => ({
  players: [],
  isLoading: false,

  // 1. CARGAR JUGADORES DESDE FIREBASE
  fetchPlayers: async () => {
    set({ isLoading: true });
    try {
      const data = await playerService.getAll();
      set({ players: data, isLoading: false });
    } catch (error) {
      console.error("Error fetching players:", error);
      set({ isLoading: false });
    }
  },

  // 2. AGREGAR JUGADOR
  addPlayer: async (data) => {
    set({ isLoading: true });
    try {
      const newPlayerBase = {
        ...data,
        goals: 0,
        yellowCards: 0,
        redCards: 0,
      };

      const newId = await playerService.create(newPlayerBase as Player);

      const newPlayer = { ...newPlayerBase, id: newId } as Player;
      set((state) => ({ 
        players: [...state.players, newPlayer],
        isLoading: false 
      }));
    } catch (error) {
      console.error("Error adding player:", error);
      set({ isLoading: false });
      throw error; 
    }
  },

  // 3. ELIMINAR JUGADOR
  deletePlayer: async (id) => {
    const originalPlayers = get().players;
    set((state) => ({
      players: state.players.filter((p) => p.id !== id),
    }));

    try {
      await playerService.delete(id);
    } catch (error) {
      console.error("Error deleting player:", error);
      set({ players: originalPlayers });
      alert("Error al eliminar el jugador");
    }
  },

  // 4. ACTUALIZAR ESTADÍSTICAS
  updatePlayerStats: async (playerId, stats) => {
    set((state) => ({
      players: state.players.map((p) =>
        p.id === playerId ? { ...p, ...stats } : p
      ),
    }));

    try {
      await playerService.update(playerId, stats);
    } catch (error) {
      console.error("Error updating stats:", error);
    }
  },

  // 5. HELPER (Síncrono)
  getPlayersByTeam: (teamId) => {
    return get().players.filter((p) => p.teamId === teamId);
  },
}));