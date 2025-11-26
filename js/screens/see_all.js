export function loadSeeAllPage(type) {
  const content = document.getElementById("content");

  // 🔥 헤더 숨기기
  document.querySelector("header").style.display = "none";
  document.querySelector(".content-section").style.display = "none";

  const titles = {
    popular: "유명한 곳",
    recommend: "추천 장소",
    user: "유저 추천"
  };

  content.innerHTML = `
    <!-- 🔙 뒤로가기 + 제목 -->
    <section class="seeall-header">
      <button id="backBtn" class="back-btn">
        <img src="assets/icons/back.svg" alt="Back" />
      </button>
      <h2>${titles[type]}</h2>
    </section>

    <!-- 🔖 태그 필터 (Home처럼 사용) -->
    <section id="tagContainer" class="filter-section">
      <div class="tag-filter">
        <span># 음식점</span>
        <span># 관광</span>
        <span># 식당</span>
        <span># 카페</span>
        <span># 미술관</span>
      </div>

      <div class="sort-section">
        <select id="sortOption">
          <option value="popular">인기순</option>
          <option value="rating">평점순</option>
          <option value="latest">최신순</option>
        </select>
      </div>
    </section>

    <!-- 📦 카드 2열 그리드 -->
    <section class="seeall-grid">
      ${createCards()}
    </section>
  `;

  // 🔙 뒤로가기 버튼 이벤트
  document.getElementById("backBtn").addEventListener("click", () => {
    document.querySelector("header").style.display = "block"; 

    import("./home.js").then(module => module.loadHomeScreen());
  });
}

// 예시 카드 생성
function createCards() {
  const cards = [];

  for (let i = 0; i < 10; i++) {
    cards.push(`
      <div class="seeall-card">
        <img src="assets/places/성심당.svg" alt="이미지">
        <p class="place-name">성심당 본점 ${i + 1}</p>
        <p class="rating">⭐ 4.7</p>
      </div>
    `);
  }

  return cards.join("");
}
