import { loadHomeScreen } from "./screens/home.js";
import { loadMapScreen } from "./screens/map.js";
import { loadFavoriteScreen } from "./screens/favorite.js";
import { loadMenuScreen } from "./screens/menu.js";

export function showHome() {
  document.getElementById("header").classList.remove("hidden");
  document.getElementById("categoryContainer").classList.remove("hidden");
  document.getElementById("tagContainer").classList.remove("hidden");
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
