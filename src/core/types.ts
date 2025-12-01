// src/core/types.ts

export type BaseStats = {
  cute: number;
  eerie: number;
  majestic: number;
  impact: number;
};

// ログや説明用のラベル（2文字表記）
export const STAT_LABELS: Record<keyof BaseStats, string> = {
  cute: "CT",
  eerie: "ER",
  majestic: "MJ",
  impact: "IP",
};

// 性格 ID
export type NatureId =
  | "natural"
  | "daring"   // IMPACT↑ CUTE↓
  | "shy"      // EERIE↑ IMPACT↓
  | "noble"    // MAJESTIC↑ IMPACT↓
  | "radiant"  // MAJESTIC↑ EERIE↓
  | "cheerful" // CUTE↑ EERIE↓
  | "gloomy"   // EERIE↑ CUTE↓
  | "fierce"   // IMPACT↑ MAJESTIC↓
  | "fluffy";  // CUTE↑ IMPACT↓

// 補正内容
type NatureModifier = {
  up?: keyof BaseStats;
  down?: keyof BaseStats;
};

export const NATURE_TABLE: Record<NatureId, NatureModifier> = {
  natural: {},
  daring: { up: "impact", down: "cute" },
  shy: { up: "eerie", down: "impact" },
  noble: { up: "majestic", down: "impact" },
  radiant: { up: "majestic", down: "eerie" },
  cheerful: { up: "cute", down: "eerie" },
  gloomy: { up: "eerie", down: "cute" },
  fierce: { up: "impact", down: "majestic" },
  fluffy: { up: "cute", down: "impact" },
};

// UI 用：性格の並び順
export const ALL_NATURE_IDS: NatureId[] = [
  "natural",
  "daring",
  "shy",
  "noble",
  "radiant",
  "cheerful",
  "gloomy",
  "fierce",
  "fluffy",
];

// 表示名
export const NATURE_LABELS: Record<NatureId, string> = {
  natural: "素直",
  daring: "向こう見ず",
  shy: "引っ込み思案",
  noble: "ノーブル",
  radiant: "神々しい",
  cheerful: "陽気",
  gloomy: "陰気",
  fierce: "大胆",
  fluffy: "ふわふわ",
};

// 性格補正を適用
export function applyNature(base: BaseStats, nature: NatureId): BaseStats {
  const mod = NATURE_TABLE[nature];
  const result: BaseStats = { ...base };

  if (mod.up) {
    result[mod.up] = Math.round(base[mod.up] * 1.1);
  }
  if (mod.down) {
    result[mod.down] = Math.round(base[mod.down] * 0.9);
  }

  return result;
}
