import { startBusTracking } from "./busTracker.js"

// 버스 노선 표시
// 수정 완
export function drawRoutePolyline(path) {
  if (routePolyline) routePolyline.setMap(null);

  routePolyline = new kakao.maps.Polyline({
    map,
    path,
    strokeWeight: 5,
    strokeColor: "#0066ff",
    strokeOpacity: 0.9,
  });
}

// // 버스 노선 경로 불러오기
// 수정 완
export async function loadRoutePath(routeId) {
  const url = `http://localhost:3000/api/routePath?routeId=${routeId}`;
  const xmlText = await fetch(url).then(res => res.text());
  const xml = new DOMParser().parseFromString(text, "text/xml");
  const items = xml.getElementsByTagName("item");

  routePath = [];

  for (let i = 0; i < items.length; i++) {
    let lat = parseFloat(items[i].getElementsByTagName("GPS_LATI")[0].textContent);
    let lng = parseFloat(items[i].getElementsByTagName("GPS_LONG")[0].textContent);
    routePath.push(new kakao.maps.LatLng(lat, lng));
  }

  drawPolyline(routePath);
}

// 버스 클릭 시 노선과 위치 표시
// 수정 완
export async function loadRoutePathAndFocus(bus) {
  await loadRoutePath(bus.routeCd);

  // 노선 중심으로 이동
  map.setCenter(new kakao.maps.LatLng(bus.lat, bus.lng));

  // 클릭한 버스의 routeId로 추적 시작
  startBusTracking(bus.routeCd);
}
