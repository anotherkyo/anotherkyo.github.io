/* chaos_v6.1.js
 * - v5.2 기반 로직 유지
 * - 전 캐릭터 공용 티어 (0~20, 0티어=20pt, +1티어당 +10pt)
 * - 3 캐릭터 독립 카드/고유카드 관리
 * - 복제/변환 체크박스: 체크=1, 해제=0 (가감)
 * - 고유카드 복제 UI 명칭: "고유카드 복제"
 * - JSON 내보내기 기능 제거
 */

//////////////////////
// 공통 상수 & 유틸 //
//////////////////////

const BASE = {
  neutral: 20,
  monster: 80,
  taboo: 20
};

// 제거/복제/변환 횟수 → pt 매핑
// 1회차: 0, 2회차:10, 3회차:30, 4회차:50, 5회 이상:70
const REMAP = { 1: 0, 2: 10, 3: 30, 4: 50 };

let globalTier = 0; // 0~20, 0티어 = 20pt

function calcCap(tier) {
  const t = Math.max(0, tier | 0);
  return 20 + t * 10; // 0티어=20, 1티어=30 ...
}

function mapCountToPt(count) {
  const c = parseInt(count || 0, 10);
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
  // 위로 쌓이게 prepend
  logArea.prepend(line);
}

////////////////////////////
// 플레이어 데이터 정의  //
////////////////////////////

const players = [
  { id: "p1", name: "캐릭터1", cards: [], unique: [], _refs: {} },
  { id: "p2", name: "캐릭터2", cards: [], unique: [], _refs: {} },
  { id: "p3", name: "캐릭터3", cards: [], unique: [], _refs: {} }
];

//////////////////////
// 고유카드 생성   //
//////////////////////

function generateDefaultUnique(pl) {
  pl.unique = [
    // 고유일반 1~3 (흰색, 번뜩임 없음)
    {
      id: "고유일반1",
      rarity: "normal",
      color: "#ffffff",
      canShine: false,
      removed: false,
      removeCount: 0,
      state: "normal",
      transCount: 0,
      dupCount: 0
    },
    {
      id: "고유일반2",
      rarity: "normal",
      color: "#ffffff",
      canShine: false,
      removed: false,
      removeCount: 0,
      state: "normal",
      transCount: 0,
      dupCount: 0
    },
    {
      id: "고유일반3",
      rarity: "normal",
      color: "#ffffff",
      canShine: false,
      removed: false,
      removeCount: 0,
      state: "normal",
      transCount: 0,
      dupCount: 0
    },

    // 고유레어 1~3 (파랑, 번뜩임 가능)
    {
      id: "고유레어1",
      rarity: "rare",
      color: "#5bd3f0",
      canShine: true,
      removed: false,
      removeCount: 0,
      state: "normal",
      transCount: 0,
      dupCount: 0
    },
    {
      id: "고유레어2",
      rarity: "rare",
      color: "#5bd3f0",
      canShine: true,
      removed: false,
      removeCount: 0,
      state: "normal",
      transCount: 0,
      dupCount: 0
    },
    {
      id: "고유레어3",
      rarity: "rare",
      color: "#5bd3f0",
      canShine: true,
      removed: false,
      removeCount: 0,
      state: "normal",
      transCount: 0,
      dupCount: 0
    },

    // 고유전설 1 (노랑, 번뜩임 가능)
    {
      id: "고유전설1",
      rarity: "legend",
      color: "#ffd700",
      canShine: true,
      removed: false,
      removeCount: 0,
      state: "normal",
      transCount: 0,
      dupCount: 0
    },

    // 고유신화 1 (보라, 번뜩임 없음)
    {
      id: "고유신화1",
      rarity: "myth",
      color: "#a777ff",
      canShine: false,
      removed: false,
      removeCount: 0,
      state: "normal",
      transCount: 0,
      dupCount: 0
    }
  ];
}

//////////////////////
// UI 빌드         //
//////////////////////

