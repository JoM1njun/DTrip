let activeCategory = null;
let activeTag = null;

export function registerFilterEvents({
    onFilterChange,    // 필터가 변경될 때 실행될 콜백
    categorySelector = ".category-item",
    tagSelector = ".tag"
}) {

    // 🔹 카테고리 클릭 이벤트
    document.querySelectorAll(categorySelector).forEach(item => {
        item.addEventListener("click", (e) => {
            e.stopPropagation();

            const type = item.dataset.type;

            // "축제" 는 별도 처리해야 할 경우 → 여기서 return 가능
            if (type === "축제" || type.toLowerCase() === "festival") {
                import("../screens/festival.js").then(m => m.loadFestivalList());
                return;
            }

            // 같은 카테고리를 다시 클릭 → 해제
            if (activeCategory === type) {
                activeCategory = null;
                document.querySelectorAll(categorySelector).forEach(el => el.classList.remove("selected"));
                onFilterChange({ category: activeCategory, tag: activeTag });
                return;
            }

            activeCategory = type;

            // 선택된 카테고리 표시
            document.querySelectorAll(categorySelector).forEach(el => el.classList.remove("selected"));
            item.classList.add("selected");

            onFilterChange({ category: activeCategory, tag: activeTag });
        });
    });

    // 🔹 태그 클릭 이벤트
    document.querySelectorAll(tagSelector).forEach(tag => {
        tag.addEventListener("click", (e) => {
            e.stopPropagation();

            const tagValue = tag.dataset.tag;

            // 같은 태그 다시 클릭하면 해제
            if (activeTag === tagValue) {
                activeTag = null;
                document.querySelectorAll(tagSelector).forEach(el => el.classList.remove("selected"));
                onFilterChange({ category: activeCategory, tag: activeTag });
                return;
            }

            activeTag = tagValue;

            // 선택된 태그 표시
            document.querySelectorAll(tagSelector).forEach(el => el.classList.remove("selected"));
            tag.classList.add("selected");

            onFilterChange({ category: activeCategory, tag: activeTag });
        });
    });
}
