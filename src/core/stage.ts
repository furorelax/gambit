// src/core/stage.ts
import type { BaseStats } from "./types";
import { STAT_LABELS } from "./types";

export type StageId =
  | "standard"
  | "cute_focus_stage"
  | "wild_show_stage"
  | "spooky_cute_stage";

export type StageProfile = {
  id: StageId;
  name: string;
  description: string;
  // スコア計算時のバイアス（審査員の weight に掛ける倍率）
  bias: Partial<Record<keyof BaseStats, number>>;
};

export const STAGES: StageProfile[] = [
  {
    id: "standard",
    name: "スタンダードステージ",
    description: "特に偏りのない、オーソドックスなステージ。",
    bias: {},
  },
  {
    id: "cute_focus_stage",
    name: "キュートフェスティバル",
    description:
      "とにかく CUTE が映えるステージ。少しだけ MAJESTIC もプラス評価。",
    bias: {
      cute: 1.2,
      majestic: 1.05,
    },
  },
  {
    id: "wild_show_stage",
    name: "ワイルドショータイム",
    description:
      "激しい演出が映えるショーステージ。IMPACT 重視、CUTE はやや割引。",
    bias: {
      impact: 1.2, // wild → impact
      cute: 0.9,
    },
  },
  {
    id: "spooky_cute_stage",
    name: "スプーキーカワイイステージ",
    description:
      "不気味さとかわいさの合わせ技がウケるステージ。EERIE と CUTE にボーナス。",
    bias: {
      eerie: 1.15,
      cute: 1.1,
    },
  },
];

export function getStageById(id: StageId): StageProfile | null {
  const found = STAGES.find((s) => s.id === id);
  return found ?? null;
}

export function formatStageBias(stage: StageProfile): string {
  const entries = Object.entries(stage.bias) as [keyof BaseStats, number][];

  if (entries.length === 0) return "補正なし";

  return entries
    .map(([key, mult]) => `${STAT_LABELS[key]}×${mult}`)
    .join(" / ");
}
