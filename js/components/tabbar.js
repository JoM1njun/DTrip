import { loadHomeScreen } from "../screens/home.js";
import { loadFavoriteScreen } from "../screens/favorite.js";
import { loadMapScreen } from "../screens/map.js";
import { loadMenuScreen } from "../screens/menu.js";
import { showHome, hideHeader } from "./../app.js";

const content = document.getElementById("content");
const tabs = document.querySelectorAll(".tab-item");

function setActive(page) {
  tabs.forEach(t => t.classList.remove("active"));
  document.querySelector(`.tab-item[data-page="${page}"]`)?.classList.add("active");
}

// 초기 화면: Home
loadHomeScreen();
setActive("home");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    const page = tab.dataset.page;

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
