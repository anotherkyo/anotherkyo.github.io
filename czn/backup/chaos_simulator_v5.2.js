// chaos_simulator_v5_2.js - v5.2 업데이트
const BASE={neutral:20,monster:80,taboo:20};
const REMAP={1:0,2:10,3:30,4:50};

const tierEl=document.getElementById('tier');
const sparkChanceEl=document.getElementById('sparkChance');
const newsparkChanceEl=document.getElementById('newsparkChance');
const openAddModalBtn=document.getElementById('openAddModal');
const modal=document.getElementById('modal');
const addCardConfirm=document.getElementById('addCardConfirm');
const addCardCancel=document.getElementById('addCardCancel');
const newType=document.getElementById('newType');
const newState=document.getElementById('newState');
const resetAll=document.getElementById('resetAll');
const cardListEl=document.getElementById('cardList');
const cardTemplate=document.getElementById('cardTemplate');
const uniqueWrap=document.getElementById('uniqueWrap');
const capDisplay=document.getElementById('capDisplay');
const totalDisplay=document.getElementById('totalDisplay');
const gaugeFill=document.getElementById('gaugeFill');
const gaugeText=document.getElementById('gaugeText');
const alertFull=document.getElementById('alertFull');
const logsEl=document.getElementById('logs');

let logs=[]; let uniqueCards=[];

