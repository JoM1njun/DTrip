export function extractPolylines(data) {
    if (!data || !data.features) {
        console.error("❌ Tmap 응답에 features가 없습니다:", data);
        return [];
    }

    return data.features
        .filter(f => f.geometry.type === "LineString")
        .map(f => f.geometry.coordinates);
}
