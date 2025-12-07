import { loadHomeScreen } from "../screens/home.js";
import { loadFavoriteScreen } from "../screens/favorite.js";
import { loadMapScreen } from "../screens/map.js";
import { loadMenuScreen } from "../screens/menu.js";
import { showHome, hideHeader } from "./../app.js";

const content = document.getElementById("content");
let tabs = [];

// tabbar 클릭 시 색 변경
export function setActive(page) {
  tabs.forEach((t) => t.classList.remove("active"));
  document.querySelector(`.tab-item[data-page="${page}"]`)?.classList.add("active");
}

window.addEventListener("DOMContentLoaded", () => {
  tabs = document.querySelectorAll(".tab-item");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const page = tab.dataset.page;

      if (page === "map") {
        const currentPage = document.querySelector(".tab-item.active")?.dataset.page;
        sessionStorage.setItem("map_prev_screen", currentPage);
      }

      switch (page) {
        case "home":
          showHome();
          loadHomeScreen();
          break;

        case "favorite":
          hideHeader();
          loadFavoriteScreen();
          break;

        case "map":
          hideHeader();
          loadMapScreen();
          break;

        case "menu":
          hideHeader();
          loadMenuScreen();
          break;
      }

      setActive(page);
    });
  });
});
