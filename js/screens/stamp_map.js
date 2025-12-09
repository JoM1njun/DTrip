/**
 * stamp_map.js (리팩토링 완료)
 * 기존 map.js의 mapInstance 위에서 "스탬프 모드"만 담당함
 */
import { STAMP_PLACES } from "../data/stampPlace.js";
import {
  isStampCollected,
  collectStamp,
  removeStamp,
  getProgress,
} from "../components/stampStore.js";

let mapInstance = null;
let markers = [];
let currentInfoWindow = null;

// map.js에서 mapInstance를 전달받음
export function setStampMapInstance(map) {
  mapInstance = map;
}

/* -------------------------------------------------------
    🎯 스탬프 모드 시작 함수
-------------------------------------------------------- */
export function startStampMode() {
  if (!mapInstance) {
    console.error("❌ mapInstance가 설정되지 않음!");
    return;
  }

  // 기존 장소 마커 제거 (map.js의 updateMarkers로 만든 마커들)
  clearNormalMarkers();

  // 스탬프 진행률 바 출력
  renderStampProgressBar();

  // 스탬프 마커 표시
  refreshMarkers();

  // 버튼 이벤트 설정 (획득 / 취소)
  setupEventListeners();

  // 진행률 초기 업데이트
  updateProgressBar();
}

/* -------------------------------------------------------
    🔸 진행률 바 추가
-------------------------------------------------------- */
function renderStampProgressBar() {
  const content = document.getElementById("content");

  // 중복 생성 방지
  const oldEl = document.getElementById("stampProgress");
  if (oldEl) oldEl.remove();

  const wrapper = document.getElementById("mapWrapper");
  wrapper.insertAdjacentHTML(
    "beforeend",
    `
        <div class="stamp-progress-bar" id="stampProgress">
            <div class="progress-header">
                <span class="progress-title">🏛️ 대전 역사 스탬프</span>
                <span class="progress-count" id="progressCount">
                    0 / ${STAMP_PLACES.length}
                </span>
            </div>
            <div class="progress-track">
                <div class="progress-fill" id="progressFill" style="width:0%;"></div>
            </div>
        </div>
        `
  );
}

/* -------------------------------------------------------
    🔸 기존 map.js의 마커 비우기
-------------------------------------------------------- */
function clearNormalMarkers() {
  const normalMarkers = window.placeMarkers;
  if (!normalMarkers) return;

  normalMarkers.forEach((m) => m.setMap(null));
}

/* -------------------------------------------------------
    🔸 스탬프 마커 모두 표시
-------------------------------------------------------- */
function addStampMarkers() {
  markers = [];

  const dreamImg = new kakao.maps.MarkerImage(
    "assets/icons/dream.png",
    new kakao.maps.Size(50, 50),
    { offset: new kakao.maps.Point(25, 50) }
  );

  const defaultImg = new kakao.maps.MarkerImage(
    "assets/icons/marker.svg",
    new kakao.maps.Size(40, 40),
    { offset: new kakao.maps.Point(20, 40) }
  );

  STAMP_PLACES.forEach((place) => {
    const isCollected = isStampCollected(place.id);
    const img = isCollected ? dreamImg : defaultImg;

    const marker = new kakao.maps.Marker({
      map: mapInstance,
      position: new kakao.maps.LatLng(place.lat, place.lng),
      image: img,
    });

    kakao.maps.event.addListener(marker, "click", () => {
      // ⭐ 클릭한 마커 중심으로 지도 이동
      mapInstance.setCenter(marker.getPosition());

      // 기존 정보 창 표시
      showStampInfoWindow(marker, place);
    });

    markers.push(marker);
  });
}

/* -------------------------------------------------------
    🔸 스탬프 정보창 표시
-------------------------------------------------------- */
function showStampInfoWindow(marker, place) {
  if (currentInfoWindow) currentInfoWindow.close();

  const isCollected = isStampCollected(place.id);

  const content = `
    <div class="stamp-info-window">
    <button class="stamp-info-close-btn" onclick="window.closeStampInfoWindow()">✕</button>
        <div class="stamp-info-header">
            <img src="${
              isCollected ? "assets/icons/dream.png" : "assets/icons/marker.svg"
            }"
                 style="width:40px; height:40px">
            <div>
                <h3>${place.name}</h3>
                <div>${place.period}</div>
            </div>
        </div>

        <p>${place.description}</p>
        <p>📍 ${place.address}</p>

        ${
          isCollected
            ? `<button class="stamp-collect-btn collected" disabled>획득 완료</button>
                   <button class="stamp-cancel-btn" onclick="window.cancelStampHandler(${place.id})">획득 취소</button>`
            : `<button class="stamp-collect-btn available" onclick="window.collectStampHandler(${place.id})">
                        스탬프 획득하기
                   </button>`
        }
    </div>
    `;

  currentInfoWindow = new kakao.maps.InfoWindow({
    position: marker.getPosition(),
    content,
  });

  currentInfoWindow.open(mapInstance, marker);

  window.closeStampInfoWindow = function () {
    if (currentInfoWindow) currentInfoWindow.close();
};
}

/* -------------------------------------------------------
    🔸 획득 처리
-------------------------------------------------------- */
window.collectStampHandler = function (id) {
  if (collectStamp(id)) {
    alert("🎉 스탬프 획득!");
    refreshMarkers();
    updateProgressBar();

    if (currentInfoWindow) currentInfoWindow.close();
  }
};

/* -------------------------------------------------------
    🔸 획득 취소
-------------------------------------------------------- */
window.cancelStampHandler = function (id) {
  if (confirm("정말 취소할까요?")) {
    if (removeStamp(id)) {
      alert("스탬프 취소됨");
      refreshMarkers();
      updateProgressBar();
      if (currentInfoWindow) currentInfoWindow.close();
    }
  }
};

/* -------------------------------------------------------
    🔸 스탬프 마커 갱신
-------------------------------------------------------- */
function refreshMarkers() {
  markers.forEach((m) => m.setMap(null));
  markers = [];
  addStampMarkers();
}

/* -------------------------------------------------------
    🔸 진행률 업데이트
-------------------------------------------------------- */
function updateProgressBar() {
  const progress = getProgress(STAMP_PLACES.length);
  const fill = document.getElementById("progressFill");
  const count = document.getElementById("progressCount");

  if (fill) fill.style.width = `${progress.percentage}%`;
  if (count) count.textContent = `${progress.collected} / ${progress.total}`;
}

/* -------------------------------------------------------
    🔸 이벤트 리스너 (추후 확장 가능)
-------------------------------------------------------- */
function setupEventListeners() {
  // 필요하면 버튼 추가 가능
}

export function clearStampMarkers() {
    markers.forEach(m => m.setMap(null));
    markers = [];
}

export function clearStampUI() {
  // 진행률 바 제거
  document.getElementById("stampProgress")?.remove();

  // 혹시 다른 stamp UI가 있다면 함께 제거
  document.querySelector(".stamp-map-container")?.remove();

  // 열려 있는 인포윈도우 닫기
  if (currentInfoWindow) {
    currentInfoWindow.close();
    currentInfoWindow = null;
  }
}
