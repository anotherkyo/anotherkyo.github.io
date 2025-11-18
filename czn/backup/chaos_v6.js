/* chaos_v6_fixed.js
   v6 fixed: v5.2 기반 오류 수정 + 3-player support
   - 제거 확정 로직 도입 (removeCount 누적은 "확정" 버튼으로만 증가)
   - 복제/변환 체크는 '발생 이벤트'로 작동: 체크 시 count++ 및 체크박스 비활성화
   - 고유 카드 복제 추가 및 목록 반영 수정
   - 전체 계산 규칙 v5.1 동일 적용
*/

const BASE = { neutral:20, monster:80, taboo:20 };
const REMAP = {1:0,2:10,3:30,4:50}; // 5+ => 70

// players data (3 players)
const players = [
  { id: 'p1', name: '캐릭터1', tier:1, cards:[], unique:[], _refs:{} },
  { id: 'p2', name: '캐릭터2', tier:1, cards:[], unique:[], _refs:{} },
  { id: 'p3', name: '캐릭터3', tier:1, cards:[], unique:[], _refs:{} }
];

// util
function calcCap(t){ return 30 + (Math.max(1,t)-1)*10; }
function mapCountToPt(c){ c = parseInt(c)||0; if(c<=1) return 0; if(c>=5) return 70; return REMAP[c]||0; }
function addLog(msg){
  const logArea = document.getElementById('logArea');
  const line = document.createElement('div');
  line.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
  logArea.prepend(line);
}
function clampPct(n){ return Math.max(0, Math.min(100, n)); }

// create default unique cards for a player
function generateDefaultUnique(pl){
  pl.unique = [
    { id:'고유일반1', rarity:'normal', color:'#ffffff', canShine:false, removed:false, removeCount:0, state:'normal', transCount:0, dupCount:0 },
    { id:'고유일반2', rarity:'normal', color:'#ffffff', canShine:false, removed:false, removeCount:0, state:'normal', transCount:0, dupCount:0 },
    { id:'고유일반3', rarity:'normal', color:'#ffffff', canShine:false, removed:false, removeCount:0, state:'normal', transCount:0, dupCount:0 },

    { id:'고유레어1', rarity:'rare', color:'#5bd3f0', canShine:true, removed:false, removeCount:0, state:'normal', transCount:0, dupCount:0 },
    { id:'고유레어2', rarity:'rare', color:'#5bd3f0', canShine:true, removed:false, removeCount:0, state:'normal', transCount:0, dupCount:0 },
    { id:'고유레어3', rarity:'rare', color:'#5bd3f0', canShine:true, removed:false, removeCount:0, state:'normal', transCount:0, dupCount:0 },

    { id:'고유전설1', rarity:'legend', color:'#ffd700', canShine:true, removed:false, removeCount:0, state:'normal', transCount:0, dupCount:0 },
    { id:'고유신화1', rarity:'myth', color:'#a777ff', canShine:false, removed:false, removeCount:0, state:'normal', transCount:0, dupCount:0 }
  ];
}