function buildUI() {
  const grid = document.getElementById("playersGrid");
  grid.innerHTML = "";

  players.forEach((pl, index) => {
    // 플레이어 카드
    const sec = document.createElement("section");
    sec.className = "player-card";
    sec.dataset.index = String(index);

    // 상단(이름, 카드추가 버튼)
    const head = document.createElement("div");
    head.className = "player-head";

    const nameInput = document.createElement("input");
    nameInput.className = "player-name";
    nameInput.value = pl.name;
    nameInput.addEventListener("input", () => {
      pl.name = nameInput.value || `캐릭터${index + 1}`;
    });

    const addBtn = document.createElement("button");
    addBtn.className = "btn ghost";
    addBtn.textContent = "카드 추가";
    addBtn.addEventListener("click", () => openAddModal(index));

    head.appendChild(nameInput);
    head.appendChild(addBtn);
    sec.appendChild(head);

    // 게이지 섹션
    const gaugeSec = document.createElement("div");
    gaugeSec.className = "section";

    const capSpan = document.createElement("div");
    capSpan.className = "small";
    capSpan.textContent = `상한: ${calcCap(globalTier)} pt`;

    const totalSpan = document.createElement("div");
    totalSpan.className = "small";
    totalSpan.style.fontWeight = "700";
    totalSpan.textContent = "총: 0 pt";

    const gauge = document.createElement("div");
    gauge.className = "gauge";

    const gaugeFill = document.createElement("div");
    gaugeFill.className = "gauge-fill";

    const gaugeText = document.createElement("div");
    gaugeText.className = "gauge-text";
    gaugeText.textContent = "0 / 0 pt";

    gauge.appendChild(gaugeFill);
    gauge.appendChild(gaugeText);

    gaugeSec.appendChild(capSpan);
    gaugeSec.appendChild(totalSpan);
    gaugeSec.appendChild(gauge);
    sec.appendChild(gaugeSec);

    // 일반 카드 리스트
    const cardSec = document.createElement("div");
    cardSec.className = "section";
    const cardList = document.createElement("div");
    cardList.className = "card-list";
    cardSec.appendChild(cardList);
    sec.appendChild(cardSec);

    // 고유 카드 리스트
    const uniqueSec = document.createElement("div");
    uniqueSec.className = "section";
    const uniqueTitle = document.createElement("div");
    uniqueTitle.className = "small";
    uniqueTitle.style.fontWeight = "700";
    uniqueTitle.textContent = "고유카드 (8장)";
    const uniqueList = document.createElement("div");
    uniqueList.className = "card-list";
    uniqueSec.appendChild(uniqueTitle);
    uniqueSec.appendChild(uniqueList);
    sec.appendChild(uniqueSec);

    grid.appendChild(sec);

    // 참조 저장
    pl._refs = {
      el: sec,
      nameInput,
      capSpan,
      totalSpan,
      gaugeFill,
      gaugeText,
      cardList,
      uniqueList
    };

    // 고유카드 초기화 & 렌더
    if (!pl.unique || pl.unique.length === 0) {
      generateDefaultUnique(pl);
    }
    renderPlayerUnique(pl);
    renderPlayerCards(pl);
    updatePlayerGauge(pl);
  });

  setupGlobalControls();
}

//////////////////////
// 카드 렌더링      //
//////////////////////

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

    // 상태 선택
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

    // 복제 여부 (토글: 체크=1, 해제=0)
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

    // 변환 여부 (토글: 체크=1, 해제=0)
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

    // 제거 체크(상태 토글만)
    const remLabel = document.createElement("label");
    remLabel.className = "small";
    const remChk = document.createElement("input");
    remChk.type = "checkbox";
    remChk.checked = !!u.removed;
    remChk.addEventListener("change", () => {
      u.removed = remChk.checked;
      addLog(`[${pl.name}] ${u.id} 제거상태: ${u.removed ? "ON" : "OFF"}`);
    });
    remLabel.appendChild(remChk);
    remLabel.appendChild(document.createTextNode("제거"));
    left.appendChild(remLabel);

    row.appendChild(left);

    const right = document.createElement("div");
    right.style.display = "flex";
    right.style.alignItems = "center";
    right.style.gap = "6px";

    // 번뜩임 선택 (가능한 카드만)
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
    } else {
      const badge = document.createElement("div");
      badge.className = "small";
      badge.textContent = "번뜩임 없음";
      right.appendChild(badge);
    }

    // 제거 확정 버튼 (누를 때만 removeCount++)
    const remConfirm = document.createElement("button");
    remConfirm.className = "btn ghost";
    remConfirm.textContent = "제거확정";
    remConfirm.addEventListener("click", () => {
      if (u.removed) {
        u.removeCount = (u.removeCount || 0) + 1;
        addLog(
          `[${pl.name}] ${u.id} 제거확정 (누적 제거횟수: ${u.removeCount})`
        );
        updatePlayerGauge(pl);
      } else {
        addLog(
          `[${pl.name}] ${u.id} 제거확정 실패 - 먼저 '제거'를 체크해야 합니다.`
        );
      }
    });
    right.appendChild(remConfirm);

    // 변환 발생 버튼 (고유카드 변환 이벤트)
    const transBtn = document.createElement("button");
    transBtn.className = "btn ghost";
    transBtn.textContent = "변환 발생";
    transBtn.addEventListener("click", () => {
      u.transCount = (u.transCount || 0) + 1;
      addLog(`[${pl.name}] ${u.id} 변환 발생 (총 ${u.transCount})`);
      updatePlayerGauge(pl);
    });
    right.appendChild(transBtn);

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