function calcCap(t){return 30 + (Math.max(1,t)-1)*10;}
function mapCountToPt(c){c=parseInt(c)||0;if(c<=1) return 0;if(c>=5) return 70;return REMAP[c]||0;}
function randChance(p){return Math.random()*100<p;}
function addLog(t){logs.unshift(`[${new Date().toLocaleTimeString()}] ${t}`);renderLogs();}
function renderLogs(){logsEl.innerHTML = logs.map(l=>`<div>${escapeHtml(l)}</div>`).join('');}
function escapeHtml(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

// modal
openAddModalBtn.addEventListener('click', ()=>{ modal.style.display='flex';});
addCardCancel.addEventListener('click', ()=>{ modal.style.display='none';});
addCardConfirm.addEventListener('click', ()=>{
  const type=newType.value; const state=newState.value;
  createCard(type,state);
  modal.style.display='none';
  addLog(`카드 추가: ${type}, 상태:${state}`);
});

function createCard(prefType='neutral', prefState='normal'){
  const n=document.importNode(cardTemplate.content,true); const el=n.querySelector('.card-item');
  el.querySelector('.card-type').value = (prefType==='unique') ? 'neutral' : prefType;
  const stateSel = el.querySelector('.state');
  stateSel.value = prefState;
  el.querySelectorAll('select,input').forEach(inp=>{ inp.addEventListener('input', ()=>{ if(inp.classList && (inp.classList.contains('is-dup')||inp.classList.contains('is-trans'))){ if(inp.checked) { const key = inp.classList.contains('is-dup') ? 'data-dupcount' : 'data-transcount'; const prev = parseInt(el.getAttribute(key)||'0'); el.setAttribute(key, prev+1); } } updateAll(); }); });
  el.querySelector('.remove-row').addEventListener('click', ()=>{ el.remove(); addLog('추가된 카드 삭제'); updateAll(); });
  cardListEl.prepend(el);
  updateAll();
}

resetAll.addEventListener('click', ()=>{ if(confirm('초기화 할까요?')){ cardListEl.innerHTML=''; initUnique(); logs=[]; addLog('초기화'); updateAll(); }});

function initUnique(){ uniqueWrap.innerHTML=''; uniqueCards=[];
  // 고유일반1~3
  for(let i=1;i<=3;i++){ const id=`고유일반${i}`; const uc={id,rarity:'normal',removed:false,removeCount:0,dupCount:0,transCount:0,state:'normal',_el:null,_contribEl:null}; uniqueCards.push(uc);} 
  // 고유레어1~3
  for(let i=1;i<=3;i++){ const id=`고유레어${i}`; const uc={id,rarity:'rare',removed:false,removeCount:0,dupCount:0,transCount:0,state:'normal',_el:null,_contribEl:null}; uniqueCards.push(uc);} 
  // 고유전설1
  {const id='고유전설1'; const uc={id,rarity:'legend',removed:false,removeCount:0,dupCount:0,transCount:0,state:'normal',_el:null,_contribEl:null}; uniqueCards.push(uc);}
  // 고유신화1
  {const id='고유신화1'; const uc={id,rarity:'myth',removed:false,removeCount:0,dupCount:0,transCount:0,state:'normal',_el:null,_contribEl:null}; uniqueCards.push(uc);}

  uniqueCards.forEach((uc,idx)=>{
    const div=document.createElement('div'); div.className='card-item';
    const left=document.createElement('div');
    let color=''; switch(uc.rarity){case 'normal': color='#fff'; break; case 'rare': color='#5bd3f0'; break; case 'legend': color='#ffd700'; break; case 'myth': color='#a777ff'; break;} 
    left.innerHTML=`<div style="font-weight:700;color:${color}">${uc.id} ${uc.rarity!=='normal'?`<span class=small style="color:#9fb0bf">(${uc.rarity})</span>`:''}</div>`;

    const mid=document.createElement('div'); mid.style.display='grid'; mid.style.gridTemplateColumns='repeat(2,1fr)'; mid.style.gap='8px';
    // 제거 checkbox
    const remDiv = document.createElement('div');
    const remLabel = document.createElement('label');
    remLabel.className = 'small';
    const remChk = document.createElement('input');
    remChk.type = 'checkbox';

    remChk.addEventListener('change', () => {
        // 제거 체크/해제시 상태만 반영
        uc.removed = remChk.checked;
        addLog(`${uc.id} ${uc.removed ? '제거 처리' : '제거 해제'}`);
        updateAll(); // 계산 함수에서 pt 적용
    });

    remLabel.appendChild(remChk);
    remLabel.appendChild(document.createTextNode('제거'));
    remDiv.appendChild(remLabel);
    mid.appendChild(remDiv);
    
    // 상태 셀렉트 (고유일반1~3은 비활성화)
    if((uc.rarity!=='normal' && uc.rarity!=='myth') || (uc.rarity==='normal' && !uc.id.includes('일반'))){
      const stateSel=document.createElement('select');
      stateSel.innerHTML = '<option value="normal">일반</option>' + (uc.rarity!=='normal'?'<option value="spark">번뜩임</option><option value="newspark">신 번뜩임</option>':'');
      stateSel.value='normal'; stateSel.addEventListener('change', ()=>{ uc.state=stateSel.value; updateAll(); });
      mid.appendChild(stateSel);
    }
    const right=document.createElement('div'); right.style.textAlign='right'; const contrib=document.createElement('div'); contrib.className='small'; contrib.innerHTML='기여 <div style="font-weight:800"><span>0</span> pt</div>';
    right.appendChild(contrib);
    div.appendChild(left); div.appendChild(mid); div.appendChild(right);
    uniqueWrap.appendChild(div);
    uc._el = div; uc._contribEl = contrib.querySelector('span');
  });
}

function calcCardContribution(el){ const type = el.querySelector('.card-type').value; const state = el.querySelector('.state').value; const isDup = el.querySelector('.is-dup')?.checked; const isTrans = el.querySelector('.is-trans')?.checked; const dupCount = parseInt(el.getAttribute('data-dupcount')||'0'); const transCount = parseInt(el.getAttribute('data-transcount')||'0'); let total=0; if(type==='taboo'){ total += BASE.taboo; } else { total += BASE[type]||0; let sparkAdd = 0; if(state==='spark') sparkAdd = 10; if(state==='newspark') sparkAdd = 20; total += sparkAdd; total += mapCountToPt(dupCount); if(dupCount>0) total += (state==='spark'?10:(state==='newspark'?20:0)) * dupCount; total += transCount * 10; if(transCount>0) total += (state==='spark'?10:(state==='newspark'?20:0)) * transCount; } el.querySelector('.contrib').textContent = total; return {total, type}; }

function calcUniqueContribution(uc) {
    let total = 0;
    // 제거 pt는 체크 상태일 때만 +20pt
    if (uc.removed) total += 20; 
    // 기존 번뜩임, 변환 등 추가 pt 계산
    if (uc.state === 'newspark' && uc.rarity !== 'normal' && uc.rarity !== 'myth') total += 20;
    // 변환/복제 pt 적용 등 필요 시 추가
    if (uc._contribEl) uc._contribEl.textContent = total + ' pt';
    return total;
}

function updateAll(){ const tier = parseInt(tierEl.value)||1; const cap = calcCap(tier); capDisplay.textContent = `${cap} pt`; let total=0; let cardCount=0; let tabooCount=0; Array.from(cardListEl.querySelectorAll('.card-item')).forEach(el=>{ const r=calcCardContribution(el); total += r.total; cardCount++; if(r.type==='taboo') tabooCount++; }); uniqueCards.forEach(uc=>{ total += calcUniqueContribution(uc); }); totalDisplay.textContent = `${total} pt`; gaugeFill.style.width = `${Math.min(100, Math.round((total/cap)*100))}%`; gaugeText.textContent = `${total} / ${cap} pt`; alertFull.style.display = total >= cap ? 'block' : 'none'; addLog(`계산: Tier ${tier} Cap ${cap} -> 총 ${total}pt, 카드 ${cardCount}개, 금기 ${tabooCount}개`); }

initUnique(); updateAll();
[tierEl, sparkChanceEl, newsparkChanceEl].forEach(el=>el.addEventListener('input', updateAll));