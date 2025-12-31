// services/playerService.ts
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, updateDoc } from "firebase/firestore";
import { Player } from "@/types/Player";

const COLLECTION_NAME = "players";

export const playerService = {
  // 1. Obtener todos los jugadores (Podríamos filtrar por torneo aquí para optimizar)
  async getAll() {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Player[];
  },

  // 2. Crear jugador
  async create(player: Omit<Player, 'id'>) {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), player);
    return docRef.id;
  },

  // 3. Eliminar jugador
  async delete(id: string) {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  },

  // 4. Actualizar stats
  async update(id: string, stats: Partial<Player>) {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, stats);
  }
};