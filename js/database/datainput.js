import { db } from "./firebase_init.js";
import {
    writeBatch,
    doc
} from "firebase/firestore";

async function insertMultipleDocuments() {

    // 👉 배치 객체 생성 (여러 작업을 한 번에 처리)
    const batch = writeBatch(db);

    // 👉 여러 데이터 준비
    // CategoryId: 1 = 카페, 2 = 식당, 3 = 문화, 4 = 체험 , 5 = 자연 , 6 = 미술관
    const items = [
        { categoryId: 3, category: "문화", address: "대전광역시 서구 대덕대로 211", favorite: 333, id: 8, image_url: "assets/places/갤러리아.svg", lat: 36.352197, lng: 127.378227, name: "갤러리아백화점 타임월드점", phone: "1544-6600", rating: 4.4, review: 21630, time_start: "10:30", time_end: "20:00" },
        { categoryId: 4, category: "체험", address: "대전광역시 서구 둔지로 14 102호, 2층", favorite: 72, id: 9, image_url: "assets/places/짱오락실.svg", lat: 36.351087, lng: 127.376292, name: "짱오락실 대전둔산점", phone: "0507-1413-7611", rating: 4.5, review: 131, time_start: "12:00", time_end: "24:00" },
        { categoryId: 2, category: "식당", address: "대전광역시 서구 대덕대로249번길 15 1층 106호", favorite: 72, id: 9, image_url: "assets/places/타츠진.svg", lat: 36.354830, lng: 127.378108, name: "타츠진 우동", phone: "0507-1424-3020", rating: 4.3, review: 7580, time_start: "11:00", time_end: "20:00" },
    ];

    // 👉 반복하며 batch.set()으로 문서 추가
    // db, 컬렉션명, 문서ID
    items.forEach(item => {
        // cities 컬렉션의 문서명은 item.name로 지정함
        const ref = doc(db, "Places", item.name);
        batch.set(ref, item);
    });

    // 👉 배치 커밋 (여러 문서를 한 번에 commit)
    await batch.commit();

    console.log("여러 문서 배치 삽입 완료!");

    process.exit(0);
}

insertMultipleDocuments();
