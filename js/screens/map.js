// js/screens/map.js
import { db } from "../database/firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { userLocation } from "../app.js";
import { startBusTracking } from "../components/busTracker.js";
import { loadRoutePathAndFocus } from "../components/busRoute.js";

// 지도 화면 생성
export async function loadMapScreen() {
  const content = document.getElementById("content");

  content.innerHTML = `
        <div id="map" style="width:100%; height:844px;"></div>
    `;

  await loadKakaoMap();
  initMapWithUserLocation();
  // loadRoutes();

  // const demoRouteId = "30300001"; // 예시용 (ROUTE_CD 8자리)
  // startBusTracking(demoRouteId);
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
    center: new kakao.maps.LatLng(lat, lng),
    level: 4
  });

  // 2. 현재 위치 마커 추가
  if (userLocation) {
    new kakao.maps.Marker({
      position: new kakao.maps.LatLng(lat, lng),
      map,
    });
  }

  // 3. 기기 위치 불러오기
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        const currentPos = new kakao.maps.LatLng(lat, lng);

        // 4. 지도 중심을 현재 위치로 변경
        map.setCenter(currentPos);

        // (선택) 말풍선
        // const infowindow = new kakao.maps.InfoWindow({
        //   content: '<div style="padding:6px;">현재 위치</div>'
        // });
        // infowindow.open(map, marker);
      },
      (err) => {
        console.warn("위치 정보를 가져올 수 없음:", err);
      }
    );
  } else {
    alert("이 브라우저는 위치 서비스를 지원하지 않습니다.");
  }
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
