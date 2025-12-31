import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, updateDoc, doc } from "firebase/firestore";
import { Tournament } from "@/types/Tournament";

const TOURNAMENTS_COLLECTION = "tournaments";

export const tournamentService = {
  async getAll() {
    const querySnapshot = await getDocs(collection(db, TOURNAMENTS_COLLECTION));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Tournament[];
  },

  async create(tournament: Omit<Tournament, 'id'>) {
    const docRef = await addDoc(collection(db, TOURNAMENTS_COLLECTION), tournament);
    return docRef.id;
  },

  async update(id: string, updates: Partial<Tournament>) {
    const docRef = doc(db, TOURNAMENTS_COLLECTION, id);
    await updateDoc(docRef, updates);
  }
};