import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

async function login(email, pw) {
  try {
    const user = await signInWithEmailAndPassword(auth, email, pw);
    console.log("로그인 성공:", user.user.uid);
    location.href = "index.html";
  } catch (err) {
    console.error("로그인 오류:", err);
    alert("로그인 실패");
  }
}
