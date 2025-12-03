import { db } from "../database/firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

export async function loadCategories() {
  const wrapper = document.getElementById("categoryWrapper");

  const snapshot = await getDocs(collection(db, "Category"));
  let html = "";

  snapshot.forEach(doc => {
    const c = doc.data();
    html += `
      <div class="category-item" data-type="${c.type}">
        <img src="${c.image_url}" />
        <p>${c.type}</p>
      </div>
    `;
  });

  wrapper.innerHTML = html;
}

export async function loadTags(target = "tagFilter") {
  const tagFilter = document.getElementById(target);

  if (!tagFilter) {
    console.warn("❌ tagFilter DOM을 찾을 수 없습니다:", target);
    return;
  }

  const snapshot = await getDocs(collection(db, "TagFilter"));
  let html = "";

  snapshot.forEach(doc => {
    const t = doc.data();
    html += `
      <span class="tag">
        <img src="${t.image_url}" /> ${t.type}
      </span>
    `;
  });

  tagFilter.innerHTML = html;
}
