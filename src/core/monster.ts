// src/core/monster.ts
import type { BaseStats, NatureId } from "./types";
import { applyNature } from "./types";

// 解放フェーズ（前期 / 中期 / 後期）
export type MonsterPhaseId = "early" | "mid" | "late";

// フェーズ表示用ラベル（UI 用）
export const MONSTER_PHASE_LABELS: Record<MonsterPhaseId, string> = {
  early: "前期（初期）",
  mid: "中期",
  late: "後期",
};

// 将来拡張を見据えた解放条件
export type MonsterUnlockCondition =
  | "always" // 最初から使用可
  | "after_local_league" // 地方大会クリア後
  | "after_national_league" // 全国大会クリア後
  | "after_world_league" // 世界大会クリア後
  | "bond_with_fenrir_max"; // フェンリルとの絆MAX など個別条件

// ==============================
// ムード定義
// ==============================

export type MoodId =
  | "idol"
  | "elegance"
  | "mysterious"
  | "wild"
  | "trickster"
  | "heartful";

// ムードそのものの表示名
export const MOOD_LABELS: Record<MoodId, string> = {
  idol: "アイドル",
  elegance: "エレガンス",
  mysterious: "ミステリアス",
  wild: "ワイルド",
  trickster: "トリックスター",
  heartful: "ハートフル",
};

// 厳選候補として 6 種すべてを使うためのリスト
export const ALL_MOOD_IDS: MoodId[] = [
  "idol",
  "elegance",
  "mysterious",
  "wild",
  "trickster",
  "heartful",
];

// ムードごとの細かいフレーバー（テキスト用）
export const MOOD_FLAVOR_LABELS: Record<MoodId, string[]> = {
  idol: ["王道アイドル", "二番手アイドル", "負けヒロイン"],
  elegance: [
    "二枚目",
    "クールビューティー",
    "モード",
    "スタイリッシュ",
    "ハイファッション",
  ],
  mysterious: ["妖艶", "芸術肌", "ヤンデレ"],
  wild: ["元気はつらつ", "野生児", "暴れん坊"],
  trickster: ["小悪魔", "いたずら好き"],
  heartful: ["おっとり", "ジェントル", "浪花節"],
};

// ==============================
// アーキタイプ定義
// ==============================

export type ArchetypeId =
  | "star" // 看板・主役
  | "partner" // 相棒・二番手・支え
  | "moodmaker" // 盛り上げ役
  | "specialist" // 完成度重視の職人
  | "artist"; // 解釈・表現重視の表現者

export const ARCHETYPE_LABELS: Record<ArchetypeId, string> = {
  star: "スター枠",
  partner: "相棒枠",
  moodmaker: "ムードメーカー枠",
  specialist: "スペシャリスト枠",
  artist: "アーティスト枠",
};

// ==============================
// モンスター本体定義
// ==============================

export type MonsterTemplate = {
  catalogNo: number; // 図鑑番号（1〜25 など）
  id: string; // 内部ID
  name: string; // 表示名
  archetype: ArchetypeId; // アーキタイプ
  baseStats: BaseStats; // 素の C/E/M/I
  phase: MonsterPhaseId; // early / mid / late
  unlockCondition: MonsterUnlockCondition; // 解放条件
  staminaMax: number; // スタミナ最大値（ラフ）
};

// 実際の個体：性格＋現在のムードを持つ
export type MonsterInstance = {
  template: MonsterTemplate;
  nature: NatureId;
  activeMood: MoodId;
};

// 性格補正まで反映したステータスを返す
export function getEffectiveStats(mon: MonsterInstance): BaseStats {
  return applyNature(mon.template.baseStats, mon.nature);
}

// ==============================
// サンプルテンプレート（ラフ 25体）
// ==============================
//
// ・early … スタート〜序盤用（staminaMax: 3 / unlock: always）
// ・mid   … 中期用（staminaMax: 4 / unlock: after_local_league）
// ・late  … 後期用（staminaMax: 5 / unlock: after_national_league 等）
//
// 数値バランスは「とりあえずテストできる」程度のラフ値。
// 後で全国大会の設計が固まったら、ここをしっかり詰める想定。

