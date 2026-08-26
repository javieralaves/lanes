import {
  APPROACH_SEC,
  LATE_FRACTION,
  RUSHED_FRACTION,
  type ActiveNote,
  type GameStats,
  type HitJudgment,
  type LaneId,
  type Recipe,
  type RecipeNote,
} from "./types";

export function createActiveNotes(recipe: Recipe): ActiveNote[] {
  return recipe.notes
    .slice()
    .sort((a, b) => a.time - b.time)
    .map((n) => ({ ...n, status: "pending" as const }));
}

export function emptyStats(total: number): GameStats {
  return {
    score: 0,
    combo: 0,
    maxCombo: 0,
    perfect: 0,
    good: 0,
    missed: 0,
    hit: 0,
    total,
  };
}

export function noteStart(note: RecipeNote): number {
  return note.time;
}

export function noteEnd(note: RecipeNote): number {
  return note.time + note.duration;
}

/** True while the step is open at the strike line and waiting for a tap. */
export function isInWindow(note: RecipeNote, now: number): boolean {
  return now >= note.time && now <= noteEnd(note);
}

/**
 * Approach progress: 0 = just spawned (far), 1 = at strike line.
 * Once in the hittable window, stays locked at 1 until hit/miss.
 */
export function noteProgress(note: RecipeNote, now: number): number {
  const start = note.time - APPROACH_SEC;
  if (now <= start) return 0;
  if (now >= note.time) return 1;
  return (now - start) / APPROACH_SEC;
}

/** How much of the open window is still left (1 → 0 while active). */
export function windowRemaining(note: RecipeNote, now: number): number {
  if (now < note.time) return 1;
  if (now >= noteEnd(note)) return 0;
  return 1 - (now - note.time) / note.duration;
}

export function isVisible(note: ActiveNote, now: number): boolean {
  if (note.status !== "pending") return false;
  const start = note.time - APPROACH_SEC;
  const end = noteEnd(note) + 0.05;
  return now >= start && now <= end;
}

/**
 * Judge a tap against a cook-duration window.
 * Rushed (very early in the window) / late edge → good.
 * Main portion (after you've had time to do the work) → perfect.
 */
export function judgeHit(note: RecipeNote, now: number): HitJudgment | null {
  if (!isInWindow(note, now)) return null;
  const progress = (now - note.time) / note.duration;
  if (progress < RUSHED_FRACTION) return "good";
  if (progress <= LATE_FRACTION) return "perfect";
  return "good";
}

export function scoreFor(judgment: HitJudgment, combo: number): number {
  if (judgment === "miss" || judgment === "early") return 0;
  const base = judgment === "perfect" ? 100 : 60;
  const mult = 1 + Math.min(combo, 20) * 0.05;
  return Math.round(base * mult);
}

/**
 * Earliest pending note in a lane that is currently hittable.
 */
export function findHittable(
  notes: ActiveNote[],
  lane: LaneId,
  now: number,
): ActiveNote | null {
  let best: ActiveNote | null = null;

  for (const note of notes) {
    if (note.lane !== lane || note.status !== "pending") continue;
    if (!isInWindow(note, now)) continue;
    if (!best || note.time < best.time) best = note;
  }
  return best;
}

/**
 * Space / global hit: earliest open step across all lanes.
 */
export function findNearestHittable(
  notes: ActiveNote[],
  now: number,
): ActiveNote | null {
  let best: ActiveNote | null = null;

  for (const note of notes) {
    if (note.status !== "pending") continue;
    if (!isInWindow(note, now)) continue;
    if (!best || note.time < best.time) best = note;
  }
  return best;
}

/**
 * Soft early: pending note in lane is approaching but not open yet.
 */
export function findApproaching(
  notes: ActiveNote[],
  lane: LaneId,
  now: number,
): ActiveNote | null {
  let best: ActiveNote | null = null;

  for (const note of notes) {
    if (note.lane !== lane || note.status !== "pending") continue;
    const approachStart = note.time - APPROACH_SEC;
    if (now >= approachStart && now < note.time) {
      if (!best || note.time < best.time) best = note;
    }
  }
  return best;
}

export function applyMisses(notes: ActiveNote[], now: number): {
  notes: ActiveNote[];
  newlyMissed: ActiveNote[];
} {
  const newlyMissed: ActiveNote[] = [];
  const next = notes.map((n) => {
    if (n.status !== "pending") return n;
    if (now > noteEnd(n)) {
      const missed = { ...n, status: "missed" as const, judgment: "miss" as const };
      newlyMissed.push(missed);
      return missed;
    }
    return n;
  });
  return { notes: next, newlyMissed };
}

export function applyHit(
  notes: ActiveNote[],
  noteId: string,
  judgment: HitJudgment,
): ActiveNote[] {
  return notes.map((n) =>
    n.id === noteId ? { ...n, status: "hit" as const, judgment } : n,
  );
}

export function applyMissStats(stats: GameStats, count: number): GameStats {
  if (count <= 0) return stats;
  return {
    ...stats,
    combo: 0,
    missed: stats.missed + count,
  };
}

export function applyHitStats(
  stats: GameStats,
  judgment: HitJudgment,
): GameStats {
  const combo = judgment === "perfect" || judgment === "good" ? stats.combo + 1 : 0;
  const points = scoreFor(judgment, stats.combo);
  return {
    ...stats,
    score: stats.score + points,
    combo,
    maxCombo: Math.max(stats.maxCombo, combo),
    perfect: stats.perfect + (judgment === "perfect" ? 1 : 0),
    good: stats.good + (judgment === "good" ? 1 : 0),
    hit: stats.hit + (judgment === "perfect" || judgment === "good" ? 1 : 0),
  };
}

export function accuracyPct(stats: GameStats): number {
  if (stats.total === 0) return 0;
  return Math.round((stats.hit / stats.total) * 100);
}

export function plateGrade(stats: GameStats): string {
  const acc = accuracyPct(stats);
  if (acc >= 95 && stats.maxCombo >= 6) return "Fire";
  if (acc >= 85) return "Hot";
  if (acc >= 70) return "Solid";
  if (acc >= 50) return "Edible";
  return "Needs salt";
}

/** Last moment any pending note can still be completed. */
export function recipeEndTime(recipe: Recipe): number {
  let end = recipe.durationSec;
  for (const n of recipe.notes) {
    end = Math.max(end, noteEnd(n));
  }
  return end;
}
