// js/screens/map.js
import { db } from "../database/firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { userLocation } from "../app.js";

let busMarkers = [];
let routePolyline = null;
let busTimer = null;

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
async function loadKakaoMap() {
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

// // 노선 ID 등 xml 파일 출력
// async function loadRoutes() {
//   const xmlText = await fetch("http://localhost:3000/api/routes")
//     .then(res => res.text());

//   const parser = new DOMParser();
//   const xml = parser.parseFromString(xmlText, "text/xml");

//   const items = xml.getElementsByTagName("itemList");

//   routeList = [];

//   for (let i = 0; i < items.length; i++) {
//     const routeId = items[i].getElementsByTagName("routeId")[0].textContent;
//     const routeNo = items[i].getElementsByTagName("routeNo")[0].textContent;

//     routeList.push({ routeId, routeNo });
//   }

//   console.log(routeList);

//   // 화면에 리스트 출력 (옵션)
//   // renderRouteButtons(routeList);
// }



// // 버스 노선 경로 불러오기
// async function loadRoutePath(routeId) {
//   const url = `${BASE}/busRouteInfo/getStaionByRoute?serviceKey=${KEY}&busRouteId=${routeId}`;

//   const res = await fetch(url);
//   const text = await res.text();

//   const xml = new DOMParser().parseFromString(text, "text/xml");
//   const items = xml.getElementsByTagName("item");

//   routePath = [];
//   for (let i = 0; i < items.length; i++) {
//     let lat = parseFloat(items[i].getElementsByTagName("GPS_LATI")[0].textContent);
//     let lng = parseFloat(items[i].getElementsByTagName("GPS_LONG")[0].textContent);
//     routePath.push(new kakao.maps.LatLng(lat, lng));
//   }

//   drawPolyline(routePath);
// }


// function startBusTracking(routeId) {
//   if (busTimer) clearInterval(busTimer);

//   // 최초 1회
//   fetchBusPositions(routeId);

//   // 10초 단위로 갱신
//   busTimer = setInterval(() => {
//     fetchBusPositions(routeId);
//   }, 10000);
// }

// async function fetchBusPositions(routeId) {
//   try {
//     const BASE_URL = "http://localhost:3000/api";
//     const url = `${BASE_URL}/busposinfo/getBusPosByRtid?serviceKey=${SERVICE_KEY}&busRouteId=${routeId}`;

//     const res = await fetch(url);
//     const text = await res.text();

//     const parser = new DOMParser();
//     const xml = parser.parseFromString(text, "text/xml");

//     const headerCd = xml.getElementsByTagName("headerCd")[0]?.textContent;
//     if (headerCd !== "0") {
//       console.warn("버스 위치 API 에러:", headerCd);
//       return;
//     }

//     // item, itemList 등 실제 구조에 따라 변경 필요 (보통 item 태그 다수)
//     const items =
//       xml.getElementsByTagName("item") ||
//       xml.getElementsByTagName("itemList");

//     const buses = [];
//     for (let i = 0; i < items.length; i++) {
//       const it = items[i];

//       const lat = parseFloat(it.getElementsByTagName("GPS_LATI")[0]?.textContent);
//       const lng = parseFloat(it.getElementsByTagName("GPS_LONG")[0]?.textContent);
//       const routeCd = it.getElementsByTagName("ROUTE_CD")[0]?.textContent;
//       const dir = it.getElementsByTagName("DIR")[0]?.textContent; // 0 상행, 1 하행
//       const busNodeId = it.getElementsByTagName("BUS_NODE_ID")[0]?.textContent;

//       if (!lat || !lng) continue;

//       buses.push({ lat, lng, routeCd, dir, busNodeId });
//     }

//     drawBusMarkers(buses);
//   } catch (err) {
//     console.error("버스 위치 조회 실패:", err);
//   }
// }

// function drawBusMarkers(buses) {
//   // 이전 버스 마커 제거
//   busMarkers.forEach((m) => m.setMap(null));
//   busMarkers = [];

//   buses.forEach((bus) => {
//     const marker = new kakao.maps.Marker({
//       map,
//       position: new kakao.maps.LatLng(bus.lat, bus.lng),
//       image: new kakao.maps.MarkerImage(
//         "assets/icons/bus_blue.png",
//         new kakao.maps.Size(28, 28)
//       ),
//     });

//     // 마커 클릭 → 노선 + 움직임 표시
//     kakao.maps.event.addListener(marker, "click", () => {
//       showRouteForBus(bus);
//     });

//     busMarkers.push(marker);
//   });
// }

