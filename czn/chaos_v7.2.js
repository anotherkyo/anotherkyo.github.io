/* chaos_v7.2.js
 * - v7.0 기반
 * - 상단 레이아웃: 초상화 왼쪽 / 캐릭터 선택 + 카드추가 오른쪽(char-controls)
 * - 번뜩임 UI: select → 아이콘 토글(pill)
 * - 중립/몬스터/고유복제/금기: spark=+10, newspark=+30
 * - 고유카드: 기존 규칙 유지(레어/전설 신 번뜩임 +20)
 * - 제거는 고유카드만 가능, 캐릭터별 덱 기준으로 제거 회차 계산
 * - 고유카드 제거 시: 제거회차 pt + 20pt 추가
 * - 변환 토글은 일반/복제/고유카드 모두 체크박스 방식
 * - 티어 셀렉트 우측 초기화 버튼
 */

const BASE = {
  neutral: 20,
  monster: 80,
  taboo: 20
};

// 티어: 0티어=20pt, 이후 티어당 +10
function calcCap(tier) {
  const t = Math.max(0, Math.min(20, tier | 0));
  return 20 + t * 10;
}

// 제거 회차 -> pt
function mapCountToPt(order) {
  const c = parseInt(order || 0, 10);
  if (c <= 1) return 0;
  if (c >= 5) return 70;
  if (c === 2) return 10;
  if (c === 3) return 30;
  if (c === 4) return 50;
  return 0;
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

// 캐릭터/플레이어 상태
const players = [
  { name: "캐릭터1", charId: null, cards: [], unique: [], removedCount: 0, _refs: null },
  { name: "캐릭터2", charId: null, cards: [], unique: [], removedCount: 0, _refs: null },
  { name: "캐릭터3", charId: null, cards: [], unique: [], removedCount: 0, _refs: null }
];

// 캐릭터 데이터 로드용
let characterList = [];   // [{id,name,portrait,unique:[...]}...]
let characterMap = {};    // id -> meta

function calcCardContribution(card) {
  let total = 0;

  if (
    card.type === "neutral" ||
    card.type === "monster" ||
    card.type === "unique_clone" ||
    card.type === "taboo"
  ) {
    if (card.type === "neutral") total += BASE.neutral;
    if (card.type === "monster") total += BASE.monster;
    if (card.type === "unique_clone") {
      total += BASE.neutral; // 고유카드 복제는 중립과 동일 기본값
    }
    if (card.type === "taboo") {
      total += BASE.taboo;
    }

    if (card.state === "spark") total += 10;
    else if (card.state === "newspark") total += 30;

    const dCount = card.dupCount || 0;
    total += mapCountToPt(dCount);
    if (dCount > 0) {
      const per =
        card.state === "newspark" ? 30 : card.state === "spark" ? 10 : 0;
      total += per * dCount;
    }

    const tCount = card.transCount || 0;
    total += tCount * 10;
    if (tCount > 0) {
      const per =
        card.state === "newspark" ? 30 : card.state === "spark" ? 10 : 0;
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

  // 일반/복제/금기 카드
  pl.cards.forEach((c) => {
    total += calcCardContribution(c);
  });

  // 고유카드 + 제거
  let removeCount = 0;
  pl.unique.forEach((u) => {
    total += calcUniqueBaseContribution(u);
    if (u.removed) {
      removeCount++;
      const remPt = mapCountToPt(removeCount);
      total += remPt + 20; // 고유카드 제거는 +20 추가
    }
  });
  pl.removedCount = removeCount;

  const tierSel = document.getElementById("tierSelect");
  const tier = tierSel ? parseInt(tierSel.value || "0", 10) : 0;
  const cap = calcCap(tier);

  const pct = clampPct((total / cap) * 100);

  if (pl._refs && pl._refs.gaugeFill && pl._refs.gaugeText) {
    pl._refs.gaugeFill.style.width = `${pct}%`;
    pl._refs.gaugeText.textContent = `${total} / ${cap}pt (${pct.toFixed(1)}%)`;
  }

  if (total >= cap) {
    addLog(`[${pl.name}] 기억 게이지가 상한에 도달했습니다.`);
  }
}

// 캐릭터별 고유카드 세팅 (JSON 기반)
function setUniqueByCharacter(pl, charId) {
  pl.unique = [];
  pl.removedCount = 0;

  const meta = characterMap[charId];
  if (!meta || !Array.isArray(meta.unique)) return;

  meta.unique.forEach((uMeta) => {
    const rarity = uMeta.rarity;
    let color = "#ffffff";
    if (rarity === "rare") color = "#4fb4ff";
    else if (rarity === "legend") color = "#ffd95a";
    else if (rarity === "myth") color = "#c15dff";

    pl.unique.push({
      id: uMeta.id,
      rarity,
      canShine: !!uMeta.canShine,
      state: "normal",
      transCount: 0,
      removed: false,
      color
    });
  });
}

// 캐릭터 변경
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
  }
  applyCharacterVisual(pl, newId);

  addLog(`[${pl.name}] 캐릭터 변경: ${oldId || "없음"} → ${newId}`);
  renderPlayerCards(pl);
  renderPlayerUnique(pl);
  updatePlayerGauge(pl);
}

// 상단 UI 구축
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

    // 초상화
    const portrait = document.createElement("div");
    portrait.className = "portrait";
    const img = document.createElement("img");
    img.alt = "portrait";
    portrait.appendChild(img);

    // 캐릭터 선택 + 카드추가 컨트롤
    const controls = document.createElement("div");
    controls.className = "char-controls";

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
    if (pl.charId) {
      charSelect.value = pl.charId;
    }

    charSelect.addEventListener("change", () => {
      const newId = charSelect.value;
      changePlayerCharacter(pl, newId);
    });

    charSelWrap.appendChild(charSelect);

    const addBtn = document.createElement("button");
    addBtn.className = "btn ghost";
    addBtn.textContent = "카드 추가";
    addBtn.addEventListener("click", () => openAddModal(index));

    controls.appendChild(charSelWrap);
    controls.appendChild(addBtn);

    charRow.appendChild(portrait);
    charRow.appendChild(controls);

    head.appendChild(charRow);
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
    gauge.appendChild(gaugeFill);
    gauge.appendChild(gaugeText);
    gaugeSec.appendChild(gauge);
    sec.appendChild(gaugeSec);

    // 일반 카드 영역
    const cardSec = document.createElement("div");
    cardSec.className = "section";
    const cardTitle = document.createElement("div");
    cardTitle.className = "small";
    cardTitle.style.fontWeight = "700";
    cardTitle.textContent = "일반/복제/금기 카드";
    const cardList = document.createElement("div");
    cardList.className = "card-list";
    cardSec.appendChild(cardTitle);
    cardSec.appendChild(cardList);
    sec.appendChild(cardSec);

    // 고유카드 영역
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
      setUniqueByCharacter(pl, pl.charId);
    }

    renderPlayerCards(pl);
    renderPlayerUnique(pl);
    updatePlayerGauge(pl);
  });
}

