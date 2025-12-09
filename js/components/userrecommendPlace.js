import { db } from "../database/firebase.js";
import {
  collection,
  getDocs,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";


async function getAllPlacesMap() {
  const snap = await getDocs(collection(db, "Places"));

  const placeMap = new Map();
  snap.forEach(doc => {
    placeMap.set(doc.id, doc.data());
  });

  return placeMap;
}

export async function getUserRecommendPlaces() {
  // 1) 유저 전체 불러오기 → 1회 요청
  const usersSnap = await getDocs(collection(db, "User"));

  // 2) Places 전체 미리 가져오기 → 1회 요청 (기존 10~30회 → 단 1회!)
  const placeMap = await getAllPlacesMap();

  let userList = [];

  usersSnap.forEach(docSnap => {
    const user = docSnap.data();
    const placeImages = [];

    // images 배열 기반으로 place 데이터 매칭
    for (const placeId of user.images || []) {
      const place = placeMap.get(placeId);
      if (place?.image_url) {
        placeImages.push(place.image_url);
      }
    }

    userList.push({
      ...user,
      placeImages,
    });
  });

  // 정렬
  userList.sort((a, b) => b.favorite - a.favorite);

  return userList;
}
