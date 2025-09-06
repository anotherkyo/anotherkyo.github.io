// ===== 이미지 데이터 배열 (예시, imgur 링크 사용 권장) =====
const images = [
  { src: "https://i.imgur.com/Jcqdcly.png", full: "https://i.imgur.com/Jcqdcly.png", title: "매튜", tags: ["주인공","빛군"] },
  { src: "https://i.imgur.com/h70cPCo.png", full: "https://i.imgur.com/h70cPCo.png", title: "아멜다", tags: ["주인공","빛군","인외"] },
  { src: "https://i.imgur.com/28t7hPN.png", full: "https://i.imgur.com/28t7hPN.png", title: "그레니어", tags: ["빛군"] },
  { src: "https://i.imgur.com/nC5SybY.png", full: "https://i.imgur.com/nC5SybY.png", title: "소피아", tags: ["기원","공주","인외"] },
  { src: "https://i.imgur.com/CumER4W.png", full: "https://i.imgur.com/CumER4W.png", title: "페라키아", tags: ["어둠","유성"] },
  { src: "https://i.imgur.com/yvzeToF.png", full: "https://i.imgur.com/yvzeToF.png", title: "프레아", tags: ["기원","공주"] },
  { src: "https://i.imgur.com/kDzJwVB.png", full: "https://i.imgur.com/kDzJwVB.png", title: "발가스", tags: ["제국","전략"] },
  { src: "", full: "", title: "파나", tags: ["제국","어둠"] },
  { src: "", full: "", title: "나암", tags: ["빛군","공주","유성"] },
  { src: "", full: "", title: "크리스", tags: ["주인공","빛군","공주"] },
  { src: "", full: "", title: "키리카제", tags: ["기원","유성"] },
  { src: "", full: "", title: "실버울프", tags: ["기원","유성"] },
  { src: "", full: "", title: "소니아", tags: ["제국","어둠","공주"] },
  { src: "", full: "", title: "에마링크", tags: ["제국","전략"] },
  { src: "", full: "", title: "이멜다", tags: ["제국","전략"] },
  { src: "", full: "", title: "리파니", tags: ["기원","공주"] },
  { src: "", full: "", title: "에그베르트", tags: ["제국","어둠","전략"] },
  { src: "", full: "", title: "헤인", tags: ["빛군","제국"] },
  { src: "", full: "", title: "란스", tags: ["빛군","제국","전략"] },
  { src: "", full: "", title: "보젤", tags: ["어둠","인외"] },
  { src: "", full: "", title: "레딘", tags: ["주인공","빛군"] },
  { src: "", full: "", title: "레온", tags: ["제국","전략"] },
  { src: "", full: "", title: "베른하르트", tags: ["제국","어둠","인외"] },
  { src: "", full: "", title: "라나", tags: ["어둠","공주"] },
  { src: "", full: "", title: "엘윈", tags: ["주인공","빛군","제국"] },
  { src: "", full: "", title: "쉐리", tags: ["빛군","공주","유성"] },
  { src: "", full: "", title: "리아나", tags: ["주인공","빛군","공주"] },
  { src: "", full: "", title: "알테뮬러", tags: ["제국","어둠","전략"] },
  { src: "", full: "", title: "루나", tags: ["기원","공주","전략"] },
  { src: "", full: "", title: "디하르트 파인애플", tags: ["주인공","기원","유성"] },
  { src: "", full: "", title: "티아리스", tags: ["주인공","기원","공주"] },
  { src: "", full: "", title: "쥬그라", tags: ["기원","유성","인외"] },
  { src: "", full: "", title: "젤다", tags: ["어둠","유성","인외"] },
  { src: "", full: "", title: "제리올", tags: ["기원","전략"] },
  { src: "", full: "", title: "셀파닐", tags: ["공주","전설"] },
  { src: "", full: "", title: "안젤리나", tags: ["공주","유성","전설"] },
  { src: "", full: "", title: "란포드", tags: ["전략","전설"] },
  { src: "", full: "", title: "리스틸", tags: ["어둠","전설"] },
  { src: "", full: "", title: "란디우스", tags: ["주인공","전설"] },
  { src: "", full: "", title: "레이첼", tags: ["주인공","전설"] },
  { src: "", full: "", title: "윌러", tags: ["전략","전설"] },
  { src: "", full: "", title: "기자로프", tags: ["어둠","인외"] },
  { src: "", full: "", title: "세레나", tags: ["전략","전설"] },
  { src: "", full: "", title: "시그마", tags: ["주인공","전설","유성"] },
  { src: "", full: "", title: "람다", tags: ["주인공","전설","인외"] },
  { src: "", full: "", title: "안젤리카", tags: ["빛군","시공"] },
  { src: "", full: "", title: "클라렛", tags: ["공주","전설","유성"] },
  { src: "", full: "", title: "엘라스타 랑모제일미녀", tags: ["빛군","기원","전략"] },
  { src: "", full: "", title: "오메가", tags: ["어둠","유성"] },
  { src: "", full: "", title: "유리아", tags: ["빛군","공주","인외"] },
  { src: "", full: "", title: "레인폴스", tags: ["전략","전설","인외"] },
  { src: "", full: "", title: "베티", tags: ["빛군","제국","어둠"] },
  { src: "", full: "", title: "알프레드", tags: ["전설","유성"] },
  { src: "", full: "", title: "환생제시카 환시카 프라임제시카 프시카", tags: ["빛군","기원","인외"] },
  { src: "", full: "", title: "에밀리아", tags: ["제국","공주"] },
  { src: "", full: "", title: "비라쥬 물고기 턱돌이", tags: ["전설","유성"] },
  { src: "", full: "", title: "미지의기사 에밀리", tags: ["전략","전설"] },
  { src: "", full: "", title: "아카야", tags: ["빛군","기원","인외"] },
  { src: "", full: "", title: "브렌다", tags: ["전설","유성"] },
  { src: "", full: "", title: "올리버 잼민이", tags: ["빛군","전설","유성"] },
  { src: "", full: "", title: "아레스", tags: ["주인공","제국","리인카"] },
  { src: "", full: "", title: "마이야", tags: ["제국","리인카"] },
  { src: "", full: "", title: "일루시아", tags: ["빛군","전략"] },
  { src: "", full: "", title: "실린카", tags: ["유성","인외"] },
  { src: "", full: "", title: "리코리스", tags: ["어둠","공주","리인카"] },
  { src: "", full: "", title: "레나타", tags: ["어둠","리인카"] },
  { src: "", full: "", title: "로자리아", tags: ["빛군","공주","리인카"] },
  { src: "", full: "", title: "노에미 노애미", tags: ["빛군","리인카"] },
  { src: "", full: "", title: "헬레나", tags: ["빛군","제국"] },
  { src: "", full: "", title: "세계수의현자 틀디우스 틀디", tags: ["전설","인외"] },
  { src: "", full: "", title: "플로렌티아", tags: ["제국","전략","리인카"] },
  { src: "", full: "", title: "츠바메", tags: ["리인카","유성"] },
  { src: "", full: "", title: "멜파니", tags: ["빛군","공주","전설"] },
  { src: "", full: "", title: "로젠실", tags: ["제국","인외","공주"] },
  { src: "", full: "", title: "클로테르 파이어펀치 파펀", tags: ["제국","전략"] },
  { src: "", full: "", title: "탄생의빛 로리카 초딩시카", tags: ["빛군","기원","리인카"] },
  { src: "", full: "", title: "마리엘", tags: ["빛군","리인카"] },
  { src: "", full: "", title: "힐다", tags: ["제국","전략","리인카"] },
  { src: "", full: "", title: "베르너", tags: ["제국","리인카"] },
  { src: "", full: "", title: "크루거", tags: ["어둠","인외"] },
  { src: "", full: "", title: "빈센트", tags: ["제국","어둠","유성"] },
  { src: "", full: "", title: "토와", tags: ["리인카","기원","전략"] },
  { src: "", full: "", title: "팟시르", tags: ["리인카","어둠"] },
  { src: "", full: "", title: "크림조의왕 홍월지왕", tags: ["기원","어둠","인외"] },
  { src: "", full: "", title: "화이트시시", tags: ["빛군","공주"] },
  { src: "", full: "", title: "오토크라토4세 오토크라토", tags: ["제국","리인카"] },
  { src: "", full: "", title: "루크레치아", tags: ["제국","공주","리인카"] },
  { src: "", full: "", title: "입실론 엡실론", tags: ["어둠","전설","유성"] },
  { src: "", full: "", title: "뮤 나무로리", tags: ["전설","인외"] },
  { src: "", full: "", title: "크리스티안네 크리스티앙 크앙", tags: ["제국","공주","리인카"] },
  { src: "", full: "", title: "수제트 수젯 수재트", tags: ["유성","리인카"] },
  { src: "", full: "", title: "초월자", tags: ["어둠","전설","인외"] },
  { src: "", full: "", title: "알파", tags: ["제국","어둠"] },
  { src: "", full: "", title: "베르너 뉴그마 틀그마 에길", tags: ["빛군","전설","유성"] },
  { src: "", full: "", title: "마리안델 뉴람다 틀다", tags: ["공주","전설","인외"] },
  { src: "", full: "", title: "웨탐 흑튜", tags: ["주인공","어둠","인외"] },
  { src: "", full: "", title: "엘마", tags: ["주인공","빛군","리인카"] },
  { src: "", full: "", title: "켈티스", tags: ["어둠","리인카"] },
  { src: "", full: "", title: "로비나대제 틀레스 뉴레스", tags: ["주인공","전략","리인카"] },
  { src: "", full: "", title: "방주의성녀 틀코리스 뉴코리스", tags: ["주인공","공주","인외"] },
  { src: "", full: "", title: "구스타프", tags: ["어둠","인외","리인카"] },
  { src: "", full: "", title: "미셸", tags: ["빛군","리인카"] },
  { src: "", full: "", title: "리자", tags: ["주인공","유성","전설"] },
  { src: "", full: "", title: "아이언챈슬러 틀로렌티아 틀로렌", tags: ["제국","전략","전설"] },
  { src: "", full: "", title: "달의집정관", tags: ["전략","전설","인외"] },
  { src: "", full: "", title: "아즈사", tags: ["기원","전략","인외"] },
  { src: "", full: "", title: "오보로", tags: ["기원","전설","인외"] },
  { src: "", full: "", title: "카구야", tags: ["공주","전략","인외"] },
  { src: "", full: "", title: "캐롤리안", tags: ["빛군","제국","전략"] },
  { src: "", full: "", title: "아샤메르", tags: ["기원","공주","인외"] },
  { src: "", full: "", title: "로스탐", tags: ["기원","전략","유성"] },
  { src: "", full: "", title: "방랑투사 틀렌다 하후돈", tags: ["기원","유성","전설"] },
  { src: "", full: "", title: "율리안", tags: ["어둠","유성","리인카"] },
  { src: "", full: "", title: "리키", tags: ["주인공","빛군","전설"] },
  { src: "", full: "", title: "마크렌", tags: ["전략","유성","전설"] },
  { src: "", full: "", title: "아단켈모", tags: ["전략","전설","인외"] },
  { src: "", full: "", title: "빛의수호사도", tags: ["주인공","빛군","인외"] },
  { src: "", full: "", title: "빛과그림자검의영혼 틀다 틀돌이", tags: ["주인공","인외","리인카"] },
  { src: "", full: "", title: "껍질소녀 틀크레치아", tags: ["어둠","공주","리인카"] },
  { src: "", full: "", title: "리오벡", tags: ["제국","어둠","인외"] },
  { src: "", full: "", title: "지온", tags: ["기원","유성","전략"] },
  { src: "", full: "", title: "폴리알", tags: ["어둠","전설","리인카"] },
  { src: "", full: "", title: "루그너", tags: ["빛군","전략","리인카"] },
  { src: "", full: "", title: "그렌실", tags: ["공주","전략","기원"] },
  { src: "", full: "", title: "요아코니", tags: ["제국","전략","리인카"] },
  { src: "", full: "", title: "각성자 아단켈모 틀단켈모", tags: ["어둠","시공","인외"] },
  { src: "", full: "", title: "사그니 부엉이", tags: ["전설","전략","인외"] },
  { src: "", full: "", title: "아마데우스 노루", tags: ["기원","전략","인외"] },
  { src: "", full: "", title: "님프", tags: ["공주","전설","유성"] },
  { src: "", full: "", title: "타탈리아", tags: ["어둠","유성","인외"] },
  { src: "", full: "", title: "투어밀크", tags: ["기원","전설","인외"] },
  { src: "", full: "", title: "이리스", tags: ["유성","전설","인외"] },
  { src: "", full: "", title: "롤랑 롤랜드 로랜드", tags: ["주인공","빛군","전설"] },
  { src: "", full: "", title: "프레시아", tags: ["주인공","공주","인외"] },
  { src: "", full: "", title: "강신자 신강자", tags: ["어둠","전설","인외"] },
  { src: "", full: "", title: "잭 털바퀴 좆냥이", tags: ["빛군","유성","전설"] },
  { src: "", full: "", title: "안드리올", tags: ["제국","전략","유성"] },
  { src: "", full: "", title: "네미아", tags: ["빛군","전략","전설"] },
  { src: "", full: "", title: "애쉬엔", tags: ["빛군","공주","유성"] },
  { src: "", full: "", title: "호프만", tags: ["빛군","전략","유성"] },
  { src: "", full: "", title: "이졸데", tags: ["전설","유성","인외"] },
  { src: "", full: "", title: "제이스", tags: ["기원","전설","인외"] },
  { src: "", full: "", title: "페트리시아", tags: ["제국","공주","인외"] },
  { src: "", full: "", title: "군", tags: ["전략","전설","유성"] },
  { src: "", full: "", title: "얼어붙은 심연의 지배자", tags: ["제국","전략","시공"] },
  { src: "", full: "", title: "타브리스", tags: ["공주","전략","유성"] },
  { src: "", full: "", title: "타이란텔", tags: ["제국","인외","리인카"] },
  { src: "", full: "", title: "세리카", tags: ["빛군","공주","전설"] },
  { src: "", full: "", title: "이미르", tags: ["빛군","어둠","전설"] },
  { src: "", full: "", title: "비리아 닭장", tags: ["빛군","공주","전설"] },
  { src: "", full: "", title: "세라피나 닭장", tags: ["제국","전략","유성"] },
  { src: "", full: "", title: "빛의소환사 크리스", tags: ["빛군","공주","인외"] },
  { src: "", full: "", title: "시온", tags: ["주인공","빛군","전설"] },
  { src: "", full: "", title: "티아나 라나", tags: ["빛군","유성","전설"] },
  { src: "", full: "", title: "엔야", tags: ["기원","전설","인외"] },
  { src: "", full: "", title: "아리아 쌍둥이 동생", tags: ["빛군","기원","공주"] },
  { src: "", full: "", title: "이리아 쌍둥이 언니", tags: ["빛군","기원","공주"] },
  { src: "", full: "", title: "노노린", tags: ["빛군","전략","유성"] },
  { src: "", full: "", title: "사프린", tags: ["기원","인외","리인카"] },
  { src: "", full: "", title: "염룡파멸자 엘가스", tags: ["제국","어둠","전설"] },
  { src: "", full: "", title: "란델", tags: ["어둠","전설","전략"] },
  { src: "", full: "", title: "히비스커스", tags: ["어둠","유성","인외"] },
  { src: "", full: "", title: "실나", tags: ["어둠","기원","전설"] }
];


const gallery = document.getElementById('gallery');
const loadMoreBtn = document.getElementById('load-more');
let loadedCount = 0;
const pageSize = 16;

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