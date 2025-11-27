import { db } from "../database/firebase.js";  // 네 프로젝트의 Firestore 객체
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { showHome } from "../app.js";


export function loadSeeAllPage(type) {
  const content = document.getElementById("content");

  // 🔥 헤더 숨기기
  document.querySelector("header").style.display = "none";
  document.querySelector(".content-section").style.display = "none";

  const titles = {
    popular: "유명한 곳",
    recommend: "추천 장소",
    user: "유저 추천"
  };

  content.innerHTML = `
    <!-- 🔙 뒤로가기 + 제목 -->
    <section class="seeall-header">
      <button id="backBtn" class="back-btn">
        <img src="assets/icons/back.svg" alt="Back" />
      </button>
      <h2>${titles[type]}</h2>
    </section>

    <!-- 🔖 태그 필터 (Home처럼 사용) -->
    <section id="tagContainer" class="filter-section">
      <div class="tag-filter">
        <span># 음식점</span>
        <span># 관광</span>
        <span># 식당</span>
        <span># 카페</span>
        <span># 미술관</span>
      </div>

      <div class="sort-section">
        <select id="sortOption">
          <option value="popular">인기순</option>
          <option value="rating">평점순</option>
          <option value="latest">최신순</option>
        </select>
      </div>
    </section>

    <!-- 📦 카드 2열 그리드 -->
    <section class="seeall-grid" id ="seeAllGrid">
      <p>로딩 중...</p>
    </section>
  `;

  // 🔙 뒤로가기 버튼 이벤트
  document.getElementById("backBtn").addEventListener("click", () => {
    showHome();
    import("./home.js").then(module => module.loadHomeScreen());
  });

  // 정렬 옵션 변경 이벤트
  document.getElementById("sortOption").addEventListener("change", (e) => {
    loadCardsFromDB(type, e.target.value);
  });

  loadCardsFromDB(type, "popular");
}

async function loadCardsFromDB(type) {
  const grid = document.getElementById("seeAllGrid");

  try {
    // 🔥 Firestore에서 데이터 가져오기
    const qSnapshot = await getDocs(collection(db, "Places"));

    let cardsHTML = "";

    qSnapshot.forEach(doc => {
      const data = doc.data();

      // 카드 HTML 생성
      cardsHTML += `
        <div class="seeall-card">
          <img src="${data.image_url}" alt="${data.name}">
          <p class="place-name">${data.name}</p>
          <div class="review_rating">
            <p class="rating"><img src="assets/icons/star.svg"/> ${data.rating}</p>
            <p class="review"> (${data.review.toLocaleString()} Reviews) </p>
          </div> 
          <div class=favorite>
          <img src="assets/icons/heart.svg"/>
            ${data.favorite}명이 좋아함
          </div>
        </div>
      `;
    });

    grid.innerHTML = cardsHTML;

  } catch (err) {
    console.error("카드 로딩 오류:", err);
    grid.innerHTML = "<p>데이터를 불러오는 중 오류가 발생했습니다.</p>";
  }
}

