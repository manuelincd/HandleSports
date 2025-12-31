import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Team } from "@/types/Team";

const COLLECTION = "teams";

export const teamService = {
  async getAll() {
    const querySnapshot = await getDocs(collection(db, COLLECTION));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Team[];
  },

  async create(team: Omit<Team, 'id'>) {
    const docRef = await addDoc(collection(db, COLLECTION), team);
    return docRef.id;
  },

  async update(id: string, data: Partial<Team>) {
    await updateDoc(doc(db, COLLECTION, id), data);
  },

  async delete(id: string) {
    await deleteDoc(doc(db, COLLECTION, id));
  }
};