import { db } from "../database/firebase.js";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

export async function getUserRecommendPlaces() {
  const placesCollection = collection(db, "Places");

  const q = query(placesCollection, orderBy("rating", "desc"), limit(20));

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}
