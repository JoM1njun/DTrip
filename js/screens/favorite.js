/**
 * favorite.js
 * 
 * 좋아요(위시리스트) 화면을 표시하고 관리합니다.
 * 좋아요한 장소의 필터링, 정렬 및 검색 기능을 지원합니다.
 * 
 * 연결된 파일:
 * - js/components/favoriteStore.js
 * - js/screens/detail.js
 * - js/app.js (사용자 위치)
 */
import { getFavorites, removeFavorite } from "../components/favoriteStore.js";
import { loadPlaceDetailPage } from "./detail.js";
import { userLocation } from "../app.js";
import { renderCourseRecommendSection, setupCourseRecommendListeners } from "../components/courseRecommend.js";

let currentView = "list"; // "grid" or "list"
let currentCategory = "all";
let currentSort = "name"; // "name", "rating", "distance"
let searchQuery = "";

// 거리 계산 함수 (Haversine formula)
function calculateDistance(lat1, lng1, lat2, lng2) {
  if (!lat1 || !lng1 || !lat2 || !lng2) return Infinity;

  const R = 6371; // 지구 반지름 (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 카테고리 추출 (주소나 이름에서 추론)
function getCategory(place) {
  const name = (place.name || "").toLowerCase();
  const address = (place.address || "").toLowerCase();

  if (name.includes("카페") || name.includes("cafe") || name.includes("커피")) {
    return "카페";
  }
  if (name.includes("맛집") || name.includes("식당") || name.includes("레스토랑") || name.includes("restaurant")) {
    return "맛집";
  }
  if (name.includes("미술관") || name.includes("박물관") || name.includes("갤러리") || address.includes("문화")) {
    return "문화";
  }
  if (name.includes("체험") || name.includes("체험관")) {
    return "체험";
  }
  if (address.includes("공원") || address.includes("산") || name.includes("자연")) {
    return "자연";
  }
  return "기타";
}

export function loadFavoriteScreen() {
  const content = document.getElementById("content");
  const favorites = getFavorites();

  // 장소에 거리 정보 추가
  const favoritesWithDistance = favorites.map((place) => {
    let distance = Infinity;
    if (userLocation && place.lat && place.lng) {
      distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        place.lat,
        place.lng
      );
    }
    return {
      ...place,
      distance,
      category: getCategory(place),
    };
  });

  // 좋아요한 장소가 없어도 검색/필터 UI는 표시
  if (favorites.length === 0) {
    renderFavoriteScreenEmpty();
    return;
  }

  renderFavoriteScreen(favoritesWithDistance);
}

// 좋아요한 장소가 없을 때도 검색/필터 UI 표시
function renderFavoriteScreenEmpty() {
  const content = document.getElementById("content");

  const categories = ["all", "카페", "맛집", "문화", "체험", "자연"];
  const categoryCounts = {};
  categories.forEach((cat) => {
    categoryCounts[cat] = 0;
  });

  content.innerHTML = `
    <div class="favorite-page">
      <!-- 헤더 -->
      <div class="favorite-header">
        <h1>❤️ 좋아요한 장소</h1>
        <div class="favorite-controls">
          <button class="view-toggle-btn" id="viewToggle" title="${currentView === "grid" ? "리스트 보기" : "그리드 보기"}">
            ${currentView === "grid" ? "📋" : "⊞"}
          </button>
        </div>
      </div>

      <!-- 검색 바 -->
      <div class="favorite-search">
        <input 
          type="text" 
          id="favoriteSearchInput" 
          placeholder="장소 이름이나 주소로 검색..." 
          value="${searchQuery}"
        />
        <img src="assets/icons/search.svg" class="search-icon" />
      </div>

      <!-- 카테고리 필터 -->
      <div class="favorite-categories">
        ${categories
      .map(
        (cat) => `
          <button 
            class="category-btn ${currentCategory === cat ? "active" : ""}" 
            data-category="${cat}"
          >
            ${cat === "all" ? "전체" : cat}
            <span class="category-count">${categoryCounts[cat]}</span>
          </button>
        `
      )
      .join("")}
      </div>

      <!-- 정렬 옵션 -->
      <div class="favorite-sort">
        <select id="favoriteSortSelect">
          <option value="name" ${currentSort === "name" ? "selected" : ""}>이름순</option>
          <option value="rating" ${currentSort === "rating" ? "selected" : ""}>평점순</option>
          <option value="distance" ${currentSort === "distance" ? "selected" : ""}>거리순</option>
        </select>
      </div>

      <!-- 결과 카운트 -->
      <div class="favorite-count">
        총 <strong>0</strong>개의 장소
      </div>

      <!-- 빈 상태 메시지 -->
      <div class="favorite-empty">
        <p>아직 좋아요한 장소가 없어요.</p>
        <p>마음에 드는 장소 상세 페이지에서 하트 버튼을 눌러 위시리스트에 추가해 보세요!</p>
      </div>

      <!-- 코스 추천 섹션 (고정) -->
      ${renderCourseRecommendSection()}
    </div>
  `;

  setupFavoriteEventListenersEmpty();
  setupCourseRecommendListeners();
}

