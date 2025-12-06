function initBottomSheet() {
    const sheet = document.getElementById("bottomSheet");
    const handle = document.getElementById("sheetHandle");

    let startY = 0;
    let startHeight = 0;
    let dragging = false;

    const minHeight = window.innerHeight * 0.2;  // 기본 접힌 상태
    const maxHeight = window.innerHeight * 0.85; // 최대 확장 상태

    function startDrag(e) {
        dragging = true;
        startY = e.touches ? e.touches[0].clientY : e.clientY;
        startHeight = sheet.offsetHeight;

        document.addEventListener("mousemove", onDrag);
        document.addEventListener("mouseup", endDrag);
        document.addEventListener("touchmove", onDrag);
        document.addEventListener("touchend", endDrag);
    }

    function onDrag(e) {
        if (!dragging) return;

        const y = e.touches ? e.touches[0].clientY : e.clientY;
        const diff = startY - y;

        let newHeight = startHeight + diff;

        if (newHeight < minHeight) newHeight = minHeight;
        if (newHeight > maxHeight) newHeight = maxHeight;

        sheet.style.height = `${newHeight}px`;
    }

    function endDrag() {
        dragging = false;

        document.removeEventListener("mousemove", onDrag);
        document.removeEventListener("mouseup", endDrag);
        document.removeEventListener("touchmove", onDrag);
        document.removeEventListener("touchend", endDrag);
    }

    handle.addEventListener("mousedown", startDrag);
    handle.addEventListener("touchstart", startDrag);
}

initBottomSheet();
