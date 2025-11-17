/* chaos_v7.0.js
 * - v6.3 기반
 * - 캐릭터 선택 시스템 추가 (player별 캐릭터 독립 선택)
 * - 캐릭터 선택 시: 덱 전체 초기화 + 고유카드 목록/이름 갱신 + 초상화 변경
 * - 캐릭터 데이터는 characters.json에서 로드
 * - 제거는 고유카드만 가능, 캐릭터별 덱 기준으로 제거 회차 계산
 * - 고유카드 제거 시: 제거회차 pt + 20pt 추가
 * - 고유일반/신화는 번뜩임 UI 없음, 레어/전설만 번뜩임/신번뜩임 가능
 * - 변환은 일반/복제/고유카드 모두 체크박스 토글 방식
 * - 캐릭터별 상한/총 pt 텍스트 삭제, 게이지만 사용
 * - 티어 셀렉트 우측 초기화 버튼 (0티어로 리셋)
 */

const BASE = {
  neutral: 20,
  monster: 80,
  taboo: 20
};

// 제거/복제/변환 횟수 → pt 매핑
// 1회차:0, 2회차:10, 3회차:30, 4회차:50, 5회차 이상:70
const REMAP = { 1: 0, 2: 10, 3: 30, 4: 50 };

let globalTier = 0; // 0~20, 0티어=20pt

// 캐릭터 데이터 로드용
let characterList = [];   // [{id,name,portrait,unique:[...]}...]
let characterMap = {};    // id -> meta

function calcCap(tier) {
  const t = Math.max(0, tier | 0);
  return 20 + t * 10;
}

function mapCountToPt(order) {
  const c = parseInt(order || 0, 10);
  if (c <= 1) return 0;
  if (c >= 5) return 70;
  return REMAP[c] || 0;
}

function clampPct(n) {
  return Math.max(0, Math.min(100, n));
}

function addLog(msg) {
  const logArea = document.getElementById("logArea");
  if (!logArea) return;
  const line = document.createElement("div");
  line.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
  logArea.prepend(line);
}

// 플레이어 데이터
const players = [
  { id: "p1", name: "캐릭터1", charId: null, cards: [], unique: [], portrait: null, _refs: {} },
  { id: "p2", name: "캐릭터2", charId: null, cards: [], unique: [], portrait: null, _refs: {} },
  { id: "p3", name: "캐릭터3", charId: null, cards: [], unique: [], portrait: null, _refs: {} }
];

// 고유카드 색상
function rarityColor(r) {
  switch (r) {
    case "normal": return "#ffffff";
    case "rare": return "#5bd3f0";
    case "legend": return "#ffd700";
    case "myth": return "#a777ff";
    default: return "#ffffff";
  }
}

// 캐릭터에 맞는 고유카드 세팅
function setUniqueByCharacter(pl, charId) {
  const meta = characterMap[charId];
  if (!meta || !Array.isArray(meta.unique)) {
    // fallback: 아무것도 없으면 빈 배열
    pl.unique = [];
    return;
  }
  pl.unique = meta.unique.map(u => ({
    id: u.id,
    rarity: u.rarity,
    color: rarityColor(u.rarity),
    canShine: !!u.canShine,
    removed: false,
    state: "normal",
    transCount: 0,
    dupCount: 0
  }));
}

