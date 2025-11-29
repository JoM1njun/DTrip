import { db } from "../database/firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { loadFestivalList } from "./festival.js";

export async function loadFestivalDetail(id) {
    const content = document.getElementById("content");
    content.innerHTML = `<p>로딩 중...</p>`;

    const snap = await getDoc(doc(db, "Festival", id));
    const f = snap.data();

    content.innerHTML = `
      <section class="festival-detail-header">
        <button id="backFestivalList" class="back-btn">
          <img src="assets/icons/back.svg"/>
        </button>
      </section>

      <section class="festival-detail">
        <div class="festival-title">${f.name}</div>
            <div class="host">주최) ${f.host}</div>
            <img class="main-img" src="${f.image_url}">
        <div class="festival-detail-info">
            <p class="date"><img src="assets/festival/festival_icons/calender.svg" />${f.date}</p>
            <p class="address"><img src="assets/festival/festival_icons/location.svg" />${f.address}</p>
            <p class="phone"><img src="assets/festival/festival_icons/phone.svg" />${f.phone}</p>
            <p class="price"><img src="assets/festival/festival_icons/price.svg" />${f.price}</p>
        </div>

        <div class="detail-buttons">
          <button class="map-btn">지도 보기</button>
          <button class="homepage-btn">공식 홈페이지</button>
        </div>
      </section>
    `;

    document.getElementById("backFestivalList").addEventListener("click", () => {
        loadFestivalList();
    });
}
