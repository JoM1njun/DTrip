// Node.js용 Firebase SDK
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCOKAMhajJSmmLt2pPhVhSdNBcXs6gox74",
    authDomain: "dtrip-3b62e.firebaseapp.com",
    projectId: "dtrip-3b62e",
    storageBucket: "dtrip-3b62e.firebasestorage.app",
    messagingSenderId: "330080981587",
    appId: "1:330080981587:web:5dc1225feab0d917216ca6",
    measurementId: "G-KTJLQCJMCW",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
