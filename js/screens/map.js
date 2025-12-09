// js/screens/map.js
import { db } from "../database/firebase.js";
import {
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { showHome, userLocation } from "../app.js";
import { setActive } from "../components/tabbar.js";
// import { startBusTracking } from "../components/busTracker.js";
// import { loadRoutePathAndFocus } from "../components/busRoute.js";
import { loadTags } from "../components/categoryTagLoader.js";
import { loadPlaceDetailPage } from "./detail.js";
import { setCurrentScreen } from "../app.js";
import { setStampMapInstance, startStampMode } from "./stamp_map.js";

let mapInstance = null;
let placeMarkers = [];
let compassMarker = null;
let compassMarkerElement = null;
let selectedTag = null;
let autoCenter = false;

async function loadAllPlaces() {
  const snapshot = await getDocs(collection(db, "Places"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// 지도 화면 생성
export async function loadMapScreen() {
  window.scrollTo(0, 0);

  const content = document.getElementById("content");

  content.innerHTML = `
      <div id="mapWrapper">
        <section id="MaptagContainer">
          <button class="back-btn" id="MapBackBtn">
            <img src="assets/icons/back.svg" />
          </button>
          <div id="maptagFilter"></div>
        </section>

        <div id="map" style="width:100%; height:100%;"></div>

        <button id="recenterBtn" class="recenter-btn">
          <img src="assets/icons/currentLocation.svg" />
        </button>
      </div>
    `;

  const backBtn = document.getElementById("MapBackBtn");
  console.log("backBtn:", backBtn);

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      console.log("🔙 MapBackBtn clicked");

      const detailId = sessionStorage.getItem("map_back_to_detail_id");
      const prev = sessionStorage.getItem("map_prev_screen");

      if (detailId) {
        loadPlaceDetailPage(detailId);
        sessionStorage.removeItem("map_back_to_detail_id");
        return;
      }
      switch (prev) {
        case "home":
          import("./home.js").then(({ loadHomeScreen }) => {
            showHome();
            loadHomeScreen();
            setActive("home");
          });
          break;

        case "favorite":
          import("./favorite.js").then(({ loadFavoriteScreen }) => {
            loadFavoriteScreen();
            setActive("favorite");
          });
          break;

        case "menu":
          import("./menu.js").then(({ loadMenuScreen }) => {
            loadMenuScreen();
            setActive("menu");
          });
          break;

        default:
          // 기록이 없으면 기본 home
          import("./home.js").then(({ loadHomeScreen }) => {
            showHome();
            loadHomeScreen();
            setActive("home");
          });
          break;
      }

      // 💡 최종적으로 기록 삭제
      sessionStorage.removeItem("map_prev_screen");
    });
  }

  await loadTags("maptagFilter");
  // ⭐ MAP 전용 태그 추가
  const mapTagFilter = document.getElementById("maptagFilter");
  mapTagFilter.insertAdjacentHTML(
    "afterbegin",
    `
    <span class="tag" data-tag="스탬프">
      <img src="assets/icons/stamp.svg" /> 스탬프
    </span>
  `
  );

  registerTagFilterEvents();

  await loadKakaoMap();

  const focusPlace = sessionStorage.getItem("map_focus_place");

  if (!focusPlace) {
    // ⭐ 일반적으로 지도 탭을 눌러 들어온 경우 → 현재 위치 기준 초기화
    initMapWithUserLocation();
  } else {
    // ⭐ SHOW MAP으로 진입한 경우 → 현재 위치 이동을 스킵한다!
    initMapWithoutUserCentering();
  }

  // ⭐ 마커 포커싱 실행
  if (focusPlace) {
    const place = JSON.parse(focusPlace);
    focusPlaceOnMap(place);
    sessionStorage.removeItem("map_focus_place");
  }

  setTimeout(async () => {
    if (selectedTag) {
      // UI에서 선택 표시
      const tagEl = document.querySelector(
        `#maptagFilter .tag[data-tag="${selectedTag}"]`
      );
      if (tagEl) {
        tagEl.classList.add("selected");
      }

      // 장소 다시 불러오기
      const places = await loadPlacesByTag(selectedTag);
      updateMarkers(places);
    }
  }, 100);

  document
    .getElementById("recenterBtn")
    .addEventListener("click", enableAutoCenter);

  document.querySelectorAll("#maptagFilter .tag").forEach((t) => {
    t.classList.remove("selected");
  });

  // 선택된 태그 상태 초기화
  selectedTag = null;

  // Drag시 자동 중심 맞추기 해제
  kakao.maps.event.addListener(mapInstance, "dragstart", () => {
    autoCenter = false;
  });

  const allPlaces = await loadAllPlaces();
  updateMarkers(allPlaces);

  // ⭐ 처음 진입 시 장소들로 중심 맞추기
  setTimeout(() => {
    const bounds = new kakao.maps.LatLngBounds();
    allPlaces.forEach((p) =>
      bounds.extend(new kakao.maps.LatLng(p.lat, p.lng))
    );
    mapInstance.setBounds(bounds);
  }, 50);
}

// 카카오맵 초기화 및 위치 설정
async function initMapWithUserLocation() {
  // 카카오맵 로드 대기 (SDK가 로딩될 시간을 줌)
  if (!window.kakao || !window.kakao.maps) {
    console.error("❌ Kakao Maps SDK가 로드되지 않았습니다.");
    return;
  }

  // 1. 지도 기본 옵션 (위치는 임시)
  const container = document.getElementById("map");
  const defaultPos = { lat: 36.35, lng: 127.38 }; // 현재 위치를 못받았을 시 기본 위치
  const { lat, lng } = userLocation ?? defaultPos;

  const map = new kakao.maps.Map(container, {
    center: new kakao.maps.LatLng(36.35, 127.38),
    level: 4,
  });

  mapInstance = map;

  // 2. 기기 위치 불러오기
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        const currentPos = new kakao.maps.LatLng(lat, lng);

        // 4. 지도 중심을 현재 위치로 변경
        // map.setCenter(currentPos);

        createCompassMarker(lat, lng);
      },
      (err) => {
        console.warn("위치 정보를 가져올 수 없음:", err);
      }
    );
  } else {
    alert("이 브라우저는 위치 서비스를 지원하지 않습니다.");
  }

  // 1) 실시간 이동 추적
  startMovementTracking();

  // 2) 기기 방향(heading) 추적
  startHeadingTracking();
}

