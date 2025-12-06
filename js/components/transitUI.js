import { getTransitRoute } from "./TmapAPI.js";
import { parseTransitItinerary } from "./transitParser.js";

// mode → 아이콘
function getModeIcon(mode) {
    if (mode === "WALK") return "🚶‍♂️";
    if (mode === "BUS") return "🚌";
    if (mode === "SUBWAY") return "🚇";
    return "➡️";
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

    // 연속된 장소 쌍마다 대중교통 경로 요청
    for (let i = 0; i < places.length - 1; i++) {
        const start = places[i];
        const end = places[i + 1];

        try {
            // 너무 많이 호출되지 않도록 약간 딜레이
            await new Promise(r => setTimeout(r, 400));

            const raw = await getTransitRoute(
                { lat: start.lat, lng: start.lng, name: start.name },
                { lat: end.lat, lng: end.lng, name: end.name }
            );

            const parsed = parseTransitItinerary(raw);
            if (!parsed) continue;

            segments.push({
                index: i + 1,
                from: start.name,
                to: end.name,
                ...parsed
            });
        } catch (err) {
            console.error("❌ 대중교통 경로 요청 실패:", err);
        }
    }

    if (segments.length === 0) {
        panel.innerHTML = "<p>표시할 대중교통 경로가 없습니다.</p>";
        return;
    }

    // HTML 렌더
    panel.innerHTML = segments
        .map(seg => {
            return `
      <div class="transit-item">
        <div class="transit-header">
          <div class="transit-header-left">
            <div class="transit-number">${seg.index}. ${seg.from} → ${seg.to}</div>
            <div class="transit-summary">
              총 시간: 약 ${seg.totalTimeMin}분 · 요금: ${seg.totalFare.toLocaleString()}원
            </div>
          </div>
          <button class="transit-toggle-btn">▼</button>
        </div>

        <div class="transit-body">
          ${seg.legs
                    .map(
                        leg => `
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

    // 아코디언(슬라이드 업/다운) 이벤트 바인딩
    panel.addEventListener("click", e => {
        const header = e.target.closest(".transit-header");
        if (!header) return;

        const item = header.closest(".transit-item");
        if (!item) return;

        item.classList.toggle("open");
    });
}
