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
        { id: 1, name: "최영준", title: "대전 둔산동 추천코스", content: "", images:[""] },
        { id: 2, name: "이태희", title: "대전 은행동 추천코스", content: "", images:[""] },
        { id: 3, name: "조민준", title: "대전 서구 추천코스", content: "", images:[""] },
        { id: 4, name: "심승용", title: "대전 동구 추천코스", content: "", images:[""] }
    ];

    // 👉 반복하며 batch.set()으로 문서 추가
    // db, 컬렉션명, 문서ID
    items.forEach(item => {
        // cities 컬렉션의 문서명은 item.name로 지정함
        const ref = doc(db, "User", item.name);
        batch.set(ref, item);
    });

    // 👉 배치 커밋 (여러 문서를 한 번에 commit)
    await batch.commit();

    console.log("여러 문서 배치 삽입 완료!");

    process.exit(0);
}

insertMultipleDocuments();
