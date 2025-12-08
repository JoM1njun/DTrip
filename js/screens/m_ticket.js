/**
 * m_ticket.js
 * 
 * [나의 패스권 보기 화면 로직]
 * localStorage에 저장된 예매 내역을 불러와 티켓 UI에 표시합니다.
 * 
 * 🔗 연결된 파일:
 * 1. css/m_ticket.css
 * 2. js/screens/menu.js
 */
import { loadMenuScreen } from "./menu.js";

export function loadMyTicketScreen() {
    const content = document.getElementById("content");
    content.innerHTML = ""; // 초기화

    // Ticket Data 로드
    const savedData = localStorage.getItem("dTrip_ticket");

    // 데이터가 없으면 안내 표시
    if (!savedData) {
        content.innerHTML = `
            <div class="m-ticket-page" style="justify-content: center;">
                <header class="m-ticket-header">
                     <button class="m-ticket-back-btn" id="mTicketBackBtn">
                        <img src="assets/icons/back.svg" alt="Back" style="width: 12px;">
                    </button>
                    <h1 class="m-ticket-title">나의 패스권</h1>
                </header>
                <div style="text-align:center; color:#888;">
                    <p>예매된 패스권이 없습니다.</p>
                </div>
            </div>
        `;
        attachBackListener();
        return;
    }

    const ticket = JSON.parse(savedData);
    const dateObj = new Date(ticket.date);
    const dateStr = `${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getDate().toString().padStart(2, '0')}`;

    // QR Code API URL (데이터를 포함한 QR 이미지 생성)
    // 예: https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=...
    const qrData = `DTRIP-${ticket.timestamp}-${ticket.adultCount}-${ticket.childCount}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}&color=000000&bgcolor=ffffff`;

    content.innerHTML = `
        <div class="m-ticket-page">
            <header class="m-ticket-header">
                <button class="m-ticket-back-btn" id="mTicketBackBtn">
                    <img src="assets/icons/back.svg" alt="Back" style="width: 12px;">
                </button>
                <h1 class="m-ticket-title">나의 패스권</h1>
            </header>

            <!-- 티켓 카드 -->
            <div class="m-ticket-card">
                <div class="m-ticket-content">
                    
                    <!-- 브랜드 (상단 좌측) -->
                    <div class="m-ticket-brand-box">DTRIP</div>

                    <!-- QR Code (상단 우측) -->
                    <div class="m-ticket-qr-area">
                        <img src="${qrUrl}" class="m-ticket-qr-img" alt="QR Code" />
                        <span class="m-ticket-qr-code-text">CHECK-IN</span>
                    </div>

                    <!-- 메인 텍스트 -->
                    <div class="m-ticket-main-text">DAEJEON</div>
                    <div class="m-ticket-sub-text">TRIP PASS</div>

                    <!-- 구분선 -->
                    <div class="m-ticket-divider"></div>

                    <!-- 티켓 타입 (성인/어린이 등) -->
                    <div class="m-ticket-type">
                        PASSENGER <span style="font-size:20px; vertical-align:middle;">***</span>
                    </div>

                    <!-- 정보 Row -->
                    <div class="m-ticket-info-row">
                        <div class="m-ticket-info-item">
                            <span class="m-ticket-label">DATE</span>
                            <span class="m-ticket-value">${dateStr}</span>
                        </div>
                         <div class="m-ticket-info-item">
                            <span class="m-ticket-label">ADULT</span>
                            <span class="m-ticket-value">${ticket.adultCount}</span>
                        </div>
                         <div class="m-ticket-info-item">
                            <span class="m-ticket-label">CHILD</span>
                            <span class="m-ticket-value">${ticket.childCount}</span>
                        </div>
                    </div>
                     
                    <div class="m-ticket-info-row" style="margin-top: 10px;">
                        <div class="m-ticket-info-item">
                            <span class="m-ticket-label">PRICE</span>
                            <span class="m-ticket-value">₩${ticket.price.toLocaleString()}</span>
                        </div>
                        
                        <!-- 장식 아이콘 -->
                         <div class="m-ticket-deco-icon" style="display:flex; justify-content:center; align-items:center;">
                            <!-- 간단한 원형 심볼 -->
                             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" stroke="#000" stroke-width="3"/>
                                <circle cx="12" cy="12" r="4" fill="#000"/>
                             </svg>
                        </div>
                    </div>

                    <!-- 바코드 스트립 (하단 장식) -->
                    <div class="m-ticket-barcode-strip"></div>

                </div>
            </div>
        </div>
    `;

    attachBackListener();
}

function attachBackListener() {
    document.getElementById("mTicketBackBtn")?.addEventListener("click", () => {
        loadMenuScreen();
    });
}