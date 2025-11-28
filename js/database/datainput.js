import { db } from "./firebase_init.js";
import {
    writeBatch,
    doc
} from "firebase/firestore";

async function insertMultipleDocuments() {

    // 👉 배치 객체 생성 (여러 작업을 한 번에 처리)
    const batch = writeBatch(db);

    // 👉 여러 데이터 준비
    // CategoryId: 1 = 카페, 2 = 식당, 3 = 문화, 4 = 체험 , 5 = 자연 , 6 = 문화
    const items = [
        { id: 1, name: "2025 대전 0시 축제", address: "대전광역시 중구 중앙로 148", date: "08. 08 (금) ~ 16 (토)", lat: 36.328640, lng: 127.426294, phone: "042-120", price: "무료", host: "대전광역시", image_url: "assets/festival/0시축제.svg" },
        { id: 2, name: "2025 대전 빵 축제", address: "대전광역시 동구 소제동 대동천 일원", date: "10. 18 (토) ~ 16 (일)", lat: 36.335135, lng: 127.438318, phone: "x", price: "무료", host: "대전관광공사", image_url: "assets/festival/빵축제.svg" },
        { id: 3, name: "한화이글스 창단 40주년 불꽃쇼", address: "대전광역시 유성구 도룡동 엑스포다리", date: "11. 30 (일) 19:00 ~ 19: 40", lat: 36.372922, lng: 127.387948, phone: "x", price: "무료", host: "한화이글스", image_url: "assets/festival/불꽃축제.svg" },
        { id: 4, name: "2025 누들대전 축제", address: "대전광역시 유성구 대덕대로 480", date: "11. 07 (금) ~ 09 (일)", lat: 36.377578, lng: 127.384261, phone: "x", price: "무료", host: "대전광역시", image_url: "assets/festival/누들대전축제.svg" },
        { id: 5, name: "대전 한우 숯불구이 축제", address: "대전 유성구 월드컵대로 32 P2 주차장", date: "04. 09 (수) ~ 13 (일)", lat: 36.363369, lng: 127.321784, phone: "1899-9501", price: "무료", host: "파이애드", image_url: "assets/festival/한우축제.svg" },
    ];

    // 👉 반복하며 batch.set()으로 문서 추가
    // db, 컬렉션명, 문서ID
    items.forEach(item => {
        // cities 컬렉션의 문서명은 item.name로 지정함
        const ref = doc(db, "Festival", item.name);
        batch.set(ref, item);
    });

    // 👉 배치 커밋 (여러 문서를 한 번에 commit)
    await batch.commit();

    console.log("여러 문서 배치 삽입 완료!");

    process.exit(0);
}

insertMultipleDocuments();
