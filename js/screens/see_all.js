import { db } from "../database/firebase.js";
import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { showHome } from "../app.js";
import { loadPlaceDetailPage } from "./detail.js";
import { loadTags } from "../components/categoryTagLoader.js";
import { setCurrentScreen } from "../app.js";


export let currentSeeAllType = null;

export async function loadSeeAllPage(type) {
  currentSeeAllType = type;
  setCurrentScreen("seeall");

  const content = document.getElementById("content");

  // 🔥 헤더 숨기기
  document.querySelector("header").style.display = "none";
  document.getElementById("categoryContainer").style.display = "none";
  document.getElementById("tagContainer").style.display = "none";
  document.getElementById("tabbar").style.display = "flex";

  const titles = {
    popular: "유명한 곳",
    recommend: "추천 장소",
    user: "유저 추천",
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
      <div class="tag-filter" id="seeAlltagFilter"></div>

      <div class="sort-section">
        <select id="sortOption">
          <option value="popular">인기순</option>
          <option value="rating">리뷰순</option>
          <option value="latest">최신순</option>
        </select>
      </div>
    </section>

    <!-- 📦 카드 2열 그리드 -->
    <section class="seeall-grid" id ="seeAllGrid">
      <p>로딩 중...</p>
    </section>
  `;

  await loadTags("seeAlltagFilter");

  // 🔙 뒤로가기 버튼 이벤트
  document.getElementById("backBtn").addEventListener("click", () => {
    showHome();
    import("./home.js").then((module) => module.loadHomeScreen());
  });

  // 정렬 옵션 변경 이벤트
  document.getElementById("sortOption").addEventListener("change", (e) => {
    loadCardsFromDB(type, e.target.value);
  });

  // 장소 Card 클릭 시 장소의 상세정보 화면으로 이동
  document.addEventListener("click", (e) => {
    const card = e.target.closest(".card, .seeall-card");
    if (!card) return;

    const id = card.dataset.id;
    console.log("Card clicked, ID:", id);
    loadPlaceDetailPage(id);
  });

  loadCardsFromDB(type);
}

// Database에서 장소들의 Data가져옴
async function loadCardsFromDB(type, sortOption = null) {
  const grid = document.getElementById("seeAllGrid");

  try {
    // 🔥 Firestore에서 데이터 가져오기
    const qSnapshot = await getDocs(collection(db, "Places"));

    let places = qSnapshot.docs.map((doc) => doc.data());
    console.log(places);

    qSnapshot.forEach((doc) => {
      places.data = doc.data();
    });

    if (!sortOption) {
      // 기본 정렬 기준
      if (type === "popular") {
        sortOption = "review"; // 리뷰 많은 순
      } else if (type === "recommend") {
        sortOption = "favorite"; // 좋아요 많은 순
      } else if (type === "user") {
        sortOption = "latest"; // 최신순
      }
    }

    if (sortOption === "rating") {
      places.sort((a, b) => b.rating - a.rating);
    } else if (sortOption === "review") {
      places.sort((a, b) => (b.review ?? 0) - (a.review ?? 0));
    } else if (sortOption === "favorite") {
      places.sort((a, b) => (b.favorite ?? 0) - (a.favorite ?? 0));
    } else if (sortOption === "latest") {
      places.sort((a, b) => {
        return (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0);
      });
    }

    // 각 장소들의 Card HTML 생성
    grid.innerHTML = places
      .map(
        (data) => `
      <div class="seeall-card" data-id="${data.name}">
        <img src="${data.image_url}" alt="${data.name}">
        <div class="place-info">
        <p class="place-name">${data.name}</p>

        <div class="review_rating">
          <p class="rating"><img src="assets/icons/star.svg"/> ${data.rating
          }</p>
          <p class="review">(${data.review?.toLocaleString() ?? 0})</p>
        </div>

        <p class="favorite">
          <img src="assets/icons/heart.svg"/>${data.favorite?.toLocaleString() ?? 0
          }명이 좋아함
        </p>
        </div>
      </div>
    `
      )
      .join("");
  } catch (err) {
    console.error("카드 로딩 오류:", err);
    grid.innerHTML = "<p>데이터를 불러오는 중 오류가 발생했습니다.</p>";
  }
}
