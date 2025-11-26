import { db } from "../database/firebase.js";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

console.log("🔥 getPopularPlaces() 실행됨");
console.log("📡 Firestore DB 객체:", db);

export async function getPopularPlaces() {
  const placesCollection = collection(db, "Places");

  const q = query(placesCollection, orderBy("favorite", "desc"), limit(20));

  const snapshot = await getDocs(q);
  console.log("📡 Firestore snapshot size:", snapshot.size);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}