// 카카오맵 API 연결
export async function loadKakaoMap() {
  return new Promise((resolve, reject) => {
    if (window.kakao && window.kakao.maps) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=124e4b785cbdd3fc46a37b0abd30547f&autoload=false`;
    script.onload = () => {
      kakao.maps.load(resolve);
    };
    script.onerror = reject;

    document.head.appendChild(script);
  });
}

function updateMarkers(places) {
  placeMarkers.forEach((o) => o.setMap(null));
  placeMarkers = [];

  places.forEach((p) => {
    if (!p.lat || !p.lng) return;

    const imageUrl = p.image_url;

    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
      <div style="
        width: 48px;
        height: 48px;
        border-radius: 50%;
        overflow: hidden;
        border: 2px solid white;
        box-shadow: 0 0 6px rgba(0,0,0,0.25);
      ">
        <img src="${imageUrl}" style="width:100%; height:100%; object-fit:cover;" />
      </div>
    `;

    const markerEl = wrapper.firstElementChild; // 실제 요소
    markerEl.style.cursor = "pointer"; // 클릭 가능하게

    markerEl.addEventListener("click", () => {
      setCurrentScreen("map");
      loadPlaceDetailPage(p.name);
    });

    const overlay = new kakao.maps.CustomOverlay({
      map: mapInstance,
      position: new kakao.maps.LatLng(p.lat, p.lng),
      content: markerEl,
      yAnchor: 1,
    });

    placeMarkers.push(overlay);
  });

  window.placeMarkers = placeMarkers;

  if (places.length > 0) {
    const bounds = new kakao.maps.LatLngBounds();
    places.forEach((p) => bounds.extend(new kakao.maps.LatLng(p.lat, p.lng)));
    mapInstance.setBounds(bounds); // ⭐ 항상 실행되도록
  }
}

// Tag Location Load
async function loadPlacesByTag(tagName) {
  const snapshot = await getDocs(collection(db, "Places"));

  const list = snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter((place) => place.tag === tagName || place.tags?.includes(tagName));

  return list;
}