// build UI for all players
function buildUI(){
  const grid = document.getElementById('playersGrid');
  grid.innerHTML = '';
  players.forEach((pl, idx) => {
    // create card
    const sec = document.createElement('section');
    sec.className = 'player-card';
    sec.dataset.index = idx;

    // header
    const header = document.createElement('div'); header.className='player-head';
    const left = document.createElement('div'); left.className='left';
    const nameInput = document.createElement('input'); nameInput.className='player-name input-small'; nameInput.value = pl.name;
    nameInput.addEventListener('input', ()=>{ pl.name = nameInput.value || `캐릭터${idx+1}`;});
    left.appendChild(nameInput);
    header.appendChild(left);

    const controls = document.createElement('div'); controls.className='player-controls';
    const tierInput = document.createElement('input'); tierInput.type='number'; tierInput.min=1; tierInput.value=pl.tier; tierInput.className='input-small'; tierInput.style.width='80px';
    tierInput.addEventListener('input', ()=>{ pl.tier = Math.max(1, parseInt(tierInput.value)||1); renderAll(); });
    controls.appendChild(tierInput);

    const addBtn = document.createElement('button'); addBtn.className='btn ghost'; addBtn.textContent='카드 추가'; addBtn.addEventListener('click', ()=> openAddModal(idx));
    controls.appendChild(addBtn);

    header.appendChild(controls);
    sec.appendChild(header);

    // gauge
    const gaugeWrap = document.createElement('div'); gaugeWrap.className='section';
    const capSpan = document.createElement('div'); capSpan.className='small'; capSpan.textContent = `상한: ${calcCap(pl.tier)} pt`;
    const memoryVal = document.createElement('div'); memoryVal.className='small'; memoryVal.style.fontWeight='800'; memoryVal.textContent='총: 0 pt';
    const gauge = document.createElement('div'); gauge.className='gauge';
    const fill = document.createElement('div'); fill.className='gauge-fill';
    const gtext = document.createElement('div'); gtext.className='gauge-text'; gtext.textContent='0 / 0 pt';
    gauge.appendChild(fill); gauge.appendChild(gtext);
    gaugeWrap.appendChild(capSpan); gaugeWrap.appendChild(memoryVal); gaugeWrap.appendChild(gauge);
    sec.appendChild(gaugeWrap);

    // card list (user added)
    const cardSection = document.createElement('div'); cardSection.className='section';
    const list = document.createElement('div'); list.className='card-list';
    cardSection.appendChild(list);
    sec.appendChild(cardSection);

    // unique area
    const uniqueSection = document.createElement('div'); uniqueSection.className='section';
    const uniqueTitle = document.createElement('div'); uniqueTitle.className='small'; uniqueTitle.style.fontWeight='700'; uniqueTitle.textContent='고유카드 (8장)';
    const uniqueWrap = document.createElement('div'); uniqueWrap.className='card-list';
    uniqueSection.appendChild(uniqueTitle); uniqueSection.appendChild(uniqueWrap);
    sec.appendChild(uniqueSection);

    grid.appendChild(sec);

    // refs
    pl._refs = {
      el: sec, nameInput, tierInput, capSpan, memoryVal, fill, gtext, list, uniqueWrap
    };

    // init unique cards if empty
    if(!pl.unique || pl.unique.length===0) generateDefaultUnique(pl);
    renderPlayerUnique(pl);
    renderPlayerCards(pl);
    updatePlayerGauge(pl);
  });

  // modal controls
  setupModalControls();
}

// modal functions
let modalTarget = null;
function openAddModal(playerIndex){
  modalTarget = playerIndex;
  document.getElementById('addModal').style.display = 'flex';
  document.getElementById('addModal').setAttribute('aria-hidden','false');
}
function closeAddModal(){
  document.getElementById('addModal').style.display = 'none';
  document.getElementById('addModal').setAttribute('aria-hidden','true');
}
function setupModalControls(){
  const addBtn = document.getElementById('modalAddBtn');
  const cancelBtn = document.getElementById('modalCancelBtn');
  addBtn.onclick = () => {
    const type = document.getElementById('modalCardType').value;
    const state = document.getElementById('modalCardState').value;
    const pl = players[modalTarget];
    // create card object and push
    const card = { type, state, dupCount:0, transCount:0 };
    // if unique clone requested, mark as uniqueClone and include id
    if(type==='unique'){
      // create unique clone with basic id (user clones)
      card.type = 'unique_clone';
      card.cloneId = `복제_고유_${Date.now()}`;
    }
    pl.cards.push(card);
    addLog(`[${pl.name}] 카드 추가: ${card.type} (${card.state})`);
    closeAddModal();
    renderPlayerCards(pl);
    updatePlayerGauge(pl);
  };
  cancelBtn.onclick = () => { closeAddModal(); };
}