export const SAMPLE_TEMPLATES: MonsterTemplate[] = [
  // ===== early（初期モンスター：マイルド。大きな偏りなし）==========================

  {
    catalogNo: 1,
    id: "fenrir_adult",
    name: "フェンリル",
    archetype: "star",
    baseStats: { cute: 48, eerie: 42, majestic: 56, impact: 54 },
    phase: "early",
    unlockCondition: "always",
    staminaMax: 3,
  },
  {
    catalogNo: 2,
    id: "jack_o_lantern",
    name: "ジャック",
    archetype: "moodmaker",
    baseStats: { cute: 57, eerie: 43, majestic: 45, impact: 55 },
    phase: "early",
    unlockCondition: "always",
    staminaMax: 3,
  },
  {
    catalogNo: 3,
    id: "muse_idol_fairy",
    name: "ミューズ",
    archetype: "star",
    baseStats: { cute: 60, eerie: 45, majestic: 50, impact: 45 },
    phase: "early",
    unlockCondition: "always",
    staminaMax: 3,
  },
  {
    catalogNo: 4,
    id: "moko_plush_beast",
    name: "モコ",
    archetype: "partner",
    baseStats: { cute: 58, eerie: 45, majestic: 47, impact: 50 },
    phase: "early",
    unlockCondition: "always",
    staminaMax: 3,
  },
  {
    catalogNo: 5,
    id: "gear_dancer_artifact",
    name: "ギアダンサー",
    archetype: "specialist",
    baseStats: { cute: 44, eerie: 46, majestic: 58, impact: 52 },
    phase: "early",
    unlockCondition: "always",
    staminaMax: 3,
  },
  {
    catalogNo: 6,
    id: "healer_sprite_spirit",
    name: "セレス",
    archetype: "partner",
    baseStats: { cute: 55, eerie: 45, majestic: 52, impact: 48 },
    phase: "early",
    unlockCondition: "always",
    staminaMax: 3,
  },
  {
    catalogNo: 7,
    id: "plush_guard_beast",
    name: "ガーディ",
    archetype: "partner",
    baseStats: { cute: 48, eerie: 45, majestic: 53, impact: 54 },
    phase: "early",
    unlockCondition: "always",
    staminaMax: 3,
  },
  {
    catalogNo: 8,
    id: "trick_rabbit_kaiji",
    name: "トリックラビット",
    archetype: "moodmaker",
    baseStats: { cute: 57, eerie: 46, majestic: 42, impact: 55 },
    phase: "early",
    unlockCondition: "always",
    staminaMax: 3,
  },
  {
    catalogNo: 9,
    id: "beat_penguin_beast",
    name: "ビートペンギン",
    archetype: "moodmaker",
    baseStats: { cute: 56, eerie: 44, majestic: 45, impact: 55 },
    phase: "early",
    unlockCondition: "always",
    staminaMax: 3,
  },
  {
    catalogNo: 10,
    id: "dream_weaver_beast",
    name: "ドリームウィーバー",
    archetype: "artist",
    baseStats: { cute: 46, eerie: 56, majestic: 54, impact: 44 },
    phase: "early",
    unlockCondition: "always",
    staminaMax: 3,
  },

  // ===== mid（中期モンスター：合計値は近いが、はっきり偏りがある）==================

  {
    catalogNo: 11,
    id: "lumina_wolf_beast",
    name: "ルミナウルフ",
    archetype: "star",
    baseStats: { cute: 50, eerie: 35, majestic: 60, impact: 75 },
    phase: "mid",
    unlockCondition: "after_local_league",
    staminaMax: 4,
  },
  {
    catalogNo: 12,
    id: "stella_song_spirit",
    name: "ステラ",
    archetype: "star",
    baseStats: { cute: 80, eerie: 25, majestic: 70, impact: 45 },
    phase: "mid",
    unlockCondition: "after_local_league",
    staminaMax: 4,
  },
  {
    catalogNo: 13,
    id: "abyss_idol_kaiji",
    name: "アビス",
    archetype: "star",
    baseStats: { cute: 25, eerie: 80, majestic: 70, impact: 45 },
    phase: "mid",
    unlockCondition: "after_local_league",
    staminaMax: 4,
  },
  {
    catalogNo: 14,
    id: "minotaur_mood_beast",
    name: "ミノタウロス",
    archetype: "moodmaker",
    baseStats: { cute: 45, eerie: 35, majestic: 30, impact: 90 },
    phase: "mid",
    unlockCondition: "after_local_league",
    staminaMax: 4,
  },
  {
    catalogNo: 15,
    id: "carnival_fox_spirit",
    name: "カーニバルフォックス",
    archetype: "moodmaker",
    baseStats: { cute: 70, eerie: 30, majestic: 35, impact: 75 },
    phase: "mid",
    unlockCondition: "after_local_league",
    staminaMax: 4,
  },
  {
    catalogNo: 16,
    id: "yukionna_snow_spirit",
    name: "ユキオンナ",
    archetype: "specialist",
    baseStats: { cute: 35, eerie: 80, majestic: 75, impact: 30 },
    phase: "mid",
    unlockCondition: "after_local_league",
    staminaMax: 4,
  },
  {
    catalogNo: 17,
    id: "tempo_sniper_artifact",
    name: "テンポスナイパー",
    archetype: "specialist",
    baseStats: { cute: 30, eerie: 40, majestic: 85, impact: 65 },
    phase: "mid",
    unlockCondition: "after_local_league",
    staminaMax: 4,
  },
  {
    catalogNo: 18,
    id: "rhythm_blade_beast",
    name: "リズムブレード",
    archetype: "specialist",
    baseStats: { cute: 35, eerie: 35, majestic: 80, impact: 70 },
    phase: "mid",
    unlockCondition: "after_local_league",
    staminaMax: 4,
  },
  {
    catalogNo: 19,
    id: "tutor_dragon",
    name: "チューター",
    archetype: "partner",
    baseStats: { cute: 40, eerie: 50, majestic: 75, impact: 45 },
    phase: "mid",
    unlockCondition: "after_local_league",
    staminaMax: 4,
  },
  {
    catalogNo: 20,
    id: "lantern_painter_spirit",
    name: "ランタンペインター",
    archetype: "artist",
    baseStats: { cute: 45, eerie: 75, majestic: 80, impact: 30 },
    phase: "mid",
    unlockCondition: "after_local_league",
    staminaMax: 4,
  },

  // ===== late（後期モンスター：0 や 100 に近い「極端な」ステ）======================

  {
    catalogNo: 21,
    id: "nocturne_artist_dragon",
    name: "ノクターン",
    archetype: "artist",
    baseStats: { cute: 10, eerie: 95, majestic: 95, impact: 20 },
    phase: "late",
    unlockCondition: "after_national_league",
    staminaMax: 5,
  },
  {
    catalogNo: 22,
    id: "shield_knight_artifact",
    name: "シールドナイト",
    archetype: "partner",
    baseStats: { cute: 30, eerie: 10, majestic: 90, impact: 80 },
    phase: "late",
    unlockCondition: "after_national_league",
    staminaMax: 5,
  },
  {
    catalogNo: 23,
    id: "score_alchemist_kaiji",
    name: "スコアアルケミスト",
    archetype: "specialist",
    baseStats: { cute: 5, eerie: 100, majestic: 85, impact: 30 },
    phase: "late",
    unlockCondition: "after_national_league",
    staminaMax: 5,
  },
  {
    catalogNo: 24,
    id: "medusa_artist_kaiji",
    name: "メデューサ",
    archetype: "artist",
    baseStats: { cute: 0, eerie: 100, majestic: 95, impact: 25 },
    phase: "late",
    unlockCondition: "bond_with_fenrir_max",
    staminaMax: 5,
  },
  {
    catalogNo: 25,
    id: "relic_sculptor_artifact",
    name: "レリックスカルプター",
    archetype: "artist",
    baseStats: { cute: 15, eerie: 80, majestic: 100, impact: 25 },
    phase: "late",
    unlockCondition: "after_national_league",
    staminaMax: 5,
  },
];


