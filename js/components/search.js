export function initSearch() {
  const input = document.querySelector("#searchInput");

  input.addEventListener("input", (e) => {
    const keyword = e.target.value.trim();
    console.log("검색어:", keyword);
  });
}
