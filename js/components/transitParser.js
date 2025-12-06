export function extractPolylines(data) {
    if (!data || !data.features) {
        console.error("❌ Tmap 응답에 features가 없습니다:", data);
        return [];
    }

    return data.features
        .filter(f => f.geometry?.type === "LineString")
        .map(f => f.geometry.coordinates);
}


// Tmap 대중교통 응답에서 한 개 경로(itinerary)만 추출해서
// UI에 쓰기 좋은 형태로 변환
export function parseTransitItinerary(data) {
    const plan = data?.metaData?.plan;
    if (!plan || !plan.itineraries || plan.itineraries.length === 0) {
        console.warn("⚠ 대중교통 경로 없음:", data);
        return null;
    }

    const it = plan.itineraries[0]; // 일단 첫번째 경로만 사용

    const totalTimeMin = Math.round((it.totalTime || 0) / 60);
    const totalFare =
        it.fare?.regular?.totalFare ??
        it.fare?.regular ??
        it.fare?.totalFare ??
        0;

    const legs = (it.legs || []).map(leg => {
        const mode = leg.mode; // WALK, BUS, SUBWAY...
        const timeMin = Math.round((leg.sectionTime || 0) / 60);
        const distanceM = leg.distance || 0;

        // 버스/지하철 이름
        let title = "";
        let sub = "";

        if (mode === "WALK") {
            title = `도보 ${timeMin}분`;
            sub = `${distanceM}m 이동`;
        } else if (mode === "BUS") {
            const route = leg.route || leg.routeNo || leg.busNo;
            const startName = leg.start?.name || "탑승";
            const endName = leg.end?.name || "하차";
            title = `버스 ${route} 탑승`;
            sub = `${startName} → ${endName}, 약 ${timeMin}분`;
        } else if (mode === "SUBWAY") {
            const lane = leg.lane?.name || leg.route;
            const startName = leg.start?.name || "승차역";
            const endName = leg.end?.name || "하차역";
            title = `지하철 ${lane}`;
            sub = `${startName} → ${endName}, 약 ${timeMin}분`;
        } else {
            title = `${mode || "기타 이동"} ${timeMin}분`;
            sub = `${distanceM}m`;
        }

        return {
            mode,
            timeMin,
            distanceM,
            title,
            sub
        };
    });

    return {
        totalTimeMin,
        totalFare,
        legs
    };
}
