// store/useTournaments.ts
import { create } from 'zustand';
import { db } from "@/lib/firebase";
import { tournamentService } from '@/services/tournamentService';
import { useAuthStore } from '@/store/useAuthStore';
import { Tournament } from '@/types/Tournament';
import { collection, doc, getDocs, query, where, writeBatch } from "firebase/firestore";

interface TournamentsState {
  tournaments: Tournament[];
  isLoading: boolean;

  fetchTournaments: () => Promise<void>;
  addTournament: (tournament: Omit<Tournament, 'id' | 'sections' | 'status' | 'ownerId'>) => Promise<void>;
  updateTournament: (id: string, updates: Partial<Tournament>) => Promise<void>;
  deleteTournament: (id: string) => Promise<void>;
}

export const useTournamentsStore = create<TournamentsState>((set, get) => ({
  tournaments: [],
  isLoading: false,

  // 1. CARGAR DATOS DESDE FIREBASE
  fetchTournaments: async () => {
    set({ isLoading: true });
    try {
      const data = await tournamentService.getAll();
      set({ tournaments: data, isLoading: false });
    } catch (error) {
      console.error("Error al traer torneos:", error);
      set({ isLoading: false });
    }
  },

  // 2. AGREGAR TORNEO
  addTournament: async (tournamentData) => {
    set({ isLoading: true });

    // Obtener el usuario actual del AuthStore
    const { user } = useAuthStore.getState();

    if (!user) {
        console.error("Intento de crear torneo sin usuario");
        set({ isLoading: false });
        throw new Error("Debes iniciar sesión para crear un torneo.");
    }

    try {
      // Preparamos el objeto
      const newTournamentBase = {
        ...tournamentData,
        ownerId: user.uid, // Guardamos quién lo creó
        ownerName: user.displayName || "Usuario", // Opcional: para mostrar en la UI
        status: 'upcoming',
        sections: ['matchdays', 'teams', 'standings', 'stats'], // Secciones por defecto
        createdAt: new Date().toISOString(),
      };

      // Guardamos en Firebase
      const newId = await tournamentService.create(newTournamentBase as any);

      // Creamos el objeto completo para el estado local
      const newTournament = { id: newId, ...newTournamentBase } as Tournament;

      // Actualizamos el estado local
      set((state) => ({
        tournaments: [...state.tournaments, newTournament],
        isLoading: false
      }));

    } catch (error) {
      console.error("Error al crear torneo:", error);
      set({ isLoading: false });
      throw error;
    }
  },

  // 3. ACTUALIZAR TORNEO
  updateTournament: async (id, updates) => {
    // Nota: Aquí podrías activar isLoading si quieres bloquear la UI, 
    // pero para updates pequeños suele ser mejor optimista.
    try {
      await tournamentService.update(id, updates);

      set((state) => ({
        tournaments: state.tournaments.map((t) =>
          t.id === id ? { ...t, ...updates } : t
        ),
      }));
    } catch (error) {
      console.error("Error al actualizar torneo:", error);
      throw error;
    }
  },

  // 4. ELIMINAR TORNEO (CASCADA)
  deleteTournament: async (tournamentId: string) => {
    set({ isLoading: true });
    try {
      const batch = writeBatch(db);

      // A. Buscar y borrar PARTIDOS asociados
      const matchesRef = collection(db, "matches");
      const matchesQuery = query(matchesRef, where("tournamentId", "==", tournamentId));
      const matchesSnapshot = await getDocs(matchesQuery);

      matchesSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // B. Buscar EQUIPOS para borrarlos y obtener sus IDs para buscar jugadores
      const teamsRef = collection(db, "teams");
      const teamsQuery = query(teamsRef, where("tournamentId", "==", tournamentId));
      const teamsSnapshot = await getDocs(teamsQuery);

      const teamIds: string[] = [];

      teamsSnapshot.forEach((doc) => {
        batch.delete(doc.ref); // Agregamos el equipo al lote de borrado
        teamIds.push(doc.id);  // Guardamos ID
      });

      // C. Buscar y borrar JUGADORES (usando los IDs de equipos encontrados)
      if (teamIds.length > 0) {
        // Ejecutamos búsquedas en paralelo para mayor velocidad
        const playerPromises = teamIds.map(teamId => {
          const playersRef = collection(db, "players");
          const q = query(playersRef, where("teamId", "==", teamId));
          return getDocs(q);
        });

        const playersSnapshots = await Promise.all(playerPromises);

        playersSnapshots.forEach(snapshot => {
          snapshot.forEach(doc => {
            batch.delete(doc.ref);
          });
        });
      }

      // D. Borrar el TORNEO principal
      const tournamentRef = doc(db, "tournaments", tournamentId);
      batch.delete(tournamentRef);

      // E. Ejecutar el borrado masivo (Atomic commit)
      await batch.commit();

      // F. Actualizar estado local
      set((state) => ({
        tournaments: state.tournaments.filter((t) => t.id !== tournamentId),
        isLoading: false
      }));

      console.log(`Torneo ${tournamentId} y todos sus datos relacionados eliminados.`);

    } catch (error) {
      console.error("Error eliminando el torneo completo:", error);
      set({ isLoading: false });
      throw error;
    }
  }
}));