// UI 생성
function buildUI() {
  const grid = document.getElementById("playersGrid");
  grid.innerHTML = "";

  players.forEach((pl, index) => {
    const sec = document.createElement("section");
    sec.className = "player-card";
    sec.dataset.index = String(index);

    // 상단 캐릭터 영역
    const head = document.createElement("div");
    head.className = "player-head";

    const charRow = document.createElement("div");
    charRow.className = "char-row";

    // 캐릭터 선택
    const charSelWrap = document.createElement("div");
    charSelWrap.className = "char-select";

    const charLabel = document.createElement("span");
    charLabel.className = "small";
    charLabel.textContent = "캐릭터:";
    charSelWrap.appendChild(charLabel);

    const charSelect = document.createElement("select");
    characterList.forEach(ch => {
      const opt = document.createElement("option");
      opt.value = ch.id;
      opt.textContent = ch.name;
      charSelect.appendChild(opt);
    });
    // 기본 캐릭터 없으면 첫 번째로
    if (!pl.charId && characterList.length > 0) {
      pl.charId = characterList[0].id;
    }
    if (pl.charId) charSelect.value = pl.charId;

    charSelect.addEventListener("change", () => {
      const newId = charSelect.value;
      changePlayerCharacter(pl, newId);
    });

    charSelWrap.appendChild(charSelect);

    // 이름 입력 (캐릭터명 기본, 수정 가능)
    const nameInput = document.createElement("input");
    nameInput.className = "player-name";
    nameInput.value = pl.name;
    nameInput.addEventListener("input", () => {
      pl.name = nameInput.value || `캐릭터${index + 1}`;
    });

    charRow.appendChild(charSelWrap);
    charRow.appendChild(nameInput);

    // 초상화
    const portrait = document.createElement("div");
    portrait.className = "portrait";
    const img = document.createElement("img");
    img.alt = "portrait";
    portrait.appendChild(img);

    head.appendChild(charRow);
    head.appendChild(portrait);

    // 카드추가 버튼
    const addBtn = document.createElement("button");
    addBtn.className = "btn ghost";
    addBtn.textContent = "카드 추가";
    addBtn.style.alignSelf = "flex-end";
    addBtn.addEventListener("click", () => openAddModal(index));

    head.appendChild(addBtn);
    sec.appendChild(head);

    // 게이지
    const gaugeSec = document.createElement("div");
    gaugeSec.className = "section";
    const gauge = document.createElement("div");
    gauge.className = "gauge";
    const gaugeFill = document.createElement("div");
    gaugeFill.className = "gauge-fill";
    const gaugeText = document.createElement("div");
    gaugeText.className = "gauge-text";
    gaugeText.textContent = "0 / 0 pt";
    gauge.appendChild(gaugeFill);
    gauge.appendChild(gaugeText);
    gaugeSec.appendChild(gauge);
    sec.appendChild(gaugeSec);

    // 일반/복제 카드 리스트
    const cardSec = document.createElement("div");
    cardSec.className = "section";
    const cardList = document.createElement("div");
    cardList.className = "card-list";
    cardSec.appendChild(cardList);
    sec.appendChild(cardSec);

    // 고유카드 리스트
    const uniqueSec = document.createElement("div");
    uniqueSec.className = "section";
    const uniqueTitle = document.createElement("div");
    uniqueTitle.className = "small";
    uniqueTitle.style.fontWeight = "700";
    uniqueTitle.textContent = "고유카드";
    const uniqueList = document.createElement("div");
    uniqueList.className = "card-list";
    uniqueSec.appendChild(uniqueTitle);
    uniqueSec.appendChild(uniqueList);
    sec.appendChild(uniqueSec);

    grid.appendChild(sec);

    pl._refs = {
      el: sec,
      nameInput,
      charSelect,
      portraitDiv: portrait,
      portraitImg: img,
      gaugeFill,
      gaugeText,
      cardList,
      uniqueList
    };

    // 캐릭터 적용 (초기)
    if (pl.charId) {
      applyCharacterVisual(pl, pl.charId);
      if (!pl.unique || pl.unique.length === 0) {
        setUniqueByCharacter(pl, pl.charId);
      }
    }

    renderPlayerUnique(pl);
    renderPlayerCards(pl);
    updatePlayerGauge(pl);
  });

  setupGlobalControls();
}

