// Firebase SDK 가져오기
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-analytics.js";

// Firebase 설정값 (본인 프로젝트에서 복붙)
const firebaseConfig = {
  apiKey: "AIzaSyCOKAMhajJSmmLt2pPhVhSdNBcXs6gox74",
  authDomain: "dtrip-3b62e.firebaseapp.com",
  projectId: "dtrip-3b62e",
  storageBucket: "dtrip-3b62e.firebasestorage.app",
  messagingSenderId: "330080981587",
  appId: "1:330080981587:web:5dc1225feab0d917216ca6",
  measurementId: "G-KTJLQCJMCW",
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// 필요한 서비스 가져오기
export const db = getFirestore(app); // Firestore
export const auth = getAuth(app);