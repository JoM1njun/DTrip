import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

const SERVICE_KEY = "9152a33db8805474901b834fd11ad3fe3a2e69a432d7468eee1fde7afe57de2d";

app.get("/api/routes", async (req, res) => {
    const url = `https://apis.data.go.kr/1613000/BusRouteInfoInqireService/getRouteNoList` +
        `?serviceKey=${SERVICE_KEY}` +
        `&cityCode=25`;

    const response = await fetch(url);
    const data = await response.text();
    res.send(data);

    console.log("data:", data);
});

app.listen(3000, () => {
    console.log("Proxy server running on port 3000");
});
