import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

const SERVICE_KEY = "9152a33db8805474901b834fd11ad3fe3a2e69a432d7468eee1fde7afe57de2d";
const PORT = 3000;

app.get("/api/routes", async (req, res) => {
  const url =
    `https://openapitraffic.daejeon.go.kr/api/rest/busRouteInfo/getBusRouteList` +
    `?serviceKey=${SERVICE_KEY}`;

  try {
    const response = await fetch(url);
    const xml = await response.text();
    res.send(xml);

    console.log("data:", xml);
  } catch (err) {
    console.log("버스 API 오류: ", err);
    res.status(500).send("Bus API Error");
  }
});

app.get("/api/routePath", async (req, res) => {
  const { routeId, cityCode } = req.query;

  if (!routeId) {
    return res.status(400).send("routeId is required");
  }

  const url =
    `https://apis.data.go.kr/1613000/BusRouteInfoInqireService/getRoutePathList` +
    `?serviceKey=${SERVICE_KEY}` +
    `&cityCode=${cityCode}` +
    `&routeId=${routeId}`;

  try {
    const response = await fetch(url);
    const xmlText = await response.text();
    res.send(xmlText);
  } catch (err) {
    console.error("노선 API 오류:", err);
    res.status(500).send("Route API Error");
  }
});

// ===============================
// 3) 실시간 버스 위치
// ===============================
app.get("/api/busPositions", async (req, res) => {
  const { routeId, cityCode } = req.query;

  if (!routeId) {
    return res.status(400).send("routeId is required");
  }

  const url =
    `https://apis.data.go.kr/1613000/BusLcInfoInqireService/getRouteAcctoBusLcList` +
    `?serviceKey=${SERVICE_KEY}` +
    `&cityCode=${cityCode}` +
    `&routeId=${routeId}`;

  try {
    const response = await fetch(url);
    const data = await response.text();
    res.send(data);

    console.log("버스 위치 응답:", data);
  } catch (err) {
    console.error("버스 위치 API 오류:", err);
    res.status(500).send("Bus Position API Error");
  }
});


app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
});
