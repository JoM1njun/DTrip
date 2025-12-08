// mode → 아이콘
function getModeIcon(mode) {
  if (mode === "WALK")
    return `<img src="assets/route/walk.svg" class="mode-icon"/>`;
  if (mode === "BUS")
    return `<img src="assets/route/bus.svg" class="mode-icon"/>`;
  if (mode === "SUBWAY") return "🚇";
  return "➡️";
}

async function getSavedTransit(from, to) {
  const url = `https://dtrip.onrender.com/api/transit-get?from=${encodeURIComponent(
    from
  )}&to=${encodeURIComponent(to)}`;

  const res = await fetch(url);
  const data = await res.json();

  return data; // { result: {...}, createdAt: ... }
}

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

    const saved = await getSavedTransit(start.name, end.name);
    let parsed;

    try {
      if (saved?.result) {
        console.log("📦 DB에서 캐시된 경로 사용");
        parsed = saved.result;
      } else {
        console.log("🌐 DB에 없어서 서버에 새로 요청");

        const res = await fetch(
          "https://dtrip.onrender.com/api/transit-cached-parsed",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              startName: start.name,
              endName: end.name,
            }),
          }
        );
        parsed = await res.json();
      }

      // 🔥🔥🔥 여기 두 줄 추가
      console.log("parsed:", parsed);
      console.log("parsed.segments:", parsed?.segments);

      if (parsed?.legs) {
        parsed.index = i + 1;
        parsed.from = parsed.from ?? start.name;
        parsed.to = parsed.to ?? end.name;
        parsed.totalTimeMin =
          parsed.totalTimeMin ??
          parsed.legs.reduce((a, l) => a + (l.timeMin ?? 0), 0);
        parsed.totalFare = parsed.totalFare ?? 0;

        segments.push(parsed); // 🔥 이제 제대로 된 segment 구조가 들어간다
      } else {
        // 🔥 legs 없음 → fallback 생성
        console.warn("⚠️ legs 없음 → fallback 사용");

        const fallback = createWalkFallback(start, end);
        fallback.index = i + 1;
        fallback.from = start.name;
        fallback.to = end.name;

        segments.push(fallback);
      }
    } catch (err) {
      console.error("🚨 Transit API 오류:", err);
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