// render functions
function renderPlayerCards(pl){
  const list = pl._refs.list;
  list.innerHTML = '';
  pl.cards.forEach((c, idx) => {
    const row = document.createElement('div'); row.className='card-row';
    const left = document.createElement('div'); left.className='card-left';
    const title = document.createElement('div'); title.style.fontWeight='700';
    title.textContent = (c.type==='unique_clone') ? (c.cloneId) : c.type;
    left.appendChild(title);

    const mid = document.createElement('div'); mid.style.display='flex'; mid.style.gap='8px';
    // state select
    const sel = document.createElement('select'); sel.className='select';
    sel.innerHTML = '<option value="normal">일반</option><option value="spark">번뜩임</option><option value="newspark">신 번뜩임</option>';
    sel.value = c.state || 'normal';
    sel.addEventListener('change', ()=>{ c.state = sel.value; updatePlayerGauge(pl); });
    mid.appendChild(sel);

    // dup checkbox -> when checked, increment dupCount and disable
    const dupLabel = document.createElement('label'); dupLabel.className='small';
    const dupChk = document.createElement('input'); dupChk.type='checkbox';
    dupChk.addEventListener('change', ()=>{ if(dupChk.checked){ c.dupCount = (c.dupCount||0)+1; dupChk.disabled = true; addLog(`[${pl.name}] ${title.textContent} 복제 발생 (총 ${c.dupCount})`); updatePlayerGauge(pl);} });
    dupLabel.appendChild(dupChk); dupLabel.appendChild(document.createTextNode('복제'));
    mid.appendChild(dupLabel);

    // trans checkbox -> when checked, increment transCount and disable
    const transLabel = document.createElement('label'); transLabel.className='small';
    const transChk = document.createElement('input'); transChk.type='checkbox';
    transChk.addEventListener('change', ()=>{ if(transChk.checked){ c.transCount = (c.transCount||0)+1; transChk.disabled = true; addLog(`[${pl.name}] ${title.textContent} 변환 발생 (총 ${c.transCount})`); updatePlayerGauge(pl);} });
    transLabel.appendChild(transChk); transLabel.appendChild(document.createTextNode('변환'));
    mid.appendChild(transLabel);

    left.appendChild(mid);

    const right = document.createElement('div'); right.style.textAlign='right';
    const contrib = document.createElement('div'); contrib.className='small'; contrib.style.fontWeight='800'; contrib.textContent='0 pt';
    right.appendChild(contrib);
    const del = document.createElement('button'); del.className='btn ghost'; del.textContent='삭제';
    del.addEventListener('click', ()=>{ pl.cards.splice(idx,1); addLog(`[${pl.name}] 카드 삭제`); renderPlayerCards(pl); updatePlayerGauge(pl); });
    right.appendChild(del);

    row.appendChild(left); row.appendChild(right);
    list.appendChild(row);

    // store ref for contribution update
    c._contribEl = contrib;
  });
}

function renderPlayerUnique(pl){
  const wrap = pl._refs.uniqueWrap;
  wrap.innerHTML = '';
  pl.unique.forEach((u, idx) => {
    const row = document.createElement('div'); row.className='card-row';
    row.style.borderLeft = `4px solid ${u.color}`;

    const left = document.createElement('div'); left.style.display='flex'; left.style.gap='8px'; left.style.alignItems='center';
    const name = document.createElement('div'); name.style.fontWeight='700'; name.textContent = u.id; name.style.color = u.color;
    left.appendChild(name);

    // remove toggle (checked toggles removed state but does not increment removeCount)
    const remLabel = document.createElement('label'); remLabel.className='small';
    const remChk = document.createElement('input'); remChk.type='checkbox'; remChk.checked = !!u.removed;
    remChk.addEventListener('change', ()=>{
      u.removed = remChk.checked;
      addLog(`[${pl.name}] ${u.id} 제거 상태: ${u.removed ? '체크' : '해제'}`);
    });
    remLabel.appendChild(remChk); remLabel.appendChild(document.createTextNode('제거'));
    left.appendChild(remLabel);

    row.appendChild(left);

    const right = document.createElement('div'); right.style.display='flex'; right.style.gap='8px'; right.style.alignItems='center';

    // state select (disabled for normal & myth)
    if(u.canShine){
      const sel = document.createElement('select'); sel.className='select';
      sel.innerHTML = '<option value="normal">일반</option><option value="spark">번뜩임</option><option value="newspark">신 번뜩임</option>';
      sel.value = u.state || 'normal';
      sel.addEventListener('change', ()=>{ u.state = sel.value; updatePlayerGauge(pl); });
      right.appendChild(sel);
    } else {
      const badge = document.createElement('div'); badge.className='small'; badge.textContent='번뜩임 없음'; right.appendChild(badge);
    }

    // removal confirm button: increments removeCount only when clicked while removed=true
    const remConfirm = document.createElement('button'); remConfirm.className='btn ghost'; remConfirm.textContent='제거확정';
    remConfirm.addEventListener('click', ()=>{
      if(u.removed){
        u.removeCount = (u.removeCount||0) + 1;
        addLog(`[${pl.name}] ${u.id} 제거 확정 (누적 ${u.removeCount})`);
        updatePlayerGauge(pl);
      } else {
        addLog(`[${pl.name}] ${u.id} 제거확정 실패 - 먼저 '제거'를 체크하세요.`);
      }
    });
    right.appendChild(remConfirm);

    // transform event button (in case user wants to add transform to unique)
    const transBtn = document.createElement('button'); transBtn.className='btn ghost'; transBtn.textContent='변환 발생';
    transBtn.addEventListener('click', ()=>{ u.transCount = (u.transCount||0) + 1; addLog(`[${pl.name}] ${u.id} 변환 발생(총 ${u.transCount})`); updatePlayerGauge(pl); });
    right.appendChild(transBtn);

    // contrib
    const contrib = document.createElement('div'); contrib.className='small'; contrib.style.fontWeight='800'; contrib.textContent='0 pt';
    right.appendChild(contrib);

    row.appendChild(right);
    wrap.appendChild(row);

    u._contribEl = contrib;
  });
}

