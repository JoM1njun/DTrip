import { loadSeeAllPage } from "./see_all.js";
import { getPopularPlaces } from "../components/popularPlace.js";
import { getRecommendPlaces } from "../components/recommendPlace.js";
import { getUserRecommendPlaces } from "../components/userrecommendPlace.js";
import { hideHeader } from "../app.js";
import { loadPlaceDetailPage } from "./detail.js";
import {
  setOriginalData,
  filterByCategory,
  filterByTag,
  resetFilter
} from "../components/filterManager.js";
import { loadTags, loadCategories } from "../components/categoryTagLoader.js";
import { registerFilterEvents } from "../components/filterEvents.js";

console.log("🏠 Home screen loaded!");

let originalPopular = [];
let originalRecommend = [];
let activeCategory = null;
let activeTag = null;

// 현재 필터링 상태 저장
let currentFilter = null;

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

  // see all 클릭 시 자세히 보기 화면으로 이동
  document.querySelectorAll(".see-all").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.closest(".list-section").id.replace("Container", "");
      let type = id;
      if (id === "userRecommend") {
        import("./user_seeall.js").then(m => m.loadUserSeeAll());
        hideHeader();
        return;
      }
      else if (id === "popular") type = "popular";
      else if (id === "recommend") type = "recommend";

      loadSeeAllPage(type);
      hideHeader();
    });
  });

  // 각 장소들의 Card 클릭 시 해당 장소의 상세정보 화면으로 이동
  document.addEventListener("click", (e) => {
    // TAG 클릭이면 카드 이동 금지
    if (e.target.closest(".tag")) return;

    // CATEGORY 클릭이면 카드 이동 금지
    if (e.target.closest(".category-item")) return;

    const card = e.target.closest(".card, .seeall-card");
    if (!card) return;

    const id = card.dataset.id;
    console.log("Card clicked, ID:", id);
    loadPlaceDetailPage(id);
  });

  await loadPopularPlacesUI();
  await loadRecommendPlacesUI();
  await loadUserRecommendPlacesUI();
  await loadCategories();
  await loadTags();

  registerFilterEvents({
    categorySelector: ".category-item",
    tagSelector: ".tag",
    onFilterChange: ({ category, tag }) => {

      let filteredPopular = [...originalPopular];
      let filteredRecommend = [...originalRecommend];

      if (category) {
        filteredPopular = filteredPopular.filter(p => p.categoryId === category);
        filteredRecommend = filteredRecommend.filter(p => p.categoryId === category);
      }

      if (tag) {
        filteredPopular = filteredPopular.filter(p => p.tag === tag);
        filteredRecommend = filteredRecommend.filter(p => p.tag === tag);
      }

      renderPopular(filteredPopular);
      renderRecommend(filteredRecommend);
    }
  });

  setOriginalData(originalPopular, originalRecommend);
}

// 🔹 인기 장소 렌더링
async function loadPopularPlacesUI() {
  const list = await getPopularPlaces();
  originalPopular = list; // 🔥 원본 저장

  renderPopular(list);
}

function renderPopular(list) {
  const container = document.getElementById("popularCards");

  container.innerHTML = list
    .map(
      (place) => `
    <div class="card" data-id="${place.name}">
      <img src="${place.image_url}">
      <div class="info">
        <h3>${place.name}</h3>
        <p class="address">${place.address}</p>
        <div class="rating"><img src="assets/icons/star.svg"/> ${place.rating}</div>
      </div>
    </div>`
    )
    .join("");
}

// 🔹 추천 장소 렌더링
async function loadRecommendPlacesUI() {
  const list = await getRecommendPlaces();
  originalRecommend = list;

  renderRecommend(list);
}

function renderRecommend(list) {
  document.getElementById("recommendCards").innerHTML = list
    .map(
      (place) => `
    <div class="card" data-id="${place.name}">
      <img src="${place.image_url}">
      <div class="info">
        <h3>${place.name}</h3>
        <p class="address">${place.address}</p>
        <div class="rating"><img src="assets/icons/star.svg"/> ${place.rating}</div>
      </div>
    </div>`
    )
    .join("");
}

// 🔹 유저 추천 장소 렌더링
async function loadUserRecommendPlacesUI() {
  const list = await getUserRecommendPlaces();

  renderUser(list);
}

function renderUser(list) {
  document.getElementById("userRecommendCards").innerHTML = list
    .map(
      (place) => `
    <div class="user-card">
      <div class="user-card-images">
        ${place.placeImages.slice(0, 4).map(img => `<img src="${img}"/>`).join("")}
      </div>
      <div class="user-info">
        <h3 class="user-name">${place.name}</h3>
        <p class="user-title">${place.title}</p>
        <div class="user-favorite"><img src="assets/icons/heart.svg" /> ${place.favorite}</div>
      </div>
    </div>`
    )
    .join("");
}

function applyCombinedFilter() {
  let filteredPopular = originalPopular;
  let filteredRecommend = originalRecommend;

  if (activeCategory) {
    filteredPopular = filteredPopular.filter(p => p.categoryId === activeCategory);
    filteredRecommend = filteredRecommend.filter(p => p.categoryId === activeCategory);
  }

  if (activeTag) {
    filteredPopular = filteredPopular.filter(p => p.tag === activeTag);
    filteredRecommend = filteredRecommend.filter(p => p.tag === activeTag);
  }

  console.log("필터 결과:", {
    popular: filteredPopular.length,
    recommend: filteredRecommend.length
  });

  // 렌더링
  renderPopular(filteredPopular);
  renderRecommend(filteredRecommend);
}

