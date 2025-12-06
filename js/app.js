import { loadHomeScreen } from "./screens/home.js";
import { loadFavoriteScreen } from "./screens/favorite.js";
import { loadMenuScreen } from "./screens/menu.js";
import { loadMapScreen } from "./screens/map.js";
import { setActive } from "./components/tabbar.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { loadTags, loadCategories } from "./components/categoryTagLoader.js";

export let currentUser = null;
export let currentScreen = "home";

export function setCurrentScreen(screen) {
  currentScreen = screen;
  console.log(currentScreen);
}

// onAuthStateChanged(auth, (user) => {
//   if (user) {
//     console.log("로그인 유지됨", user.uid);
//     currentUser = user;
//     updateMenuProfile(user);
//   } else {
//     console.log("로그아웃 상태");
//     currentUser = null;
//     updateMenuProfile(null);
//   }
// });

// export function getCurrentUser() {
//   return currentUser;
// }

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

window.addEventListener("DOMContentLoaded", async () => {
  //const header = document.querySelector("header"); // ← 헤더 DOM

  await loadCategories();
  await loadTags("tagFilter");

  // 🔥 카테고리 클릭 이벤트 연결
  // document.querySelectorAll(".category-item").forEach(item => {
  //   item.addEventListener("click", () => {
  //     const type = item.dataset.type;
  //     console.log("카테고리 선택됨:", type);

  //     setCurrentScreen("seeall");
  //     hideHeader();

  //     import("./screens/festival.js").then(module => {
  //       module.loadFestivalList();
  //     });
  //   });
  // });

  // // 🔥 태그 클릭 이벤트 연결
  // document.querySelectorAll("#tagFilter .tag").forEach(tag => {
  //   tag.addEventListener("click", () => {
  //     const tagName = tag.textContent.trim();
  //     console.log("태그 선택됨:", tagName);

  //     setCurrentScreen("seeall");
  //     hideHeader();

  //     import("./screens/see_all.js").then(module => {
  //       module.loadSeeAllPage("tag", tagName);
  //     });
  //   });
  // });

  // 🔹 기본 화면 = 홈
  await requestUserLocation();
  showHome();
  // 초기 화면: Home
  loadHomeScreen();
  setActive("home");
});

// 사용자의 처음 위치 = null
export let userLocation = null;

// 사용자의 현재 위치를 가져오는 기능
export function requestUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      alert("이 브라우저는 위치 정보를 지원하지 않습니다.");
      return reject();
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        userLocation = { lat, lng };
        console.log("📍 위치 저장됨:", userLocation);

        resolve(userLocation);
      },
      (err) => {
        console.error("위치 정보를 가져올 수 없습니다:", err);
        reject(err);
      }
    );
  });
}
