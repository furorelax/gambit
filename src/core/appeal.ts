// src/core/appeal.ts
import type { BaseStats } from "./types";
import { STAT_LABELS } from "./types";
import type { MonsterPhaseId, MonsterUnlockCondition } from "./monster";

/**
 * アピール ID
 */
export type AppealId =
  | "cool_howl"
  | "throw_kiss"
  | "spin_turn"
  | "glance_shot"
  | "bashful_smile"
  | "weird_dance";

export type AppealProfile = {
  id: AppealId;
  name: string;
  description: string;
  /**
   * ステータスごとの倍率。
   * 例: { impact: 1.25, majestic: 1.15 }
   */
  multipliers: Partial<Record<keyof BaseStats, number>>;
};

/**
 * アピール一覧
 * 倍率は「1 回使ったときの倍率」。
 * skillUses 回使うと、(1 + (mul - 1) * skillUses) で累積させます。
 */
export const APPEALS: AppealProfile[] = [
  {
    id: "cool_howl",
    name: "カッコいい遠吠え",
    description: "静寂を切り裂くクールな遠吠えで、ワイルドさと威厳を示す。",
    multipliers: {
      impact: 1.25,
      majestic: 1.15,
    },
  },
  {
    id: "throw_kiss",
    name: "投げキッス",
    description: "客席に向けて投げキッス。CUTE 重視のサービスアピール。",
    multipliers: {
      cute: 1.3,
    },
  },
  {
    id: "spin_turn",
    name: "クルクルターン",
    description: "華麗なターンでステージを大きく使い、存在感を高める。",
    multipliers: {
      cute: 1.1,
      majestic: 1.2,
    },
  },
  {
    id: "glance_shot",
    name: "流し目ショット",
    description: "流し目で客席を射抜き、色気と集中力をアピールする。",
    multipliers: {
      cute: 1.15,
      eerie: 1.1,
    },
  },
  {
    id: "bashful_smile",
    name: "照れ笑い",
    description: "ふと見せる照れ笑いで、守ってあげたくなる雰囲気を出す。",
    multipliers: {
      cute: 1.2,
    },
  },
  {
    id: "weird_dance",
    name: "不気味なダンス",
    description: "奇妙なステップで会場の空気を支配する、クセになるダンス。",
    multipliers: {
      eerie: 1.4,
      impact: 1.1,
    },
  },
];

/**
 * モンスターごとのアピール候補リスト
 * id は MonsterTemplate.id と合わせる。
 *
 * 今は [1つだけ] 登録しておき、
 * getDefaultAppealForMonster は先頭要素だけを使う。
 * 後から ["cool_howl", "spin_turn"] のように増やして拡張可能。
 */
const MONSTER_APPEALS: Record<string, AppealId[]> = {
  fenrir_adult: ["cool_howl"],
  jack_o_lantern: ["weird_dance"],
  // 他モンスターは未設定なら null 扱い
};

export const MONSTER_PHASE_LABELS: Record<MonsterPhaseId, string> = {
  early: "初期",
  mid: "中期",
  late: "後期",
};

export const MONSTER_UNLOCK_CONDITION_LABELS: Record<
  MonsterUnlockCondition,
  string
> = {
  always: "最初から使用可能",
  after_local_league: "地方大会クリア後",
  after_national_league: "全国大会クリア後",
  after_world_league: "世界大会クリア後",
  bond_with_fenrir_max: "フェンリルとの絆MAX",
};

/**
 * モンスターに対応するデフォルトアピールを取得。
 * 該当がなければ null。
 *
 * ※ main.ts など既存コードのシグネチャは維持。
 */
export function getDefaultAppealForMonster(
  monsterId: string
): AppealProfile | null {
  const appealIds = MONSTER_APPEALS[monsterId];
  if (!appealIds || appealIds.length === 0) return null;

  const firstId = appealIds[0];
  const found = APPEALS.find((a) => a.id === firstId);
  return found ?? null;
}

/**
 * （将来用）モンスターに紐づくアピールID一覧を返す。
 * 今は使わなくても OK。
 */
export function getAppealIdsForMonster(monsterId: string): AppealId[] {
  return MONSTER_APPEALS[monsterId] ?? [];
}

/**
 * アピール倍率をテキスト化（ログ表示用）
 *
 * 例: "CUTE×1.30 / IMPACT×1.25"
 */
export function formatAppealMultipliers(appeal: AppealProfile): string {
  const parts: string[] = [];

  (Object.entries(appeal.multipliers) as [keyof BaseStats, number][]).forEach(
    ([key, mul]) => {
      if (mul === 1) return;
      parts.push(`${STAT_LABELS[key]}×${mul}`);
    }
  );

  if (parts.length === 0) return "補正なし";
  return parts.join(" / ");
}

/**
 * アピールをステータスに適用。
 *
 * - appeal が null のとき
 * - uses <= 0 のとき
 *   → そのまま stats を返す。
 *
 * - uses >= 1 のとき
 *   各ステータスごとに
 *   totalMul = 1 + (mul - 1) * uses
 *   を掛ける（掛け算はまとめて 1 回）。
 */
export function applyAppealToStats(
  stats: BaseStats,
  appeal: AppealProfile | null,
  uses: number
): BaseStats {
  if (!appeal || uses <= 0) {
    // 何もしない
    return stats;
  }

  const result: BaseStats = { ...stats };

  (Object.keys(stats) as (keyof BaseStats)[]).forEach((key) => {
    const baseVal = stats[key];
    const mulPerUse = appeal.multipliers[key] ?? 1;

    if (mulPerUse === 1) {
      result[key] = baseVal;
      return;
    }

    // uses 回使ったときの合計倍率
    const totalMul = 1 + (mulPerUse - 1) * uses;
    result[key] = Math.round(baseVal * totalMul);
  });

  return result;
}