// Tag Click event
function registerTagFilterEvents() {
  document.querySelectorAll("#maptagFilter .tag").forEach((tag) => {
    tag.addEventListener("click", async () => {
      const tagName = tag.dataset.tag;

      if (selectedTag === "스탬프" && tagName !== "스탬프") {
        selectedTag = null;

        const m = await import("./stamp_map.js");
        m.clearStampMarkers?.();
        m.clearStampUI?.();

        console.log("🔚 스탬프 모드 해제됨");
      }

      // Stamp
      if (tagName === "스탬프") {
        // 이미 스탬프 선택된 상태에서 다시 클릭 → 해제
        if (selectedTag === "스탬프") {
          selectedTag = null;

          // 선택 효과 제거
          document
            .querySelectorAll("#maptagFilter .tag")
            .forEach((t) => t.classList.remove("selected"));

          // 스탬프 마커 제거
          const m = await import("./stamp_map.js");

          await m.clearStampMarkers?.();
          await m.clearStampUI?.();

          // 기존 장소 마커 복원
          const allPlaces = await loadAllPlaces();
          updateMarkers(allPlaces);

          return;
        }

        // 스탬프 처음 선택한 경우
        selectedTag = "스탬프";

        // 스타일 반영
        document
          .querySelectorAll("#maptagFilter .tag")
          .forEach((t) => t.classList.remove("selected"));
        tag.classList.add("selected");

        // 스탬프 모드 실행
        import("./stamp_map.js").then((m) => {
          m.setStampMapInstance(mapInstance);
          m.startStampMode();
        });

        return;
      }

      // ⭐ 같은 태그를 다시 클릭하면 선택 해제
      if (selectedTag === tagName) {
        selectedTag = null;

        // 선택 효과 제거
        document.querySelectorAll("#maptagFilter .tag").forEach((t) => {
          t.classList.remove("selected");
        });

        // 전체 마커 다시 표시
        const snapshot = await getDocs(collection(db, "Places"));
        const allPlaces = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        updateMarkers(allPlaces);

        return; // 🔥 여기서 함수 종료
      }

      selectedTag = tagName;

      // 🔥 기존 선택 제거
      document.querySelectorAll("#maptagFilter .tag").forEach((t) => {
        t.classList.remove("selected");
      });

      // 🔥 새 선택 태그 강조
      tag.classList.add("selected");

      console.log("선택된 태그:", tagName);

      const places = await loadPlacesByTag(tagName);
      updateMarkers(places);
    });
  });
}

// 마커 생성
function createCompassMarker(lat, lng, visible = false) {
  const markerHTML = document.createElement("div");
  markerHTML.innerHTML = `
    <div id="compassIcon" style="
      width: 30px;
      height: 30px;
      display: ${visible ? "flex" : "none"}; 
      align-items: center;
      justify-content: center;
    ">
      <img id="compassImg" src="assets/icons/MyLocation.png" style="
        width: 100%;
        height: 100%;
        display: block;
        transform-origin: 50% 50%;
      "/>
    </div>
  `;

  compassMarkerElement = markerHTML.querySelector("#compassImg");

  compassMarker = new kakao.maps.CustomOverlay({
    map: mapInstance,
    position: new kakao.maps.LatLng(lat, lng),
    content: markerHTML,
    yAnchor: 0.5,
    xAnchor: 0.5,
  });
}

window.addEventListener("deviceorientationabsolute", handleHeading, true);
window.addEventListener("deviceorientation", handleHeading, true);

let headingOffset = 0; // ← 너의 기기에 맞게 조절

function handleHeading(event) {
  let heading = null;

  if (event.webkitCompassHeading !== undefined) {
    heading = event.webkitCompassHeading; // iPhone
  } else if (event.alpha !== null) {
    heading = 360 - event.alpha; // Android fallback
  }

  if (heading == null || !compassMarkerElement) return;

  // 디스플레이 방향 보정
  switch (window.orientation) {
    case 90:
      heading -= 90;
      break;
    case -90:
      heading += 90;
      break;
    case 180:
      heading += 180;
      break;
  }

  // 사용자 오프셋 보정
  const corrected = (heading + headingOffset + 360) % 360;

  compassMarkerElement.style.transform = `rotate(${corrected}deg)`;
}

// IOS
function startIOSHeading() {
  window.addEventListener("deviceorientation", (event) => {
    if (event.webkitCompassHeading != null) {
      applyHeading(event.webkitCompassHeading);
    }
  });
}

