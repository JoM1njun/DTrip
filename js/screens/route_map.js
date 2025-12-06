import { loadKakaoMap } from "./map.js"
import { db } from "../database/firebase.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { getTransitRoute } from "../components/TmapAPI.js";
import { extractPolylines } from "../components/transitParser.js";
import { drawPolyline, getColorByMode } from "../components/Polyline.js";


export async function loadUserRouteMap(user) {
    const content = document.getElementById("content");
    console.log("👉 전달된 user:", user);

    // 헤더/카테고리 숨기기
    document.querySelector("header").style.display = "none";
    document.querySelector("#categoryContainer").style.display = "none";
    document.querySelector("#tagContainer").style.display = "none";
    document.getElementById("tabbar").style.display = "none";

    content.innerHTML = "";
    content.innerHTML =
        `<section id="routeContainer" class="route-container">
        <div class="route-header">
            <p>${user.name}님의 경로</p>
            <button id="routeBackBtn" class="back-btn">
                <img src="assets/icons/back.svg" />
            </button>
        </div>
            <div id="map"></div>
        </section>`;

    document.getElementById("routeBackBtn").onclick = () => {
        history.back(); // 단순 뒤로가기 OR 필요하면 loadUserSeeAll 호출
        import("./user_seeall.js").then(m => m.loadUserSeeAll());
        document.getElementById("tabbar").style.display = "flex";
    };

    await loadKakaoMap();
    // DOM 렌더 보장
    await new Promise(res => requestAnimationFrame(res));

    // 🔥 User 안의 place 이름 → Places에서 데이터 가져오기
    const placeData = await fetchPlacesByNames(user.images);
    console.log("👉 변환된 placeData:", placeData);

    initRouteMap(placeData);

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
        // 마커 표시
        new kakao.maps.Marker({
            map,
            position: new kakao.maps.LatLng(p.lat, p.lng)
        });
    });

    // 선 그리기
    for (let i = 0; i < places.length - 1; i++) {
        const start = places[i];
        const end = places[i + 1];

        await new Promise(res => setTimeout(res, 300));

        const data = await getTransitRoute(
            { lat: start.lat, lng: start.lng },
            { lat: end.lat, lng: end.lng }
        );

        const lines = extractPolylines(data);

        lines.forEach(line => {
            const color = getColorByMode(line.mode);
            drawPolyline(map, line.coords, color);
        });
    }

    // 모든 마커 포함하는 boundary 자동 맞추기
    const bounds = new kakao.maps.LatLngBounds();
    places.forEach(p => bounds.extend(new kakao.maps.LatLng(p.lat, p.lng)));
    map.setBounds(bounds);
}

