import { db } from "./firebase_init.js";
import { collection, addDoc } from "firebase/firestore";

async function insertData() {
    try {
        const docRef = await addDoc(collection(db, "testCollection"), {
            name: "민준",
            age: 23,
            time: Date.now()
        });

        console.log("데이터 입력 성공! 문서 ID:", docRef.id);
    } catch (e) {
        console.error("에러:", e);
    }
}

insertData();
