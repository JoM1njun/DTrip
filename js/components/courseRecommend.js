/**
 * courseRecommend.js
 * 
 * 코스 추천 섹션을 렌더링하는 컴포넌트입니다.
 * 인기 코스와 최신 코스를 표시합니다.
 * 
 * 연결된 파일:
 * - js/components/courseStore.js
 * - js/screens/courseDetail.js
 * - js/screens/courseList.js
 * - js/screens/courseAdd.js
 */
// js/components/courseRecommend.js
// 다른 사람들이 만든 코스 추천 섹션 컴포넌트

import { getPopularCourses, getRecentCourses } from "./courseStore.js";
import { loadCourseDetailPage } from "../screens/courseDetail.js";

// 코스 추천 섹션 렌더링
export function renderCourseRecommendSection() {
    const popularCourses = getPopularCourses(4); // 상위 4개만 표시
    const recentCourses = getRecentCourses(4);

    // 인기 코스와 최신 코스를 합쳐서 표시 (중복 제거)
    const allCourses = [...popularCourses, ...recentCourses];
    const uniqueCourses = Array.from(
        new Map(allCourses.map((c) => [c.id, c])).values()
    ).slice(0, 4);

    if (uniqueCourses.length === 0) {
        // 기본 샘플 코스 (데모용)
        return renderEmptyCourseSection();
    }

    return `
    <div class="course-recommend-section">
      <div class="course-recommend-header">
        <h2>추천 코스</h2>
        <button class="course-see-more-btn" id="courseSeeMoreBtn">더 보기</button>
      </div>
      <div class="course-grid">
        ${uniqueCourses.map((course) => renderCourseCard(course)).join("")}
        ${renderAddCourseCard()}
      </div>
    </div>
  `;
}

// 코스 카드 렌더링
function renderCourseCard(course) {
    // 코스의 첫 4개 장소 이미지만 표시
    const placeImages = (course.places || []).slice(0, 4);
    const imageGrid = placeImages
        .map(
            (place) => `
      <div class="course-image-item">
        <img src="${place.image_url || "assets/placeholder.png"}" alt="${place.name}" />
      </div>
    `
        )
        .join("");

    // 4개 미만이면 빈 칸 추가
    while (placeImages.length < 4) {
        imageGrid += '<div class="course-image-item empty"></div>';
    }

    return `
    <div class="course-card" data-course-id="${course.id}">
      <div class="course-image-grid">
        ${imageGrid}
      </div>
      <div class="course-info">
        <h3 class="course-title">${course.title || "제목 없음"}</h3>
        <div class="course-meta">
          <span class="course-likes">
            <img src="assets/icons/heart_filled.svg" />
            ${course.likes || 0}명이 좋아함
          </span>
        </div>
      </div>
      <div class="course-arrow">
        <img src="assets/icons/heart.svg" alt="하트 버튼" />
      </div>
    </div>
  `;
}

// 코스 추가 카드 렌더링
function renderAddCourseCard() {
    return `
    <div class="course-card add-course-card" id="addCourseCard">
      <div class="add-course-icon">+</div>
      <p class="add-course-text">새 코스 만들기</p>
    </div>
  `;
}

// 빈 코스 섹션 (데모용 기본 코스)
function renderEmptyCourseSection() {
    return `
    <div class="course-recommend-section">
      <div class="course-recommend-header">
        <h2>사용자 경로</h2>
        <button class="course-see-more-btn" id="courseSeeMoreBtn">더 보기</button>
      </div>
      <div class="course-grid">
        ${renderDemoCourseCard()}
        ${renderAddCourseCard()}
      </div>
    </div>
  `;
}

// 데모 코스 카드 (샘플)
function renderDemoCourseCard() {
    return `
    <div class="course-card demo-course" data-course-id="demo-1">
      <div class="course-image-grid">
        <div class="course-image-item">
          <img src="assets/placeholder.png" alt="장소 1" />
        </div>
        <div class="course-image-item">
          <img src="assets/placeholder.png" alt="장소 2" />
        </div>
        <div class="course-image-item">
          <img src="assets/placeholder.png" alt="장소 3" />
        </div>
        <div class="course-image-item">
          <img src="assets/placeholder.png" alt="장소 4" />
        </div>
      </div>
      <div class="course-info">
        <h3 class="course-title">빵지순례</h3>
        <div class="course-meta">
          <span class="course-likes">
            <img src="assets/icons/heart.svg" />
            24명이 좋아함
          </span>
        </div>
      </div>
      <div class="course-arrow">
        <img src="assets/icons/heart.svg" alt="하트 버튼" />
      </div>
    </div>
  `;
}

// 코스 추천 섹션 이벤트 리스너 설정
export function setupCourseRecommendListeners() {
    // 더 보기 버튼
    const seeMoreBtn = document.getElementById("courseSeeMoreBtn");
    if (seeMoreBtn) {
        seeMoreBtn.addEventListener("click", () => {
            import("../screens/courseList.js").then((m) => m.loadCourseListScreen());
        });
    }

    // 코스 카드 클릭
    document.querySelectorAll(".course-card:not(.add-course-card)").forEach((card) => {
        card.addEventListener("click", () => {
            const courseId = card.dataset.courseId;
            if (courseId) {
                loadCourseDetailPage(courseId);
            }
        });
    });

    // 코스 추가 카드 클릭
    const addCard = document.getElementById("addCourseCard");
    if (addCard) {
        addCard.addEventListener("click", () => {
            import("../screens/courseAdd.js").then((m) => m.loadCourseAddScreen());
        });
    }
}
