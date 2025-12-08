import { getTransitRoute } from "./TmapAPI.js";
import { parseTransitItinerary } from "./transitParser.js";

const transitCache = {};

// mode → 아이콘
function getModeIcon(mode) {
  if (mode === "WALK")
    return `<img src="assets/route/walk.svg" class="mode-icon"/>`;
  if (mode === "BUS")
    return `<img src="assets/route/bus.svg" class="mode-icon"/>`;
  if (mode === "SUBWAY") return "🚇";
  return "➡️";
}

// Tmap API 캐싱
// async function getTransitRouteCached(start, end) {
//     const key = `${start.lat},${start.lng}_${end.lat},${end.lng}`;

//     // 이미 캐시에 저장된 경우 즉시 반환 (API 호출 없음)
//     if (transitCache[key]) {
//         console.log("📌 캐시에서 대중교통 경로 사용:", key);
//         return transitCache[key];
//     }

//     const payload = {
//         startX: start.lng,
//         startY: start.lat,
//         endX: end.lng,
//         endY: end.lat,
//         reqCoordType: "WGS84GEO",
//         resCoordType: "WGS84GEO"
//     };

//     try {
//         // API 최초 호출
//         const data = await getTransitRoute(payload);

//         // 정상 응답이면 캐싱
//         transitCache[key] = data;
//         return data;
//     } catch (err) {
//         console.error("❌ 대중교통 API 실패:", err);

//         // API 실패도 반영 (429일 때도 캐시에 넣어버려)
//         transitCache[key] = null;
//         return null;
//     }
// }

// 도보 안내 생성
function createWalkFallback(start, end) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371000; // 지구 반경(m)

  const dLat = toRad(end.lat - start.lat);
  const dLng = toRad(end.lng - start.lng);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(start.lat)) *
      Math.cos(toRad(end.lat)) *
      Math.sin(dLng / 2) ** 2;

  const distance = 2 * R * Math.asin(Math.sqrt(a));
  const timeMin = Math.max(1, Math.round(distance / 80)); // 80m/min 보행 속도

  return {
    totalTimeMin: timeMin,
    totalFare: 0,
    legs: [
      {
        mode: "WALK",
        title: "도보 이동",
        sub: `${Math.round(distance)}m 이동`,
        timeMin,
      },
    ],
  };
}

// places: [{ name, lat, lng }, ...]
export async function renderTransitPanel(places) {
  const panel = document.getElementById("transitPanel");
  if (!panel) return;

  // 구간이 1개 이하면 안내할 게 없음
  if (!places || places.length < 2) {
    panel.innerHTML = "<p>대중교통 안내를 제공할 구간이 없습니다.</p>";
    return;
  }

  const segments = [];

  for (let i = 0; i < places.length - 1; i++) {
    const start = places[i];
    const end = places[i + 1];

    try {
      await new Promise((r) => setTimeout(r, 300));

      // const raw = await getTransitRouteCached(
      //     { lat: start.lat, lng: start.lng },
      //     { lat: end.lat, lng: end.lng }
      // );
      // let parsed = parseTransitItinerary(raw);

      const res = await fetch(
        "https://dtrip.onrender.com/api/transit-cached-parsed",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            startX: start.lng,
            startY: start.lat,
            endX: end.lng,
            endY: end.lat,
            startName: start.name,
            endName: end.name,
          }),
        }
      );

      const data = await res.json();
      let parsed = data.result;

      // 🔥 fallback 적용
      if (!parsed) {
        console.warn(`⚠ 구간 ${i + 1} 경로 없음 → 도보 fallback 사용`);
        parsed = createWalkFallback(start, end);
      }

      segments.push({
        index: i + 1,
        from: start.name,
        to: end.name,
        ...parsed,
      });
    } catch (err) {
      console.error("❌ 구간 처리 중 오류:", err);
    }
  }

  // HTML 렌더
  panel.innerHTML = segments
    .map((seg) => {
      return `
      <div class="transit-item open">  <!-- 🔥 항상 open -->
        
        <div class="transit-header">
          <div class="transit-header-left">
            <div class="transit-number">${seg.index}. ${seg.from} → ${
        seg.to
      }</div>
            <div class="transit-summary">
              약 ${seg.totalTimeMin}분 · ${seg.totalFare.toLocaleString()}원
            </div>
          </div>
        </div>

        <!-- 🔥 transit-body는 항상 열린 상태 -->
        <div class="transit-body" style="max-height: none; padding: 10px 12px;">
          ${seg.legs
            .map(
              (leg) => `
            <div class="transit-step">
              <div class="transit-step-icon">${getModeIcon(leg.mode)}</div>
              <div class="transit-step-main">
                <div class="transit-step-title">${leg.title}</div>
                <div class="transit-step-sub">
                  ${leg.sub} · 약 ${leg.timeMin}분
                </div>
              </div>
            </div>
        `
            )
            .join("")}
        </div>

      </div>
    `;
    })
    .join("");

  const firstItem = panel.querySelector(".transit-item");
  if (firstItem) {
    firstItem.classList.add("open");
  }
}
