/**
 * stampPlaces.js
 * 
 * 대전 역사 장소 정적 데이터를 정의합니다.
 * 스탬프 랠리를 위한 역사적 장소 목록을 포함합니다.
 * 
 * 연결된 파일:
 * - js/screens/stamp_map.js
 * - js/components/stampStore.js
 */

export const STAMP_PLACES = [
    {
        id: 1,
        name: "대전역 구 역사",
        description: "1958년에 건립된 근대 건축물로, 대전의 교통 역사를 상징하는 중요한 문화재입니다.",
        lat: 36.3324,
        lng: 127.4346,
        period: "근대",
        address: "대전광역시 동구 정동"
    },
    {
        id: 2,
        name: "한밭교육박물관",
        description: "대전 교육의 역사와 변천사를 한눈에 볼 수 있는 교육 전문 박물관입니다.",
        lat: 36.3547,
        lng: 127.3856,
        period: "근현대",
        address: "대전광역시 동구 용전동"
    },
    {
        id: 3,
        name: "우암사적공원",
        description: "조선 후기 대학자 송시열 선생의 유적지로, 남간정사와 기국정 등이 있습니다.",
        lat: 36.3072,
        lng: 127.4156,
        period: "조선시대",
        address: "대전광역시 동구 가양동"
    },
    {
        id: 4,
        name: "계족산성",
        description: "백제시대에 축조된 산성으로, 둘레 약 1km의 성벽이 남아있습니다.",
        lat: 36.4156,
        lng: 127.4089,
        period: "백제시대",
        address: "대전광역시 대덕구 장동"
    },
    {
        id: 5,
        name: "대전 근현대사 전시관",
        description: "대전의 근현대 역사를 다양한 자료와 전시물로 만나볼 수 있는 전시관입니다.",
        lat: 36.3504,
        lng: 127.3849,
        period: "근현대",
        address: "대전광역시 중구 대흥동"
    }
];

// 스탬프 획득 반경 (미터)
export const STAMP_COLLECT_RADIUS = 100;