/**
 * courseStore.js
 * 
 * 로컬 스토리지를 사용하여 코스 데이터를 관리하는 유틸리티입니다.
 * 코스에 대한 CRUD(생성, 읽기, 업데이트, 삭제) 작업을 지원합니다.
 * 
 * 연결된 파일:
 * - js/components/courseRecommend.js
 * - js/screens/courseList.js
 * - js/screens/courseDetail.js
 * - js/screens/courseAdd.js
 */
// js/components/courseStore.js
// 코스(경로) 데이터를 로컬스토리지로 관리하는 유틸

const STORAGE_KEY = "dtrip_courses";

function readStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.error("코스 읽기 오류:", e);
        return [];
    }
}

function writeStorage(list) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
        console.error("코스 저장 오류:", e);
    }
}

// 모든 코스 가져오기
export function getAllCourses() {
    return readStorage();
}

// 특정 코스 가져오기
export function getCourse(courseId) {
    const courses = readStorage();
    return courses.find((c) => c.id === courseId.toString());
}

// 코스 추가
export function addCourse(course) {
    const courses = readStorage();
    const newCourse = {
        id: Date.now().toString(), // 간단한 ID 생성
        ...course,
        createdAt: new Date().toISOString(),
        likes: 0, // 좋아요 수
    };
    courses.push(newCourse);
    writeStorage(courses);
    return newCourse.id;
}

// 코스 업데이트
export function updateCourse(courseId, updates) {
    const courses = readStorage();
    const index = courses.findIndex((c) => c.id === courseId.toString());
    if (index === -1) return false;

    courses[index] = { ...courses[index], ...updates };
    writeStorage(courses);
    return true;
}

// 코스 삭제
export function deleteCourse(courseId) {
    const courses = readStorage();
    const newCourses = courses.filter((c) => c.id !== courseId.toString());
    writeStorage(newCourses);
    return courses.length !== newCourses.length;
}

// 코스 좋아요 증가
export function likeCourse(courseId) {
    const courses = readStorage();
    const index = courses.findIndex((c) => c.id === courseId.toString());
    if (index === -1) return false;

    courses[index].likes = (courses[index].likes || 0) + 1;
    writeStorage(courses);
    return true;
}

// 인기 코스 가져오기 (좋아요 순)
export function getPopularCourses(limit = 10) {
    const courses = readStorage();
    return courses
        .sort((a, b) => (b.likes || 0) - (a.likes || 0))
        .slice(0, limit);
}

// 최신 코스 가져오기
export function getRecentCourses(limit = 10) {
    const courses = readStorage();
    return courses
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit);
}
