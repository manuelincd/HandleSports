import { create } from 'zustand';
import { db } from "@/lib/firebase";
import { matchService } from '@/services/matchService';
// Asegúrate de que Scorer esté en tu archivo de tipos
import { Match, Scorer } from '@/types/Match'; 
import { 
  doc, 
  increment, 
  writeBatch, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs 
} from "firebase/firestore";

interface MatchesState {
  matches: Match[];
  isLoading: boolean;
  
  // 1. CAMBIO: fetchMatches ahora acepta filtros opcionales
  fetchMatches: (tournamentId?: string, seasonId?: string) => Promise<void>;
  
  addMatch: (match: Omit<Match, 'id'>) => Promise<void>;
  updateMatch: (id: string, data: Partial<Match>) => Promise<void>;
  deleteMatch: (id: string) => Promise<void>;
  updateMatchScore: (matchId: string, homeScore: number, awayScore: number, scorers: Scorer[]) => Promise<void>;
}

export const useMatchesStore = create<MatchesState>((set, get) => ({
  matches: [],
  isLoading: false,

  // 2. CAMBIO: Lógica de filtrado por Temporada
  fetchMatches: async (tournamentId, seasonId) => {
    set({ isLoading: true });
    try {
      const matchesRef = collection(db, "matches");
      
      // Empezamos con la referencia base
      let q = query(matchesRef);

      // Si nos pasan un ID de torneo, filtramos
      if (tournamentId) {
        q = query(q, where("tournamentId", "==", tournamentId));
      }

      // Si nos pasan una temporada, filtramos también
      // Esto es lo que hace la magia de separar "Apertura" de "Clausura"
      if (seasonId) {
        q = query(q, where("seasonId", "==", seasonId));
      }

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Match[];

      set({ matches: data, isLoading: false });
    } catch (error) {
      console.error("Error fetching matches", error);
      set({ isLoading: false });
    }
  },

  addMatch: async (data) => {
    try {
      // Nota: 'data' ya debe incluir el seasonId que viene del modal
      const id = await matchService.create(data);
      const newMatch = { ...data, id } as Match;
      set(state => ({ matches: [...state.matches, newMatch] }));
    } catch (error) {
      console.error(error);
    }
  },

  updateMatch: async (id, data) => {
    set(state => ({
      matches: state.matches.map(m => m.id === id ? { ...m, ...data } : m)
    }));
    await matchService.update(id, data);
  },

  deleteMatch: async (matchId) => {
    try {
      const batch = writeBatch(db);
      const matchRef = doc(db, "matches", matchId);

      // A. Leer el partido para saber qué revertir
      const matchSnap = await getDoc(matchRef);
      if (matchSnap.exists()) {
        const matchData = matchSnap.data() as Match;
        const historyStats = matchData.stats || [];

        // B. Revertir estadísticas de los jugadores
        historyStats.forEach((stat) => {
          const playerRef = doc(db, "players", stat.playerId);
          batch.update(playerRef, {
            goals: increment(-stat.goals),
            yellowCards: increment(-stat.yellowCards),
            redCards: increment(-stat.redCards)
          });
        });

        // C. Borrar el partido
        batch.delete(matchRef);

        await batch.commit();

        // D. Actualizar estado local
        set(state => ({ matches: state.matches.filter(m => m.id !== matchId) }));
      }
    } catch (error) {
      console.error(error);
    }
  },

  updateMatchScore: async (matchId, homeScore, awayScore, newStats) => {
    set({ isLoading: true });
    try {
      const batch = writeBatch(db);
      const matchRef = doc(db, "matches", matchId);

      // A. Obtener el partido ACTUAL
      const matchSnap = await getDoc(matchRef);
      if (!matchSnap.exists()) throw new Error("Partido no encontrado");

      const currentMatchData = matchSnap.data() as Match;
      const seasonId = currentMatchData.seasonId || 'general'; 
      const oldStats = currentMatchData.stats || [];

      oldStats.forEach((stat) => {
        const playerRef = doc(db, "players", stat.playerId);
        
        batch.update(playerRef, {
          [`seasons.${seasonId}.goals`]: increment(-stat.goals),
          [`seasons.${seasonId}.yellowCards`]: increment(-stat.yellowCards),
          [`seasons.${seasonId}.redCards`]: increment(-stat.redCards),
        });
      });

      newStats.forEach((stat) => {
        const playerRef = doc(db, "players", stat.playerId);
        
        batch.update(playerRef, {
          [`seasons.${seasonId}.goals`]: increment(stat.goals),
          [`seasons.${seasonId}.yellowCards`]: increment(stat.yellowCards),
          [`seasons.${seasonId}.redCards`]: increment(stat.redCards),
        });
      });

      batch.update(matchRef, {
        homeScore,
        awayScore,
        status: 'finished',
        stats: newStats
      });

      await batch.commit();

      set((state) => ({
        matches: state.matches.map((m) =>
          m.id === matchId
            ? { ...m, homeScore, awayScore, status: 'finished', stats: newStats }
            : m
        ),
        isLoading: false,
      }));

    } catch (error) {
      console.error("Error updating score:", error);
      set({ isLoading: false });
    }
  },
}));