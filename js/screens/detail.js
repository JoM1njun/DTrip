import { db } from "../database/firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { loadHomeScreen } from "./home.js";

export async function loadPlaceDetailPage(id) {
    const content = document.getElementById("content");

    document.getElementById("header").style.display = "none";
    document.getElementById("categoryContainer").style.display = "none";
    document.getElementById("tagContainer").style.display = "none";
    document.getElementById("tabbar").style.display = "none";

    const ref = doc(db, "Places", id.toString());
    const snap = await getDoc(ref);

    if (!snap.exists()) {
        content.innerHTML = "<p>존재하지 않는 장소입니다.</p>";
        return;
    }

    const data = snap.data();

    content.innerHTML = `
    <div class="detail-page">

      <!-- 🔙 Back Button -->
      <button class="detail-back-btn" id="detailBackBtn">
        <img src="assets/icons/back.svg" />
      </button>

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
        <p class="d_rating"><img src="assets/icons/star.svg" /> ${data.rating ?? 0}</p>
        <p class="d_reviews">(${data.review?.toLocaleString() ?? 0} Reviews)</p>

            <!-- 운영시간 -->
            <div class="detail-row">
                <p class="detail_time"><img src="assets/icons/time.svg" />${data.time_start ?? "운영 시간 정보 없음"} ~ ${data.time_end ?? "운영 시간 정보 없음"}</p>
            <!-- 전화번호 -->
                <p class="detail_phone"><img src="assets/icons/phone.svg" /> ${data.phone ?? "전화번호 없음"}</p>
            </div>
        </div>

        <div class="homepage">
            <a href="${"https://www.sungsimdang.co.kr/" ?? "#"}" target="_blank" class="homepage-icon">
                <img src="assets/icons/home.svg" />
            </a>
            <a href="${"https://www.instagram.com/sungsimdang_official/" ?? "#"}" target="_blank" class="homepage-icon">
                <img src="assets/icons/instagram.svg" />
            </a>
        </div>

        <!-- 설명 -->
        <p class="detail-description">${data.description ?? "설명 정보 없음"}</p>

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
        
        <!-- 좋아요 / 리뷰 -->
        <div class="detail-favorite">
        <p id="favoriteCount">${data.favorite ?? 0}명이 좋아함</p>
            <button id="favoriteBtn" class="favorite-btn">
            
                <img id="heartIcon" src="assets/icons/heart.svg" />
            </button>
        </div>
        
      </div>
    </div>
  `;

    // 뒤로가기 기능
    document.getElementById("detailBackBtn").addEventListener("click", () => {
        document.getElementById("header").style.display = "flex";
        document.getElementById("categoryContainer").style.display = "block";
        document.getElementById("tagContainer").style.display = "block";
        document.getElementById("tabbar").style.display = "flex";

        loadHomeScreen();
    });

    // 지도 보기 버튼 클릭
    document.getElementById("openMapBtn").addEventListener("click", () => {
        alert("지도 기능은 곧 연결됩니다!");
    });
}
