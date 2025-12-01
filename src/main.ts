// src/main.ts
import {
  SAMPLE_TEMPLATES,
  type MonsterInstance,
  type MoodId,
  MOOD_LABELS,
  ALL_MOOD_IDS,
  ARCHETYPE_LABELS,
  getEffectiveStats,
  MONSTER_PHASE_LABELS,
  type MonsterPhaseId,
} from "./core/monster";

import {
  type BaseStats,
  type NatureId,
  ALL_NATURE_IDS,
  NATURE_LABELS,
  STAT_LABELS,
} from "./core/types";

import { JUDGES, type JudgeId, type JudgeProfile } from "./core/judge";

import {
  GAMBITS,
  type GambitId,
  type GambitProfile,
  getGambitById,
  applyGambitToStats,
  formatGambitMultipliers,
} from "./core/gambit";

import {
  STAGES,
  type StageId,
  type StageProfile,
  getStageById,
  formatStageBias,
} from "./core/stage";

import {
  getDefaultAppealForMonster,
  applyAppealToStats,
  formatAppealMultipliers,
} from "./core/appeal";

// --------- 型 & 状態 ---------

type JudgeSlotKey = "judge1" | "judge2" | "judge3";
type StageSlotKey = "stage1" | "stage2" | "stage3";
type GambitSlotKey = "gambit1" | "gambit2" | "gambit3";

type State = {
  monsterId: string;
  natureId: NatureId;
  moodId: MoodId;
  // ガンビットは 3 スロット
  gambits: Record<GambitSlotKey, GambitId>;
  // ステージも 3 スロット
  stages: Record<StageSlotKey, StageId>;
  // 審査員 3 人
  judges: Record<JudgeSlotKey, JudgeId>;
};

let state: State;

// --------- 小物ユーティリティ ---------

function $(selector: string): HTMLElement | null {
  return document.querySelector < HTMLElement > (selector);
}

function getTemplateById(id: string) {
  const found = SAMPLE_TEMPLATES.find((t) => t.id === id);
  return found ?? null;
}

function getJudgeById(id: JudgeId): JudgeProfile | null {
  const found = JUDGES.find((j) => j.id === id);
  return found ?? null;
}

function formatJudgeFormula(judge: JudgeProfile): string {
  const parts: string[] = [];
  (Object.entries(judge.weights) as [keyof BaseStats, number][]).forEach(
    ([key, weight]) => {
      parts.push(`${STAT_LABELS[key]}×${weight}`);
    }
  );
  return parts.join(" + ");
}

// ステージまで含めたスコア計算
function calcScoreWithStage(
  stats: BaseStats,
  judge: JudgeProfile,
  stage: StageProfile | null
): number {
  let total = 0;

  (Object.keys(judge.weights) as (keyof BaseStats)[]).forEach((key) => {
    const w = judge.weights[key];
    const stageMul = stage?.bias[key] ?? 1;
    total += stats[key] * w * stageMul;
  });

  return total;
}

// --------- UI 初期化 ---------

