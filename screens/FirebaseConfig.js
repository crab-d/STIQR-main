// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // Ensure full Firestore is imported
import { getStorage } from 'firebase/storage'; // Import Firebase Storage
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDgLsFAiLUlIYKTVK_1gqdvREvBQVpsI_E",
  authDomain: "stiqr-eb0f7.firebaseapp.com",
  projectId: "stiqr-eb0f7",
  storageBucket: "stiqr-eb0f7.appspot.com",
  messagingSenderId: "666426109560",
  appId: "1:666426109560:web:8ff9349370ce030a4c478d",
  measurementId: "G-X3SLMNY1EK"
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
const db = getFirestore(app);
const storage = getStorage(app); // Initialize Firebase Storage

export { auth, db, storage };