// 캐릭터 변경 처리
function changePlayerCharacter(pl, newId) {
  const oldId = pl.charId;
  pl.charId = newId;

  // 덱 전체 초기화 (일반/고유카드 모두)
  pl.cards = [];
  setUniqueByCharacter(pl, newId);

  // 이름/초상화 갱신
  const meta = characterMap[newId];
  if (meta) {
    pl.name = meta.name;
    if (pl._refs.nameInput) pl._refs.nameInput.value = meta.name;
  }
  applyCharacterVisual(pl, newId);

  addLog(`[${pl.name}] 캐릭터 변경: ${oldId || "없음"} → ${newId}`);

  renderPlayerCards(pl);
  renderPlayerUnique(pl);
  updatePlayerGauge(pl);
}

// 초상화 및 이름
function applyCharacterVisual(pl, charId) {
  const meta = characterMap[charId];
  if (!meta || !pl._refs) return;
  const img = pl._refs.portraitImg;
  if (!img) return;

  if (meta.portrait) {
    img.src = meta.portrait;
    img.style.display = "block";
    pl._refs.portraitDiv.textContent = "";
  } else {
    img.style.display = "none";
    pl._refs.portraitDiv.textContent = "초상화 없음";
  }
}

// 일반/복제 카드 렌더
function renderPlayerCards(pl) {
  const list = pl._refs.cardList;
  list.innerHTML = "";

  pl.cards.forEach((card, idx) => {
    const row = document.createElement("div");
    row.className = "card-row";

    const left = document.createElement("div");
    left.className = "card-left";

    const title = document.createElement("div");
    title.style.fontWeight = "700";

    if (card.type === "unique_clone") {
      title.textContent = "고유카드 복제";
    } else if (card.type === "neutral") {
      title.textContent = "중립 카드";
    } else if (card.type === "monster") {
      title.textContent = "몬스터 카드";
    } else if (card.type === "taboo") {
      title.textContent = "금기 카드";
    } else {
      title.textContent = card.type;
    }
    left.appendChild(title);

    const mid = document.createElement("div");
    mid.style.display = "flex";
    mid.style.gap = "6px";
    mid.style.alignItems = "center";

    const stateSel = document.createElement("select");
    stateSel.className = "select";
    stateSel.innerHTML =
      '<option value="normal">일반</option>' +
      '<option value="spark">번뜩임</option>' +
      '<option value="newspark">신 번뜩임</option>';
    stateSel.value = card.state || "normal";
    stateSel.addEventListener("change", () => {
      card.state = stateSel.value;
      updatePlayerGauge(pl);
    });
    mid.appendChild(stateSel);

    const dupLabel = document.createElement("label");
    dupLabel.className = "small";
    const dupChk = document.createElement("input");
    dupChk.type = "checkbox";
    dupChk.checked = !!card.dupCount;
    dupChk.addEventListener("change", () => {
      card.dupCount = dupChk.checked ? 1 : 0;
      addLog(`[${pl.name}] ${title.textContent} 복제여부: ${dupChk.checked ? "ON" : "OFF"}`);
      updatePlayerGauge(pl);
    });
    dupLabel.appendChild(dupChk);
    dupLabel.appendChild(document.createTextNode("복제"));
    mid.appendChild(dupLabel);

    const transLabel = document.createElement("label");
    transLabel.className = "small";
    const transChk = document.createElement("input");
    transChk.type = "checkbox";
    transChk.checked = !!card.transCount;
    transChk.addEventListener("change", () => {
      card.transCount = transChk.checked ? 1 : 0;
      addLog(`[${pl.name}] ${title.textContent} 변환여부: ${transChk.checked ? "ON" : "OFF"}`);
      updatePlayerGauge(pl);
    });
    transLabel.appendChild(transChk);
    transLabel.appendChild(document.createTextNode("변환"));
    mid.appendChild(transLabel);

    left.appendChild(mid);

    const right = document.createElement("div");
    right.style.textAlign = "right";

    const contrib = document.createElement("div");
    contrib.className = "small";
    contrib.style.fontWeight = "700";
    contrib.textContent = "0 pt";
    right.appendChild(contrib);

    const delBtn = document.createElement("button");
    delBtn.className = "btn ghost";
    delBtn.textContent = "삭제";
    delBtn.addEventListener("click", () => {
      pl.cards.splice(idx, 1);
      addLog(`[${pl.name}] 카드 삭제: ${title.textContent}`);
      renderPlayerCards(pl);
      updatePlayerGauge(pl);
    });
    right.appendChild(delBtn);

    row.appendChild(left);
    row.appendChild(right);
    list.appendChild(row);

    card._contribEl = contrib;
  });
}

