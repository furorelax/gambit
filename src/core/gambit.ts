// src/core/gambit.ts
import type { BaseStats } from "./types";
import { STAT_LABELS } from "./types";

export type GambitId =
  | "none"
  | "cute_focus"
  | "wild_show"
  | "balanced_pose"
  | "eerie_focus"
  | "majestic_focus"
  | "glass_cannon"
  | "steady_performance"
  | "stage_finale";

export type GambitProfile = {
  id: GambitId;
  name: string;
  description: string;
  // 対象ステータスに掛ける倍率（指定がないものは 1.0 のまま）
  multipliers: Partial<Record<keyof BaseStats, number>>;
};

export const GAMBITS: GambitProfile[] = [
  {
    id: "none",
    name: "ガンビットなし",
    description: "素の魅力で勝負する。ステータス補正なし。",
    multipliers: {},
  },
  {
    id: "cute_focus",
    name: "キュート全振りアピール",
    description: "CUTE をぐっと押し出す演出。ほかの要素は少しだけ控えめに。",
    multipliers: {
      cute: 1.2,
      eerie: 0.95,
      majestic: 0.95,
      impact: 0.95, // wild → impact
    },
  },
  {
    id: "wild_show",
    name: "ワイルドショータイム",
    description:
      "インパクトを前面に出した攻めの構成。CUTE と MAJESTIC は少しだけ犠牲に。",
    multipliers: {
      impact: 1.2, // wild → impact
      cute: 0.95,
      majestic: 0.9,
    },
  },
  {
    id: "balanced_pose",
    name: "バランスよく魅せる",
    description:
      "全体のバランスを整えて、どの審査員にもそこそこ好印象を狙う構成。",
    multipliers: {
      cute: 1.05,
      eerie: 1.05,
      majestic: 1.05,
      impact: 1.05, // wild → impact
    },
  },

  // 追加1：EERIE 寄りの構成
  {
    id: "eerie_focus",
    name: "ミステリアス集中構成",
    description:
      "EERIE を強く押し出す構成。CUTE はやや抑えめにして雰囲気を重視する。",
    multipliers: {
      eerie: 1.25,
      cute: 0.9,
      impact: 0.95, // wild → impact
    },
  },

  // 追加2：MAJESTIC 寄りの構成
  {
    id: "majestic_focus",
    name: "オーラ全開ステージ",
    description:
      "MAJESTIC を底上げし、存在感で勝負する構成。ほかの要素は少しだけ抑える。",
    multipliers: {
      majestic: 1.25,
      cute: 0.95,
      eerie: 0.95,
    },
  },

  // 追加3：ハイリスク・ハイリターン
  {
    id: "glass_cannon",
    name: "一発勝負アピール",
    description:
      "CUTE と MAJESTIC を大きく伸ばす代わりに、IMPACT と EERIE をかなり削る賭け構成。",
    multipliers: {
      cute: 1.35,
      majestic: 1.25,
      impact: 0.8, // wild → impact
      eerie: 0.9,
    },
  },

  // 追加4：安定志向
  {
    id: "steady_performance",
    name: "安定重視パフォーマンス",
    description:
      "全体を少しだけ底上げして、どのステージでも破綻しづらい安定型の構成。",
    multipliers: {
      cute: 1.03,
      eerie: 1.03,
      majestic: 1.03,
      impact: 1.03, // wild → impact
    },
  },

  // 追加5：クライマックス用構成（最終ステージを想定）
  {
    id: "stage_finale",
    name: "クライマックスアピール",
    description:
      "フィナーレ用の見せ場構成。CUTE と MAJESTIC を中心に、IMPACT も底上げする。",
    multipliers: {
      cute: 1.15,
      majestic: 1.15,
      impact: 1.1, // wild → impact
    },
  },
];

export function getGambitById(id: GambitId): GambitProfile | null {
  const found = GAMBITS.find((g) => g.id === id);
  return found ?? null;
}

// ステに倍率を掛けたあと、小数は四捨五入
export function applyGambitToStats(
  stats: BaseStats,
  gambit: GambitProfile | null
): BaseStats {
  if (!gambit) return { ...stats };

  const result: BaseStats = { ...stats };
  (Object.entries(gambit.multipliers) as [keyof BaseStats, number][])
    .forEach(([key, mult]) => {
      result[key] = Math.round(result[key] * mult);
    });

  return result;
}

// ログ表示用（CUTE×1.2 / IMPACT×0.95 みたいな文字列）
export function formatGambitMultipliers(gambit: GambitProfile): string {
  const entries = Object.entries(
    gambit.multipliers
  ) as [keyof BaseStats, number][];

  if (entries.length === 0) return "補正なし";

  return entries
    .map(([key, mult]) => `${STAT_LABELS[key]}×${mult}`)
    .join(" / ");
}
