import { auth, db } from "@/lib/firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export const authService = {
  // 1. REGISTRO MEJORADO
  register: async (email: string, pass: string, name?: string) => {
    // A. Crear usuario en Auth System
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;

    // B. Actualizar nombre visible (Display Name)
    if (name) {
        await updateProfile(user, { displayName: name });
    }

    // C. CREAR DOCUMENTO EN FIRESTORE (Aquí guardamos las monedas)
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      displayName: name || "Usuario",
      balance: 1000, // <--- ¡Tus monedas para apuestas!
      createdAt: new Date().toISOString(),
      role: 'user' // Por si luego quieres admins
    });

    return user;
  },

  // 2. LOGIN (Sin cambios, pero podríamos traer el balance aquí si quisieras)
  login: async (email: string, pass: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    return userCredential.user;
  },

  logout: async () => {
    await signOut(auth);
  },
  
  // Extra: Función para obtener datos del perfil (monedas, etc)
  getUserProfile: async (uid: string) => {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data() : null;
  }
};