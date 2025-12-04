import { db } from "../database/firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { loadFestivalList } from "./festival.js";

export async function loadFestivalDetail(id) {
    const content = document.getElementById("content");
    content.innerHTML = `<p>로딩 중...</p>`;

    // Festival 데이터 가져옴
    const snap = await getDoc(doc(db, "Festival", id));
    const f = snap.data();

    // 🔥 해당 축제의 버튼 목록 가져오기
    const buttons = festivalButtons[id] ?? [];

    // 공식 사이트로 이어지거나 SNS로 이어지는 버튼
    let dynamicButtons = buttons
        .map(btn => `
            <button class="festival-website-btn" onclick="window.open('${btn.url}', '_blank')">
                ${btn.label}
            </button>
        `)
        .join("");

    content.innerHTML = `
      <section class="festival-detail-header">
        <button id="backFestivalList" class="back-btn">
          <img src="assets/icons/back.svg"/>
        </button>
      </section>

      <section class="festival-detail">
        <div class="festival-title">${f.name}</div>
            <div class="host">주최) ${f.host}</div>
            <div class="festival-img-wrapper">
            <a href="${"https://djzerofe.com/" ?? '#'}" target="_blank" class="main-img">
                <img class="main-img" src="${f.image_url}">
            </a>
            </div>
        <div class="festival-detail-info">
            <p class="date"><img src="assets/festival/festival_icons/calender.svg" />${f.date}</p>
            <p class="address"><img src="assets/festival/festival_icons/location.svg" />${f.address}</p>
            <p class="phone"><img src="assets/festival/festival_icons/phone.svg" />${f.phone}</p>
            <p class="price"><img src="assets/festival/festival_icons/price.svg" />${f.price}</p>
        </div>

        <div class="festival-button-container">
            ${dynamicButtons} <!-- 여기서 동적으로 버튼 추가 -->
        </div>
      </section>
    `;

    document.getElementById("backFestivalList").addEventListener("click", () => {
        loadFestivalList();
    });
}

// 각 축제들의 홈페이지 or SNS
export const festivalButtons = {
    "2025 대전 0시 축제": [  // 0시축제
        {
            label: ` <!-- 축제 맛집 안내 버튼 -->
            <div class="btn-content">
                <img class="btn-bg" src="assets/festival/festival_info/blue.svg" />
                <div class="btn-text">
                    <p class="subtitle">대전 토박이가 소개하는</p>
                    <p class="title">2025 대전 0시 축제 상인회 추천 맛집</p>
                </div>
            </div>
            `,
            url: "https://djzerofe.com/bbs/board.php?bo_table=notice&wr_id=21"
        },
        {
            label: ` <!-- 숙박시설 안내 버튼 -->
            <div class="btn-content">
                <img class="btn-bg" src="assets/festival/festival_info/cloud.svg" />
                <div class="btn-text">
                    <p class="subtitle">대전 관광이 추천하는 숙소</p>
                    <p class="title">숙박시설 안내</p>
                </div>
            </div>
            `,
            url: "https://daejeontour.co.kr/hotel_djt"
        },
        {
            label: ` <!-- 주차장 안내 버튼 -->
            <div class="btn-content">
                <img class="btn-bg" src="assets/festival/festival_info/mint.svg" />
                <div class="btn-text">
                    <p class="subtitle">행사장 주변 주차장 안내</p>
                    <p class="title">행사장 주변 무료/유료 주차장 안내</p>
                </div>
            </div>
            `,
            url: "https://djzerofe.com/bbs/board.php?bo_table=traffic_info"
        },
        {
            label: ` <!-- FAQ 안내 버튼 -->
            <div class="btn-content">
                <img class="btn-bg" src="assets/festival/festival_info/yellow.svg" />
                <div class="btn-text">
                    <p class="subtitle">축제에 대한 문의사항</p>
                    <p class="title">2025 대전 0시 축제 FAQ</p>
                </div>
            </div>
            `,
            url: "https://djzerofe.com/bbs/board.php?bo_table=faq"
        }
    ],
    "2025 대전 빵 축제": [  // 빵 축제
        { label: "홈페이지", url: "https://breadfest.com" }
    ],
    "2025 누들대전 축제": [  // 누들대전 축제
        // 버튼 없음 → 아예 비어있는 배열
    ],
    "대전 한우 숯불구이 축제": [  // 한우 숯불구이 축제
        // 버튼 없음 → 아예 비어있는 배열
    ],
    "한화이글스 창단 40주년 불꽃쇼": [  // 한화이글스 축제
        // 버튼 없음 → 아예 비어있는 배열
    ],
};
