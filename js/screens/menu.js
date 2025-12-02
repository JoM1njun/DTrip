import { hideHeader, currentUser } from "../app.js";
import { auth } from "../database/firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";

// 🔥 메뉴 화면 로드
export function loadMenuScreen() {
  const content = document.getElementById("content");

  content.innerHTML = `
    <section id="menuPage" class="menu-section">
      <h3 class="mypage"> 마이페이지 </h3>
      <!-- 프로필 영역 -->
      <div id="menuProfile" class="menu-profile">
          <img id="menuProfileImg" class="profile-img" src="assets/icons/default_profile.svg">
          <div class="profile-info">
            <p id="menuProfileName">로그인해주세요</p>
            <button id="profileActionBtn" class="profile-btn">로그인</button>
          </div>
      </div>

      <!-- 메뉴 리스트 -->
      <div class="menu-list">

          <div class="menu-item" id="menuAccount">
            <img src="assets/icons/account.svg"/>
            <span>계정 설정</span>
          </div>

          <div class="menu-item">
            <img src="assets/icons/notice.svg"/>
            <span>공지사항</span>
          </div>

          <div class="menu-item">
            <img src="assets/icons/policy.svg"/>
            <span>약관 및 정책</span>
          </div>

          <div class="menu-item logout-item" id="logoutBtn">
            <img src="assets/icons/logout.svg"/>
            <span>로그아웃</span>
          </div>

      </div>
    </section>
  `;

  // 로그인 상태 기반으로 UI 변경
  updateMenuProfile(currentUser);

  // 로그아웃 이벤트 바인딩
  setupMenuEvents();
}

// 🔥 로그인 상태에 따른 프로필 전환
export function updateMenuProfile(user) {
  const profileImg = document.getElementById("menuProfileImg");
  const profileName = document.getElementById("menuProfileName");
  const profileBtn = document.getElementById("profileActionBtn");

  if (!profileImg) return; // 메뉴가 아직 로드 전인 경우

  if (!user) {
    profileImg.src = "assets/icons/default_profile.svg";
    profileName.innerText = "로그인해주세요";
    profileBtn.innerText = "로그인";
    profileBtn.onclick = () => (location.href = "login.html");
    return;
  }

  profileImg.src = user.photoURL ?? "assets/icons/default_profile.svg";
  profileName.innerText = user.displayName ?? user.email;
  profileBtn.innerText = "프로필 설정";
  profileBtn.onclick = () => (location.href = "profile.html");
}

// 🔥 메뉴 항목 클릭설정
function setupMenuEvents() {
  const logoutBtn = document.getElementById("logoutBtn");

  logoutBtn.addEventListener("click", () => {
    if (!currentUser) {
      alert("로그인 후 사용할 수 있습니다.");
      return;
    }

    signOut(auth).then(() => {
      alert("로그아웃 되었습니다.");
      location.reload();
    });
  });

  document.getElementById("menuAccount").addEventListener("click", () => {
    if (!currentUser) {
      alert("로그인 후 이용 가능합니다.");
      location.href = "login.html";
      return;
    }
    location.href = "account.html";
  });
}
