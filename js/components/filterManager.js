// filterManager.js
let originalPopular = [];
let originalRecommend = [];

export function setOriginalData(popular, recommend) {
    originalPopular = Array.isArray(popular) ? popular : [];
    originalRecommend = Array.isArray(recommend) ? recommend : [];

    console.log("✅ setOriginalData:", {
        popular: originalPopular.length,
        recommend: originalRecommend.length,
    });
}

export function filterByCategory(category) {
    console.log("filterByCategory:", category);

    return {
        popular: originalPopular.filter(p => p.categoryId === category),
        recommend: originalRecommend.filter(p => p.categoryId === category),
    };
}

export function filterByTag(tag) {
    console.log("filterByTag:", tag);

    return {
        popular: originalPopular.filter(p => p.tag === tag),
        recommend: originalRecommend.filter(p => p.tag === tag),
    };
}

export function resetFilter() {
    console.log("resetFilter");

    return {
        popular: [...originalPopular],
        recommend: [...originalRecommend],
    };
}
