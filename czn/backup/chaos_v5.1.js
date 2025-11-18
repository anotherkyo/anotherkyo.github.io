// chaos_simulator_v5_1.js
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
const addDefaults=document.getElementById('addDefaults');
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
function calcCap(t){return 30 + (Math.max(1,t)-1)*10;}function mapCountToPt(c){c=parseInt(c)||0;if(c<=1) return 0;if(c>=5) return 70;return REMAP[c]||0;}function randChance(p){return Math.random()*100<p;}function addLog(t){logs.unshift(`[${new Date().toLocaleTimeString()}] ${t}`);renderLogs();}function renderLogs(){logsEl.innerHTML = logs.map(l=>`<div>${escapeHtml(l)}</div>`).join('');}function escapeHtml(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

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
  el.querySelector('.card-type').value = (prefType==='unique') ? 'neutral' : prefType; // unique added as neutral-type visual
  const stateSel = el.querySelector('.state');
  stateSel.value = prefState;
  // disable state options for unique-type added via modal? if prefType==='unique' and prefState invalid, allow

  // event listeners
  el.querySelectorAll('select,input').forEach(inp=>{ inp.addEventListener('input', ()=>{ if(inp.classList && (inp.classList.contains('is-dup')||inp.classList.contains('is-trans'))){ if(inp.checked) { // increment counters stored as data-attrs
        const key = inp.classList.contains('is-dup') ? 'data-dupcount' : 'data-transcount';
        const prev = parseInt(el.getAttribute(key)||'0'); el.setAttribute(key, prev+1);
      }} updateAll(); }); });
  el.querySelector('.remove-row').addEventListener('click', ()=>{ el.remove(); addLog('추가된 카드 삭제'); updateAll(); });
  cardListEl.prepend(el);
  updateAll();
}

// defaults
addDefaults.addEventListener('click', ()=>{ createCard('neutral','normal'); createCard('neutral','normal'); createCard('monster','normal'); createCard('taboo','normal'); addLog('기본카드 생성'); });
resetAll.addEventListener('click', ()=>{ if(confirm('초기화 할까요?')){ cardListEl.innerHTML=''; initUnique(); logs=[]; addLog('초기화'); updateAll(); }});

// unique init
function initUnique(){ uniqueWrap.innerHTML=''; uniqueCards=[];
  for(let i=1;i<=3;i++){ const id=`고유일반${i}`; const uc={id,rarity:'normal',removed:false,removeCount:0,dupCount:0,transCount:0,state:'normal',_el:null,_contribEl:null}; uniqueCards.push(uc);} for(let i=1;i<=5;i++){ const id=`고유레어${i}`; const uc={id,rarity:'rare',removed:false,removeCount:0,dupCount:0,transCount:0,state:'normal',_el:null,_contribEl:null}; uniqueCards.push(uc);} 
  uniqueCards.forEach((uc,idx)=>{
    const div=document.createElement('div'); div.className='card-item';
    const left=document.createElement('div'); left.innerHTML=`<div style="font-weight:700">${uc.id} ${uc.rarity==='rare'?'<span class=small style="color:#9fb0bf">(레어)</span>':''}</div>`;
    const mid=document.createElement('div'); mid.style.display='grid'; mid.style.gridTemplateColumns='repeat(3,1fr)'; mid.style.gap='8px';
    // state select
    const stateSel=document.createElement('select'); stateSel.innerHTML = '<option value="normal">일반</option>' + (uc.rarity==='rare'?'<option value="spark">번뜩임</option><option value="newspark">신 번뜩임</option>':''); stateSel.value='normal'; stateSel.addEventListener('change', ()=>{ uc.state=stateSel.value; updateAll(); });
    mid.appendChild(stateSel);
    // removal checkbox (action: when checked increment removeCount and mark removed)
    const remDiv=document.createElement('div'); const remLabel=document.createElement('label'); remLabel.className='small'; const remChk=document.createElement('input'); remChk.type='checkbox'; remChk.addEventListener('change', ()=>{ if(remChk.checked){ uc.removed=true; uc.removeCount +=1; addLog(`${uc.id} 제거 처리 (제거 횟수=${uc.removeCount})`);} else { uc.removed=false; addLog(`${uc.id} 제거 해제`);} updateAll(); }); remLabel.appendChild(remChk); remLabel.appendChild(document.createTextNode('제거')); remDiv.appendChild(remLabel); mid.appendChild(remDiv);
    // dup checkbox - when checked increment dupCount (counts how many times duplicated)
    const dupDiv=document.createElement('div'); const dupLabel=document.createElement('label'); dupLabel.className='small'; const dupChk=document.createElement('input'); dupChk.type='checkbox'; dupChk.addEventListener('change', ()=>{ if(dupChk.checked){ uc.dupCount +=1; addLog(`${uc.id} 복제 발생 (총 복제=${uc.dupCount})`);} updateAll(); }); dupLabel.appendChild(dupChk); dupLabel.appendChild(document.createTextNode('복제')); dupDiv.appendChild(dupLabel); mid.appendChild(dupDiv);
    // trans checkbox
    const transDiv=document.createElement('div'); const transLabel=document.createElement('label'); transLabel.className='small'; const transChk=document.createElement('input'); transChk.type='checkbox'; transChk.addEventListener('change', ()=>{ if(transChk.checked){ uc.transCount +=1; addLog(`${uc.id} 변환 발생 (총 변환=${uc.transCount})`);} updateAll(); }); transLabel.appendChild(transChk); transLabel.appendChild(document.createTextNode('변환')); transDiv.appendChild(transLabel); mid.appendChild(transDiv);
    const right=document.createElement('div'); right.style.textAlign='right'; const contrib=document.createElement('div'); contrib.className='small'; contrib.innerHTML='기여 <div style="font-weight:800"><span>0</span> pt</div>';
    right.appendChild(contrib);
    div.appendChild(left); div.appendChild(mid); div.appendChild(right);
    uniqueWrap.appendChild(div);
    uc._el = div; uc._contribEl = contrib.querySelector('span'); uc._stateSel = stateSel; uc._remChk = remChk; uc._dupChk = dupChk; uc._transChk = transChk;
  });
}

