/* chaos_v7.5.js
 * - v7.4.x 기반 + v7.5 UI/규칙 반영
 * - 추가 카드: 번뜩/신번/복제 이모지 + 2행 배치
 * - 고유카드 8장: 복제 불가, normal만 변환(🔁 토글) 가능
 * - 로그: 화면 하단 고정 도크
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

// 제거 회차 → PT
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

const players = [
  { name: "캐릭터1", charId: null, cards: [], unique: [], removedCount: 0, _refs: null },
  { name: "캐릭터2", charId: null, cards: [], unique: [], removedCount: 0, _refs: null },
  { name: "캐릭터3", charId: null, cards: [], unique: [], removedCount: 0, _refs: null }
];

let characterList = [];
let characterMap = {};

// 일반/복제/금기 카드 기여 계산
function calcCardContribution(card) {
  let total = 0;

  if (
    card.type === "neutral" ||
    card.type === "monster" ||
    card.type === "unique_clone" ||
    card.type === "taboo"
  ) {
    if (card.type === "neutral" || card.type === "unique_clone") {
      total += BASE.neutral;
    } else if (card.type === "monster") {
      total += BASE.monster;
    } else if (card.type === "taboo") {
      total += BASE.taboo;
    }

    if (card.state === "spark") total += 10;
    else if (card.state === "newspark") total += 30;
  }

  return total;
}

// 고유카드 기본 기여 계산
function calcUniqueBaseContribution(u) {
  let total = 0;

  // 고유 rare/legend 의 신 번뜩임만 +20
  if ((u.rarity === "rare" || u.rarity === "legend") &&
      u.canShine && u.state === "newspark") {
    total += 20;
  }

  // 고유 normal(1~3) 변환: 토글 ON이면 +10
  if (u.rarity === "normal" && (u.transCount || 0) > 0) {
    total += 10;
  }

  return total;
}

function updatePlayerGauge(pl) {
  let total = 0;

  pl.cards.forEach((c) => total += calcCardContribution(c));
  pl.unique.forEach((u) => total += calcUniqueBaseContribution(u));

  const removedCards = [];

  pl.cards.forEach((c) => {
    if (c.removed) {
      removedCards.push({
        isUnique: false,
        state: c.state || "normal"
      });
    }
  });

  pl.unique.forEach((u) => {
    if (u.removed) {
      removedCards.push({
        isUnique: true,
        state: u.state || "normal",
        rarity: u.rarity
      });
    }
  });

  let order = 0;

  removedCards.forEach((rc) => {
    order += 1;
    const baseRem = mapCountToPt(order);
    const uniqueBonus = rc.isUnique ? 20 : 0;

    // 제거 시 번뜩 보정:
    // - 일반카드: spark / newspark 둘 다 +20
    // - 고유 rare/legend: newspark 일 때만 +20
    let sparkBonus = 0;
    if (!rc.isUnique) {
      if (rc.state === "spark" || rc.state === "newspark") {
        sparkBonus = 20;
      }
    } else {
      if ((rc.rarity === "rare" || rc.rarity === "legend") &&
          rc.state === "newspark") {
        sparkBonus = 20;
      }
    }

    total += baseRem + uniqueBonus + sparkBonus;
  });

  pl.removedCount = removedCards.length;

  // === 복제 기여 계산 ===
  let dupTotal = 0;
  let dupSparkPt = 0;

  // 일반/몬스터/금기/추가 고유카드(카드 리스트) 쪽
  pl.cards.forEach((c) => {
    if (c.dupCount && c.dupCount > 0) {
      dupTotal += c.dupCount;
      if (c.state === "spark") dupSparkPt += 10;
      else if (c.state === "newspark") dupSparkPt += 30;
    }
  });

  // 고유카드 8장은 UI 상 복제 불가이므로, 여기서 dupCount > 0이 되는 일은 없음

  let dupBase = 0;
  if (dupTotal > 0) {
    dupBase = mapCountToPt(dupTotal); // 1:0, 2:10, 3:30, 4:50, 5+:70
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
      dupCount: 0,
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

  addLog(`[${pl.name}] 캐릭터 변경: ${oldId || "없음"} → ${newId}`);
  renderPlayerCards(pl);
  renderPlayerUnique(pl);
  updatePlayerGauge(pl);
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

    const charLabel = document.createElement("span");
    charLabel.className = "small";
    charLabel.textContent = "캐릭터:";  // ${i} 제거

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
      updatePlayerGauge(pl);
      addLog(`[${pl.name}] 캐릭터 상태 초기화`);
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

// 일반/복제/금기 카드 렌더
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

    if (card.type === "unique_clone") title.textContent = "고유카드";
    else if (card.type === "neutral") title.textContent = "중립 카드";
    else if (card.type === "monster") title.textContent = "몬스터 카드";
    else if (card.type === "taboo") title.textContent = "금기 카드";
    else title.textContent = card.type;

    left.appendChild(title);

    // 제거 토글 (pill, 이모지 + 툴팁)
    const remPill = document.createElement("div");
    remPill.className = "toggle-pill" + (card.removed ? " active" : "");
    remPill.textContent = "❌";
    remPill.title = "제거";
    remPill.addEventListener("click", () => {
      card.removed = !card.removed;
      remPill.classList.toggle("active", card.removed);
      addLog(`[${pl.name}] ${title.textContent} 제거: ${card.removed}`);
      updatePlayerGauge(pl);
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

    // 번뜩 / 신번 토글 (이모지 + 툴팁)
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
        updatePlayerGauge(pl);
      });

      stateBox.appendChild(pill);
    });

    ctrlRow.appendChild(stateBox);

    // 복제 토글 (pill, 이모지 + 툴팁) - 추가된 카드만
    const dupPill = document.createElement("div");
    dupPill.className = "toggle-pill" + ((card.dupCount || 0) > 0 ? " active" : "");
    dupPill.textContent = "🌀";
    dupPill.title = "복제";
    dupPill.addEventListener("click", () => {
      const nowDup = card.dupCount || 0;
      card.dupCount = nowDup > 0 ? 0 : 1;
      dupPill.classList.toggle("active", card.dupCount > 0);
      addLog(`[${pl.name}] ${title.textContent} 복제: ${card.dupCount > 0}`);
      updatePlayerGauge(pl);
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
      const idx = pl.cards.indexOf(card);
      if (idx >= 0) {
        pl.cards.splice(idx, 1);
        addLog(`[${pl.name}] ${title.textContent} 카드 삭제됨`);
        renderPlayerCards(pl);
        updatePlayerGauge(pl);
      }
    });

    deleteRow.appendChild(delBtn);
    row.appendChild(deleteRow);

    list.appendChild(row);
  });
}

// 고유카드 렌더
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

    // 제거 토글 (pill, 이모지 + 툴팁)
    const remPill = document.createElement("div");
    remPill.className = "toggle-pill" + (u.removed ? " active" : "");
    remPill.textContent = "❌";
    remPill.title = "제거";
    remPill.addEventListener("click", () => {
      u.removed = !u.removed;
      remPill.classList.toggle("active", u.removed);
      addLog(`[${pl.name}] ${u.id} 제거: ${u.removed}`);
      updatePlayerGauge(pl);
    });
    left.appendChild(remPill);

    row.appendChild(left);

    const right = document.createElement("div");
    right.style.display = "flex";
    right.style.alignItems = "center";
    right.style.gap = "6px";

    // 고유 rare / legend: 번뜩/신번 (이모지 + 툴팁)
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
          updatePlayerGauge(pl);
        });

        stateBox.appendChild(pill);
      });

      right.appendChild(stateBox);
    }

    // 고유 normal(1~3): 변환 토글 가능 (🔁, title="변환")
    if (u.rarity === "normal") {
      const transPill = document.createElement("div");
      transPill.className =
        "toggle-pill" + ((u.transCount || 0) > 0 ? " active" : "");
      transPill.textContent = "🔁";
      transPill.title = "변환";

      transPill.addEventListener("click", () => {
        const now = u.transCount || 0;
        const next = now > 0 ? 0 : 1;
        u.transCount = next;
        transPill.classList.toggle("active", next > 0);
        addLog(
          `[${pl.name}] 고유카드 ${u.id} 변환: ${next > 0 ? "ON" : "OFF"}`
        );
        updatePlayerGauge(pl);
      });

      right.appendChild(transPill);
    }

    // 고유 myth: 복제/번뜩/신번/변환 모두 없음 (기본 값만 사용)

    row.appendChild(right);
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
    addLog(`[${pl.name}] ${type} 카드 추가 (복제: X)`);

    closeAddModal();

    renderPlayerCards(pl);
    updatePlayerGauge(pl);
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

    // 캐릭터 3명 랜덤 선택 (중복 없음)
    const available = [...characterList];   // 캐릭터 리스트 복제
    shuffleArray(available);

    // players 3명에게 각각 다른 캐릭터 할당
    players.forEach((pl, idx) => {
      const ch = available[idx % available.length];
      pl.charId = ch.id;   // 사전 지정
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
