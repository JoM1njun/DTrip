export function loadFavoriteScreen() {
  const content = document.getElementById("content");

  content.innerHTML = `
    <div class="favorite-page">
      <h1>❤️ 좋아요한 장소</h1>
      <p>여기에 좋아요 리스트 불러오기</p>
    </div>
  `;
}
