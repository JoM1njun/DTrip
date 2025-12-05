/**
 * favoriteStore.js
 * 
 * 로컬 스토리지를 사용하여 좋아요(위시리스트) 데이터를 관리하는 유틸리티입니다.
 * 장소 추가, 제거 및 좋아요 상태 확인 기능을 지원합니다.
 * 
 * 연결된 파일:
 * - js/screens/favorite.js
 * - js/screens/detail.js
 * - js/screens/home.js
 */
// js/components/favoriteStore.js
// 로컬스토리지를 이용해 "좋아요한 장소(위시리스트)"를 관리하는 유틸

const STORAGE_KEY = "dtrip_favorites";

function readStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.error("즐겨찾기 읽기 오류:", e);
        return [];
    }
}

function writeStorage(list) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
        console.error("즐겨찾기 저장 오류:", e);
    }
}

export function getFavorites() {
    return readStorage();
}

export function isFavorite(id) {
    const list = readStorage();
    return list.some((item) => item.id === id.toString());
}

export function addFavorite(place) {
    const list = readStorage();
    const id = place.id.toString();
    if (list.some((item) => item.id === id)) return;

    list.push({ ...place, id });
    writeStorage(list);
}

export function removeFavorite(id) {
    const list = readStorage();
    const newList = list.filter((item) => item.id !== id.toString());
    writeStorage(newList);
}

