/**
 * menu.js
 * 
 * 메뉴 / 마이페이지 화면입니다.
 * 사용자 프로필, 포인트, 패스권 및 고객 지원 옵션을 표시합니다.
 * HTML 구조를 함수로 분리하여 가독성을 높이고 상호작용 기능을 추가했습니다.
 * 
 * 연결된 파일:
 * - js/app.js
 * - js/screens/p_ticket.js
 */
import { loadPassPurchasePage } from "./p_ticket.js";

// js/screens/menu.js
// 마이페이지 / 메뉴 화면

export function loadMenuScreen() {
  const content = document.getElementById("content");
  content.innerHTML = ""; // 초기화

  // 컨테이너 생성
  const container = document.createElement("div");
  container.className = "menu-page";

  // 각 섹션 렌더링
  container.appendChild(renderHeader());
  container.appendChild(renderSearchBar());
  container.appendChild(renderProfileSection());
  container.appendChild(renderPointSection());
  container.appendChild(renderPassSection());
  container.appendChild(renderSupportSection());

  content.appendChild(container);

  // 이벤트 리스너 연결
  attachMenuListeners();
}

// 1. 헤더 렌더링
function renderHeader() {
  const header = document.createElement("header");
  header.className = "menu-header";
  header.innerHTML = `<h1 class="menu-header-title">마이페이지</h1>`;
  return header;
}

// 2. 검색바 렌더링
function renderSearchBar() {
  const section = document.createElement("section");
  section.className = "menu-search";
  section.innerHTML = `
        <div class="menu-search-box">
          <input type="text" class="menu-search-input" placeholder="Search" />
          <span class="menu-search-icon">
            <img src="assets/icons/search.svg" alt="search" />
          </span>
        </div>`;
  return section;
}

// 3. 프로필 섹션 렌더링
function renderProfileSection() {
  const section = document.createElement("section");
  section.className = "menu-section";
  section.innerHTML = `
        <div class="menu-profile-row" id="btnProfile">
          <div class="menu-profile-avatar">
            <img src="assets/profile/default_profile.png" alt="프로필" onerror="this.style.display='none'" />
          </div>
          <div class="menu-profile-info">
            <p class="menu-profile-name">내 계정</p>
            <p class="menu-profile-email">로그인이 필요합니다</p>
          </div>
          <div class="menu-profile-arrow">›</div>
        </div>`;
  return section;
}

// 4. 포인트 사용 섹션 렌더링
function renderPointSection() {
  const section = document.createElement("section");
  section.className = "menu-section";
  section.innerHTML = `
        <div class="menu-section-header">포인트 사용</div>
        <div class="menu-list">
          ${createMenuItem("store", "포인트 상점", "btnPointStore")}
          ${createMenuItem("shop", "제휴매장 확인", "btnAffiliate")}
        </div>`;
  return section;
}

// 5. 패스권 섹션 렌더링
function renderPassSection() {
  const section = document.createElement("section");
  section.className = "menu-section";
  section.innerHTML = `
        <div class="menu-section-header">패스권</div>
        <div class="menu-list">
          ${createMenuItem("ticket", "패스권 구매", "btnPassPurchase")}
          ${createMenuItem("ticket_check", "나의 패스권 보기", "btnMyPass")}
        </div>`;
  return section;
}

// 6. 고객 지원 섹션 렌더링
function renderSupportSection() {
  const section = document.createElement("section");
  section.className = "menu-section";
  section.innerHTML = `
        <div class="menu-section-header">고객 지원</div>
        <div class="menu-list">
          ${createMenuItem("chat", "문의사항", "btnInquiry")}
          ${createMenuItem("notice", "공지사항", "btnNotice")}
          ${createMenuItem("info", "약관 및 정책", "btnPolicy")}
        </div>`;
  return section;
}

// 헬퍼 함수: 메뉴 아이템 HTML 생성
function createMenuItem(iconName, text, id) {
  return `
      <div class="menu-item" id="${id}">
        <div class="menu-item-icon">
          <img src="assets/menu/${iconName}.svg" alt="${text}" onerror="this.style.display='none'" />
        </div>
        <div class="menu-item-text">
          <span class="menu-item-title">${text}</span>
        </div>
        <div class="menu-item-arrow">›</div>
      </div>
    `;
}

// 이벤트 리스너 연결
function attachMenuListeners() {
  // 패스권 구매
  const btnPassPurchase = document.getElementById("btnPassPurchase");
  if (btnPassPurchase) {
    btnPassPurchase.addEventListener("click", () => {
      loadPassPurchasePage();
    });
  }

  // 마이페이지 프로필 클릭
  document.getElementById("btnProfile")?.addEventListener("click", () => {
    alert("로그인 페이지 준비 중입니다.");
  });

  // 포인트 상점
  document.getElementById("btnPointStore")?.addEventListener("click", () => {
    alert("포인트 상점은 준비 중입니다.");
  });

  // 제휴매장
  document.getElementById("btnAffiliate")?.addEventListener("click", () => {
    alert("제휴 매장 목록을 불러오는 중...");
  });

  // 나의 패스권 보기
  document.getElementById("btnMyPass")?.addEventListener("click", () => {
    alert("구매한 패스권이 없습니다.");
  });

  // 문의사항
  document.getElementById("btnInquiry")?.addEventListener("click", () => {
    alert("고객센터 연결(준비 중)");
  });
}