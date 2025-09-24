// ===== 이미지 데이터 배열 (예시, imgur 링크 사용 권장) =====
const images = [
  { src: "https://i.imgur.com/ceHpjNw.png", full: "https://i.imgur.com/ceHpjNw.png", title: "악념 계략가-깡통대장(발디아)", tags: ["무기","시계"] },
  { src: "https://i.imgur.com/qs1WmgG.png", full: "https://i.imgur.com/qs1WmgG.png", title: "케른바이터-꼰대쿤(칼자스)", tags: ["무기","시계"] },
  { src: "https://i.imgur.com/SMRQDfH.png", full: "https://i.imgur.com/SMRQDfH.png", title: "티르의분노-홍염의눈동자(티스라오)", tags: ["투구","바람"] },
  { src: "https://i.imgur.com/Po0FzZo.png", full: "https://i.imgur.com/Po0FzZo.png", title: "빛나는 검의 날개-DOTGGABI(티스라오)", tags: ["장신구","만월"] },
  { src: "https://i.imgur.com/iL9nj33.png", full: "https://i.imgur.com/iL9nj33.png", title: "행성의 예-어나더쿄(레이갈드)", tags: ["방어구","수정"] },
  { src: "https://i.imgur.com/SR8GonT.png", full: "https://i.imgur.com/SR8GonT.png", title: "최후의 옷-노에미(카먼)", tags: ["방어구","나무"] },
  { src: "https://i.imgur.com/OfxE0qa.png", full: "https://i.imgur.com/OfxE0qa.png", title: "붉은 달-노에미(카먼)", tags: ["무기","태양"] },
  { src: "https://i.imgur.com/mJma6kd.png", full: "https://i.imgur.com/mJma6kd.png", title: "초저녁의 별-연옥(카먼)", tags: ["장신구","바람"] },
  { src: "https://i.imgur.com/sI3HBqb.png", full: "https://i.imgur.com/sI3HBqb.png", title: "고독한 기사의 결의-어나더쿄(레이갈드)", tags: ["투구","바람","전용장비"] }
];


const gallery = document.getElementById('gallery');
const loadMoreBtn = document.getElementById('load-more');
let loadedCount = 0;
const pageSize = 5;

function renderMore() {
  const end = Math.min(loadedCount + pageSize, images.length);
  for (let i = loadedCount; i < end; i++) {
    const img = images[i];
    const fig = document.createElement('figure');
    fig.className = 'card';
    fig.dataset.tags = img.tags.join(',');
    fig.dataset.title = img.title;
    fig.innerHTML = `
      <img src="${img.src}" loading="lazy" decoding="async" 
          alt="${img.title}" data-full="${img.full}"/>
      <span class="badge">${img.title}</span>
      <figcaption class="sr-only">${img.title}</figcaption>
      <button></button>`;
    gallery.appendChild(fig);
  }
  loadedCount = end;

  if (loadedCount >= images.length) loadMoreBtn.style.display = 'none';
}
renderMore();

// 무한 스크롤
window.addEventListener('scroll',()=>{
  if(window.innerHeight+window.scrollY>=document.body.offsetHeight-200){
    renderMore();
  }
});

// 검색 & 필터
const q=document.getElementById('q');
const filterButtons=document.querySelectorAll('.filters .btn');
let activeTag='all';
function applyFilter(){
  const term=(q.value||'').toLowerCase();
  [...gallery.children].forEach(card=>{
    const tags=(card.dataset.tags||'').toLowerCase();
    const title=(card.dataset.title||'').toLowerCase();
    const byTag=activeTag==='all'||tags.includes(activeTag);
    const bySearch=!term||tags.includes(term)||title.includes(term);
    card.style.display=byTag&&bySearch?'':'none';
  });
}
q.addEventListener('input',applyFilter);
filterButtons.forEach(btn=>btn.addEventListener('click',()=>{
  activeTag=btn.dataset.tag;
  filterButtons.forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));
  applyFilter();
}));

// 라이트박스 + URL 파라미터 딥링크
const dialog=document.getElementById('lightbox');
const lbImg=document.getElementById('lb-img');
const lbCap=document.getElementById('lb-cap');
let items=[]; let index=0;

function refreshItems(){items=[...gallery.querySelectorAll('.card')];}
function openAt(i){
  refreshItems(); index=i;
  const fig=items[index]; const img=fig.querySelector('img');
  lbImg.src=img.dataset.full||img.src; lbCap.textContent=fig.dataset.title||'';
  dialog.showModal();
  const url=new URL(location); url.searchParams.set('img',index); history.replaceState({},'',url);
}
function close(){dialog.close(); const url=new URL(location); url.searchParams.delete('img'); history.replaceState({},'',url);}
function prev(){openAt((index-1+items.length)%items.length);} 
function next(){openAt((index+1)%items.length);}

gallery.addEventListener('click',e=>{
  const fig=e.target.closest('figure');
  if(fig)openAt([...gallery.children].indexOf(fig));
});
document.querySelector('[data-action="close"]').onclick=close;
document.querySelector('[data-action="prev"]').onclick=prev;
document.querySelector('[data-action="next"]').onclick=next;
document.addEventListener('keydown',e=>{
  if(!dialog.open)return;
  if(e.key==='Escape')close();
  if(e.key==='ArrowLeft')prev();
  if(e.key==='ArrowRight')next();
});
dialog.addEventListener('click',e=>{
  if(!e.target.closest('.viewer'))close();
});

// 드래그&드롭 업로드
gallery.addEventListener('dragover',e=>{e.preventDefault();});
gallery.addEventListener('drop',e=>{
  e.preventDefault();
  const files=[...e.dataTransfer.files].filter(f=>f.type.startsWith('image/'));
  files.forEach(f=>{
    const url=URL.createObjectURL(f);
    images.push({src:url,full:url,title:f.name,tags:["uploaded"]});
    renderMore();
  });
});

// 모바일 제스처 스와이프
let startX=0;
dialog.addEventListener('touchstart',e=>{startX=e.touches[0].clientX;});
dialog.addEventListener('touchend',e=>{
  let dx=e.changedTouches[0].clientX-startX;
  if(Math.abs(dx)>60){if(dx>0)prev();else next();}
});

// URL 딥링크로 바로 열기
window.addEventListener('load',()=>{
  const p=new URL(location).searchParams.get('img');
  if(p!==null){setTimeout(()=>openAt(Number(p)),500);}
});