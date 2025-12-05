import { db } from "../database/firebase.js";
import {
  collection,
  getDocs,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";


export async function getUserRecommendPlaces() {
  const usersRef = collection(db, "User");
  const userSnap = await getDocs(usersRef);

  let userList = [];

  for (const docSnap of userSnap.docs) {
    const user = docSnap.data();

    // 🔥 user.places === ["p1", "p2", "p3"] 같은 상태
    const placeImages = [];

    for (const placeId of user.images) {
      if (!placeId || placeId.trim() === "") continue;

      const placeRef = doc(db, "Places", placeId);
      const placeSnap = await getDoc(placeRef);

      if (placeSnap.exists()) {
        const placeData = placeSnap.data();

        // place 이미지 추가
        if (placeData.image_url) {
          placeImages.push(placeData.image_url);
        }
      }
    }

    userList.push({
      ...user,
      placeImages // → 최종적으로 image URL 배열이 됨
    });
  }

  userList.sort((a, b) => b.favorite - a.favorite);

  return userList;
}