// Android
async function startAndroidAbsoluteSensor() {
  try {
    const sensor = new AbsoluteOrientationSensor({ frequency: 30 });
    sensor.addEventListener("reading", () => {
      const q = sensor.quaternion;
      const heading = quaternionToHeading(q);
      applyHeading(heading);
    });
    sensor.start();
    return true;
  } catch (err) {
    console.warn("AbsoluteOrientationSensor 사용불가:", err);
    return false;
  }
}

// Android
function quaternionToHeading(q) {
  const [x, y, z, w] = q;
  const siny = 2 * (w * z + x * y);
  const cosy = 1 - 2 * (y * y + z * z);
  let heading = Math.atan2(siny, cosy) * (180 / Math.PI);
  if (heading < 0) heading += 360;
  return heading;
}

// Android
function startAndroidFallback() {
  window.addEventListener("deviceorientation", (event) => {
    if (event.alpha != null) {
      let heading = 360 - event.alpha; // 화면 기준 → 북 기준 변환
      applyHeading(heading);
    }
  });
}

// 마커 방향 회전
function startHeadingTracking() {
  if (typeof DeviceOrientationEvent?.requestPermission === "function") {
    startIOSHeading();
    return;
  }

  // Android?
  if ("AbsoluteOrientationSensor" in window) {
    startAndroidAbsoluteSensor().then((ok) => {
      if (!ok) startAndroidFallback();
    });
  } else {
    startAndroidFallback();
  }

  // ---- 방향 값 처리 ----
  const handler = (event) => {
    let heading = null;

    // iOS (실제 나침반 값 제공)
    if (event.webkitCompassHeading !== undefined) {
      heading = event.webkitCompassHeading;
    }
    // Android
    else if (event.alpha !== null) {
      // alpha → 북 기준으로 변환 (카메라 방향 보정)
      heading = 360 - event.alpha;
    }

    if (heading == null || !compassMarkerElement) return;

    // 회전 적용
    compassMarkerElement.style.transform = `rotate(${heading}deg)`;
  };

  window.addEventListener("deviceorientationabsolute", handler, true);
  window.addEventListener("deviceorientation", handler, true);
}

// 마커 위치 추적
function startMovementTracking() {
  navigator.geolocation.watchPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const loc = new kakao.maps.LatLng(lat, lng);

      if (!compassMarker) {
        createCompassMarker(lat, lng);
      } else {
        compassMarker.setPosition(loc);
      }

      if (autoCenter) {
        mapInstance.setCenter(loc);
      }

      // compassMarker.setPosition(newPos);
      // mapInstance.setCenter(newPos); // 따라오기 모드
    },
    (err) => console.warn(err),
    {
      enableHighAccuracy: true,
      maximumAge: 500,
      timeout: 10000,
    }
  );
}

// 자동 중심 추적
function enableAutoCenter() {
  autoCenter = true;

  if (compassMarker) {
    const el = compassMarker.getContent().querySelector("#compassIcon");
    el.style.display = "flex";

    mapInstance.setCenter(compassMarker.getPosition());
    mapInstance.setLevel(3);
  }
}

// Deatil show map Button
export function focusPlaceOnMap(place) {
  if (!mapInstance || !place.lat || !place.lng) return;

  // 지도 중심 이동
  const moveLatLng = new kakao.maps.LatLng(place.lat, place.lng);
  mapInstance.setCenter(moveLatLng);

  // 마커 표시
  const marker = new kakao.maps.Marker({
    map: mapInstance,
    position: moveLatLng,
  });

  // 인포윈도우
  const info = new kakao.maps.InfoWindow({
    position: moveLatLng,
    content: `<div style="padding:8px;">${place.name}</div>`,
  });
  info.open(mapInstance, marker);
}

function initMapWithoutUserCentering() {
  mapInstance = new kakao.maps.Map(document.getElementById("map"), {
    center: new kakao.maps.LatLng(36.35, 127.38), // 대전 중심 등 기본값
    level: 5,
  });

  const pos = userLocation || { lat: 36.35, lng: 127.38 };

  createCompassMarker(pos.lat, pos.lng, false);
  startMovementTracking(); // ✔ 추가
  startHeadingTracking(); // ✔ 나침반도 추가
}
