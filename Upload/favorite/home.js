/**
 * home.js
 * 
 * 메인 홈 화면입니다.
 * 인기 장소, 추천 장소 및 사용자 추천 장소를 표시합니다.
 * 다른 화면 및 섹션으로의 네비게이션을 처리합니다.
 * 
 * 연결된 파일:
 * - js/screens/see_all.js
 * - js/components/popularPlace.js
 * - js/components/recommendPlace.js
 * - js/components/userrecommendPlace.js
 * - js/screens/detail.js
 */
import { loadSeeAllPage } from "./see_all.js";
import { getPopularPlaces } from "../components/popularPlace.js";
import { getRecommendPlaces } from "../components/recommendPlace.js";
import { getUserRecommendPlaces } from "../components/userrecommendPlace.js";
import { hideHeader } from "../app.js";
import { loadPlaceDetailPage } from "./detail.js";

console.log("🏠 Home screen loaded!");

export async function loadHomeScreen() {
  const content = document.getElementById("content");

  content.innerHTML = `
    <section id="popularContainer" class="content-section list-section">
      <div class="list-header">
        <div class="list-title">유명한 곳</div>
        <button class="see-all">see all</button>
      </div>
      <div class="card-container" id="popularCards"></div>
    </section>

    <section id="recommendContainer" class="content-section list-section">
      <div class="list-header">
        <div class="list-title">추천 장소</div>
        <button class="see-all">see all</button>
      </div>
      <div class="card-container" id="recommendCards"></div>
    </section>

    <section id="userRecommendContainer" class="content-section list-section">
      <div class="list-header">
        <div class="list-title">유저 추천</div>
        <button class="see-all">see all</button>
      </div>
      <div class="card-container" id="userRecommendCards"></div>
    </section>
  `;

  document.querySelectorAll(".see-all").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.closest(".list-section").id.replace("Container", "");
      let type = id;
      if (id === "userRecommend") type = "user";
      else if (id === "popular") type = "popular";
      else if (id === "recommend") type = "recommend";

      loadSeeAllPage(type);
      hideHeader();
    });
  });

  document.addEventListener("click", (e) => {
    const card = e.target.closest(".card, .seeall-card");
    if (!card) return;

    const id = card.dataset.id;
    console.log("Card clicked, ID:", id);
    loadPlaceDetailPage(id);
  });

  document.querySelectorAll(".category-item").forEach(item => {
    item.addEventListener("click", () => {
      const type = item.dataset.type;

      if (type === "festival") {
        import("./festival.js").then(m => m.loadFestivalList());
      }
    });
  });

  await loadPopularPlacesUI();
  await loadRecommendPlacesUI();
  await loadUserRecommendPlacesUI();
}

// 🔹 인기 장소 렌더링
async function loadPopularPlacesUI() {
  const list = await getPopularPlaces();
  const container = document.getElementById("popularCards");

  container.innerHTML = list
    .map(
      (place) => `
    <div class="card" data-id="${place.name}">
      <img src="${place.image_url}" alt="${place.name}">
      <div class="info">
        <h3>${place.name}</h3>
        <p class=address>${place.address}</p>
        <div class="rating"><img src="assets/icons/star.svg"/> ${place.rating}</div>
      </div>
    </div>
  `
    )
    .join("");
}

// 🔹 추천 장소 렌더링
async function loadRecommendPlacesUI() {
  const list = await getRecommendPlaces();
  const container = document.getElementById("recommendCards");

  container.innerHTML = list
    .map(
      (place) => `
    <div class="card" data-id="${place.name}">
      <img src="${place.image_url}" alt="${place.name}">
      <div class="info">
        <h3>${place.name}</h3>
        <p class=address>${place.address}</p>
        <div class="rating"><img src="assets/icons/star.svg"/> ${place.rating}</div>
      </div>
    </div>
  `
    )
    .join("");
}

// 🔹 추천 장소 렌더링
async function loadUserRecommendPlacesUI() {
  const list = await getUserRecommendPlaces();
  const container = document.getElementById("userRecommendCards");

  container.innerHTML = list
    .map(
      (place) => `
    <div class="card">
      <img src="${place.image_url}" alt="${place.name}">
      <div class="info">
        <h3>${place.name}</h3>
        <p class=address>${place.address}</p>
        <div class="rating">⭐ ${place.rating}</div>
      </div>
    </div>
  `
    )
    .join("");
}