function setupFavoriteEventListenersEmpty() {
  // 검색
  const searchInput = document.getElementById("favoriteSearchInput");
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener("input", (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        searchQuery = e.target.value;
        loadFavoriteScreen();
      }, 300);
    });
  }

  // 카테고리 필터
  document.querySelectorAll(".category-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentCategory = btn.dataset.category;
      loadFavoriteScreen();
    });
  });

  // 정렬
  const sortSelect = document.getElementById("favoriteSortSelect");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      currentSort = e.target.value;
      loadFavoriteScreen();
    });
  }

  // 뷰 전환
  const viewToggle = document.getElementById("viewToggle");
  if (viewToggle) {
    viewToggle.addEventListener("click", () => {
      currentView = currentView === "grid" ? "list" : "grid";
      loadFavoriteScreen();
    });
  }
}


function renderFavoriteScreen(favorites) {
  const content = document.getElementById("content");

  // 필터링 및 정렬
  let filtered = favorites.filter((place) => {
    // 검색어 필터
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = (place.name || "").toLowerCase().includes(query);
      const matchesAddress = (place.address || "").toLowerCase().includes(query);
      if (!matchesName && !matchesAddress) return false;
    }

    // 카테고리 필터
    if (currentCategory !== "all" && place.category !== currentCategory) {
      return false;
    }

    return true;
  });

  // 정렬
  if (currentSort === "name") {
    filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  } else if (currentSort === "rating") {
    filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (currentSort === "distance") {
    filtered.sort((a, b) => a.distance - b.distance);
  }

  const categories = ["all", "카페", "맛집", "문화", "체험", "자연"];
  const categoryCounts = {};
  categories.forEach((cat) => {
    categoryCounts[cat] =
      cat === "all"
        ? favorites.length
        : favorites.filter((p) => p.category === cat).length;
  });

  content.innerHTML = `
    <div class="favorite-page">
      <!-- 헤더 -->
      <div class="favorite-header">
        <h1>❤️ 좋아요한 장소</h1>
        <div class="favorite-controls">
          <button class="view-toggle-btn" id="viewToggle" title="${currentView === "grid" ? "리스트 보기" : "그리드 보기"}">
            ${currentView === "grid" ? "📋" : "⊞"}
          </button>
        </div>
      </div>

      <!-- 검색 바 -->
      <div class="favorite-search">
        <input 
          type="text" 
          id="favoriteSearchInput" 
          placeholder="장소 이름이나 주소로 검색..." 
          value="${searchQuery}"
        />
        <img src="assets/icons/search.svg" class="search-icon" />
      </div>

      <!-- 카테고리 필터 -->
      <div class="favorite-categories">
        ${categories
      .map(
        (cat) => `
          <button 
            class="category-btn ${currentCategory === cat ? "active" : ""}" 
            data-category="${cat}"
          >
            ${cat === "all" ? "전체" : cat}
            <span class="category-count">${categoryCounts[cat]}</span>
          </button>
        `
      )
      .join("")}
      </div>

      <!-- 정렬 옵션 -->
      <div class="favorite-sort">
        <select id="favoriteSortSelect">
          <option value="name" ${currentSort === "name" ? "selected" : ""}>이름순</option>
          <option value="rating" ${currentSort === "rating" ? "selected" : ""}>평점순</option>
          <option value="distance" ${currentSort === "distance" ? "selected" : ""}>거리순</option>
        </select>
      </div>

      <!-- 결과 카운트 -->
      <div class="favorite-count">
        총 <strong>${filtered.length}</strong>개의 장소
      </div>

      <!-- 장소 리스트/그리드 -->
      <div class="favorite-container ${currentView === "grid" ? "grid-view" : "list-view"}">
        ${filtered.length === 0
      ? `
          <div class="favorite-empty-filter">
            <p>검색 결과가 없습니다.</p>
            <p>다른 검색어나 카테고리를 시도해보세요.</p>
          </div>
        `
      : filtered
        .map((place) => renderPlaceCard(place))
        .join("")}
      </div>

      <!-- 코스 추천 섹션 (고정) -->
      ${renderCourseRecommendSection()}
    </div>
  `;

  // 이벤트 리스너 등록
  setupFavoriteEventListeners(filtered);
  setupCourseRecommendListeners();
}

