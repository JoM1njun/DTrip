import { db } from "../database/firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { showHome, setCurrentScreen } from "../app.js";
import { loadPlaceDetailPage } from "./detail.js";
import { loadTags } from "../components/categoryTagLoader.js";
import { registerFilterEvents } from "../components/filterEvents.js";

export let currentSeeAllType = null;
let allPlaces = [];
let currentSort = null;
let activeCategory = null;
let activeTag = null;

export async function loadSeeAllPage(type) {
  currentSeeAllType = type;
  setCurrentScreen("seeall");

  const content = document.getElementById("content");

  // UI 숨김 처리
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
    <section class="seeall-header">
      <button id="backBtn" class="back-btn">
        <img src="assets/icons/back.svg" alt="Back" />
      </button>
      <h2>${titles[type]}</h2>
    </section>

    <section id="tagContainer" class="filter-section">
      <div class="tag-filter" id="seeAlltagFilter"></div>

      <div class="sort-section">
        <select id="sortOption">
          <option value="review">인기순</option>
          <option value="rating">리뷰순</option>
          <option value="latest">최신순</option>
        </select>
      </div>
    </section>

    <section class="seeall-grid" id="seeAllGrid">
      <p>로딩 중...</p>
    </section>
  `;

  // 태그 로딩
  await loadTags("seeAlltagFilter");

  // 태그/카테고리 필터 이벤트 등록
  registerFilterEvents({
    categorySelector: ".category-item",
    tagSelector: "#seeAlltagFilter .tag",

    onFilterChange: ({ category, tag }) => {
      activeCategory = category;
      activeTag = tag;
      applySeeAllFilters();
    }
  });

  // 뒤로가기
  document.getElementById("backBtn").addEventListener("click", () => {
    showHome();
    import("./home.js").then((module) => module.loadHomeScreen());
  });

  // 정렬 변경 이벤트
  document.getElementById("sortOption").addEventListener("change", (e) => {
    currentSort = e.target.value;
    applySeeAllFilters();
  });

  // 카드 클릭
  document.addEventListener("click", (e) => {
    const card = e.target.closest(".card, .seeall-card");
    if (!card) return;

    loadPlaceDetailPage(card.dataset.id);
  });

  loadCardsFromDB(type);
}

// Firestore에서 데이터 로딩
async function loadCardsFromDB(type) {
  const grid = document.getElementById("seeAllGrid");

  try {
    const qSnapshot = await getDocs(collection(db, "Places"));
    let places = qSnapshot.docs.map((doc) => doc.data());

    allPlaces = [...places]; // 전체 데이터 저장
    currentSort = "review";  // 기본 정렬

    applySeeAllFilters();    // 필터 + 정렬 적용 후 렌더링

  } catch (err) {
    console.error("카드 로딩 오류:", err);
    grid.innerHTML = "<p>데이터를 불러오는 중 오류가 발생했습니다.</p>";
  }
}

// 필터 + 정렬 적용 후 렌더링
function applySeeAllFilters() {
  let result = [...allPlaces];

  if (activeCategory) {
    result = result.filter(p => p.categoryId === activeCategory);
  }

  if (activeTag) {
    result = result.filter(p => p.tag === activeTag);
  }

  if (currentSort === "rating") {
    result.sort((a, b) => b.rating - a.rating);
  }
  else if (currentSort === "review") {
    result.sort((a, b) => (b.review ?? 0) - (a.review ?? 0));
  }
  else if (currentSort === "favorite") {
    result.sort((a, b) => (b.favorite ?? 0) - (a.favorite ?? 0));
  }
  else if (currentSort === "latest") {
    result.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
  }

  renderSeeAllCards(result);
}

// 카드 렌더링 함수
function renderSeeAllCards(list) {
  const grid = document.getElementById("seeAllGrid");

  grid.innerHTML = list.map((data) => `
    <div class="seeall-card" data-id="${data.name}">
      <img src="${data.image_url}" alt="${data.name}">
      <div class="place-info">
        <p class="place-name">${data.name}</p>

        <div class="review_rating">
          <p class="rating"><img src="assets/icons/star.svg"/> ${data.rating}</p>
          <p class="review">(${data.review?.toLocaleString() ?? 0})</p>
        </div>

        <p class="favorite">
          <img src="assets/icons/heart.svg"/>${data.favorite?.toLocaleString() ?? 0}명이 좋아함
        </p>
      </div>
    </div>
  `).join("");
}
