import { loadHomeScreen } from "./screens/home.js";
import { loadFavoriteScreen } from "./screens/favorite.js";
import { loadMenuScreen } from "./screens/menu.js";
import { loadMapScreen } from "./screens/map.js";
import { setActive } from "./components/tabbar.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { loadTags, loadCategories } from "./components/categoryTagLoader.js";


async function wakeServerIfNeeded() {
  const lastWake = localStorage.getItem("serverLastWake");
  const now = Date.now();

  // 15분 = 900,000ms
  const SLEEP_THRESHOLD = 15 * 60 * 1000;

  if (lastWake && now - lastWake < SLEEP_THRESHOLD) {
    console.log("⚡ 서버 깨어있다고 판단 → ping 생략");
    return false;
  }

  console.log("💤 서버가 잠들었을 가능성 높음 → ping 요청 보냄");
  try {
    await fetch("https://dtrip.onrender.com/ping");
    localStorage.setItem("serverLastWake", Date.now());
  } catch (e) {
    console.warn("ping 실패:", e);
  }

  return true;
}

function hideSplash() {
  const splash = document.getElementById("splash-screen");
  if (!splash) return;

  splash.style.transition = "opacity 0.4s ease";
  splash.style.opacity = "0";

  splash.addEventListener("transitionend", () => {
    splash.remove();
  });
}

window.addEventListener("load", async () => {
  console.log("🚀 Splash 시작");

  // 1) 서버 깨우기
  await wakeServerIfNeeded();

  // 2) Firestore 첫 요청 캐싱(작은 요청)
  import("./components/popularPlace.js").then(m => m.getPopularPlaces());
  import("./components/recommendPlace.js").then(m => m.getRecommendPlaces());
  import("./components/userrecommendPlace.js").then(m => m.getUserRecommendPlaces());

  // 3) 2초 뒤 홈화면 로드
  setTimeout(() => {
    hideSplash();
    import("./screens/home.js").then(m => m.loadHomeScreen());
    setActive("home");
  }, 2000);
});

export let currentUser = null;
export let currentScreen = "home";

export function setCurrentScreen(screen) {
  currentScreen = screen;

  // 1) 모든 탭 active 제거
  document.querySelectorAll("#tabbar .tab-item").forEach(tab => {
    tab.classList.remove("active");
  });

  // 2) 해당 탭 active 추가
  const activeTab = document.querySelector(`#tabbar .tab-item[data-page="${screen}"]`);
  if (activeTab) {
    activeTab.classList.add("active");
  }
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

  // 🔹 기본 화면 = 홈
  await requestUserLocation();
  showHome();
  // 초기 화면: Home
  // loadHomeScreen();
  //setActive("home");
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
