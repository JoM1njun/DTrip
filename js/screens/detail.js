import { db } from "../database/firebase.js";
import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { loadHomeScreen } from "./home.js";
import { loadSeeAllPage, currentSeeAllType } from "./see_all.js";
import { currentScreen, showHome } from "../app.js";
import { addFavorite, removeFavorite, isFavorite } from "../components/favoriteStore.js";

export async function loadPlaceDetailPage(id) {
  const content = document.getElementById("content");

  document.getElementById("header").style.display = "none";
  document.getElementById("categoryContainer").style.display = "none";
  document.getElementById("tagContainer").style.display = "none";
  document.getElementById("tabbar").style.display = "none";

  // Places에서 데이터 가져옴
  const ref = doc(db, "Places", id.toString());
  const snap = await getDoc(ref);

  // Data가 존재하지 않음
  if (!snap.exists()) {
    content.innerHTML = "<p>존재하지 않는 장소입니다.</p>";
    return;
  }

  const data = snap.data();

  content.innerHTML = `
    <div class="detail-page">
      <div class="detail-section">
        <!-- 🔙 Back Button -->
        <button class="back-btn" id="detailBackBtn">
          <img src="assets/icons/back.svg" />
        </button>
      </div>

      <!-- 상단 이미지 -->
      <div class="detail-image-container">
        <img src="${data.image_url}" class="detail-image">
      </div>

      <!-- 텍스트 컨테이너 -->
      <div class="detail-info-container">
        
        <!-- 제목(큰 글자) -->
        <div class="detail-header">
            <h1 class="detail-title">${data.name}</h1>
            <!-- 지도 보기 버튼 -->
            <p id="openMapBtn" class="detail-map">Show Map</p>
        </div>

        <div class="detail-rating">
        <p class="d_rating"><img src="assets/icons/star.svg" /> ${data.rating ?? 0
    }</p>
        <p class="d_reviews">(${data.review?.toLocaleString() ?? 0} Reviews)</p>

            <!-- 운영시간 -->
            <div class="detail-row">
                <p class="detail_time"><img src="assets/icons/time.svg" />${data.time_start ?? "운영 시간 정보 없음"
    } ~ ${data.time_end ?? "운영 시간 정보 없음"}</p>
            <!-- 전화번호 -->
                <p class="detail_phone"><img src="assets/icons/phone.svg" /><a href="tel:${data.phone}"> ${data.phone ?? "전화번호 없음"}</a>
                </p>
            </div>
        </div>

        <div class="homepage">
            <a href="${"https://www.sungsimdang.co.kr/" ?? "#"
    }" target="_blank" class="homepage-icon">
                <img src="assets/icons/home.svg" />
            </a>
            <a href="${"https://www.instagram.com/sungsimdang_official/" ?? "#"
    }" target="_blank" class="homepage-icon">
                <img src="assets/icons/instagram.svg" />
            </a>
        </div>

        <!-- 설명 -->
        <p class="detail-description">${data.description ?? "설명 정보 없음"
    }</p>

        <div class="detail-facilities">
            <h1>Facilities</h1>

            <div class="facility-row">
                <div class="facility-box">
                    <img src="assets/facilities/wifi.svg" alt="와이파이 아이콘" title="무료 Wi-Fi 제공" />
                    <span>
                        WiFi
                    </span>
                </div>
            
                <div class="facility-box">
                    <img src="assets/facilities/card.svg" alt="카드 아이콘" title="카드 이용 가능" />
                    <span>
                        Card
                    </span>
                </div>
            
                <div class="facility-box">
                    <img src="assets/facilities/parking.svg" alt="주차장 아이콘" title="주차장 이용 가능" />
                    <span>
                        Parking
                    </span>
                </div>
            
                <div class="facility-box">
                    <img src="assets/facilities/cart.svg" alt="카트 아이콘" title="카트 이용 가능" />
                    <span>
                        Cart
                    </span>
                </div>
            </div>
        </div>
        
        <div class="favorite-nav">
          <!-- 좋아요 / 리뷰 -->
          <div class="detail-favorite">
            <p id="favoriteCount">${data.favorite ?? 0}명이 좋아함</p>
              <button id="favoriteBtn" class="favorite-btn">
                <img id="heartIcon" src="assets/icons/heart.svg" />
              </button>
          </div>

          <div class="navigation">
            <p>길 안내</p>
          </div>
        </div>
      </div>
    </div>
  `;

  // 뒤로가기 기능
  document.getElementById("detailBackBtn").addEventListener("click", async () => {
    const backTo = sessionStorage.getItem("backTo");

    if (backTo === "route_map") {
      sessionStorage.removeItem("backTo");

      // 👉 뒤로갈 때 tabbar는 route_map 화면에서 숨겨져 있기 때문에 복원 X
      const { loadUserRouteMap } = await import("./route_map.js");

      loadUserRouteMap(window.currentRouteUser);
      // ⭐ route_map에서 user 정보를 넘겨서 사용 중이므로 복귀 시 동일 user 필요

      return;
    }

    if (currentScreen === "seeall") {
      loadSeeAllPage(currentSeeAllType);
    } else if (currentScreen === "map") {
      import("./map.js").then(module => module.loadMapScreen());
      document.getElementById("tabbar").style.display = "flex";
    } else {
      showHome();
      loadHomeScreen();
      document.getElementById("tabbar").style.display = "flex";
    }
  });

  // 지도 보기 버튼 클릭
  document.getElementById("openMapBtn").addEventListener("click", () => {
    const placeData = {
      id: id,
      name: data.name,
      lat: data.lat,
      lng: data.lng
    };

    // 지도에서 이 장소를 바로 표시하도록 데이터 전달
    sessionStorage.setItem("map_focus_place", JSON.stringify(placeData));
    sessionStorage.setItem("map_back_to_detail_id", id.toString());
    sessionStorage.setItem("map_prev_screen", "detail");

    import("./map.js").then(module => {
      module.loadMapScreen();
    });

    document.getElementById("tabbar").style.display = "flex";
  });

  document.querySelector(".navigation").addEventListener("click", () => {
    // const placeData = {
    //   id: id,
    //   name: data.name,
    //   lat: data.lat,
    //   lng: data.lng
    // };

    // sessionStorage.setItem("route_target", JSON.stringify(placeData));
    // sessionStorage.setItem("map_focus_place", JSON.stringify(placeData));
    // sessionStorage.setItem("map_back_to_detail_id", id);

    // import("./route_map.js").then(module => {
    //   module.loadRouteMapScreen();  // 네가 만든 route map 화면 로딩
    // });

    // document.getElementById("tabbar").style.display = "none";
    alert("곧 기능을 연결할 예정입니다!");
  });

  // ================================
  //   ❤️ 좋아요(위시리스트) 기능
  // ================================
  const favoriteBtn = document.getElementById("favoriteBtn");
  const heartIcon = document.getElementById("heartIcon");
  const favoriteCountText = document.getElementById("favoriteCount");

  const placeId = id.toString();
  const baseFavorite = data.favorite ?? 0;

  // 현재 장소가 위시리스트에 있는지 확인
  let liked = isFavorite(placeId);

  function updateFavoriteUI() {
    // 텍스트 업데이트 (내 위시리스트 여부만 간단히 표시)
    if (liked) {
      favoriteCountText.textContent = `${baseFavorite}명이 좋아함 · 내 위시리스트에 추가됨`;
      favoriteBtn.classList.add("active");
    } else {
      favoriteCountText.textContent = `${baseFavorite}명이 좋아함`;
      favoriteBtn.classList.remove("active");
    }

    // 하트 아이콘 상태 (채움/비움)
    if (liked) {
      heartIcon.src = "assets/icons/heart.svg";
    } else {
      heartIcon.src = "assets/icons/deart.svg";
    }
  }

  updateFavoriteUI();

  favoriteBtn.addEventListener("click", () => {
    liked = !liked;

    if (liked) {
      // 위시리스트에 추가
      addFavorite({
        id: placeId,
        name: data.name,
        image_url: data.image_url,
        address: data.address ?? "",
        rating: data.rating ?? 0,
        lat: data.lat ?? null,
        lng: data.lng ?? null,
        review: data.review ?? 0,
      });
    } else {
      // 위시리스트에서 제거
      removeFavorite(placeId);
    }

    updateFavoriteUI();
  });
}