// calculation functions
function calcCardContribution(card){
  let total = 0;
  if(card.type === 'taboo'){ total += BASE.taboo; }
  else {
    total += BASE[card.type] || 0;
    if(card.state === 'spark') total += 10;
    else if(card.state === 'newspark') total += 20;
    // duplication pt based on dupCount
    total += mapCountToPt(card.dupCount || 0);
    if(card.dupCount){
      const dupSpark = (card.state==='newspark') ? 20 : (card.state==='spark' ? 10 : 0);
      total += dupSpark * (card.dupCount || 0);
    }
    // transform
    total += (card.transCount || 0) * 10;
    if(card.transCount){
      const tSpark = (card.state==='newspark') ? 20 : (card.state==='spark' ? 10 : 0);
      total += tSpark * (card.transCount || 0);
    }
  }
  return total;
}

function calcUniqueContribution(u){
  let total = 0;
  // unique base 0
  if(u.state === 'newspark' && u.canShine) total += 20;
  if(u.removed){
    total += mapCountToPt(u.removeCount || 0);
    total += 20; // unique removal extra
  }
  total += (u.transCount || 0) * 10;
  // dup count for unique (shouldn't normally happen because copy means adding new unique item)
  total += mapCountToPt(u.dupCount || 0);
  return total;
}

function updatePlayerGauge(pl){
  let total = 0;
  pl.cards.forEach(c => {
    const val = calcCardContribution(c);
    total += val;
    if(c._contribEl) c._contribEl.textContent = val + ' pt';
  });
  pl.unique.forEach(u => {
    const val = calcUniqueContribution(u);
    total += val;
    if(u._contribEl) u._contribEl.textContent = val + ' pt';
  });
  pl._refs.memoryVal.textContent = `총: ${total} pt`;
  const cap = calcCap(pl.tier || 1);
  pl._refs.capSpan.textContent = `상한: ${cap} pt`;
  const pct = clampPct(Math.round((total / cap) * 100));
  pl._refs.fill.style.width = pct + '%';
  pl._refs.gtext.textContent = `${total} / ${cap} pt`;
}

// update all players
function renderAll(){
  players.forEach(pl => {
    renderPlayerCards(pl);
    renderPlayerUnique(pl);
    updatePlayerGauge(pl);
  });
}

// initialization
function init(){
  // build UI and default data
  players.forEach(pl => { generateDefaultUnique(pl); });
  buildUI();
  // attach log controls
  document.getElementById('clearLog').addEventListener('click', ()=>{ document.getElementById('logArea').innerHTML=''; });
  document.getElementById('exportJson').addEventListener('click', ()=>{
    const out = players.map(p => ({ id:p.id, name:p.name, tier:p.tier, cards:p.cards, unique:p.unique }));
    const blob = new Blob([JSON.stringify(out,null,2)],{type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'chaos_v6_export.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  });

  // modal close on outside click
  const modal = document.getElementById('addModal');
  modal.addEventListener('click', (e)=>{ if(e.target === modal) closeAddModal(); });
}

// run
window.addEventListener('DOMContentLoaded', ()=>{ init(); renderAll(); });
