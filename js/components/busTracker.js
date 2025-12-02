import { drawBusMarkers, updateBusPositions } from "./busMarker.js"

let tracker = null;

// 버스 데이터 받는 간격
// 수정 완
export function startBusTracking(routeId, map) {
    if (tracker) clearInterval(tracker);

    fetchBusData(routeId).then(data => {
        drawBusMarkers(data, map);
    });

    tracker = setInterval(async () => {
        let newData = await fetchBusData(routeId);
        updateBusPositions(newData, map);
    }, 5000);
}

// 버스 위치 가져오기
// 수정 완
export async function fetchBusPositions(routeId) {
  const url = `http://localhost:3000/api/busPositions?routeId=${routeId}`;
  const xmlText = await fetch(url).then(res => res.text());

  const xml = new DOMParser().parseFromString(xmlText, "text/xml");
  const items = xml.getElementsByTagName("item");

  const buses = [];

  for (let i = 0; i < items.length; i++) {
    buses.push({
      lat: parseFloat(items[i].getElementsByTagName("GPS_LATI")[0].textContent),
      lng: parseFloat(items[i].getElementsByTagName("GPS_LONG")[0].textContent),
      busNo: items[i].getElementsByTagName("plainNo")[0].textContent
    });
  }

  drawBusMarkers(buses);
}