/**
 * stampStore.js
 * 
 * 스탬프 데이터를 localStorage로 관리하는 유틸리티입니다.
 * 스탬프 획득, 조회, 진행률 계산 기능을 제공합니다.
 * 
 * 연결된 파일:
 * - js/screens/stamp_map.js
 * - js/data/stampPlaces.js
 */

const STORAGE_KEY = "dtrip_stamps";

/**
 * localStorage에서 스탬프 데이터 가져오기
 */
function getStampData() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
        return { collected: [] };
    }
    return JSON.parse(data);
}

/**
 * localStorage에 스탬프 데이터 저장하기
 */
function saveStampData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * 획득한 스탬프 목록 가져오기
 * @returns {Array} 획득한 스탬프 배열 [{stampId, collectedAt}, ...]
 */
export function getCollectedStamps() {
    const data = getStampData();
    return data.collected || [];
}

/**
 * 특정 스탬프가 이미 획득되었는지 확인
 * @param {number} stampId - 스탬프 ID
 * @returns {boolean} 획득 여부
 */
export function isStampCollected(stampId) {
    const collected = getCollectedStamps();
    return collected.some(stamp => stamp.stampId === stampId);
}

/**
 * 스탬프 획득 처리
 * @param {number} stampId - 획득할 스탬프 ID
 * @returns {boolean} 성공 여부 (이미 획득한 경우 false)
 */
export function collectStamp(stampId) {
    if (isStampCollected(stampId)) {
        return false; // 이미 획득함
    }

    const data = getStampData();
    data.collected.push({
        stampId: stampId,
        collectedAt: new Date().toISOString()
    });

    saveStampData(data);
    return true;
}

/**
 * 스탬프 진행률 계산
 * @param {number} totalStamps - 전체 스탬프 수
 * @returns {Object} { collected: number, total: number, percentage: number }
 */
export function getProgress(totalStamps) {
    const collected = getCollectedStamps();
    const count = collected.length;
    const percentage = totalStamps > 0 ? Math.round((count / totalStamps) * 100) : 0;

    return {
        collected: count,
        total: totalStamps,
        percentage: percentage
    };
}

/**
 * 스탬프 획득 취소 (테스트용)
 * @param {number} stampId - 취소할 스탬프 ID
 */
export function removeStamp(stampId) {
    const data = getStampData();
    data.collected = data.collected.filter(stamp => stamp.stampId !== stampId);
    saveStampData(data);
    return true;
}

/**
 * 모든 스탬프 데이터 초기화 (테스트용)
 */
export function resetAllStamps() {
    localStorage.removeItem(STORAGE_KEY);
}