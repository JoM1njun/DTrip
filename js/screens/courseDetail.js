/**
 * courseDetail.js
 * 
 * 특정 코스의 상세 정보를 표시하는 화면입니다.
 * 코스에 포함된 장소 목록을 보여주며 장소 상세로 이동할 수 있습니다.
 * 
 * 연결된 파일:
 * - js/components/courseStore.js
 * - js/screens/detail.js
 * - js/screens/favorite.js
 */
// js/screens/courseDetail.js
// 코스 상세 화면

import { getCourse, likeCourse } from "../components/courseStore.js";
import { loadPlaceDetailPage } from "./detail.js";
import { loadFavoriteScreen } from "./favorite.js";

export function loadCourseDetailPage(courseId) {
    const content = document.getElementById("content");

    // 헤더 숨기기
    document.getElementById("header").style.display = "none";
    document.getElementById("categoryContainer").style.display = "none";
    document.getElementById("tagContainer").style.display = "none";

    const course = getCourse(courseId);

    if (!course) {
        content.innerHTML = `
      <div class="course-detail-page">
        <button class="back-btn" id="courseDetailBackBtn">
          <img src="assets/icons/back.svg" alt="뒤로" />
        </button>
        <p>코스를 찾을 수 없습니다.</p>
      </div>
    `;
        setupBackButton();
        return;
    }

    content.innerHTML = `
    <div class="course-detail-page">
      <!-- 헤더 -->
      <div class="course-detail-header">
        <button class="back-btn" id="courseDetailBackBtn">
          <img src="assets/icons/back.svg" alt="뒤로" />
        </button>
        <h1>${course.title || "제목 없음"}</h1>
        <div class="course-detail-sort">
          <select id="courseDetailSortSelect">
            <option value="order">순서대로</option>
            <option value="distance">거리순</option>
          </select>
        </div>
      </div>

      <!-- 코스 정보 -->
      <div class="course-detail-info">
        <p class="course-detail-description">${course.description || ""}</p>
        <div class="course-detail-meta">
          <span class="course-detail-likes">
            <img src="assets/icons/heart.svg" />
            ${course.likes || 0}명이 좋아함
          </span>
          <span class="course-detail-count">${course.places?.length || 0}개 장소</span>
        </div>
      </div>

      <!-- 장소 목록 -->
      <div class="course-detail-places">
        ${(course.places || [])
            .map((place, index) => renderCoursePlaceItem(place, index + 1))
            .join("")}
      </div>
    </div>
  `;

    setupCourseDetailListeners(course);
}

function renderCoursePlaceItem(place, order) {
    return `
    <div class="course-detail-place-item" data-place-id="${place.id}">
      <div class="course-detail-place-number">${order}</div>
      <img src="${place.image_url}" alt="${place.name}" class="course-detail-place-image" />
      <div class="course-detail-place-info">
        <h3>${place.name}</h3>
        <p class="course-detail-place-address">${place.address || ""}</p>
        <div class="course-detail-place-meta">
          <span class="course-detail-place-rating">⭐ ${place.rating || 0}</span>
          ${place.review ? `<span class="course-detail-place-review">(${place.review} Reviews)</span>` : ""}
        </div>
      </div>
      <button class="course-detail-place-remove" data-place-id="${place.id}">
        <img src="assets/icons/minus_circle.svg" alt="제거" />
      </button>
    </div>
  `;
}

function setupCourseDetailListeners(course) {
    // 뒤로가기
    setupBackButton();

    // 장소 클릭 → 상세 페이지
    document.querySelectorAll(".course-detail-place-item").forEach((item) => {
        item.addEventListener("click", (e) => {
            if (e.target.closest(".course-detail-place-remove")) return;

            const placeId = item.dataset.placeId;
            if (placeId) {
                loadPlaceDetailPage(placeId);
            }
        });
    });

    // 좋아요 버튼 (나중에 추가 가능)
}

function setupBackButton() {
    const backBtn = document.getElementById("courseDetailBackBtn");
    if (backBtn) {
        backBtn.addEventListener("click", () => {
            loadFavoriteScreen();
            document.getElementById("header").style.display = "flex";
            document.getElementById("categoryContainer").style.display = "block";
            document.getElementById("tagContainer").style.display = "block";
        });
    }
}