// 고유카드 렌더
function renderPlayerUnique(pl) {
  const wrap = pl._refs.uniqueList;
  wrap.innerHTML = "";

  pl.unique.forEach((u) => {
    const row = document.createElement("div");
    row.className = "card-row";
    row.style.borderLeft = `4px solid ${u.color}`;

    const left = document.createElement("div");
    left.className = "card-left";

    const nameSpan = document.createElement("div");
    nameSpan.className = "uniqueTitle";
    nameSpan.textContent = u.id;
    nameSpan.style.color = u.color;
    left.appendChild(nameSpan);

    // 제거 체크(고유카드만)
    const remLabel = document.createElement("label");
    remLabel.className = "small";
    const remChk = document.createElement("input");
    remChk.type = "checkbox";
    remChk.checked = !!u.removed;
    remChk.addEventListener("change", () => {
      u.removed = remChk.checked;
      addLog(`[${pl.name}] ${u.id} 제거상태: ${u.removed ? "ON" : "OFF"}`);
      updatePlayerGauge(pl);
    });
    remLabel.appendChild(remChk);
    remLabel.appendChild(document.createTextNode("제거"));
    left.appendChild(remLabel);

    row.appendChild(left);

    const right = document.createElement("div");
    right.style.display = "flex";
    right.style.alignItems = "center";
    right.style.gap = "6px";

    // 번뜩임 셀렉트 (고유레어/전설만)
    if (u.canShine) {
      const sel = document.createElement("select");
      sel.className = "select";
      sel.innerHTML =
        '<option value="normal">일반</option>' +
        '<option value="spark">번뜩임</option>' +
        '<option value="newspark">신 번뜩임</option>';
      sel.value = u.state || "normal";
      sel.addEventListener("change", () => {
        u.state = sel.value;
        updatePlayerGauge(pl);
      });
      right.appendChild(sel);
    }

    // 고유카드 변환 체크박스
    const uTransLabel = document.createElement("label");
    uTransLabel.className = "small";
    const uTransChk = document.createElement("input");
    uTransChk.type = "checkbox";
    uTransChk.checked = !!u.transCount;
    uTransChk.addEventListener("change", () => {
      u.transCount = uTransChk.checked ? 1 : 0;
      addLog(
        `[${pl.name}] ${u.id} 변환여부: ${uTransChk.checked ? "ON" : "OFF"}`
      );
      updatePlayerGauge(pl);
    });
    uTransLabel.appendChild(uTransChk);
    uTransLabel.appendChild(document.createTextNode("변환"));
    right.appendChild(uTransLabel);

    const contrib = document.createElement("div");
    contrib.className = "small";
    contrib.style.fontWeight = "700";
    contrib.textContent = "0 pt";
    right.appendChild(contrib);

    row.appendChild(right);
    wrap.appendChild(row);

    u._contribEl = contrib;
  });
}

// 카드 기여도 계산
function calcCardContribution(card) {
  let total = 0;

  if (card.type === "taboo") {
    total += BASE.taboo;
  } else if (
    card.type === "neutral" ||
    card.type === "monster" ||
    card.type === "unique_clone"
  ) {
    if (card.type === "neutral") total += BASE.neutral;
    if (card.type === "monster") total += BASE.monster;
    if (card.type === "unique_clone") {
      total += BASE.neutral; // 고유카드 복제는 중립과 동일 기본값
    }

    if (card.state === "spark") total += 10;
    else if (card.state === "newspark") total += 20;

    const dCount = card.dupCount || 0;
    total += mapCountToPt(dCount);
    if (dCount > 0) {
      const per =
        card.state === "newspark" ? 20 : card.state === "spark" ? 10 : 0;
      total += per * dCount;
    }

    const tCount = card.transCount || 0;
    total += tCount * 10;
    if (tCount > 0) {
      const per =
        card.state === "newspark" ? 20 : card.state === "spark" ? 10 : 0;
      total += per * tCount;
    }
  }

  return total;
}

