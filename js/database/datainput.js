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
        { CategoryId: 1, address: "대전광역시 대적구 한남로38번길 28 1층", category: 1, favorite: 451, id: "4", image_url: "assets/places/몽심.svg", lat: 36.352279, lng: 127.425074, name: "몽심", phone: "0507-1390-1811", rating: 4.91, review: 2769, time_end: "18:00", time_start: "11:00" },
        { CategoryId: 1, address: "대전광역시 중구 대흥로121번길 44", category: 1, favorite: 451, id: "5", image_url: "assets/places/뮤제베이커리.svg", lat: 36.325542, lng: 127.424926, name: "뮤제 베이커리", phone: "0507-1393-1837", rating: 0, review: 338, time_end: "22:00", time_start: "11:00" },
        { CategoryId: 3, address: "대전광역시 유성구 엑스포로 1 대전 신세계 Art&Science 지하 1층", category: 1, favorite: 451, id: "6", image_url: "assets/places/아쿠아리움.svg", lat: 36.375165, lng: 127.380774, name: "대전 엑스포 아쿠아리움", phone: "0042-607-8852", rating: 0, review: 5264, time_end: "19:00", time_start: "10:30" },
        { CategoryId: 3, address: "대전광역시 유성구 대덕대로 480", category: 3, favorite: 451, id: "7", image_url: "assets/places/엑스포 과학공원.svg", lat: 36.376436, lng: 127.388091, name: "엑스포 과학공원", phone: "042-250-1111", rating: 4.22, review: 194, time_end: "00:00", time_start: "00:00" }
    ];

    // 👉 반복하며 batch.set()으로 문서 추가
    items.forEach(item => {
        // cities 컬렉션의 문서명은 item.id로 지정함
        const ref = doc(db, "Places", item.name);
        batch.set(ref, item);
    });

    // 👉 배치 커밋 (여러 문서를 한 번에 commit)
    await batch.commit();

    console.log("여러 문서 배치 삽입 완료!");

    Process.exit(0);
}

insertMultipleDocuments();