function renderPlaceCard(place) {
  const distanceText =
    place.distance === Infinity
      ? ""
      : place.distance < 1
        ? `${Math.round(place.distance * 1000)}m`
        : `${place.distance.toFixed(1)}km`;

  if (currentView === "grid") {
    // 그리드 뷰 (2열)
    return `
      <div class="favorite-card-grid" data-id="${place.id}">
        <div class="favorite-card-image">
          <img src="${place.image_url}" alt="${place.name}" />
          <button class="favorite-remove-btn" data-id="${place.id}" title="위시리스트에서 제거">
            <img src="assets/icons/heart.svg" />
          </button>
        </div>
        <div class="favorite-card-info">
          <h3>${place.name}</h3>
          <p class="favorite-card-rating">⭐ ${place.rating || 0}</p>
          ${distanceText ? `<p class="favorite-card-distance">${distanceText}</p>` : ""}
        </div>
      </div>
    `;
  } else {
    // 리스트 뷰
    return `
      <div class="favorite-card-list" data-id="${place.id}">
        <img src="${place.image_url}" alt="${place.name}" class="favorite-card-img" />
        <div class="favorite-card-content">
          <div class="favorite-card-header">
            <h3>${place.name}</h3>
            <button class="favorite-remove-btn" data-id="${place.id}" title="위시리스트에서 제거">
              <img src="assets/icons/heart.svg" />
            </button>
          </div>
          <p class="favorite-card-address">${place.address || ""}</p>
          <div class="favorite-card-meta">
            <span class="favorite-card-rating">⭐ ${place.rating || 0}</span>
            ${place.review ? `<span class="favorite-card-review">(${place.review.toLocaleString()} Reviews)</span>` : ""}
            ${distanceText ? `<span class="favorite-card-distance">${distanceText}</span>` : ""}
          </div>
        </div>
      </div>
    `;
  }
}

function setupFavoriteEventListeners(favorites) {
  // 검색
  const searchInput = document.getElementById("favoriteSearchInput");
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener("input", (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        searchQuery = e.target.value;
        loadFavoriteScreen();
      }, 300);
    });
  }

  // 카테고리 필터
  document.querySelectorAll(".category-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentCategory = btn.dataset.category;
      loadFavoriteScreen();
    });
  });

  // 정렬
  const sortSelect = document.getElementById("favoriteSortSelect");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      currentSort = e.target.value;
      loadFavoriteScreen();
    });
  }

  // 뷰 전환
  const viewToggle = document.getElementById("viewToggle");
  if (viewToggle) {
    viewToggle.addEventListener("click", () => {
      currentView = currentView === "grid" ? "list" : "grid";
      loadFavoriteScreen();
    });
  }

  // 카드 클릭 → 상세 페이지
  document.querySelectorAll(".favorite-card-grid, .favorite-card-list").forEach((card) => {
    card.addEventListener("click", (e) => {
      // 제거 버튼 클릭이면 상세 페이지로 이동하지 않음
      if (e.target.closest(".favorite-remove-btn")) return;

      const id = card.dataset.id;
      if (id) loadPlaceDetailPage(id);
    });
  });

  // 위시리스트에서 제거
  document.querySelectorAll(".favorite-remove-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      if (confirm("위시리스트에서 제거하시겠습니까?")) {
        removeFavorite(id);
        loadFavoriteScreen();
      }
    });
  });
}