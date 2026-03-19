import { initializeApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBFF3zq6zY_TYF0M8fR2WgMAi7zOrgmEzU",
  authDomain: "barbeariadocesar2026.firebaseapp.com",
  projectId: "barbeariadocesar2026",
  storageBucket: "barbeariadocesar2026.firebasestorage.app",
  messagingSenderId: "507436085424",
  appId: "1:507436085424:web:4990b3e8de0d22bbef4b75",
  measurementId: "G-TY3MSCT5VX"
};

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});