// 일반/복제/금기 카드 렌더
function renderPlayerCards(pl) {
  const list = pl._refs.cardList;
  list.innerHTML = "";

  pl.cards.forEach((card) => {
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

    const stateBox = document.createElement("div");
    stateBox.className = "state-toggle";

    const stateDefs = [
      { value: "normal", label: "일반" },
      { value: "spark", label: "번뜩" },
      { value: "newspark", label: "신번" }
    ];
    const currentState = card.state || "normal";
    card.state = currentState;

    stateDefs.forEach(def => {
      const pill = document.createElement("div");
      pill.className = "state-pill" + (def.value === currentState ? " active" : "");
      pill.textContent = def.label;
      pill.addEventListener("click", () => {
        card.state = def.value;
        Array.from(stateBox.children).forEach(child => {
          child.classList.remove("active");
        });
        pill.classList.add("active");
        updatePlayerGauge(pl);
      });
      stateBox.appendChild(pill);
    });

    mid.appendChild(stateBox);

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

    row.appendChild(left);
    row.appendChild(mid);
    list.appendChild(row);
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

    // 번뜩임 토글 (고유레어/전설만)
    if (u.canShine) {
      const stateBox = document.createElement("div");
      stateBox.className = "state-toggle";

      const stateDefs = [
        { value: "normal", label: "일반" },
        { value: "newspark", label: "신번" }
      ];
      const currentState = u.state || "normal";
      u.state = currentState;

      stateDefs.forEach(def => {
        const pill = document.createElement("div");
        pill.className = "state-pill" + (def.value === currentState ? " active" : "");
        pill.textContent = def.label;
        pill.addEventListener("click", () => {
          u.state = def.value;
          Array.from(stateBox.children).forEach(child => {
            child.classList.remove("active");
          });
          pill.classList.add("active");
          updatePlayerGauge(pl);
        });
        stateBox.appendChild(pill);
      });

      right.appendChild(stateBox);
    }

    // 변환 토글
    const transLabel = document.createElement("label");
    transLabel.className = "small";
    const transChk = document.createElement("input");
    transChk.type = "checkbox";
    transChk.checked = !!u.transCount;
    transChk.addEventListener("change", () => {
      u.transCount = transChk.checked ? 1 : 0;
      addLog(`[${pl.name}] 고유카드 ${u.id} 변환여부: ${transChk.checked ? "ON" : "OFF"}`);
      updatePlayerGauge(pl);
    });
    transLabel.appendChild(transChk);
    transLabel.appendChild(document.createTextNode("변환"));
    right.appendChild(transLabel);

    row.appendChild(right);
    wrap.appendChild(row);
  });
}

