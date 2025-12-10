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
        { categoryId: "데이트", tag: "미술관", address: "대전 서구 둔산대로 155 둔산대공원", favorite: 333, id: 11, image_url: "assets/places/daejeonart.svg", lat: 36.367006, lng: 127.385827, name: "대전시립미술관", phone: "0507-1378-7370", rating: 4.57, review: 1286, time_start: "10:00", time_end: "18:00" },
        { categoryId: "데이트", tag: "미술관", address: "대전 서구 둔산대로 157 이응노미술관", favorite: 213, id: 12, image_url: "assets/places/eungart.svg", lat: 36.367102, lng: 127.387051, name: "이응노미술관", phone: "0507-1490-9801", rating: 4.55, review: 385, time_start: "10:00", time_end: "18:00" },
        { categoryId: "데이트", tag: "자연", address: "대전 동구 충정로 53 남간정사", favorite: 45, id: 13, image_url: "assets/places/uampark.svg", lat: 36.348006, lng: 127.456830, name: "우암사적공원", phone: "042-673-9286", rating: 4.5, review: 37, time_start: "05:00", time_end: "21:00" },
        { categoryId: "데이트", tag: "자연", address: "대전 서구 장안로 461", favorite: 241, id: 14, image_url: "assets/places/jangtemountain.svg", lat: 36.218945, lng: 127.340221, name: "장태산자연휴양림", phone: "042-673-9286", rating: 4.44, review: 497, time_start: "09:00", time_end: "17:00" },
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
