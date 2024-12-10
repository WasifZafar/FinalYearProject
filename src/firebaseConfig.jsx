import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getDatabase, ref, get  } from "firebase/database";
import{ getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_YOUR_MEASUREMENT_ID,
  databaseURL: import.meta.env.VITE_DATABASE_URL, // Ensure the Realtime Database URL is set
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// Initialize Firestore and Realtime Database
export const db = getFirestore(app);  // Firestore instance
export const database = getDatabase(app);  // Realtime Database instance
export {  ref, get };
export { auth, GoogleAuthProvider, signInWithPopup, signOut };