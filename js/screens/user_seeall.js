import { getUserRecommendPlaces } from "../components/userrecommendPlace.js";
import { showHome } from "../app.js";

export function loadUserSeeAll() {
  const content = document.getElementById("content");

  document.querySelector("header").style.display = "none";
  document.querySelector(".content-section").style.display = "none";

  content.innerHTML = `
    <section class="seeall-header">
      <button id="backBtn" class="back-btn">
        <img src="assets/icons/back.svg" />
      </button>
      <h2>유저 추천</h2>
    </section>

    <section class="user-seeall-list" id="userList">
      <p>로딩 중...</p>
    </section>
  `;

  document.getElementById("backBtn").onclick = () => {
    showHome();
    import("./home.js").then(m => m.loadHomeScreen());
  };

  loadUserList();
}

async function loadUserList() {
  const list = await getUserRecommendPlaces();
  const container = document.getElementById("userList");

  container.innerHTML = list.map(user => `
    <div class="user-seeall-card">
    <div class="user-header">
        <div class="profile">
          <img class="user-profile" src="${user.profile}" />
          <h3 class="user-name">${user.name}</h3>
        </div>
        <button class="route-btn">길 안내</button>
      </div>

      <div class="user-seeall-info">
        <p class="user-seeall-title">${user.title}</p>
        <span><img src="assets/icons/heart.svg" /> ${user.favorite}</span>
      </div>

      <div class="place-images">
        ${user.images.map(img => `<img src="${img}" />`).join("")}
      </div>
    </div>
  `).join("");
}