function calcUniqueBaseContribution(u) {
  let total = 0;
  // 고유카드 번뜩임: 고유레어/전설에서 신 번뜩임일 때만 +20
  if (u.canShine && u.state === "newspark") {
    total += 20;
  }
  // 변환
  total += (u.transCount || 0) * 10;
  return total;
}

function updatePlayerGauge(pl) {
  let total = 0;

  // 일반 카드
  pl.cards.forEach((c) => {
    const val = calcCardContribution(c);
    total += val;
    if (c._contribEl) c._contribEl.textContent = `${val} pt`;
  });

  // 고유카드 기본 기여
  pl.unique.forEach((u) => {
    const base = calcUniqueBaseContribution(u);
    u._basePt = base;
  });

  // 고유카드 제거 보정(캐릭터별 제거 순번 기준)
  const removedList = pl.unique.filter((u) => u.removed);
  removedList.forEach((u, idx) => {
    const order = idx + 1;
    let remPt = mapCountToPt(order); // 0,10,30,50,70
    remPt += 20; // 고유카드 제거 보정
    u._removePt = remPt;
  });
  // 제거 안 된 애들은 0
  pl.unique.forEach((u) => {
    if (!u.removed) u._removePt = 0;
  });

  // 고유카드 총합
  pl.unique.forEach((u) => {
    const val = (u._basePt || 0) + (u._removePt || 0);
    total += val;
    if (u._contribEl) u._contribEl.textContent = `${val} pt`;
  });

  const cap = calcCap(globalTier);
  const pct = cap > 0 ? clampPct(Math.round((total / cap) * 100)) : 0;
  pl._refs.gaugeFill.style.width = `${pct}%`;
  pl._refs.gaugeText.textContent = `${total} / ${cap} pt`;
}

// 전체 다시 렌더
function renderAll() {
  players.forEach((pl) => {
    renderPlayerCards(pl);
    renderPlayerUnique(pl);
    updatePlayerGauge(pl);
  });
}

// 모달 & 티어 제어
let modalTargetIndex = null;

function openAddModal(playerIndex) {
  modalTargetIndex = playerIndex;
  const modal = document.getElementById("addModal");
  modal.style.display = "flex";
}

function closeAddModal() {
  const modal = document.getElementById("addModal");
  modal.style.display = "none";
  modalTargetIndex = null;
}