function initSelectors(): void {
  const monsterSelect = $("#monsterSelect") as HTMLSelectElement | null;
  const natureSelect = $("#natureSelect") as HTMLSelectElement | null;
  const moodSelect = $("#moodSelect") as HTMLSelectElement | null;

  const stage1Select = $("#stage1Select") as HTMLSelectElement | null;
  const stage2Select = $("#stage2Select") as HTMLSelectElement | null;
  const stage3Select = $("#stage3Select") as HTMLSelectElement | null;

  const gambit1Select = $("#gambit1Select") as HTMLSelectElement | null;
  const gambit2Select = $("#gambit2Select") as HTMLSelectElement | null;
  const gambit3Select = $("#gambit3Select") as HTMLSelectElement | null;

  const judge1Select = $("#judge1Select") as HTMLSelectElement | null;
  const judge2Select = $("#judge2Select") as HTMLSelectElement | null;
  const judge3Select = $("#judge3Select") as HTMLSelectElement | null;

  const skillUsesInput = document.getElementById(
    "skillUses"
  ) as HTMLInputElement | null;

  if (
    !monsterSelect ||
    !natureSelect ||
    !moodSelect ||
    !stage1Select ||
    !stage2Select ||
    !stage3Select ||
    !gambit1Select ||
    !gambit2Select ||
    !gambit3Select ||
    !judge1Select ||
    !judge2Select ||
    !judge3Select
  ) {
    return;
  }

  const defaultTemplate = SAMPLE_TEMPLATES[0];

  const defaultJudgeIds: JudgeId[] = JUDGES.slice(0, 3).map((j) => j.id);
  const defaultStageIds: StageId[] = STAGES.slice(0, 3).map((s) => s.id);
  const fallbackStageId: StageId =
    (defaultStageIds[0] as StageId) ?? ("standard" as StageId);

  const defaultGambitIds: GambitId[] = GAMBITS.slice(0, 3).map((g) => g.id);
  const noneGambit =
    GAMBITS.find((g) => g.id === ("none" as GambitId)) ?? GAMBITS[0];
  const fallbackGambitId: GambitId = noneGambit.id as GambitId;

  state = {
    monsterId: defaultTemplate.id,
    natureId: "natural",
    // ムードはとりあえず idol を初期値にしておき、セレクトで変更
    moodId: "idol",
    gambits: {
      gambit1: fallbackGambitId,
      gambit2: fallbackGambitId,
      gambit3: fallbackGambitId,
    },
    stages: {
      stage1: defaultStageIds[0] ?? fallbackStageId,
      stage2: defaultStageIds[1] ?? fallbackStageId,
      stage3: defaultStageIds[2] ?? fallbackStageId,
    },
    judges: {
      judge1: defaultJudgeIds[0],
      judge2: defaultJudgeIds[1] ?? defaultJudgeIds[0],
      judge3: defaultJudgeIds[2] ?? defaultJudgeIds[0],
    },
  };

  // --- モンスター選択肢（phase ごとに optgroup 分類） ---
  const phaseOrder: MonsterPhaseId[] = ["early", "mid", "late"];
  monsterSelect.innerHTML = "";

  phaseOrder.forEach((phaseId) => {
    const groupMonsters = SAMPLE_TEMPLATES.filter((t) => t.phase === phaseId);

    if (groupMonsters.length === 0) return;

    const optgroup = document.createElement("optgroup");
    optgroup.label = MONSTER_PHASE_LABELS[phaseId];

    groupMonsters
      .slice()
      .sort((a, b) => a.catalogNo - b.catalogNo)
      .forEach((t) => {
        const opt = document.createElement("option");
        opt.value = t.id;

        const catalogLabel = String(t.catalogNo).padStart(3, "0");
        opt.textContent = `${catalogLabel} ${t.name}`;

        // 将来用にメタ情報を data-* で持たせておく
        opt.dataset.phase = t.phase;
        opt.dataset.unlockCondition = t.unlockCondition;
        opt.dataset.staminaMax = String(t.staminaMax);

        optgroup.appendChild(opt);
      });

    monsterSelect.appendChild(optgroup);
  });

  monsterSelect.value = state.monsterId;

  // --- 性格選択肢 ---
  ALL_NATURE_IDS.forEach((id) => {
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = `${NATURE_LABELS[id]}（${id}）`;
    natureSelect.appendChild(opt);
  });
  natureSelect.value = state.natureId;

  // --- ムード選択肢 ---
  updateMoodOptions();

  // --- ステージ選択肢（3スロット） ---
  const fillStageSelect = (el: HTMLSelectElement, selectedId: StageId) => {
    el.innerHTML = "";
    STAGES.forEach((s) => {
      const opt = document.createElement("option");
      opt.value = s.id;
      opt.textContent = s.name;
      el.appendChild(opt);
    });
    el.value = selectedId;
  };

  fillStageSelect(stage1Select, state.stages.stage1);
  fillStageSelect(stage2Select, state.stages.stage2);
  fillStageSelect(stage3Select, state.stages.stage3);

  // --- ガンビット選択肢（3スロット） ---
  const fillGambitSelect = (el: HTMLSelectElement, selectedId: GambitId) => {
    el.innerHTML = "";
    GAMBITS.forEach((g) => {
      const opt = document.createElement("option");
      opt.value = g.id;
      opt.textContent = g.name;
      el.appendChild(opt);
    });
    el.value = selectedId;
  };

  fillGambitSelect(gambit1Select, state.gambits.gambit1);
  fillGambitSelect(gambit2Select, state.gambits.gambit2);
  fillGambitSelect(gambit3Select, state.gambits.gambit3);

  // --- 審査員選択肢 ---
  const fillJudgeSelect = (el: HTMLSelectElement, selectedId: JudgeId) => {
    el.innerHTML = "";
    JUDGES.forEach((j) => {
      const opt = document.createElement("option");
      opt.value = j.id;
      opt.textContent = j.name;
      el.appendChild(opt);
    });
    el.value = selectedId;
  };

  fillJudgeSelect(judge1Select, state.judges.judge1);
  fillJudgeSelect(judge2Select, state.judges.judge2);
  fillJudgeSelect(judge3Select, state.judges.judge3);

  // --- イベント登録 ---

  monsterSelect.addEventListener("change", () => {
    const newId = monsterSelect.value;
    const tmpl = getTemplateById(newId);
    if (!tmpl) return;

    state.monsterId = newId;
    updateMoodOptions();
    render();
  });

  natureSelect.addEventListener("change", () => {
    state.natureId = natureSelect.value as NatureId;
    render();
  });

  moodSelect.addEventListener("change", () => {
    state.moodId = moodSelect.value as MoodId;
    render();
  });

  stage1Select.addEventListener("change", () => {
    state.stages.stage1 = stage1Select.value as StageId;
    render();
  });

  stage2Select.addEventListener("change", () => {
    state.stages.stage2 = stage2Select.value as StageId;
    render();
  });

  stage3Select.addEventListener("change", () => {
    state.stages.stage3 = stage3Select.value as StageId;
    render();
  });

  gambit1Select.addEventListener("change", () => {
    state.gambits.gambit1 = gambit1Select.value as GambitId;
    render();
  });

  gambit2Select.addEventListener("change", () => {
    state.gambits.gambit2 = gambit2Select.value as GambitId;
    render();
  });

  gambit3Select.addEventListener("change", () => {
    state.gambits.gambit3 = gambit3Select.value as GambitId;
    render();
  });

  judge1Select.addEventListener("change", () => {
    state.judges.judge1 = judge1Select.value as JudgeId;
    render();
  });

  judge2Select.addEventListener("change", () => {
    state.judges.judge2 = judge2Select.value as JudgeId;
    render();
  });

  judge3Select.addEventListener("change", () => {
    state.judges.judge3 = judge3Select.value as JudgeId;
    render();
  });

  if (skillUsesInput) {
    skillUsesInput.addEventListener("input", () => {
      render();
    });
  }
}

