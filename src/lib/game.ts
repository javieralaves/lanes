import {
  APPROACH_SEC,
  GOOD_WINDOW,
  PERFECT_WINDOW,
  type ActiveNote,
  type GameStats,
  type HitJudgment,
  type LaneId,
  type Recipe,
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

export function noteProgress(noteTime: number, now: number): number {
  // 0 = just spawned (far), 1 = at strike line
  const start = noteTime - APPROACH_SEC;
  if (now <= start) return 0;
  if (now >= noteTime) return 1 + (now - noteTime) / APPROACH_SEC;
  return (now - start) / APPROACH_SEC;
}

export function isVisible(note: ActiveNote, now: number): boolean {
  if (note.status !== "pending") return false;
  const start = note.time - APPROACH_SEC;
  const end = note.time + GOOD_WINDOW + 0.05;
  return now >= start && now <= end;
}

export function judgeHit(delta: number): HitJudgment | null {
  const abs = Math.abs(delta);
  if (abs <= PERFECT_WINDOW) return "perfect";
  if (abs <= GOOD_WINDOW) return "good";
  return null;
}

export function scoreFor(judgment: HitJudgment, combo: number): number {
  if (judgment === "miss" || judgment === "early") return 0;
  const base = judgment === "perfect" ? 100 : 60;
  const mult = 1 + Math.min(combo, 20) * 0.05;
  return Math.round(base * mult);
}

/**
 * Find the best pending note in a lane within the hit window.
 */
export function findHittable(
  notes: ActiveNote[],
  lane: LaneId,
  now: number,
): ActiveNote | null {
  let best: ActiveNote | null = null;
  let bestAbs = Infinity;

  for (const note of notes) {
    if (note.lane !== lane || note.status !== "pending") continue;
    const delta = now - note.time;
    const abs = Math.abs(delta);
    if (abs > GOOD_WINDOW) continue;
    if (abs < bestAbs) {
      bestAbs = abs;
      best = note;
    }
  }
  return best;
}

/**
 * Space / global hit: nearest pending note across all lanes in window.
 */
export function findNearestHittable(
  notes: ActiveNote[],
  now: number,
): ActiveNote | null {
  let best: ActiveNote | null = null;
  let bestAbs = Infinity;

  for (const note of notes) {
    if (note.status !== "pending") continue;
    const abs = Math.abs(now - note.time);
    if (abs > GOOD_WINDOW) continue;
    if (abs < bestAbs) {
      bestAbs = abs;
      best = note;
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
    if (now - n.time > GOOD_WINDOW) {
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
  if (acc >= 95 && stats.maxCombo >= 8) return "Fire";
  if (acc >= 85) return "Hot";
  if (acc >= 70) return "Solid";
  if (acc >= 50) return "Edible";
  return "Needs salt";
}
