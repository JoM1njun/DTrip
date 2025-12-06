export async function getTransitRoute(payload) {
    console.log("📌 Sending coords to server:", payload);

    const response = await fetch("https://dtrip.onrender.com/api/transit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        console.error("❌ 서버 응답 에러:", response.status, response.statusText);
        throw new Error("서버 에러");
    }

    return await response.json();
}

export async function getTmapRoute(start, end) {
    console.log("📌 Sending coords to server:", start, end);

    const payload = {
        startX: String(start.lng),
        startY: String(start.lat),
        endX: String(end.lng),
        endY: String(end.lat),
        startName: start.name ?? "출발지",
        endName: end.name ?? "도착지",
        reqCoordType: "WGS84GEO",
        resCoordType: "WGS84GEO"
    };

    const response = await fetch("https://dtrip.onrender.com/api/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        console.error("❌ 서버 응답 에러:", response.status, response.statusText);
        throw new Error("서버 에러");
    }

    return await response.json();
}

