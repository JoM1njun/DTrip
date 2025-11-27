import { loadHomeScreen } from "./screens/home.js";
import { loadMapScreen } from "./screens/map.js";
import { loadFavoriteScreen } from "./screens/favorite.js";
import { loadMenuScreen } from "./screens/menu.js";

export function showHome() {
  const header = document.getElementById("header");
  const cat = document.getElementById("categoryContainer");
  const tag = document.getElementById("tagContainer");

  header.classList.remove("hidden");
  cat.classList.remove("hidden");
  tag.classList.remove("hidden");

  // 혹시 header가 0높이가 되어있으면 강제로 원복
  header.style.display = "flex";
  cat.style.display = "block";
  tag.style.display = "block";
}

export function hideHeader() {
  document.getElementById("header").classList.add("hidden");
  document.getElementById("categoryContainer").classList.add("hidden");
  document.getElementById("tagContainer").classList.add("hidden");
}

window.addEventListener("DOMContentLoaded", () => {
  //const header = document.querySelector("header"); // ← 헤더 DOM

  // 🔹 기본 화면 = 홈
  showHome();
  loadHomeScreen();

  // 탭바 이벤트 등록
  document.getElementById("tabbar").addEventListener("click", (e) => {
    const target = e.target.closest(".tab-item");
    if (!target) return;

    const screen = target.dataset.screen;

    switch (screen) {
      case "home":
        showHome();
        loadHomeScreen();
        break;
      case "map":
        hideHeader();
        loadMapScreen();
        break;
      case "favorite":
        hideHeader();
        loadFavoriteScreen();
        break;
      case "menu":
        hideHeader();
        loadMenuScreen();
        break;
    }
  });
});
