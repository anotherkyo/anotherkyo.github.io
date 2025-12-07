/* chaos_v7.7.js
 * - 번뜩임/신 번뜩임 누적 규칙 적용
 * - 제거 시 spark/new 보정 제거, 고유카드 제거만 +20
 * - 고유 normal 변환은 제거 후에도 유지
 * - 복제 점수 1~N 누적
 * - 고유카드 버튼(❌, 💡, ⚡, 🔁) 1행 배치 + 이모지 사이즈업
 * - 로그에 PT 변화량 표시 (스타일 B)
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

// 제거/복제 회차 → PT (각 회차의 값)
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

// PT 변화 로그용 wrapper
function logWithPt(pl, baseMsg) {
  const before = typeof pl._lastTotal === "number" ? pl._lastTotal : 0;
  updatePlayerGauge(pl); // 내부에서 pl._lastTotal 갱신
  const after = typeof pl._lastTotal === "number" ? pl._lastTotal : 0;
  const diff = after - before;

  let msg = baseMsg;
  if (diff !== 0) {
    const sign = diff > 0 ? "+" : "-";
    msg += ` (${sign}${Math.abs(diff)}pt, ${before} → ${after})`;
  }
  addLog(msg);
}

const players = [
  { name: "캐릭터1", charId: null, cards: [], unique: [], removedCount: 0, _refs: null, _lastTotal: 0 },
  { name: "캐릭터2", charId: null, cards: [], unique: [], removedCount: 0, _refs: null, _lastTotal: 0 },
  { name: "캐릭터3", charId: null, cards: [], unique: [], removedCount: 0, _refs: null, _lastTotal: 0 }
];

let characterList = [];
let characterMap = {};

// 추가 카드(중립/몬스터/금기/고유 복제)의 기여 계산
function calcCardContribution(card) {
  let total = 0;
  const type = card.type;
  const removed = !!card.removed;
  const state = card.state || "normal";

  // 기본 PT (제거된 카드는 기본점수 0)
  if (!removed) {
    if (type === "neutral") {
      total += BASE.neutral;
    } else if (type === "monster") {
      total += BASE.monster;
    } else if (type === "taboo") {
      total += BASE.taboo;
    } else if (type === "unique_clone") {
      // 고유 복제는 기본 0pt
    }
  }

  // 제거된 카드는 "번뜩임 기록이 사라진다" → 상태 보정 적용 X
  if (!removed) {
    if (state === "spark") {
      // 일반(중립/몬스터)만 번뜩임 10pt
      if (type === "neutral" || type === "monster") {
        total += 10;
      }
    } else if (state === "newspark") {
      // 일반(중립/몬스터): 10+20 = 30
      if (type === "neutral" || type === "monster") {
        total += 30;
      }
      // 고유 복제: 신번 20pt
      else if (type === "unique_clone") {
        total += 20;
      }
    }
    // taboo 는 번뜩/신번 없음 → 아무것도 안 함
  }

  return total;
}

// 고유카드 기본 기여 계산
function calcUniqueBaseContribution(u) {
  let total = 0;
  const removed = !!u.removed;
  const rarity = u.rarity;
  const state = u.state || "normal";

  // 고유 rare/legend 의 신 번뜩임만 +20
  // (제거되면 번뜩 기록 사라짐 → removed=false 일 때만)
  if (!removed &&
      (rarity === "rare" || rarity === "legend") &&
      u.canShine &&
      state === "newspark") {
    total += 20;
  }

  // 고유 normal(1~3) 변환: 토글 ON이면 +10 (제거 여부와 무관, 기록 유지)
  if (rarity === "normal" && (u.transCount || 0) > 0) {
    total += 10;
  }

  return total;
}

function updatePlayerGauge(pl) {
  let total = 0;

  // 기본 카드 + 상태/변환
  pl.cards.forEach((c) => total += calcCardContribution(c));
  pl.unique.forEach((u) => total += calcUniqueBaseContribution(u));

  // 제거 카드 모음 (제거 순번용)
  const removedCards = [];

  pl.cards.forEach((c) => {
    if (c.removed) {
      removedCards.push({
        isUnique: false
      });
    }
  });

  pl.unique.forEach((u) => {
    if (u.removed) {
      removedCards.push({
        isUnique: true
      });
    }
  });

  // 제거 순번 1~N → 0/10/30/50/70 + (고유카드면 +20)
  let order = 0;
  removedCards.forEach((rc) => {
    order += 1;
    const baseRem = mapCountToPt(order);
    const uniqueBonus = rc.isUnique ? 20 : 0;
    total += baseRem + uniqueBonus;
  });

  pl.removedCount = removedCards.length;

  // === 복제 기여 계산 (누적) ===
  let dupCopies = 0;
  let dupSparkPt = 0;

  pl.cards.forEach((c) => {
    const cnt = c.dupCount || 0;
    if (cnt > 0 && !c.removed) { // 제거된 카드는 복제 기여 X
      dupCopies += cnt;

      const type = c.type;
      const state = c.state || "normal";

      if (state === "spark") {
        // 일반(중립/몬스터) 복제: 복제본마다 +10
        if (type === "neutral" || type === "monster") {
          dupSparkPt += 10 * cnt;
        }
      } else if (state === "newspark") {
        // 일반(중립/몬스터): 복제본마다 +30
        if (type === "neutral" || type === "monster") {
          dupSparkPt += 30 * cnt;
        }
        // 고유 복제: 복제본마다 +20
        else if (type === "unique_clone") {
          dupSparkPt += 20 * cnt;
        }
      }
    }
  });

  // 복제 회차별 누적 점수 (1 ~ dupCopies)
  let dupBase = 0;
  for (let i = 1; i <= dupCopies; i++) {
    dupBase += mapCountToPt(i);
  }

  total += dupBase + dupSparkPt;
  // === 복제 기여 끝 ===

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

  pl._lastTotal = total;
}

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
      dupCount: 0,   // 기본 8장은 복제 UI 사용 안하지만 구조는 유지
      color
    });
  });
}

function changePlayerCharacter(pl, newId) {
  const oldId = pl.charId;
  pl.charId = newId;

  pl.cards = [];
  setUniqueByCharacter(pl, newId);

  const meta = characterMap[newId];
  if (meta) pl.name = meta.name;

  applyCharacterVisual(pl, newId);

  logWithPt(pl, `[${pl.name}] 캐릭터 변경: ${oldId || "없음"} → ${newId}`);
  renderPlayerCards(pl);
  renderPlayerUnique(pl);
}

// UI 생성
function buildUI() {
  const grid = document.getElementById("playersGrid");
  grid.innerHTML = "";

  players.forEach((pl, index) => {
    const sec = document.createElement("section");
    sec.className = "player-card";
    sec.dataset.index = String(index);

    const head = document.createElement("div");
    head.className = "player-head";

    const charRow = document.createElement("div");
    charRow.className = "char-row";

    const portrait = document.createElement("div");
    portrait.className = "portrait";
    const img = document.createElement("img");
    img.alt = "portrait";
    portrait.appendChild(img);

    const controls = document.createElement("div");
    controls.className = "char-controls";

    const charSelWrap = document.createElement("div");
    charSelWrap.className = "char-select";

    const charSelect = document.createElement("select");
    characterList.forEach(ch => {
      const opt = document.createElement("option");
      opt.value = ch.id;
      opt.textContent = ch.name;
      charSelect.appendChild(opt);
    });

    if (!pl.charId && characterList.length > 0)
      pl.charId = characterList[0].id;

    if (pl.charId)
      charSelect.value = pl.charId;

    charSelect.addEventListener("change", () =>
      changePlayerCharacter(pl, charSelect.value)
    );

    charSelWrap.appendChild(charSelect);

    const addBtn = document.createElement("button");
    addBtn.className = "btn ghost";
    addBtn.textContent = "카드 추가";
    addBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      openAddModal(index);
    });

    charSelWrap.appendChild(addBtn);

    const resetCharBtn = document.createElement("button");
    resetCharBtn.className = "btn ghost";
    resetCharBtn.textContent = "캐릭터 초기화";
    resetCharBtn.addEventListener("click", () => {
      pl.cards = [];
      if (pl.charId) {
        setUniqueByCharacter(pl, pl.charId);
      } else {
        pl.unique = [];
        pl.removedCount = 0;
      }
      renderPlayerCards(pl);
      renderPlayerUnique(pl);
      logWithPt(pl, `[${pl.name}] 캐릭터 상태 초기화`);
    });

    charSelWrap.appendChild(resetCharBtn);

    controls.appendChild(charSelWrap);

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

    // 일반카드 구역
    const cardSec = document.createElement("div");
    cardSec.className = "section";
    const cardTitle = document.createElement("div");
    cardTitle.className = "small";
    cardTitle.style.fontWeight = "700";
    cardTitle.textContent = "추가 카드";
    const cardList = document.createElement("div");
    cardList.className = "card-list";
    cardSec.appendChild(cardTitle);
    cardSec.appendChild(cardList);
    sec.appendChild(cardSec);

    // 고유카드 구역
    const uniqueSec = document.createElement("div");
    uniqueSec.className = "section";
    const uniqueTitle = document.createElement("div");
    uniqueTitle.className = "small";
    uniqueTitle.style.fontWeight = "700";
    uniqueTitle.textContent = "고유 카드";
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

    if (pl.charId) {
      applyCharacterVisual(pl, pl.charId);
      setUniqueByCharacter(pl, pl.charId);
    }

    renderPlayerCards(pl);
    renderPlayerUnique(pl);
    updatePlayerGauge(pl);
  });
}

// 일반/복제/금기/고유 복제 카드 렌더
function renderPlayerCards(pl) {
  const list = pl._refs.cardList;
  list.innerHTML = "";

  pl.cards.forEach((card) => {
    const row = document.createElement("div");
    row.className = "card-row";

    // 1행: 카드명 + 제거
    const topRow = document.createElement("div");
    topRow.style.display = "flex";
    topRow.style.justifyContent = "space-between";
    topRow.style.alignItems = "center";
    topRow.style.width = "100%";
    topRow.style.gap = "8px";

    const left = document.createElement("div");
    left.className = "card-left";

    const title = document.createElement("div");
    title.className = "cardTitle";

    if (card.type === "unique_clone") title.textContent = "고유카드 (복제)";
    else if (card.type === "neutral") title.textContent = "중립 카드";
    else if (card.type === "monster") title.textContent = "몬스터 카드";
    else if (card.type === "taboo") title.textContent = "금기 카드";
    else title.textContent = card.type;

    left.appendChild(title);

    // 제거 토글 (pill)
    const remPill = document.createElement("div");
    remPill.className = "toggle-pill" + (card.removed ? " active" : "");
    remPill.textContent = "❌";
    remPill.title = "제거";
    remPill.addEventListener("click", () => {
      card.removed = !card.removed;
      remPill.classList.toggle("active", card.removed);
      logWithPt(pl, `[${pl.name}] ${title.textContent} 제거: ${card.removed}`);
    });
    left.appendChild(remPill);

    topRow.appendChild(left);
    row.appendChild(topRow);

    // 2행: 번뜩/신번/복제
    const ctrlRow = document.createElement("div");
    ctrlRow.style.display = "flex";
    ctrlRow.style.alignItems = "center";
    ctrlRow.style.gap = "6px";
    ctrlRow.style.marginTop = "4px";

    // 번뜩 / 신번 토글 (taboo 제외)
    if (card.type !== "taboo") {
      const stateBox = document.createElement("div");
      stateBox.className = "state-toggle";

      const defs = [
        { value: "spark", label: "💡", title: "번뜩임" },
        { value: "newspark", label: "⚡", title: "신 번뜩임" }
      ];

      const now = card.state || "normal";
      card.state = now;

      defs.forEach(def => {
        const pill = document.createElement("div");
        pill.textContent = def.label;
        pill.title = def.title;
        pill.className =
          def.value === now ? "state-pill active" : "state-pill";

        pill.addEventListener("click", () => {
          if (card.state === def.value) {
            card.state = "normal";
            Array.from(stateBox.children).forEach(p => p.classList.remove("active"));
          } else {
            card.state = def.value;
            Array.from(stateBox.children).forEach(p => p.classList.remove("active"));
            pill.classList.add("active");
          }
          logWithPt(pl, `[${pl.name}] ${title.textContent} 상태 변경: ${card.state}`);
        });

        stateBox.appendChild(pill);
      });

      ctrlRow.appendChild(stateBox);
    }

    // 복제 토글 (pill) - 추가된 카드들만
    const dupPill = document.createElement("div");
    dupPill.className = "toggle-pill" + ((card.dupCount || 0) > 0 ? " active" : "");
    dupPill.textContent = "🌀";
    dupPill.title = "복제";
    dupPill.addEventListener("click", () => {
      const nowDup = card.dupCount || 0;
      card.dupCount = nowDup > 0 ? 0 : 1;
      dupPill.classList.toggle("active", card.dupCount > 0);
      logWithPt(pl, `[${pl.name}] ${title.textContent} 복제: ${card.dupCount > 0 ? "ON" : "OFF"}`);
    });
    ctrlRow.appendChild(dupPill);

    row.appendChild(ctrlRow);

    // 3행: 삭제 버튼
    const deleteRow = document.createElement("div");
    deleteRow.style.width = "100%";
    deleteRow.style.display = "flex";
    deleteRow.style.justifyContent = "flex-end";
    deleteRow.style.marginTop = "4px";

    const delBtn = document.createElement("button");
    delBtn.className = "btn ghost";
    delBtn.style.padding = "3px 8px";
    delBtn.style.fontSize = "11px";
    delBtn.textContent = "삭제";

    delBtn.addEventListener("click", () => {

      // 1) 변환으로 생성된 중립카드인지 먼저 체크
      if (card._isTransformGenerated && card._linkedUniqueId) {
        const linked = pl.unique.find(u => u.id === card._linkedUniqueId);
    
        if (linked) {
          linked.transCount = 0;               // 변환 OFF
          linked._linkedNeutralCard = null;
    
          logWithPt(
            pl,
            `[${pl.name}] 고유카드 ${linked.id} 변환 해제 (중립카드 삭제)`
          );
        }
      }
    
      // 2) 실제 카드 삭제
      const idx = pl.cards.indexOf(card);
      if (idx >= 0) {
        pl.cards.splice(idx, 1);
        logWithPt(pl, `[${pl.name}] ${title.textContent} 카드 삭제`);
      }
    
      // 3) UI 다시 그리기
      renderPlayerCards(pl);
      renderPlayerUnique(pl);
    });
  
    deleteRow.appendChild(delBtn);
    row.appendChild(deleteRow);
  }
}

// 고유카드 렌더 (❌, 💡, ⚡, 🔁 1행)
function renderPlayerUnique(pl) {
  const wrap = pl._refs.uniqueList;
  wrap.innerHTML = "";

  pl.unique.forEach((u) => {
    const row = document.createElement("div");
    row.className = "card-row unique-row";
    row.style.borderLeft = `3px solid ${u.color}`;

    const left = document.createElement("div");
    left.className = "card-left";

    const nameSpan = document.createElement("div");
    nameSpan.className = "uniqueTitle";
    nameSpan.textContent = u.id;
    nameSpan.style.color = u.color;
    left.appendChild(nameSpan);

    // 제거 토글 (pill)
    const remPill = document.createElement("div");
    remPill.className = "toggle-pill" + (u.removed ? " active" : "");
    remPill.textContent = "❌";
    remPill.title = "제거";
    remPill.addEventListener("click", () => {
      u.removed = !u.removed;
      remPill.classList.toggle("active", u.removed);
      logWithPt(pl, `[${pl.name}] ${u.id} 제거: ${u.removed}`);
    });
    left.appendChild(remPill);

    const right = document.createElement("div");
    right.style.display = "flex";
    right.style.alignItems = "center";
    right.style.gap = "6px";

    // 고유 rare / legend: 번뜩/신번
    if (u.rarity === "rare" || u.rarity === "legend") {
      const stateBox = document.createElement("div");
      stateBox.className = "state-toggle";

      const defs = [
        { value: "spark", label: "💡", title: "번뜩임" },
        { value: "newspark", label: "⚡", title: "신 번뜩임" }
      ];

      const now = u.state || "normal";
      u.state = now;

      defs.forEach(def => {
        const pill = document.createElement("div");
        pill.textContent = def.label;
        pill.title = def.title;
        pill.className =
          def.value === now ? "state-pill active" : "state-pill";

        pill.addEventListener("click", () => {
          if (u.state === def.value) {
            u.state = "normal";
            Array.from(stateBox.children).forEach(p => p.classList.remove("active"));
          } else {
            u.state = def.value;
            Array.from(stateBox.children).forEach(p => p.classList.remove("active"));
            pill.classList.add("active");
          }
          logWithPt(pl, `[${pl.name}] 고유카드 ${u.id} 상태 변경: ${u.state}`);
        });

        stateBox.appendChild(pill);
      });

      right.appendChild(stateBox);
    }

    // 고유 normal(1~3): 변환 토글 (🔁)
    // - 변환 ON 시 자동으로 중립 카드 1장 생성
    // - 생성된 중립카드를 삭제하기 전까지 변환 해제 불가
    if (u.rarity === "normal") {
      const transPill = document.createElement("div");
      transPill.className =
        "toggle-pill" + ((u.transCount || 0) > 0 ? " active" : "");
      transPill.textContent = "🔁";
      transPill.title = "변환";
    
      transPill.addEventListener("click", () => {
        // 이미 변환된 상태면, 중립카드를 삭제해야만 해제 가능
        if (u.transCount > 0) {
          alert("변환된 카드는, 변환으로 생성된 중립 카드를 삭제하기 전까지 해제할 수 없습니다.");
          return;
        }
    
        // 변환 시작: transCount = 1로 고정
        u.transCount = 1;
        transPill.classList.add("active");
    
        // 변환으로 생성되는 중립 카드 객체
        const neutralCard = {
          type: "neutral",
          state: "normal",
          removed: false,
          dupCount: 0,
    
          // 변환으로 생성된 카드라는 표시
          _isTransformGenerated: true,
    
          // 어떤 고유카드와 연결되어 있는지 기록
          _linkedUniqueId: u.id
        };
    
        // 플레이어의 추가 카드 목록에 넣기
        pl.cards.push(neutralCard);
    
        // 고유카드 → 중립카드 연결(메모용, 나중에 써도 됨)
        u._linkedNeutralCard = neutralCard;
    
        logWithPt(
          pl,
          `[${pl.name}] 고유카드 ${u.id} 변환: 중립 카드 자동 생성`
        );
    
        // 카드 리스트 다시 그리기
        renderPlayerCards(pl);
        // 고유카드 영역도 다시 그려도 됨(선택사항)
        renderPlayerUnique(pl);
      });
    
      right.appendChild(transPill);
    }

    // 1행에 카드명 + 제거 + (번뜩/신번/변환) 모두 배치
    const rowInner = document.createElement("div");
    rowInner.style.display = "flex";
    rowInner.style.alignItems = "center";
    rowInner.style.justifyContent = "space-between";
    rowInner.style.gap = "6px";

    rowInner.appendChild(left);
    rowInner.appendChild(right);

    row.appendChild(rowInner);
    wrap.appendChild(row);
  });
}

function applyCharacterVisual(pl, charId) {
  const meta = characterMap[charId];
  if (!meta || !pl._refs) return;

  const img = pl._refs.portraitImg;
  const div = pl._refs.portraitDiv;

  if (!div.contains(img)) {
    div.innerHTML = "";
    div.appendChild(img);
  }

  if (meta.portrait) {
    img.src = meta.portrait + "?v=" + Date.now();
    img.style.display = "block";
  } else {
    img.style.display = "none";
    div.textContent = "초상화 없음";
  }
}

// 모달
let currentAddPlayerIndex = 0;

function openAddModal(i) {
  currentAddPlayerIndex = i;
  const bd = document.getElementById("addModalBackdrop");
  if (!bd) return;
  bd.style.display = "flex";
  bd.classList.remove("hidden");
}

function closeAddModal() {
  const bd = document.getElementById("addModalBackdrop");
  if (!bd) return;
  bd.style.display = "none";
  bd.classList.add("hidden");
}

function initModal() {
  const addBtn = document.getElementById("modalAddBtn");
  const cancelBtn = document.getElementById("modalCancelBtn");
  const bd = document.getElementById("addModalBackdrop");

  if (!bd || !addBtn || !cancelBtn) return;

  cancelBtn.addEventListener("click", () => closeAddModal());

  bd.addEventListener("click", (e) => {
    if (e.target === bd) closeAddModal();
  });

  addBtn.addEventListener("click", () => {
    const typeSel = document.getElementById("newType");
    if (!typeSel) return;

    const type = typeSel.value;
    const pl = players[currentAddPlayerIndex];

    const card = {
      type,
      state: "normal",
      dupCount: 0,
      removed: false
    };

    pl.cards.push(card);
    logWithPt(pl, `[${pl.name}] ${type} 카드 추가`);

    closeAddModal();

    renderPlayerCards(pl);
    renderPlayerUnique(pl);
  });
}

// 티어
function initTierControls() {
  const tierSel = document.getElementById("tierSelect");
  const tierCapText = document.getElementById("tierCapText");

  function refresh() {
    const t = parseInt(tierSel.value || "2", 10);
    const cap = calcCap(t);
    tierCapText.textContent = `상한: ${cap}pt`;
    players.forEach(updatePlayerGauge);
  }

  tierSel.addEventListener("change", refresh);

  refresh();
}

function resetAllPlayers() {
  const tierSel = document.getElementById("tierSelect");
  const tierCapText = document.getElementById("tierCapText");

  if (tierSel) {
    tierSel.value = "2";
    if (tierCapText) {
      const cap = calcCap(2);
      tierCapText.textContent = `상한: ${cap}pt`;
    }
  }

  players.forEach(pl => {
    pl.cards = [];
    if (pl.charId) {
      setUniqueByCharacter(pl, pl.charId);
    } else {
      pl.unique = [];
      pl.removedCount = 0;
    }
    renderPlayerCards(pl);
    renderPlayerUnique(pl);
    updatePlayerGauge(pl);
  });
  addLog("전체 초기화가 실행되었습니다.");
}

function initResetAll() {
  const btn = document.getElementById("resetAllBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    resetAllPlayers();
  });
}

// 캐릭터 로드 (가나다 순)
function loadCharacters() {
  return fetch("characters.json")
    .then(res => res.json())
    .then(data => {
      characterList = data.characters || [];
      characterList.sort((a, b) => a.name.localeCompare(b.name, "ko"));
      characterMap = {};
      characterList.forEach(ch => characterMap[ch.id] = ch);
    })
    .catch(err => {
      console.error("characters.json 로드 실패", err);
      characterList = [];
      characterMap = {};
    });
}

window.addEventListener("DOMContentLoaded", () => {
  loadCharacters().then(() => {

    const available = [...characterList];
    shuffleArray(available);

    players.forEach((pl, idx) => {
      const ch = available[idx % (available.length || 1)];
      if (ch) {
        pl.charId = ch.id;
      }
    });
    
    buildUI();
    initModal();
    initTierControls();
    initResetAll();
  });
});

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
