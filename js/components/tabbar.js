import { loadHomeScreen } from "../screens/home.js";
import { loadFavoriteScreen } from "../screens/favorite.js";
import { loadMapScreen } from "../screens/map.js";
import { loadMenuScreen } from "../screens/menu.js";
import { showHome, hideHeader } from "./../app.js";

const content = document.getElementById("content");
let tabs = [];

// iOS 방향 센서 권한 요청 함수
async function requestIOSSensorPermission() {
  if (typeof DeviceOrientationEvent?.requestPermission === "function") {
    try {
      const res = await DeviceOrientationEvent.requestPermission();
      console.log("iOS sensor permission:", res);
    } catch (e) {
      console.warn("iOS 권한 요청 실패:", e);
    }
  }
}

// Android → 별도 권한 필요 없음 (sensor는 자동 허용 or 차단)
function prepareAndroidSensor() {
  console.log("Android sensor ready");
}

// MAP 버튼 클릭 시 센서 준비
async function prepareDeviceOrientation() {
  // iOS
  if (typeof DeviceOrientationEvent?.requestPermission === "function") {
    await requestIOSSensorPermission();
  }
  // Android
  else {
    prepareAndroidSensor();
  }
}

// tabbar 클릭 시 색 변경
export function setActive(page) {
  tabs.forEach((t) => t.classList.remove("active"));
  document.querySelector(`.tab-item[data-page="${page}"]`)?.classList.add("active");
}

window.addEventListener("DOMContentLoaded", () => {
  tabs = document.querySelectorAll(".tab-item");

  tabs.forEach((tab) => {
    tab.addEventListener("click", async () => {
      const page = tab.dataset.page;

      if (page === "map") {
        // 🌟 iOS 방향 센서 권한 요청 (유저 제스처 기반)
        await prepareDeviceOrientation();
        
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
