import { create } from 'zustand';
// 1. IMPORTA SCORER AQUÍ
import { db } from "@/lib/firebase";
import { matchService } from '@/services/matchService';
import { Match, Scorer } from '@/types/Match';
import { doc, increment, writeBatch, getDoc } from "firebase/firestore";

interface MatchesState {
  matches: Match[];
  isLoading: boolean;
  fetchMatches: () => Promise<void>;
  addMatch: (match: Omit<Match, 'id'>) => Promise<void>;
  updateMatch: (id: string, data: Partial<Match>) => Promise<void>;
  deleteMatch: (id: string) => Promise<void>;

  // 2. AGREGA ESTA DEFINICIÓN A LA INTERFAZ:
  updateMatchScore: (matchId: string, homeScore: number, awayScore: number, scorers: Scorer[]) => Promise<void>;
}

export const useMatchesStore = create<MatchesState>((set, get) => ({
  matches: [],
  isLoading: false,

  fetchMatches: async () => {
    set({ isLoading: true });
    try {
      const data = await matchService.getAll();
      set({ matches: data, isLoading: false });
    } catch (error) {
      console.error("Error fetching matches", error);
      set({ isLoading: false });
    }
  },

  addMatch: async (data) => {
    try {
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
    // Optimistic delete visual (opcional, pero mejor esperar confirmación si es delicado)
    // set(state => ({ matches: state.matches.filter(m => m.id !== matchId) }));

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

        // D. Actualizar estado local ahora sí
        set(state => ({ matches: state.matches.filter(m => m.id !== matchId) }));
      }
    } catch (error) {
      console.error(error);
    }
  },

  // Tu función updateMatchScore (ya estaba bien, solo le faltaba el import)
  updateMatchScore: async (matchId, homeScore, awayScore, newStats) => {
    set({ isLoading: true });
    try {
      const batch = writeBatch(db);
      const matchRef = doc(db, "matches", matchId);

      // A. Obtener el partido ACTUAL de la BD para ver qué tenía guardado antes
      const matchSnap = await getDoc(matchRef);
      if (!matchSnap.exists()) throw new Error("Partido no encontrado");

      const currentMatchData = matchSnap.data() as Match;
      const oldStats = currentMatchData.stats || []; // El historial previo

      // B. REVERTIR (Restar) las estadísticas viejas a los jugadores
      oldStats.forEach((stat) => {
        const playerRef = doc(db, "players", stat.playerId);
        batch.update(playerRef, {
          goals: increment(-stat.goals),             // Restamos
          yellowCards: increment(-stat.yellowCards), // Restamos
          redCards: increment(-stat.redCards)        // Restamos
        });
      });

      // C. APLICAR (Sumar) las nuevas estadísticas
      newStats.forEach((stat) => {
        const playerRef = doc(db, "players", stat.playerId);
        batch.update(playerRef, {
          goals: increment(stat.goals),
          yellowCards: increment(stat.yellowCards),
          redCards: increment(stat.redCards)
        });
      });

      // D. Actualizar el partido con el NUEVO historial y resultado
      batch.update(matchRef, {
        homeScore,
        awayScore,
        status: 'finished',
        stats: newStats // <--- Guardamos el historial nuevo aquí
      });

      await batch.commit();

      // E. Actualizar estado local
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