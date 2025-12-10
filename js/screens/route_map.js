import { loadKakaoMap } from "./map.js";
import { db } from "../database/firebase.js";
import {
  collection,
  query,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { getTmapRoute, getTransitRoute } from "../components/TmapAPI.js";
import { extractPolylines } from "../components/transitParser.js";
import { drawPolyline, getColorByMode } from "../components/Polyline.js";
import { renderTransitPanel } from "../components/transitUI.js";
import { userLocation } from "../app.js";

let allowDrag = true;

export async function loadUserRouteMap(user) {
  window.currentRouteUser = user;

  const content = document.getElementById("content");
  console.log("👉 전달된 user:", user);

  // 헤더/카테고리 숨기기
  document.querySelector("header").style.display = "none";
  document.querySelector("#categoryContainer").style.display = "none";
  document.querySelector("#tagContainer").style.display = "none";
  document.getElementById("tabbar").style.display = "none";

  content.innerHTML = "";
  content.innerHTML = `
        <div class="route-header">
            <p>${user.name}님의 경로</p>
            <button id="routeBackBtn" class="back-btn">
                <img src="assets/icons/back.svg" />
            </button>
        </div>
        <section id="routeContainer" class="route-container">
            <div id="map"></div>
            <div id="bottomSheet">
                <div id="sheetHandle"></div>
                <div id="transitPanel"></div>
            </div>
        </section>`;

  document.getElementById("routeBackBtn").onclick = () => {
    history.back(); // 단순 뒤로가기 OR 필요하면 loadUserSeeAll 호출
    import("./user_seeall.js").then((m) => m.loadUserSeeAll());
    document.getElementById("tabbar").style.display = "flex";
  };

  // 🔥 User 안의 place 이름 → Places에서 데이터 가져오기
  const placeData = await fetchPlacesByNames(user.images);
  console.log("👉 변환된 placeData:", placeData);

  await loadKakaoMap();
  await initRouteMap(placeData);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const panel = document.getElementById("transitPanel");
      console.log("AFTER RENDER HEIGHT:", panel.scrollHeight);
      enableBottomSheetDrag();
    });
  });

  const bs = document.getElementById("bottomSheet");
  console.log("bottomSheet:", bs);

  if (bs) {
    console.log("offsetHeight:", bs.offsetHeight);
  } else {
    console.log("❌ bottomSheet 없음 (지금 화면이 아님)");
  }

  const h = document.getElementById("sheetHandle");
  console.log("sheetHandle:", h);

  if (h) {
    console.log("handle offsetHeight:", h.offsetHeight);
    console.log("handle computed height:", getComputedStyle(h).height);
  }

  setTimeout(() => {
    window.scrollTo(0, 0);
  }, 0);
}

async function fetchPlacesByNames(names) {
  const places = [];

  for (const name of names) {
    const q = query(collection(db, "Places"), where("name", "==", name));
    const snap = await getDocs(q);

    if (!snap.empty) {
      places.push(snap.docs[0].data());
    }
  }

  return places;
}

async function initRouteMap(places) {
  if (places.length === 0) return;

  const first = places[0];

  const map = new kakao.maps.Map(document.getElementById("map"), {
    center: new kakao.maps.LatLng(first.lat, first.lng),
    level: 5,
  });

  places.forEach((p) => {
    if (!p.lat || !p.lng) return;

    const imageUrl = p.image_url; // map.js와 동일하게 이미지 사용

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

    const markerEl = wrapper.firstElementChild;
    markerEl.style.cursor = "pointer";

    markerEl.addEventListener("click", () => {
      sessionStorage.setItem("backTo", "route_map");
      import("./detail.js").then((m) => m.loadPlaceDetailPage(p.name));
    });

    const overlay = new kakao.maps.CustomOverlay({
      map,
      position: new kakao.maps.LatLng(p.lat, p.lng),
      content: markerEl,
      yAnchor: 1,
    });
  });

  // 선 그리기
  for (let i = 0; i < places.length - 1; i++) {
    const start = places[i];
    const end = places[i + 1];

    await new Promise((res) => setTimeout(res, 300));

    await window.wakePromise;

    const data = await getTmapRoute(
      { lat: start.lat, lng: start.lng, name: start.name },
      { lat: end.lat, lng: end.lng, name: end.name }
    );

    const lines = extractPolylines(data);

    lines.forEach((coords) => {
      drawPolyline(map, coords, "#2979FF");
    });
  }

  // 모든 마커 포함하는 boundary 자동 맞추기
  const bounds = new kakao.maps.LatLngBounds();
  places.forEach((p) => bounds.extend(new kakao.maps.LatLng(p.lat, p.lng)));
  map.setBounds(bounds);

  renderTransitPanel(places);
}