function setupGlobalControls() {
  const tierSelect = document.getElementById("globalTier");
  if (tierSelect && !tierSelect.dataset.initialized) {
    for (let i = 0; i <= 20; i++) {
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = `티어 ${i} (${calcCap(i)}pt)`;
      tierSelect.appendChild(opt);
    }
    tierSelect.value = String(globalTier);
    tierSelect.dataset.initialized = "1";

    tierSelect.addEventListener("change", () => {
      globalTier = parseInt(tierSelect.value, 10) || 0;
      addLog(`[공통] 티어 변경: ${globalTier} (상한 ${calcCap(globalTier)}pt)`);
      renderAll();
    });
  }

  // 티어 초기화 버튼
  const resetBtn = document.getElementById("resetTier");
  if (resetBtn && !resetBtn.dataset.bound) {
    resetBtn.dataset.bound = "1";
    resetBtn.addEventListener("click", () => {
      globalTier = 0;
      if (tierSelect) tierSelect.value = "0";
      addLog("[공통] 티어 초기화: 0 (상한 20pt)");
      renderAll();
    });
  }

  const clearLogBtn = document.getElementById("clearLog");
  if (clearLogBtn && !clearLogBtn.dataset.bound) {
    clearLogBtn.dataset.bound = "1";
    clearLogBtn.addEventListener("click", () => {
      const logArea = document.getElementById("logArea");
      if (logArea) logArea.innerHTML = "";
    });
  }

  // 모달 버튼
  const addBtn = document.getElementById("modalAddBtn");
  const cancelBtn = document.getElementById("modalCancelBtn");
  const modalCardType = document.getElementById("modalCardType");
  const modalCardState = document.getElementById("modalCardState");

  if (addBtn && !addBtn.dataset.bound) {
    addBtn.dataset.bound = "1";
    addBtn.addEventListener("click", () => {
      if (modalTargetIndex == null) return;
      const pl = players[modalTargetIndex];
      const type = modalCardType.value;
      const state = modalCardState.value;

      const card = {
        type,
        state,
        dupCount: 0,
        transCount: 0
      };

      if (type === "unique") {
        card.type = "unique_clone";
        card.cloneId = `복제고유_${Date.now()}`;
      }

      pl.cards.push(card);
      addLog(
        `[${pl.name}] 카드 추가: ${
          card.type === "unique_clone" ? "고유카드 복제" : card.type
        } (${state})`
      );

      renderPlayerCards(pl);
      updatePlayerGauge(pl);
      closeAddModal();
    });
  }

  if (cancelBtn && !cancelBtn.dataset.bound) {
    cancelBtn.dataset.bound = "1";
    cancelBtn.addEventListener("click", () => {
      closeAddModal();
    });
  }

  const modal = document.getElementById("addModal");
  if (modal && !modal.dataset.bound) {
    modal.dataset.bound = "1";
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeAddModal();
    });
  }
}

// 캐릭터 JSON 로드
function loadCharactersJson() {
  return fetch("characters.json")
    .then(res => res.json())
    .then(data => {
      if (Array.isArray(data.characters)) {
        characterList = data.characters;
        characterMap = {};
        data.characters.forEach(ch => {
          characterMap[ch.id] = ch;
        });
      } else {
        console.warn("characters.json: characters 배열이 없습니다.");
      }
    })
    .catch(err => {
      console.error("characters.json 로드 실패:", err);
      addLog("characters.json 로드 실패 - 기본 캐릭터 정보만 사용합니다.");
      // fallback: 레노아 하나라도 강제로 넣기
      if (characterList.length === 0) {
        characterList = [{
          id: "lenoa",
          name: "레노아",
          portrait: "./img/lenoa.png",
          unique: [
            { id: "섬멸 사격", rarity: "normal", canShine: false },
            { id: "섬멸 사격", rarity: "normal", canShine: false },
            { id: "검은 장막", rarity: "normal", canShine: false },
            { id: "비탄의 메아리", rarity: "rare", canShine: true },
            { id: "즉결 심판", rarity: "rare", canShine: true },
            { id: "칠흑의 송시", rarity: "rare", canShine: true },
            { id: "운명을 삼킨 꽃", rarity: "legend", canShine: true },
            { id: "결사의 일격", rarity: "myth", canShine: false }
          ]
        }];
        characterMap = { lenoa: characterList[0] };
      }
    });
}

// 초기화
function init() {
  loadCharactersJson().then(() => {
    // 캐릭터 데이터가 준비된 뒤에 UI 구성
    players.forEach((pl, idx) => {
      // 기본 캐릭터 없으면 첫 번째를 할당
      if (!pl.charId && characterList.length > 0) {
        pl.charId = characterList[0].id;
        const meta = characterMap[pl.charId];
        if (meta) {
          pl.name = meta.name;
          setUniqueByCharacter(pl, pl.charId);
        }
      }
    });

    buildUI();
    renderAll();
    addLog("v7.0 시뮬레이터 초기화 완료");
  });
}

window.addEventListener("DOMContentLoaded", init);
