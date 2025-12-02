import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { auth } from "./firebase_init.js";  // auth 객체

async function register(email, pw) {
  try {
    const user = await createUserWithEmailAndPassword(auth, email, pw);
    console.log("회원가입 성공:", user.user.uid);
  } catch (err) {
    console.error("회원가입 오류:", err);
  }
}