function enableBottomSheetDrag() {
  const sheet = document.getElementById("bottomSheet");
  const panel = document.getElementById("transitPanel");
  const handle = document.getElementById("sheetHandle");

  if (!sheet || !panel) return;

  let startY = 0;
  let startHeight = 0;
  let isDragging = false;

  const MIN_HEIGHT = 140;
  const MAX_HEIGHT = window.innerHeight * 0.5;

  sheet.style.height = MIN_HEIGHT + "px";
  panel.style.overflowY = "hidden";

  const startDrag = (clientY) => {
    isDragging = true;
    startY = clientY;
    startHeight = sheet.offsetHeight;

    sheet.style.transition = "none";

    // 모바일
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", endDrag);

    // PC
    window.addEventListener("mousemove", onMoveMouse);
    window.addEventListener("mouseup", endDragMouse);
  };

  const onMove = (e) => {
    if (!isDragging) return;
    const clientY = e.touches[0].clientY;
    updateDrag(clientY, e);
  };

  const onMoveMouse = (e) => {
    if (!isDragging) return;
    updateDrag(e.clientY, e);
  };

  const updateDrag = (clientY, e) => {
    const diff = startY - clientY;

    let newHeight = startHeight + diff;
    if (newHeight < MIN_HEIGHT) newHeight = MIN_HEIGHT;
    if (newHeight > MAX_HEIGHT) newHeight = MAX_HEIGHT;

    if (e.cancelable) e.preventDefault();
    sheet.style.height = newHeight + "px";
  };

  const endDrag = () => {
    finishDrag();
    window.removeEventListener("touchmove", onMove);
    window.removeEventListener("touchend", endDrag);
  };

  const endDragMouse = () => {
    finishDrag();
    window.removeEventListener("mousemove", onMoveMouse);
    window.removeEventListener("mouseup", endDragMouse);
  };

  const finishDrag = () => {
    isDragging = false;
    sheet.style.transition = "height 0.25s ease";

    const current = sheet.offsetHeight;
    const snapPoint = (MIN_HEIGHT + MAX_HEIGHT) / 2;

    const finalHeight = current < snapPoint ? MIN_HEIGHT : MAX_HEIGHT;
    sheet.style.height = finalHeight + "px";

    panel.style.overflowY = finalHeight === MAX_HEIGHT ? "auto" : "hidden";
  };

  // --------------------------
  // sheet 전체 드래그 (모바일)
  // --------------------------
  sheet.addEventListener("touchstart", (e) => {
    const target = e.target;

    if (panel.contains(target) && sheet.offsetHeight >= MAX_HEIGHT - 1) return;

    if (panel.contains(target) && panel.scrollTop === 0) {
      startDrag(e.touches[0].clientY);
      return;
    }

    startDrag(e.touches[0].clientY);
  });

  // --------------------------
  // sheet 전체 드래그 (PC)
  // --------------------------
  sheet.addEventListener("mousedown", (e) => {
    const target = e.target;

    if (panel.contains(target) && sheet.offsetHeight >= MAX_HEIGHT - 1) return;

    if (panel.contains(target) && panel.scrollTop === 0) {
      startDrag(e.clientY);
      return;
    }

    startDrag(e.clientY);
  });

  // handle은 항상 drag 가능
  handle.addEventListener("touchstart", (e) => {
    startDrag(e.touches[0].clientY);
    e.stopPropagation();
  });

  handle.addEventListener("mousedown", (e) => {
    startDrag(e.clientY);
    e.stopPropagation();
  });
}



// detail.js의 길 안내
export async function loadRouteMapScreen() {
  const content = document.getElementById("content");

  content.innerHTML = `
        <div id="routeMap" style="width:100%; height:100vh;"></div>
    `;

  // ⭐ detail.js에서 전달된 목적지 정보
  const target = JSON.parse(sessionStorage.getItem("route_target"));
  if (!target) {
    alert("경로 대상 정보가 없습니다.");
    return;
  }

  await loadKakaoMap();

  // ⭐ 현재 위치가 준비되어 있는지 체크
  if (!userLocation || !userLocation.lat || !userLocation.lng) {
    alert("현재 위치 정보를 불러오지 못했습니다.");
    return;
  }

  // 지도 생성
  const map = new kakao.maps.Map(document.getElementById("routeMap"), {
    center: new kakao.maps.LatLng(userLocation.lat, userLocation.lng),
    level: 4,
  });

  await window.wakePromise;

  // ⭐ Render 서버로 경로 요청
  const res = await fetch("https://dtrip.onrender.com/api/route", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      startX: userLocation.lng,
      startY: userLocation.lat,
      endX: target.lng,
      endY: target.lat,
      startname: "현재 위치",
      endname: target.name,
    }),
  });

  const data = await res.json();
  console.log("🚀 Tmap 경로 응답:", data);

  if (!data.features) {
    alert("경로 데이터를 받아오지 못했습니다.");
    return;
  }

  // ⭐ Tmap → Kakao 좌표 변환 후 폴리라인 생성
  const path = [];
  data.features.forEach((item) => {
    if (item.geometry.type === "LineString") {
      item.geometry.coordinates.forEach((coord) => {
        path.push(new kakao.maps.LatLng(coord[1], coord[0]));
      });
    }
  });

  const polyline = new kakao.maps.Polyline({
    map: map,
    path: path,
    strokeWeight: 5,
    strokeColor: "#346beb",
    strokeOpacity: 0.9,
  });

  //⭐ 경로 전체 보이도록 지도 범위 조정
  const bounds = new kakao.maps.LatLngBounds();
  path.forEach((p) => bounds.extend(p));
  map.setBounds(bounds);
}
