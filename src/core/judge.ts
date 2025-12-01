// src/core/judge.ts
import type { BaseStats } from "./types";

export type JudgeId =
  | "cute_focus"
  | "wild_focus"
  | "balance_focus"
  | "dark_mystic";

export type JudgeProfile = {
  id: JudgeId;
  name: string;
  description: string; // ざっくりキャラ説明
  weights: Partial<Record<keyof BaseStats, number>>; // C/E/M/IMPACT の係数
};

// 審査員一覧
export const JUDGES: JudgeProfile[] = [
  {
    id: "cute_focus",
    name: "かわいい至上主義者",
    description: "CUTE が高い子にとにかく甘い。MAJESTIC も少し見る。",
    weights: {
      cute: 1.0,
      majestic: 0.4,
    },
  },
  {
    id: "wild_focus",
    name: "インパクト重視の審査員",
    description: "IMPACT を重視。インパクトの中に CUTE があるとさらに加点。",
    weights: {
      impact: 1.0, // wild → impact
      cute: 0.3,
    },
  },
  {
    id: "balance_focus",
    name: "バランス派批評家",
    description: "全ステータスのバランスを評価。極端な尖りはあまり好きじゃない。",
    weights: {
      cute: 0.5,
      eerie: 0.5,
      majestic: 0.5,
      impact: 0.5, // wild → impact
    },
  },
  {
    id: "dark_mystic",
    name: "ダーク趣味の鑑定士",
    description: "EERIE と MAJESTIC の組み合わせが大好物。",
    weights: {
      eerie: 1.0,
      majestic: 0.6,
    },
  },
];

export function calcJudgeScore(stats: BaseStats, judge: JudgeProfile): number {
  let score = 0;
  (Object.entries(judge.weights) as [keyof BaseStats, number][]).forEach(
    ([key, weight]) => {
      score += stats[key] * weight;
    }
  );
  return score;
}
