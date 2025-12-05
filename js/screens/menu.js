/**
 * menu.js
 * 
 * 메뉴 / 마이페이지 화면입니다.
 * 사용자 프로필, 포인트, 패스권 및 고객 지원 옵션을 표시합니다.
 * 
 * 연결된 파일:
 * - js/app.js
 */
// js/screens/menu.js
// 마이페이지 / 메뉴 화면

export function loadMenuScreen() {
  const content = document.getElementById("content");

  content.innerHTML = `
    <div class="menu-page">
      <!-- 상단 제목 -->
      <header class="menu-header">
        <h1 class="menu-header-title">마이페이지</h1>
      </header>

      <!-- 검색 바 -->
      <section class="menu-search">
        <div class="menu-search-box">
          <input
            type="text"
            class="menu-search-input"
            placeholder="Search"
          />
          <span class="menu-search-icon">
            <img src="assets/icons/search.svg" alt="search" />
          </span>
        </div>
      </section>

      <!-- 내 계정 -->
      <section class="menu-section">
        <div class="menu-profile-row">
          <div class="menu-profile-avatar">
            <img src="assets/profile/default_profile.png" alt="프로필" onerror="this.style.display='none'" />
          </div>
          <div class="menu-profile-info">
            <p class="menu-profile-name">내 계정</p>
            <p class="menu-profile-email">로그인이 필요합니다</p>
          </div>
          <div class="menu-profile-arrow">›</div>
        </div>
      </section>

      <!-- 포인트 사용 -->
      <section class="menu-section">
        <div class="menu-section-header">포인트 사용</div>
        <div class="menu-list">
          <div class="menu-item">
            <div class="menu-item-icon">
              <img src="assets/menu/store.svg" alt="포인트 상점" onerror="this.style.display='none'" />
            </div>
            <div class="menu-item-text">
              <span class="menu-item-title">포인트 상점</span>
            </div>
            <div class="menu-item-arrow">›</div>
          </div>

          <div class="menu-item">
            <div class="menu-item-icon">
              <img src="assets/menu/shop.svg" alt="제휴매장 확인" onerror="this.style.display='none'" />
            </div>
            <div class="menu-item-text">
              <span class="menu-item-title">제휴매장 확인</span>
            </div>
            <div class="menu-item-arrow">›</div>
          </div>
        </div>
      </section>

      <!-- 패스권 -->
      <section class="menu-section">
        <div class="menu-section-header">패스권</div>
        <div class="menu-list">
          <div class="menu-item">
            <div class="menu-item-icon">
              <img src="assets/menu/ticket.svg" alt="패스권 구매" onerror="this.style.display='none'" />
            </div>
            <div class="menu-item-text">
              <span class="menu-item-title">패스권 구매</span>
            </div>
            <div class="menu-item-arrow">›</div>
          </div>

          <div class="menu-item">
            <div class="menu-item-icon">
              <img src="assets/menu/ticket_check.svg" alt="나의 패스권 보기" onerror="this.style.display='none'" />
            </div>
            <div class="menu-item-text">
              <span class="menu-item-title">나의 패스권 보기</span>
            </div>
            <div class="menu-item-arrow">›</div>
          </div>
        </div>
      </section>

      <!-- 고객 지원 -->
      <section class="menu-section">
        <div class="menu-section-header">고객 지원</div>
        <div class="menu-list">
          <div class="menu-item">
            <div class="menu-item-icon">
              <img src="assets/menu/chat.svg" alt="문의사항" onerror="this.style.display='none'" />
            </div>
            <div class="menu-item-text">
              <span class="menu-item-title">문의사항</span>
            </div>
            <div class="menu-item-arrow">›</div>
          </div>

          <div class="menu-item">
            <div class="menu-item-icon">
              <img src="assets/menu/notice.svg" alt="공지사항" onerror="this.style.display='none'" />
            </div>
            <div class="menu-item-text">
              <span class="menu-item-title">공지사항</span>
            </div>
            <div class="menu-item-arrow">›</div>
          </div>

          <div class="menu-item">
            <div class="menu-item-icon">
              <img src="assets/menu/info.svg" alt="약관 및 정책" onerror="this.style.display='none'" />
            </div>
            <div class="menu-item-text">
              <span class="menu-item-title">약관 및 정책</span>
            </div>
            <div class="menu-item-arrow">›</div>
          </div>
        </div>
      </section>
    </div>
  `;
}