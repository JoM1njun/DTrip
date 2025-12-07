import { loadKakaoMap } from "./map.js"
import { db } from "../database/firebase.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { getTmapRoute, getTransitRoute } from "../components/TmapAPI.js";
import { extractPolylines } from "../components/transitParser.js";
import { drawPolyline, getColorByMode } from "../components/Polyline.js";
import { renderTransitPanel } from "../components/transitUI.js";
import { userLocation } from "../app.js";


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
    content.innerHTML =
        `
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
        import("./user_seeall.js").then(m => m.loadUserSeeAll());
        document.getElementById("tabbar").style.display = "flex";
    };

    await loadKakaoMap();
    // DOM 렌더 보장
    await new Promise(res => requestAnimationFrame(() => {
        requestAnimationFrame(res);
    }));

    // 🔥 User 안의 place 이름 → Places에서 데이터 가져오기
    const placeData = await fetchPlacesByNames(user.images);
    console.log("👉 변환된 placeData:", placeData);

    initRouteMap(placeData);

    enableBottomSheetDrag();

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
        level: 5
    });

    places.forEach(p => {
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
            import("./detail.js").then(m => m.loadPlaceDetailPage(p.name));
        });

        const overlay = new kakao.maps.CustomOverlay({
            map,
            position: new kakao.maps.LatLng(p.lat, p.lng),
            content: markerEl,
            yAnchor: 1
        });
    });

    // 선 그리기
    for (let i = 0; i < places.length - 1; i++) {
        const start = places[i];
        const end = places[i + 1];

        await new Promise(res => setTimeout(res, 300));

        const data = await getTmapRoute(
            { lat: start.lat, lng: start.lng, name: start.name },
            { lat: end.lat, lng: end.lng, name: end.name }
        );

        const lines = extractPolylines(data);

        lines.forEach(coords => {
            drawPolyline(map, coords, "#2979FF");
        });
    }

    // 모든 마커 포함하는 boundary 자동 맞추기
    const bounds = new kakao.maps.LatLngBounds();
    places.forEach(p => bounds.extend(new kakao.maps.LatLng(p.lat, p.lng)));
    map.setBounds(bounds);

    renderTransitPanel(places);
}

function enableBottomSheetDrag() {
    const sheet = document.getElementById("bottomSheet");
    const handle = document.getElementById("sheetHandle");

    if (!sheet || !handle) {
        console.warn("❌ bottomSheet 또는 sheetHandle을 찾지 못했습니다.");
        return;
    }

    let startY = 0;
    let currentY = 0;
    let sheetY = 0; // 현재 translateY 값

    const sheetHeight = window.innerHeight * 0.25; // 25vh
    const MAX_UP = window.innerHeight * 0.75;   // 위로 20%
    const MAX_DOWN = window.innerHeight - sheetHeight; // 아래로 60%

    // 초기 위치 (조금 내려와 있게)
    sheet.style.transition = "transform 0.25s ease";
    sheet.style.transform = `translateY(${MAX_DOWN}px)`;

    const onTouchStart = (e) => {
        startY = e.touches[0].clientY;
        const match = sheet.style.transform.match(/translateY\(([-0-9.]+)px\)/);
        sheetY = match ? parseFloat(match[1]) : 0;
    };
    const onTouchMove = (e) => {
        currentY = e.touches[0].clientY;
        const diff = currentY - startY;

        let newY = sheetY + diff;

        // 범위 제한
        newY = Math.max(MAX_UP, Math.min(MAX_DOWN, newY));

        sheet.style.transition = "none";
        sheet.style.transform = `translateY(${newY}px)`;
    };

    const onTouchEnd = (e) => {
        sheet.style.transition = "transform 0.25s ease";

        const match = sheet.style.transform.match(/translateY\(([-0-9.]+)px\)/);
        const finalY = match ? parseFloat(match[1]) : 0;

        // 스냅 기준은 중앙
        const mid = (MAX_UP + MAX_DOWN) / 2;

        // 스냅 기준은 중앙
        if (finalY < mid) {
            sheet.style.transform = `translateY(${MAX_UP}px)`;  // 위로 스냅
        } else {
            sheet.style.transform = `translateY(${MAX_DOWN}px)`; // 아래로 스냅
        }
    };

    handle.addEventListener("touchstart", onTouchStart);
    handle.addEventListener("touchmove", onTouchMove);
    handle.addEventListener("touchend", onTouchEnd);
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
        level: 4
    });

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
            endname: target.name
        })
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
        strokeOpacity: 0.9
    });

    //⭐ 경로 전체 보이도록 지도 범위 조정
    const bounds = new kakao.maps.LatLngBounds();
    path.forEach(p => bounds.extend(p));
    map.setBounds(bounds);
}
