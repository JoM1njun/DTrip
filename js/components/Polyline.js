export function drawPolyline(map, coords, color) {
    const path = coords.map(([lng, lat]) => new kakao.maps.LatLng(lat, lng));

    return new kakao.maps.Polyline({
        path,
        strokeWeight: 5,
        strokeColor: color,
        strokeOpacity: 0.9,
        strokeStyle: "solid",
        map
    });
}

export function getColorByMode(mode) {
    if (mode === "WALK") return "#777777";
    if (mode === "BUS") return "#2979FF";
    if (mode === "SUBWAY") return "#00C853";
    return "#000000";
}
