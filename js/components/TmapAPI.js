export async function getTransitRoute(start, end) {
    const response = await fetch("https://dtrip.onrender.com/api/transit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            startX: start.lng,
            startY: start.lat,
            endX: end.lng,
            endY: end.lat
        })
    });

    if (!response.ok) {
        console.error("❌ 서버 응답 에러:", res.status, res.statusText);
        throw new Error("서버 에러");
    }

    return await response.json();
}
