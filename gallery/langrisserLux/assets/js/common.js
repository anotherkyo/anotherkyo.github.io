const gallery = document.getElementById('gallery');
const q = document.getElementById('q');
const filterButtons = document.querySelectorAll('.filters .btn');
const toggleBtn = document.getElementById('toggle-mode');
const root = document.documentElement;

let images = []; // JSON에서 불러온 이미지 데이터
let items = [];  // 현재 화면에 보이는 카드
let index = 0;
let activeTag = 'all';

// 테마 초기화
let currentMode = localStorage.getItem('theme') || 'system';
if(currentMode !== 'system') root.setAttribute('data-theme', currentMode);

toggleBtn.addEventListener('click', () => {
  currentMode = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', currentMode);
  localStorage.setItem('theme', currentMode);
});

// ==========================
// JSON 데이터 불러오기
// ==========================
async function loadImages() {
  try {
    const res = await fetch('./assets/data/images.json');
    images = await res.json();
    applyFilter(); // 불러온 후 필터 적용 + 렌더링
  } catch (err) {
    console.error("이미지 데이터를 불러오지 못했습니다.", err);
  }
}

// ==========================
// 갤러리 렌더링
// ==========================
function renderGallery(filteredImages) {
  gallery.innerHTML = '';
  filteredImages.forEach(img => {
    const fig = document.createElement('figure');
    fig.className = 'card';
    fig.dataset.tags = img.tags.join(',');
    fig.dataset.title = img.title;
    fig.innerHTML = `
      <img src="${img.src}" loading="lazy" decoding="async" alt="${img.title}" data-full="${img.full}" />
      <span class="badge">${img.title}</span>
      <figcaption class="sr-only">${img.title}</figcaption>
      ${img.comment ? `<div class="comment">💬 ${img.comment}</div>` : ""}
      <button></button>
    `;
    gallery.appendChild(fig);
  });
  refreshItems();
}

// ==========================
// 필터 & 검색
// ==========================
function applyFilter() {
  const term = (q.value || '').toLowerCase();
  const filtered = images.filter(img => {
    const tags = img.tags.join(',').toLowerCase();
    const title = img.title.toLowerCase();
    const byTag = activeTag === 'all' || tags.includes(activeTag);
    const bySearch = !term || tags.includes(term) || title.includes(term);
    return byTag && bySearch;
  });
  renderGallery(filtered);
}

q.addEventListener('input', applyFilter);
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    activeTag = btn.dataset.tag;
    filterButtons.forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
    applyFilter();
  });
});

// ==========================
// 라이트박스 기능
// ==========================
const dialog = document.getElementById('lightbox');
const lbImg = document.getElementById('lb-img');
const lbCap = document.getElementById('lb-cap');
const lbComment = document.getElementById('lbComment');

function refreshItems() {
  items = [...gallery.querySelectorAll('.card')].filter(c => c.style.display !== 'none');
}

function openAt(i) {
  refreshItems();
  if (i < 0 || i >= items.length) return;
  index = i;
  const fig = items[index];
  const img = fig.querySelector('img');
  const data = images.find(im => im.title === fig.dataset.title);

  lbImg.src = img.dataset.full || img.src;
  lbCap.textContent = fig.dataset.title || '';
  if (data?.comment) {
    lbComment.textContent = data.comment;
    lbComment.style.display = '';
  } else {
    lbComment.textContent = '';
    lbComment.style.display = 'none';
  }

  dialog.showModal();
  const url = new URL(location);
  url.searchParams.set('img', index);
  history.replaceState({}, '', url);
}

function close() { 
  dialog.close(); 
  const url = new URL(location); 
  url.searchParams.delete('img'); 
  history.replaceState({}, '', url); 
}
function prev() { openAt((index - 1 + items.length) % items.length); }
function next() { openAt((index + 1) % items.length); }

gallery.addEventListener('click', e => {
  const fig = e.target.closest('figure');
  if (fig && fig.style.display !== 'none') {
    const i = items.indexOf(fig);
    if (i !== -1) openAt(i);
  }
});

document.querySelector('[data-action="close"]').onclick = close;
document.querySelector('[data-action="prev"]').onclick = prev;
document.querySelector('[data-action="next"]').onclick = next;

document.addEventListener('keydown', e => {
  if (!dialog.open) return;
  if (e.key === 'Escape') close();
  if (e.key === 'ArrowLeft') prev();
  if (e.key === 'ArrowRight') next();
});

dialog.addEventListener('click', e => {
  if (!e.target.closest('.viewer')) close();
});

// ==========================
// 모바일 스와이프
// ==========================
let startX = 0;
dialog.addEventListener('touchstart', e => { startX = e.touches[0].clientX; });
dialog.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - startX;
  if (Math.abs(dx) > 60) { if (dx > 0) prev(); else next(); }
});

// ==========================
// URL 딥링크
// ==========================
window.addEventListener('load', () => {
  loadImages(); // JSON 불러오기 + 초기 렌더링
  const p = new URL(location).searchParams.get('img');
  if (p !== null) setTimeout(() => openAt(Number(p)), 500);
});
