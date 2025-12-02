export function updateBusPositions(newData, map) {
    newData.forEach(newBus => {
        const target = busMarkers.find(x => x.bus.busNo === newBus.busNo);
        if (!target) return;

        const newPos = new kakao.maps.LatLng(newBus.lat, newBus.lng);

        // 🔥 부드러운 이동 (LERP)
        smoothMove(target.overlay, newPos, map);

        // 데이터도 갱신
        target.bus = newBus;
    });
}


// CustomOverlay 객체 저장용
export let busMarkers = [];

// 버스 마커 그리기
// 수정 중
export function drawBusMarkers(buses) {
    busMarkers.forEach(b => b.setMap(null));
    busMarkers = [];

    buses.forEach(bus => {
        const color = getLineColor(bus.routeType); 
        // 예: 간선 = 파랑, 지선 = 초록 등

        const content = `
            <div class="bus-box" style="background: ${color}">
            ${bus.busNo}
            </div>
        `;

        const overlay = new kakao.maps.CustomOverlay({
            position: new kakao.maps.LatLng(bus.lat, bus.lng),
            content,
            map: map,
            yAnchor: 1.0
        });

        // 클릭 시 노선 표시
        kakao.maps.event.addListener(overlay, "click", () => {
            loadRoutePathAndFocus(bus);
        });

        busMarkers.push(overlay);
    });
}

// 버스 노선별 색상
export function getLineColor(type) {
    switch (type) {
        case "간선": return "#0082FC"; // 파랑
        case "지선": return "#21B42B"; // 초록
        case "급행": return "#e60012"; // 주황
        case "마을": return "#21B42B"; // 보라
        default: return "#555";        // 기본 회색
    }
}

export function smoothMove(overlay, targetPos, map) {
    const startPos = overlay.getPosition();

    const steps = 20; // 단계 수
    let count = 0;

    const move = setInterval(() => {
        count++;

        // 보간(LERP)
        const lat = startPos.getLat() + (targetPos.getLat() - startPos.getLat()) * (count / steps);
        const lng = startPos.getLng() + (targetPos.getLng() - startPos.getLng()) * (count / steps);

        overlay.setPosition(new kakao.maps.LatLng(lat, lng));

        if (count >= steps) {
            clearInterval(move);
        }
    }, 30);
}
