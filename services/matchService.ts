import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { Match } from "@/types/Match"; // Asumo que tienes este tipo definido

const COLLECTION = "matches";

export const matchService = {
  // Obtener todos los partidos (Idealmente filtraríamos por torneo aquí)
  async getAll() {
    const q = query(collection(db, COLLECTION));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Match[];
  },

  async create(match: Omit<Match, "id">) {
    const docRef = await addDoc(collection(db, COLLECTION), match);
    return docRef.id;
  },

  async update(id: string, data: Partial<Match>) {
    await updateDoc(doc(db, COLLECTION, id), data);
  },

  async delete(id: string) {
    await deleteDoc(doc(db, COLLECTION, id));
  }
};