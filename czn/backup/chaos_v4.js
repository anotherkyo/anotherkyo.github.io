// chaos_simulator_v4.js - 카오스 제로 나이트메어 세이브 시뮬레이터 v4 기능 스크립트
const BASE={normal:20,special:80,taboo:20};
const REMAP={1:0,2:10,3:30,4:50};

const tierEl=document.getElementById('tier');
const capEl=document.getElementById('cap');
const totalPtEl=document.getElementById('totalPt');
const cardListEl=document.getElementById('cardList');
const addCardBtn=document.getElementById('addCard');
const addDefaultCardsBtn=document.getElementById('addDefaultCards');
const clearCardsBtn=document.getElementById('clearCards');
const sparkChanceEl=document.getElementById('sparkChance');
const newsparkChanceEl=document.getElementById('newsparkChance');
const cardTemplate=document.getElementById('cardTemplate');
const gaugeFill=document.getElementById('gaugeFill');
const gaugeText=document.getElementById('gaugeText');
const alertFull=document.getElementById('alertFull');
const logsEl=document.getElementById('logs');
const summaryCap=document.getElementById('summaryCap');
const summaryTotal=document.getElementById('summaryTotal');
const summaryTaboo=document.getElementById('summaryTaboo');
const summaryCount=document.getElementById('summaryCount');

let logs=[];

function calcCap(t){return 30+(Math.max(1,t)-1)*10;}
function mapCountToPt(c){c=parseInt(c)||0;if(c<=1)return 0;if(c>=5)return 70;return REMAP[c]||0;}
function escapeHtml(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function addLog(t){logs.unshift(`[${new Date().toLocaleTimeString()}] ${t}`);renderLogs();}
function renderLogs(){logsEl.innerHTML=logs.map(l=>`<div>${escapeHtml(l)}</div>`).join('');}
function randomChance(p){return Math.random()*100<p;}

function createCard(type='normal'){const n=document.importNode(cardTemplate.content,true);const el=n.querySelector('.card-item');
const cardTypeSel=el.querySelector('.card-type');cardTypeSel.value=type;
const stateSelect=el.querySelector('.state');
if(randomChance(parseFloat(sparkChanceEl.value)))stateSelect.value='spark';
else if(randomChance(parseFloat(newsparkChanceEl.value)))stateSelect.value='newspark';
el.querySelectorAll('select,input').forEach(i=>i.addEventListener('input',updateAll));
el.querySelector('.remove-btn').addEventListener('click',()=>{el.remove();updateAll();addLog('카드 제거')});
cardListEl.appendChild(el);updateAll();}

addCardBtn.addEventListener('click',()=>{createCard();addLog('카드 추가')});
addDefaultCardsBtn.addEventListener('click',()=>{
['normal','normal','special','taboo'].forEach(type=>createCard(type));
addLog('기본 카드 자동 생성');
});
clearCardsBtn.addEventListener('click',()=>{if(confirm('모든 카드 초기화?')){cardListEl.innerHTML='';updateAll();addLog('카드 목록 초기화')}});
tierEl.addEventListener('input',updateAll);
sparkChanceEl.addEventListener('input',updateAll);
newsparkChanceEl.addEventListener('input',updateAll);

function calcCardContribution(el){
  const type=el.querySelector('.card-type').value;
  const state=el.querySelector('.state').value;
  const removeCount=parseInt(el.querySelector('.remove-count').value)||0;
  const dupCount=parseInt(el.querySelector('.dup-count').value)||0;
  const transCount=parseInt(el.querySelector('.trans-count').value)||0;
  const isUnique=el.querySelector('.is-unique').checked;
  const isStartRemove=el.querySelector('.is-startremove').checked;
  
  let base=BASE[type]||0;
  let total=type==='taboo'?base:base;
  let sparkAdd=0;

  if(type!=='taboo'){
    if(state==='spark'){sparkAdd=isUnique?0:10;} 
    else if(state==='newspark'){sparkAdd=20;}
    total+=sparkAdd;
    total+=mapCountToPt(removeCount)+(removeCount>0&&(isStartRemove||state!=='normal')?20:0);
    total+=mapCountToPt(dupCount)+(dupCount>0?sparkAdd*dupCount:0);
    total+=transCount*10+(transCount>0?sparkAdd*transCount:0);
  }
  el.querySelector('.contrib').textContent=total;
  return {total,type};
}

function updateAll(){
  const tier=parseInt(tierEl.value)||1;
  const cap=calcCap(tier);
  capEl.value=cap;
  summaryCap.textContent=`${cap} pt`;

  let total=0,tabooCount=0,cardCount=0;
  Array.from(cardListEl.querySelectorAll('.card-item')).forEach(c=>{
    const r=calcCardContribution(c);
    total+=r.total;
    if(r.type==='taboo')tabooCount++;
    cardCount++;
  });
  totalPtEl.value=total;
  summaryTotal.textContent=`${total} pt`;
  summaryTaboo.textContent=tabooCount;
  summaryCount.textContent=cardCount;

  const pct=Math.min(100,Math.round((total/cap)*100));
  gaugeFill.style.width=pct+'%';
  gaugeText.textContent=`${total} / ${cap} pt`;
  alertFull.style.display=total>=cap?'block':'none';
}

updateAll();
