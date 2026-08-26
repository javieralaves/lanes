export type LaneId = "board" | "pot" | "finish";

export type GamePhase = "ready" | "playing" | "done";

export type HitJudgment = "perfect" | "good" | "miss" | "early";

export interface RecipeNote {
  id: string;
  lane: LaneId;
  /** Seconds from recipe start when the note should be hit */
  time: number;
  label: string;
}

export interface Recipe {
  id: string;
  title: string;
  subtitle: string;
  durationSec: number;
  notes: RecipeNote[];
}

export interface ActiveNote extends RecipeNote {
  status: "pending" | "hit" | "missed";
  judgment?: HitJudgment;
}

export interface HitFlash {
  id: string;
  lane: LaneId;
  judgment: HitJudgment;
  label: string;
  at: number;
}

export interface GameStats {
  score: number;
  combo: number;
  maxCombo: number;
  perfect: number;
  good: number;
  missed: number;
  hit: number;
  total: number;
}

export const LANE_ORDER: LaneId[] = ["board", "pot", "finish"];

export const LANE_META: Record<
  LaneId,
  { name: string; key: string; keys: string[]; accent: string; glow: string }
> = {
  board: {
    name: "Board",
    key: "A",
    keys: ["a", "j", "1"],
    accent: "#ffb347",
    glow: "rgba(255, 179, 71, 0.55)",
  },
  pot: {
    name: "Pot",
    key: "S",
    keys: ["s", "k", "2"],
    accent: "#5cffb0",
    glow: "rgba(92, 255, 176, 0.55)",
  },
  finish: {
    name: "Finish",
    key: "D",
    keys: ["d", "l", "3"],
    accent: "#ff5c7a",
    glow: "rgba(255, 92, 122, 0.55)",
  },
};

/** How long a note travels before the strike line (seconds) */
export const APPROACH_SEC = 2.4;

/** Hit windows relative to perfect time (seconds) — generous for countertop demo */
export const PERFECT_WINDOW = 0.16;
export const GOOD_WINDOW = 0.32;
