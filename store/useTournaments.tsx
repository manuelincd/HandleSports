import { create } from 'zustand';
import { db, auth } from "@/lib/firebase"; // Asegúrate de tener 'auth' exportado en tu lib/firebase
import { Tournament } from '@/types/Tournament';
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc,
  updateDoc,
  query, 
  where, 
  writeBatch, 
  orderBy
} from "firebase/firestore";

interface TournamentsState {
  tournaments: Tournament[];
  isLoading: boolean;

  fetchTournaments: () => Promise<void>;
  // Ajustamos el tipo para que coincida con lo que manda el modal
  addTournament: (tournament: Omit<Tournament, 'id' | 'sections' | 'status' | 'ownerId' | 'seasons' | 'activeSeasonId'>) => Promise<void>;
  updateTournament: (id: string, updates: Partial<Tournament>) => Promise<void>;
  deleteTournament: (id: string) => Promise<void>;
}

export const useTournamentsStore = create<TournamentsState>((set, get) => ({
  tournaments: [],
  isLoading: false,

  // 1. CARGAR DATOS (Solo los del usuario actual o públicos)
  fetchTournaments: async () => {
    set({ isLoading: true });
    try {
      const tournamentsRef = collection(db, "tournaments");
      // Opcional: Ordenar por fecha de creación
      const q = query(tournamentsRef, orderBy("createdAt", "desc"));
      
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Tournament[];

      set({ tournaments: data, isLoading: false });
    } catch (error) {
      console.error("Error al traer torneos:", error);
      set({ isLoading: false });
    }
  },

  // 2. AGREGAR TORNEO (Con lógica completa de inicialización)
  addTournament: async (tournamentData) => {
    set({ isLoading: true });

    // Validar usuario directamente de auth para asegurar consistencia
    const user = auth.currentUser;

    if (!user) {
        console.error("Intento de crear torneo sin usuario");
        set({ isLoading: false });
        throw new Error("Debes iniciar sesión para crear un torneo.");
    }

    try {
      // Definimos la primera temporada por defecto
      const firstSeasonId = `season_${Date.now()}`;

      // Preparamos el objeto completo
      const newTournamentBase = {
        ...tournamentData,
        // CAMPOS OBLIGATORIOS PARA TUS REGLAS DE FIREBASE:
        ownerId: user.uid, 
        createdBy: user.uid,
        
        status: 'upcoming',
        sections: ['matchdays', 'teams', 'standings', 'stats'],
        createdAt: new Date().toISOString(),
        
        // CAMPOS OBLIGATORIOS PARA LA UI (Standings, Cards, etc):
        activeSeasonId: firstSeasonId,
        seasons: [
            {
                id: firstSeasonId,
                name: "Temporada 1", // Nombre por defecto
                isActive: true,
                startDate: new Date().toISOString()
            }
        ]
      };

      // Guardamos directamente en Firestore
      const docRef = await addDoc(collection(db, "tournaments"), newTournamentBase);

      // Creamos el objeto completo para el estado local
      const newTournament = { id: docRef.id, ...newTournamentBase } as Tournament;

      // Actualizamos el estado local
      set((state) => ({
        tournaments: [newTournament, ...state.tournaments],
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
    try {
      const docRef = doc(db, "tournaments", id);
      await updateDoc(docRef, updates);

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

  // 4. ELIMINAR TORNEO
  deleteTournament: async (tournamentId: string) => {
    set({ isLoading: true });
    try {
      const batch = writeBatch(db);

      // A. Buscar y borrar PARTIDOS
      const matchesRef = collection(db, "matches");
      const matchesQuery = query(matchesRef, where("tournamentId", "==", tournamentId));
      const matchesSnapshot = await getDocs(matchesQuery);

      matchesSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // B. Buscar EQUIPOS 
      const teamsRef = collection(db, "teams");
      const teamsQuery = query(teamsRef, where("tournamentId", "==", tournamentId));
      const teamsSnapshot = await getDocs(teamsQuery);

      const teamIds: string[] = [];

      teamsSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
        teamIds.push(doc.id); 
      });

      // C. Buscar y borrar JUGADORES (vinculados a los equipos encontrados)
      if (teamIds.length > 0) {
        const playerPromises = teamIds.map(async (teamId) => {
             const playersRef = collection(db, "players");
             const q = query(playersRef, where("teamId", "==", teamId));
             const snap = await getDocs(q);
             snap.forEach(doc => batch.delete(doc.ref));
        });
        
        await Promise.all(playerPromises);
      }

      // D. Borrar el TORNEO principal
      const tournamentRef = doc(db, "tournaments", tournamentId);
      batch.delete(tournamentRef);

      // E. Ejecutar el borrado masivo
      await batch.commit();

      // F. Actualizar estado local
      set((state) => ({
        tournaments: state.tournaments.filter((t) => t.id !== tournamentId),
        isLoading: false
      }));

      console.log(`Torneo ${tournamentId} eliminado correctamente.`);

    } catch (error) {
      console.error("Error eliminando el torneo completo:", error);
      set({ isLoading: false });
      throw error;
    }
  }
}));