function applyCharacterVisual(pl, charId) {
  const meta = characterMap[charId];
  if (!meta || !pl._refs) return;

  const img = pl._refs.portraitImg;
  const div = pl._refs.portraitDiv;

  // 이미지 DOM 복원 (img가 삭제되었을 가능성 대비)
  if (!div.contains(img)) {
    div.innerHTML = "";
    div.appendChild(img);
  }

  if (meta.portrait) {
    img.src = meta.portrait + "?v=" + Date.now();  // 캐싱 방지
    img.style.display = "block";
  } else {
    img.style.display = "none";
    div.textContent = "초상화 없음";
  }
}

// 모달 제어
let currentAddPlayerIndex = 0;

function openAddModal(playerIndex) {
  currentAddPlayerIndex = playerIndex;
  const bd = document.getElementById("addModalBackdrop");
  bd.classList.remove("hidden");
}

function closeAddModal() {
  const bd = document.getElementById("addModalBackdrop");
  bd.classList.add("hidden");
}

function initModal() {
  const addBtn = document.getElementById("modalAddBtn");
  const cancelBtn = document.getElementById("modalCancelBtn");
  const bd = document.getElementById("addModalBackdrop");

  cancelBtn.addEventListener("click", () => closeAddModal());
  bd.addEventListener("click", (e) => {
    if (e.target === bd) closeAddModal();
  });

  addBtn.addEventListener("click", () => {
    const typeSel = document.getElementById("newType");
    const dupChk = document.getElementById("newDupChk");
    const transChk = document.getElementById("newTransChk");
    const type = typeSel.value;

    const pl = players[currentAddPlayerIndex];
    const card = {
      type,
      state: "normal",
      dupCount: dupChk.checked ? 1 : 0,
      transCount: transChk.checked ? 1 : 0
    };

    pl.cards.push(card);
    addLog(`[${pl.name}] ${type} 카드 추가 (복제:${card.dupCount ? "O" : "X"}, 변환:${card.transCount ? "O" : "X"})`);
    renderPlayerCards(pl);
    updatePlayerGauge(pl);

    dupChk.checked = false;
    transChk.checked = false;
    closeAddModal();
  });
}

// 티어 초기화
function initTierControls() {
  const tierSel = document.getElementById("tierSelect");
  const tierCapText = document.getElementById("tierCapText");
  const resetBtn = document.getElementById("tierResetBtn");

  function refresh() {
    const t = parseInt(tierSel.value || "0", 10);
    const cap = calcCap(t);
    tierCapText.textContent = `상한: ${cap}pt`;
    players.forEach(updatePlayerGauge);
  }

  tierSel.addEventListener("change", refresh);
  resetBtn.addEventListener("click", () => {
    tierSel.value = "0";
    refresh();
  });

  refresh();
}

// characters.json 로드
function loadCharacters() {
  return fetch("characters.json")
    .then(res => res.json())
    .then(data => {
      characterList = data.characters || [];
      characterMap = {};
      characterList.forEach(ch => {
        characterMap[ch.id] = ch;
      });
    })
    .catch(err => {
      console.error("characters.json 로드 실패", err);
      characterList = [];
      characterMap = {};
    });
}

window.addEventListener("DOMContentLoaded", () => {
  loadCharacters().then(() => {
    buildUI();
    initModal();
    initTierControls();
  });
});