function updateMoodOptions(): void {
  const moodSelect = $("#moodSelect") as HTMLSelectElement | null;
  if (!moodSelect) return;

  moodSelect.innerHTML = "";

  // テンプレート依存ではなく、全ムードから選択
  ALL_MOOD_IDS.forEach((moodId) => {
    const opt = document.createElement("option");
    opt.value = moodId;
    opt.textContent = MOOD_LABELS[moodId];
    moodSelect.appendChild(opt);
  });

  // 万一 state.moodId が不正ならデフォルトに戻す
  if (!ALL_MOOD_IDS.includes(state.moodId)) {
    state.moodId = ALL_MOOD_IDS[0];
  }

  moodSelect.value = state.moodId;
}

// --------- 描画 ---------

function render(): void {
  const logEl = $("#log") as HTMLPreElement | null;
  if (!logEl) return;

  const tmpl = getTemplateById(state.monsterId);
  if (!tmpl) {
    logEl.textContent = "テンプレートが見つかりません。";
    return;
  }

  const instance: MonsterInstance = {
    template: tmpl,
    nature: state.natureId,
    activeMood: state.moodId,
  };

  // アピール情報
  const skillUsesInput = document.getElementById(
    "skillUses"
  ) as HTMLInputElement | null;
  const skillInfoDiv = document.getElementById(
    "skillInfo"
  ) as HTMLDivElement | null;

  const appeal = getDefaultAppealForMonster(instance.template.id);
  const skillUses = skillUsesInput ? Number(skillUsesInput.value) || 0 : 0;

  if (skillInfoDiv) {
    if (appeal) {
      const effectText = formatAppealMultipliers(appeal);
      const usesText = skillUses > 0 ? `（想定使用回数: ${skillUses}回）` : "";
      skillInfoDiv.textContent = `アピール: ${appeal.name}
説明: ${appeal.description}
補正: ${effectText} ${usesText}`;
    } else {
      skillInfoDiv.textContent =
        "このモンスターにはまだスキルが設定されていません。";
    }
  }

  // ステータス計算：性格 → ガンビット×3 → アピール
  const baseStats = getEffectiveStats(instance);

  const gambitSlots: GambitSlotKey[] = ["gambit1", "gambit2", "gambit3"];

  let statsAfterGambit = baseStats;
  gambitSlots.forEach((slotKey) => {
    const g = getGambitById(state.gambits[slotKey]);
    statsAfterGambit = applyGambitToStats(statsAfterGambit, g);
  });

  const statsAfterAppeal = applyAppealToStats(
    statsAfterGambit,
    appeal,
    skillUses
  );
  const finalStats = statsAfterAppeal;

  const lines: string[] = [];

  lines.push("=== 現在の設定 ===");
  lines.push(`名前: ${tmpl.name}`);
  lines.push(
    `タイプ: ${ARCHETYPE_LABELS[tmpl.archetype]}（${tmpl.archetype}）`
  );
  lines.push(`性格: ${NATURE_LABELS[state.natureId]}（${state.natureId}）`);
  lines.push(`ムード: ${MOOD_LABELS[state.moodId]}（${state.moodId}）`);
  lines.push("");

  lines.push(
    `基本ステ（性格まで反映）: CT${baseStats.cute} / ER${baseStats.eerie} / MJ${baseStats.majestic} / IP${baseStats.impact}`
  );
  // ★ スタミナ表示（monster → instance.template に修正）
  lines.push(`スタミナMax: ${tmpl.staminaMax}`);

  // ガンビット設定ブロック
  lines.push("");
  lines.push("=== ガンビット設定 ===");
  gambitSlots.forEach((slotKey, index) => {
    const g = getGambitById(state.gambits[slotKey]);
    if (!g) {
      lines.push(`ガンビット${index + 1}: （なし）`);
    } else {
      lines.push(`ガンビット${index + 1}: ${g.name}`);
      lines.push(`  説明: ${g.description}`);
      lines.push(`  補正: ${formatGambitMultipliers(g)}`);
    }
  });

  // アピール
  if (appeal) {
    lines.push("");
    lines.push("=== アピール ===");
    lines.push(`アピール: ${appeal.name}`);
    lines.push(`  説明: ${appeal.description}`);
    lines.push(
      `  補正: ${formatAppealMultipliers(appeal)}（×${skillUses}回想定）`
    );
  }

  lines.push("");
  lines.push(
    `最終ステ（ガンビット＋アピール適用後）: CT${finalStats.cute} / ER${finalStats.eerie} / MJ${finalStats.majestic} / IP${finalStats.impact}`
  );
  lines.push("");

  // ステージ構成
  const stageSlots: StageSlotKey[] = ["stage1", "stage2", "stage3"];
  lines.push("ステージ構成:");
  stageSlots.forEach((slotKey, idx) => {
    const stage = getStageById(state.stages[slotKey]);
    if (!stage) return;
    lines.push(`  ステージ${idx + 1}: ${stage.name}（${stage.description}）`);
  });
  lines.push("");

  // ===== 審査 =====
  lines.push("=== 審査結果 ===");

  const judgeSlots: JudgeSlotKey[] = ["judge1", "judge2", "judge3"];
  let grandTotal = 0;

  stageSlots.forEach((stageSlotKey, stageIndex) => {
    const stage = getStageById(state.stages[stageSlotKey]);
    if (!stage) return;

    lines.push("");
    lines.push(`--- ステージ${stageIndex + 1}: ${stage.name} ---`);
    lines.push(`説明: ${stage.description}`);
    lines.push(`ステージバイアス: ${formatStageBias(stage)}`);
    lines.push("");

    const judgeScoresThisStage: number[] = [];

    judgeSlots.forEach((judgeSlotKey, judgeIndex) => {
      const judgeId = state.judges[judgeSlotKey];
      const judge = getJudgeById(judgeId);
      if (!judge) return;

      const score = calcScoreWithStage(finalStats, judge, stage);
      judgeScoresThisStage.push(score);

      lines.push(
        `審査員${judgeIndex + 1}: ${judge.name}（${judge.description}）`
      );
      lines.push(`  評価式: ${formatJudgeFormula(judge)}`);
      lines.push(`  スコア: ${score.toFixed(1)}`);
      lines.push("");
    });

    if (judgeScoresThisStage.length > 0) {
      const stageTotal = judgeScoresThisStage.reduce((a, b) => a + b, 0);
      grandTotal += stageTotal;
      lines.push(`ステージ合計スコア: ${stageTotal.toFixed(1)}`);
    }
  });

  lines.push("");
  lines.push("=== 総合結果 ===");
  const validStageCount = stageSlots.filter(
    (slotKey) => getStageById(state.stages[slotKey]) != null
  ).length;

  // 合計スコアはコメントアウトで残す
  // lines.push(`全ステージ合計スコア: ${grandTotal.toFixed(1)}`);

  const averageScore =
    validStageCount > 0 ? grandTotal / validStageCount : 0;
  lines.push(`平均ステージスコア: ${averageScore.toFixed(1)}`);

  logEl.textContent = lines.join("\n");
}

// --------- 起動 ---------

initSelectors();
render();
