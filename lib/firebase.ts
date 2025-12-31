// lib/firebase.ts
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from "firebase/app";

import { initializeAuth, getReactNativePersistence } from 'firebase/auth';

import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Tu configuración
const firebaseConfig = {
  apiKey: "AIzaSyBJ58jlz6cJM6KL5OmxHua-XZDHy62Qcwg",
  authDomain: "handlesports-380a3.firebaseapp.com",
  projectId: "handlesports-380a3",
  storageBucket: "handlesports-380a3.firebasestorage.app",
  messagingSenderId: "922310160482",
  appId: "1:922310160482:web:b6e5929d4843200618613b"
};


const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;