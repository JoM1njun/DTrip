import { db } from "../database/firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { loadFestivalDetail } from "./festival_detail.js";

export async function loadFestivalList() {
    const content = document.getElementById("content");

    // 헤더 숨기기
    document.getElementById("header").style.display = "none";
    document.getElementById("categoryContainer").style.display = "none";
    document.getElementById("tagContainer").style.display = "none";
    document.getElementById("tabbar").style.display = "none";

    content.innerHTML = `
      <section class="festival-header">
        <button id="backHome" class="back-btn">
          <img src="assets/icons/back.svg"/>
        </button>
        <h2>축제</h2>
      </section>

      <section class="festival-list" id="festivalList">
        <p>로딩 중...</p>
      </section>
    `;

    document.getElementById("backHome").addEventListener("click", () => {
        import("./home.js").then(m => m.loadHomeScreen());
        document.getElementById("header").style.display = "flex";
        document.getElementById("categoryContainer").style.display = "block";
        document.getElementById("tagContainer").style.display = "block";
        document.getElementById("tabbar").style.display = "flex";
    });

    // Firestore 축제 데이터 가져오기
    const snapshot = await getDocs(collection(db, "Festival"));
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const listContainer = document.getElementById("festivalList");

    listContainer.innerHTML = list.map(f => `
        <div class="festival-card" data-id="${f.name}">
            <div class="festival-info">
                <div class="festival-host-name">
                    <div class="festival-host">${f.host}</div>
                    <div class="festival-name">${f.name}</div>
                </div>
                <img src="${f.image_url}">
                <div class="festival-phone"><img src="assets/festival/festival_icons/phone.svg" />${f.phone}</div>
            </div>
        </div>
    `).join("");

    // 카드 클릭 → 상세 화면 이동
    document.querySelectorAll(".festival-card").forEach(card => {
        card.addEventListener("click", () => {
            const id = card.getAttribute("data-id");
            loadFestivalDetail(id);
        });
    });
}
