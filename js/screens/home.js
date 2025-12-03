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

  // see all 클릭 시 자세히 보기 화면으로 이동
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

  // 각 장소들의 Card 클릭 시 해당 장소의 상세정보 화면으로 이동
  document.addEventListener("click", (e) => {
    const card = e.target.closest(".card, .seeall-card");
    if (!card) return;

    const id = card.dataset.id;
    console.log("Card clicked, ID:", id);
    loadPlaceDetailPage(id);
  });

  // 축제 버튼 클릭 시 축제 화면으로 이동
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

// 🔹 유저 추천 장소 렌더링
async function loadUserRecommendPlacesUI() {
  const list = await getUserRecommendPlaces();
  const container = document.getElementById("userRecommendCards");

  container.innerHTML = list
    .map(
      (place) => `
    <div class="user-card">
      <div class="user-card-images">
        ${place.images
          .slice(0, 4)
          .map((img) => `<img src="${img}"/>`)
          .join("")}
      </div>
      <div class="user-info">
        <h3 class="user-name">${place.name}</h3>
        <p class="user-title">${place.title}</p>
        <div class="user-favorite"><img src="assets/icons/heart.svg" /> ${place.favorite}</div>
      </div>
    </div>
  `
    )
    .join("");
}