/* chaos_v7.4.js
 * - v7.3 기반
 * - 일반/복제/금기 카드도 좌측 border-left 흰색 라인 적용 (CSS)
 * - 고유카드도 번뜩/신번 선택 가능 (spark는 표시용, PT 영향 없음)
 * - 카드 추가 버튼을 캐릭터 select 우측에 배치
 * - characters.json 로드 후 캐릭터 이름 가나다 순 정렬
 * - 제거 PT = 제거회차PT + (고유 ? 20 : 0) + (spark/new spark ? 20 : 0, 단 고유 spark는 0)
 * - 중립/몬스터/금기/복제: 번뜩=+10, 신번뜩=+30
 * - 고유: 레어/전설 신번뜩만 +20 (기본 기여)
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

// 일반/복제/금기 카드 기여
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

    const dCount = card.dupCount || 0;
    total += mapCountToPt(dCount);
    if (dCount > 0) {
      const per =
        card.state === "newspark" ? 30 : card.state === "spark" ? 10 : 0;
      total += per * dCount;
    }
    // 변환은 일반/복제/금기에는 없음
  }

  return total;
}

// 고유카드 기본 기여 (신번/변환)
function calcUniqueBaseContribution(u) {
  let total = 0;
  // 고유카드: 레어/전설에서 신번뜩이면 +20
  if (u.canShine && u.state === "newspark") {
    total += 20;
  }
  // 변환
  total += (u.transCount || 0) * 10;
  return total;
}

function updatePlayerGauge(pl) {
  let total = 0;

  // 일반/복제/금기 기본
  pl.cards.forEach((c) => {
    total += calcCardContribution(c);
  });

  // 고유카드 기본
  pl.unique.forEach((u) => {
    total += calcUniqueBaseContribution(u);
  });

  // 제거 계산 (고유 + 일반/복제/금기 모두)
  const removedCards = [];

  // 일반/복제/금기
  pl.cards.forEach((c) => {
    if (c.removed) {
      removedCards.push({
        isUnique: false,
        state: c.state || "normal"
      });
    }
  });

  // 고유
  pl.unique.forEach((u) => {
    if (u.removed) {
      removedCards.push({
        isUnique: true,
        state: u.state || "normal"
      });
    }
  });

  let order = 0;
  removedCards.forEach((rc) => {
    order += 1;
    const baseRem = mapCountToPt(order);

    // 고유카드는 기본 제거 보정 +20
    const uniqueBonus = rc.isUnique ? 20 : 0;

    // 번뜩/신번 제거 보정 (고유 spark는 0, 고유 newspark만 20)
    const isSparkForBonus =
      (!rc.isUnique && (rc.state === "spark" || rc.state === "newspark")) ||
      (rc.isUnique && rc.state === "newspark");

    const sparkBonus = isSparkForBonus ? 20 : 0;

    total += baseRem + uniqueBonus + sparkBonus;
  });

  pl.removedCount = removedCards.length;

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
  if (meta) {
    pl.name = meta.name;
  }
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
    charLabel.textContent = "캐릭터:";
    charSelWrap.appendChild(charLabel);

    const charSelect = document.createElement("select");
    characterList.forEach(ch => {
      const opt = document.createElement("option");
      opt.value = ch.id;
      opt.textContent = ch.name;
      charSelect.appendChild(opt);
    });

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

    // 카드 추가 버튼을 캐릭터 select 오른쪽에 배치
    charSelWrap.appendChild(addBtn);
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
    title.className = "cardTitle";

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

    // 제거 상태
    const remLabel = document.createElement("label");
    remLabel.className = "small";
    const remChk = document.createElement("input");
    remChk.type = "checkbox";
    remChk.checked = !!card.removed;
    remChk.addEventListener("change", () => {
      card.removed = remChk.checked;
      addLog(`[${pl.name}] ${title.textContent} 제거상태: ${card.removed ? "ON" : "OFF"}`);
      updatePlayerGauge(pl);
    });
    remLabel.appendChild(remChk);
    remLabel.appendChild(document.createTextNode("제거"));
    left.appendChild(remLabel);

    row.appendChild(left);

    const mid = document.createElement("div");
    mid.style.display = "flex";
    mid.style.gap = "6px";
    mid.style.alignItems = "center";

    // 번뜩/신번 토글 (둘 중 하나 또는 둘 다 OFF)
    const stateBox = document.createElement("div");
    stateBox.className = "state-toggle";

    const stateDefs = [
      { value: "spark", label: "번뜩" },
      { value: "newspark", label: "신번" }
    ];
    const currentState = card.state || "normal";
    card.state = currentState;

    stateDefs.forEach(def => {
      const pill = document.createElement("div");
      if (def.value === currentState) {
        pill.className = "state-pill active";
      } else {
        pill.className = "state-pill";
      }
      pill.textContent = def.label;
      pill.addEventListener("click", () => {
        if (card.state === def.value) {
          // 다시 클릭하면 해제 → normal
          card.state = "normal";
          Array.from(stateBox.children).forEach(child => {
            child.classList.remove("active");
          });
        } else {
          card.state = def.value;
          Array.from(stateBox.children).forEach(child => {
            child.classList.remove("active");
          });
          pill.classList.add("active");
        }
        updatePlayerGauge(pl);
      });
      stateBox.appendChild(pill);
    });

    mid.appendChild(stateBox);

    // 복제 여부
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
    row.style.borderLeft = `4px solid ${u.color}`; // rarity색으로 override

    const left = document.createElement("div");
    left.className = "card-left";

    const nameSpan = document.createElement("div");
    nameSpan.className = "uniqueTitle";
    nameSpan.textContent = u.id;
    nameSpan.style.color = u.color;
    left.appendChild(nameSpan);

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

    // 고유카드 번뜩/신번 토글 (표시 + newspark만 PT 영향)
    if (u.canShine) {
      const stateBox = document.createElement("div");
      stateBox.className = "state-toggle";

      const stateDefs = [
        { value: "spark", label: "번뜩" },
        { value: "newspark", label: "신번" }
      ];
      const currentState = u.state || "normal";
      u.state = currentState;

      stateDefs.forEach(def => {
        const pill = document.createElement("div");
        pill.className =
          def.value === currentState ? "state-pill active" : "state-pill";
        pill.textContent = def.label;
        pill.addEventListener("click", () => {
          if (u.state === def.value) {
            // 다시 누르면 normal
            u.state = "normal";
            pill.classList.remove("active");
          } else {
            u.state = def.value;
            Array.from(stateBox.children).forEach(child => {
              child.classList.remove("active");
            });
            pill.classList.add("active");
          }
          updatePlayerGauge(pl);
        });
        stateBox.appendChild(pill);
      });

      right.appendChild(stateBox);
    }

    // 변환 토글 (고유카드만)
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
    const type = typeSel.value;

    const pl = players[currentAddPlayerIndex];
    const card = {
      type,
      state: "normal",
      dupCount: dupChk.checked ? 1 : 0,
      removed: false
    };

    pl.cards.push(card);
    addLog(
      `[${pl.name}] ${type} 카드 추가 (복제:${card.dupCount ? "O" : "X"})`
    );
    renderPlayerCards(pl);
    updatePlayerGauge(pl);

    dupChk.checked = false;
    closeAddModal();
  });
}

// 티어
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

// characters.json 로드 (가나다 순 정렬)
function loadCharacters() {
  return fetch("characters.json")
    .then(res => res.json())
    .then(data => {
      characterList = data.characters || [];
      // 이름 기준 정렬 (한글)
      characterList.sort((a, b) => a.name.localeCompare(b.name, "ko"));
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
