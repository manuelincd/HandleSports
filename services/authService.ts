import { auth, db } from "@/lib/firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile,
  User
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export interface UserProfile {
    email: string;
    displayName: string;
    balance: number;
    createdAt: string;
    role: 'user' | 'admin';
}

export const authService = {
  register: async (email: string, pass: string, name?: string): Promise<User> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;

    if (name) {
        await updateProfile(user, { displayName: name });
        await user.reload(); 
    }

    try {
        await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            displayName: name || "Usuario",
            balance: 1000,
            createdAt: new Date().toISOString(),
            role: 'user'
        });
    } catch (error) {
        console.error("Error creando perfil en Firestore:", error);
    }

    return auth.currentUser || user;
  },

  login: async (email: string, pass: string): Promise<User> => {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    return userCredential.user;
  },

  logout: async (): Promise<void> => {
    await signOut(auth);
  },
  
  getUserProfile: async (uid: string): Promise<UserProfile | null> => {
      try {
          const docRef = doc(db, "users", uid);
          const docSnap = await getDoc(docRef);
          return docSnap.exists() ? (docSnap.data() as UserProfile) : null;
      } catch (error) {
          console.error("Error obteniendo perfil:", error);
          return null;
      }
  }
};