export function initCategory() {
  const items = document.querySelectorAll(".category-item");

  items.forEach(item => {
    item.addEventListener("click", () => {
      const type = item.dataset.type;
      alert(`카테고리 선택됨: ${type}`);
    });
  });
}