// calc functions
function calcCardContribution(el){ const type = el.querySelector('.card-type').value; const state = el.querySelector('.state').value; const isDup = el.querySelector('.is-dup').checked; const isTrans = el.querySelector('.is-trans').checked; const dupCount = parseInt(el.getAttribute('data-dupcount')||'0'); const transCount = parseInt(el.getAttribute('data-transcount')||'0'); let total=0; if(type==='taboo'){ total += BASE.taboo; } else { total += BASE[type]||0; let sparkAdd = 0; if(state==='spark') sparkAdd = 10; if(state==='newspark') sparkAdd = 20; total += sparkAdd; // removal not applicable for added cards
  // duplication: each time isDup toggled we increment data-dupcount; use that
  total += mapCountToPt(dupCount); if(dupCount>0) total += (state==='spark'?10:(state==='newspark'?20:0)) * dupCount; // transform
  total += transCount * 10; if(transCount>0) total += (state==='spark'?10:(state==='newspark'?20:0)) * transCount; }
  el.querySelector('.contrib').textContent = total; return {total, type}; }

function calcUniqueContribution(uc){ let total=0; // base 0
  if(uc.rarity==='rare'){ if(uc.state==='newspark') total +=20; // spark adds 0
  }
  if(uc.removed){ // removal extra +20 and removal count mapping
    total += mapCountToPt(uc.removeCount) + 20; }
  // duplication
  total += mapCountToPt(uc.dupCount); if(uc.dupCount>0){ const dupSpark = (uc.state==='newspark')?20:0; total += dupSpark * uc.dupCount; }
  // transform
  total += uc.transCount * 10; if(uc.transCount>0){ const tSpark = (uc.state==='newspark')?20:0; total += tSpark * uc.transCount; }
  if(uc._contribEl) uc._contribEl.textContent = total; return total; }

function updateAll(){ const tier = parseInt(tierEl.value)||1; const cap = calcCap(tier); capDisplay.textContent = `${cap} pt`; let total=0; let cardCount=0; let tabooCount=0; Array.from(cardListEl.querySelectorAll('.card-item')).forEach(el=>{ const r=calcCardContribution(el); total += r.total; cardCount++; if(r.type==='taboo') tabooCount++; }); uniqueCards.forEach(uc=>{ total += calcUniqueContribution(uc); }); totalDisplay.textContent = `${total} pt`; gaugeFill.style.width = `${Math.min(100, Math.round((total/cap)*100))}%`; gaugeText.textContent = `${total} / ${cap} pt`; alertFull.style.display = total >= cap ? 'block' : 'none'; addLog(`계산: Tier ${tier} Cap ${cap} -> 총 ${total}pt, 카드 ${cardCount}개, 금기 ${tabooCount}개`); }

// init
initUnique(); updateAll();
// listeners
[tierEl, sparkChanceEl, newsparkChanceEl].forEach(el=>el.addEventListener('input', updateAll));

