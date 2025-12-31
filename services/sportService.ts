import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Sport } from "@/types/Sport";

const COLLECTION = "sports";

export const sportService = {
  async getAll() {
    const snapshot = await getDocs(collection(db, COLLECTION));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Sport[];
  },
};