//////////////////////
// pt 계산 로직     //
//////////////////////

function calcCardContribution(card) {
  let total = 0;

  if (card.type === "taboo") {
    // 금기카드: 항상 20pt
    total += BASE.taboo;
  } else if (card.type === "neutral" || card.type === "monster" || card.type === "unique_clone") {
    // 중립 / 몬스터 / 고유카드 복제
    if (card.type === "neutral") total += BASE.neutral;
    if (card.type === "monster") total += BASE.monster;
    if (card.type === "unique_clone") {
      // 고유카드 복제는 기본 중립/금기 규칙에 맞게 조정 가능
      total += BASE.neutral; // 일단 중립기준 20pt로 둠 (필요하면 나중에 별도 테이블 지정)
    }

    // 번뜩임 / 신번뜩임
    if (card.state === "spark") total += 10;
    else if (card.state === "newspark") total += 20;

    // 복제 횟수 보정
    const dCount = card.dupCount || 0;
    total += mapCountToPt(dCount);
    if (dCount > 0) {
      // 복제된 카드들도 같은 번뜩임 보정 적용 (개수만큼)
      const per = card.state === "newspark" ? 20 : card.state === "spark" ? 10 : 0;
      total += per * dCount;
    }

    // 변환 횟수 보정
    const tCount = card.transCount || 0;
    total += tCount * 10;
    if (tCount > 0) {
      const per = card.state === "newspark" ? 20 : card.state === "spark" ? 10 : 0;
      total += per * tCount;
    }
  }

  return total;
}

function calcUniqueContribution(u) {
  let total = 0;

  // 고유카드 번뜩임: 고유 일반/신화는 번뜩임 없음, canShine=true 인 애들만
  if (u.canShine && u.state === "newspark") {
    total += 20;
  }

  // 제거 횟수 보정 + 고유 제거 추가 20pt
  if (u.removed) {
    const rc = u.removeCount || 0;
    total += mapCountToPt(rc);
    total += 20; // 고유카드는 제거시 +20pt
  }

  // 변환 횟수
  total += (u.transCount || 0) * 10;

  // (필요하면 고유카드 dupCount도 사용 가능하지만, 현재는 특수 상황으로 거의 안 씀)
  total += mapCountToPt(u.dupCount || 0);

  return total;
}

function updatePlayerGauge(pl) {
  let total = 0;

  // 일반 카드
  pl.cards.forEach((c) => {
    const val = calcCardContribution(c);
    total += val;
    if (c._contribEl) {
      c._contribEl.textContent = `${val} pt`;
    }
  });

  // 고유 카드
  pl.unique.forEach((u) => {
    const val = calcUniqueContribution(u);
    total += val;
    if (u._contribEl) {
      u._contribEl.textContent = `${val} pt`;
    }
  });

  const cap = calcCap(globalTier);
  pl._refs.totalSpan.textContent = `총: ${total} pt`;
  pl._refs.capSpan.textContent = `상한: ${cap} pt`;

  const pct = cap > 0 ? clampPct(Math.round((total / cap) * 100)) : 0;
  pl._refs.gaugeFill.style.width = `${pct}%`;
  pl._refs.gaugeText.textContent = `${total} / ${cap} pt`;

  if (total >= cap) {
    // 상한 도달 로그는 필요에 따라 한 번만 찍고 싶으면 상태 플래그로 관리 가능
    // 일단은 계속 찍지는 않도록 막음 (여기서는 조용히 UI만 보여줌)
  }
}

function renderAll() {
  players.forEach((pl) => {
    renderPlayerCards(pl);
    renderPlayerUnique(pl);
    updatePlayerGauge(pl);
  });
}

//////////////////////
// 모달 & 티어 제어 //
//////////////////////

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
    // 0~20 옵션 생성
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

  // 로그 초기화
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
        // 고유카드 복제 → 내부 타입은 unique_clone
        card.type = "unique_clone";
        card.cloneId = `복제고유_${Date.now()}`;
      }

      pl.cards.push(card);
      addLog(`[${pl.name}] 카드 추가: ${card.type === "unique_clone" ? "고유카드 복제" : card.type} (${state})`);

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

//////////////////////
// 초기화           //
//////////////////////

function init() {
  // 기본 고유카드 준비
  players.forEach((pl) => {
    generateDefaultUnique(pl);
  });

  buildUI();
  renderAll();

  addLog("v6.1 시뮬레이터 초기화 완료");
}

window.addEventListener("DOMContentLoaded", init);
