export function loadInfoScreen() {
  const content = document.getElementById("content");

  content.innerHTML = `
    <div class="mypage">
      <h1>👤 마이페이지</h1>
      <p>유저 정보 표시</p>
    </div>
  `;
}
