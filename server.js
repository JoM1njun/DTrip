import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import { db } from "./firebaseAdmin.js";
import { parseTransitItinerary } from "./transitParserServer.js";
//import { doc, getDoc, setDoc } from "firebase-admin/firestore";


const TMAP_KEY = process.env.TMAP_KEY;
const app = express();
app.use(cors());
app.use(express.json());

// const SERVICE_KEY = "9152a33db8805474901b834fd11ad3fe3a2e69a432d7468eee1fde7afe57de2d";
//const SERVICE_KEY = encodeURIComponent("36781dec23b439f774a5a628c913a453ef964b60b0e1aacf8b8ff7fdec8cee3f");
const PORT = process.env.PORT || 10000;


// app.get("/api/routes", async (req, res) => {
//   const { cityCode, routeId } = req.query;
//   const url =
//     `https://apis.data.go.kr/1613000/BusRouteInfoInqireService/getRouteInfoIem?serviceKey=${SERVICE_KEY}` +
//     `&_type=xml` +
//     `&cityCode=${cityCode}` +
//     `&routeId=${routeId}`;

//   try {
//     const response = await fetch(url);
//     const xml = await response.text();
//     res.send(xml);

//     console.log("data:", xml);
//   } catch (err) {
//     console.log("버스 API 오류: ", err);
//     res.status(500).send("Bus API Error");
//   }
// });

// app.get("/api/routePath", async (req, res) => {
//   const { routeId, cityCode } = req.query;

//   if (!routeId) {
//     return res.status(400).send("routeId is required");
//   }

//   const url =
//     `https://apis.data.go.kr/1613000/BusRouteInfoInqireService/getRoutePathIem?serviceKey=${SERVICE_KEY}` +
//     `&_type=xml` +
//     `&cityCode=${cityCode}` +
//     `&routeId=${routeId}`;

//   try {
//     const response = await fetch(url);
//     const xmlText = await response.text();
//     res.send(xmlText);
//   } catch (err) {
//     console.error("노선 API 오류:", err);
//     res.status(500).send("Route API Error");
//   }
// });

// ===============================
// 3) 실시간 버스 위치
// ===============================
// app.get("/api/busPositions", async (req, res) => {
//   const { routeId, cityCode } = req.query;

//   if (!routeId) {
//     return res.status(400).send("routeId is required");
//   }

//   const url =
//     `https://apis.data.go.kr/1613000/BusLcInfoInqireService/getRouteAcctoBusLcList` +
//     `?serviceKey=${SERVICE_KEY}` +
//     `&cityCode=${cityCode}` +
//     `&routeId=${routeId}`;

//   try {
//     const response = await fetch(url);
//     const xmlText = await response.text();
//     res.send(xmlText);

//     console.log("버스 위치 응답:", xmlText);
//   } catch (err) {
//     console.error("버스 위치 API 오류:", err);
//     res.status(500).send("Bus Position API Error");
//   }
// });

// Tmap 대중교통 & Polyline API
// app.post("/api/transit", async (req, res) => {
//   const { startX, startY, endX, endY } = req.body;

//   console.log("🔥 Received Body:", req.body);
//   console.log("TMAP_KEY:", TMAP_KEY);
//   console.log("🔥 Received coords:", {
//     startX, startY, endX, endY
//   });

//   // 값이 없으면 바로 에러 반환 (디버깅용)
//   if (
//     startX === undefined ||
//     startY === undefined ||
//     endX === undefined ||
//     endY === undefined
//   ) {
//     return res.status(400).json({ error: "좌표가 누락되었습니다." });
//   }

//   // 2️⃣ Tmap에 보낼 payload를 딱 문서 형식대로 구성
//   const payload = {
//     startX: String(startX),
//     startY: String(startY),
//     endX: String(endX),
//     endY: String(endY),
//     count: 3,         // 결과 3개까지
//     lang: 0,          // 한국어
//     format: "json"
//   };

//   console.log("🚀 Sending to Tmap:", payload);

//   try {
//     const response = await fetch("https://apis.openapi.sk.com/transit/routes", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "appKey": TMAP_KEY
//       },
//       body: JSON.stringify(payload)
//     });

//     const data = await response.json();

//     res.status(response.status).json(data);
//   } catch (err) {
//     console.error("Server Error:", err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

app.post("/api/route", async (req, res) => {
  const { startX, startY, endX, endY, startname, endname } = req.body;
  console.log("🔥 /api/route Received Body:", req.body);

  if (
    startX === undefined ||
    startY === undefined ||
    endX === undefined ||
    endY === undefined
  ) {
    return res.status(400).json({ error: "좌표가 누락되었습니다." });
  }

  const payload = {
    startX: String(startX),
    startY: String(startY),
    endX: String(endX),
    endY: String(endY),
    startName: startname ?? "출발지",
    endName: endname ?? "도착지",
    reqCoordType: "WGS84GEO",
    resCoordType: "WGS84GEO"
  };

  console.log("🚀 Sending to Tmap routes/pedestrian:", payload);

  try {
    const response = await fetch(
      "https://apis.openapi.sk.com/tmap/routes/pedestrian",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
          "appKey": TMAP_KEY,            // 🔥 여기 꼭 확인
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();
    console.log("📩 Tmap(route) response:", data);

    return res.status(response.status).json(data);
  } catch (err) {
    console.error("Server Error (/api/route):", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/transit-cached-parsed", async (req, res) => {
  const { startX, startY, endX, endY, startName, endName } = req.body;

  const key = `${startName}_${endName}`;
  const ref = db.collection("ParsedTransitCache").doc(key);

  // 🔥 1) 캐시 확인
  const snap = await ref.get();
  if (snap.exists) {
    console.log("📦 Parsed DB 캐시 사용됨");
    return res.json(snap.data());
  }

  // 🔥 2) 원본 Tmap 경로 호출
  const tmapResponse = await fetch("https://apis.openapi.sk.com/transit/routes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "appKey": TMAP_KEY
    },
    body: JSON.stringify({
      startX, startY, endX, endY,
      count: 3,
      lang: 0,
      format: "json"
    })
  });

  const rawJson = await tmapResponse.json();

  // 🔥 3) 서버에서 직접 파싱
  const parsed = parseTransitItinerary(rawJson);

  // 🔥 4) DB에 저장
  await ref.set({
    from: startName,
    to: endName,
    result: parsed,
    createdAt: new Date()
  });

  return res.json({ from: startName, to: endName, result: parsed });
});

app.listen(PORT, () => {
  console.log(`Proxy server running at https://dtrip.onrender.com:${PORT}`);
});
