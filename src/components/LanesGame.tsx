"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  playDone,
  playHit,
  playMiss,
  playStart,
  setMuted,
} from "@/lib/audio";
import {
  accuracyPct,
  applyHit,
  applyHitStats,
  applyMisses,
  applyMissStats,
  createActiveNotes,
  emptyStats,
  findApproaching,
  findHittable,
  findNearestHittable,
  isInWindow,
  isVisible,
  judgeHit,
  noteProgress,
  plateGrade,
  recipeEndTime,
  windowRemaining,
} from "@/lib/game";
import {
  INITIATION_RECIPE,
  LENTIL_CURRY,
  RECIPES,
} from "@/lib/recipe";
import {
  LANE_META,
  LANE_ORDER,
  type ActiveNote,
  type GamePhase,
  type GameStats,
  type HitFlash,
  type HitJudgment,
  type LaneId,
  type Recipe,
} from "@/lib/types";

function formatTime(sec: number): string {
  const s = Math.max(0, Math.ceil(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

function formatWindow(sec: number): string {
  const s = Math.max(0, Math.ceil(sec));
  if (s >= 60) {
    const m = Math.floor(s / 60);
    const r = s % 60;
    return r === 0 ? `${m}m` : `${m}m ${r}s`;
  }
  return `${s}s`;
}

function recipeBlurb(recipe: Recipe): string {
  const mins = Math.max(1, Math.round(recipe.durationSec / 60));
  const steps = recipe.notes.length;
  return `${steps} steps · ~${mins} min`;
}

export default function LanesGame() {
  const [recipe, setRecipe] = useState<Recipe>(INITIATION_RECIPE);
  const [phase, setPhase] = useState<GamePhase>("ready");
  const [menuOpen, setMenuOpen] = useState(true);
  const [notes, setNotes] = useState<ActiveNote[]>(() =>
    createActiveNotes(INITIATION_RECIPE),
  );
  const [stats, setStats] = useState<GameStats>(() =>
    emptyStats(INITIATION_RECIPE.notes.length),
  );
  const [now, setNow] = useState(0);
  const [flashes, setFlashes] = useState<HitFlash[]>([]);
  const [pressLane, setPressLane] = useState<LaneId | null>(null);
  const [soundOn, setSoundOn] = useState(false);
  const [judgmentBanner, setJudgmentBanner] = useState<{
    text: string;
    kind: HitJudgment;
  } | null>(null);

  const phaseRef = useRef(phase);
  const notesRef = useRef(notes);
  const statsRef = useRef(stats);
  const recipeRef = useRef(recipe);
  const menuOpenRef = useRef(menuOpen);
  const startWallRef = useRef(0);
  const rafRef = useRef(0);
  const bannerTimer = useRef<number | null>(null);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);
  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);
  useEffect(() => {
    recipeRef.current = recipe;
  }, [recipe]);
  useEffect(() => {
    menuOpenRef.current = menuOpen;
  }, [menuOpen]);

  const showJudgment = useCallback((judgment: HitJudgment, label?: string) => {
    const text =
      judgment === "perfect"
        ? "PERFECT"
        : judgment === "good"
          ? "GOOD"
          : judgment === "early"
            ? "EARLY"
            : "MISS";
    setJudgmentBanner({ text: label ? `${text}` : text, kind: judgment });
    if (bannerTimer.current) window.clearTimeout(bannerTimer.current);
    bannerTimer.current = window.setTimeout(() => setJudgmentBanner(null), 420);
  }, []);

  const pushFlash = useCallback(
    (lane: LaneId, judgment: HitJudgment, label: string) => {
      const id = `${lane}-${performance.now()}`;
      setFlashes((f) => [
        ...f.slice(-6),
        { id, lane, judgment, label, at: performance.now() },
      ]);
      window.setTimeout(() => {
        setFlashes((f) => f.filter((x) => x.id !== id));
      }, 500);
    },
    [],
  );

  const attemptHit = useCallback(
    (lane: LaneId | "any") => {
      if (phaseRef.current !== "playing") return;
      const t = (performance.now() - startWallRef.current) / 1000;
      const target =
        lane === "any"
          ? findNearestHittable(notesRef.current, t)
          : findHittable(notesRef.current, lane, t);

      if (!target) {
        if (lane !== "any") {
          const approaching = findApproaching(notesRef.current, lane, t);
          if (approaching) {
            playMiss();
            showJudgment("early");
            pushFlash(lane, "early", approaching.label);
          }
          setPressLane(lane);
          window.setTimeout(() => setPressLane(null), 120);
        }
        return;
      }

      const judgment = judgeHit(target, t);
      if (!judgment) return;

      const nextNotes = applyHit(notesRef.current, target.id, judgment);
      notesRef.current = nextNotes;
      setNotes(nextNotes);

      const nextStats = applyHitStats(statsRef.current, judgment);
      statsRef.current = nextStats;
      setStats(nextStats);

      playHit(judgment === "perfect" ? "perfect" : "good");
      showJudgment(judgment);
      pushFlash(target.lane, judgment, target.label);
      setPressLane(target.lane);
      window.setTimeout(() => setPressLane(null), 140);
    },
    [pushFlash, showJudgment],
  );

  useEffect(() => {
    if (phase !== "playing") {
      cancelAnimationFrame(rafRef.current);
      return;
    }

    const endAt = recipeEndTime(recipe);

    const frame = () => {
      if (phaseRef.current !== "playing") return;
      const t = (performance.now() - startWallRef.current) / 1000;
      setNow(t);

      const { notes: next, newlyMissed } = applyMisses(notesRef.current, t);
      if (newlyMissed.length > 0) {
        notesRef.current = next;
        setNotes(next);
        const nextStats = applyMissStats(statsRef.current, newlyMissed.length);
        statsRef.current = nextStats;
        setStats(nextStats);
        playMiss();
        showJudgment("miss");
        for (const m of newlyMissed) {
          pushFlash(m.lane, "miss", m.label);
        }
      }

      const allDone = notesRef.current.every((n) => n.status !== "pending");
      if (allDone || t >= endAt + 0.8) {
        setPhase("done");
        playDone();
        return;
      }

      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, recipe, pushFlash, showJudgment]);

  const startRecipe = useCallback((next: Recipe) => {
    const fresh = createActiveNotes(next);
    const freshStats = emptyStats(next.notes.length);
    recipeRef.current = next;
    notesRef.current = fresh;
    statsRef.current = freshStats;
    setRecipe(next);
    setNotes(fresh);
    setStats(freshStats);
    setFlashes([]);
    setJudgmentBanner(null);
    setNow(0);
    setMenuOpen(false);
    menuOpenRef.current = false;
    startWallRef.current = performance.now();
    setPhase("playing");
    playStart();
  }, []);

  const openMenu = useCallback(() => {
    setMenuOpen(true);
    setPhase("ready");
    setNow(0);
    setFlashes([]);
    setJudgmentBanner(null);
  }, []);

  const replayCurrent = useCallback(() => {
    startRecipe(recipeRef.current);
  }, [startRecipe]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();

      if (phaseRef.current === "ready" && menuOpenRef.current) {
        if (key === "1" || key === " ") {
          e.preventDefault();
          startRecipe(INITIATION_RECIPE);
          return;
        }
        if (key === "2" || key === "enter") {
          e.preventDefault();
          startRecipe(LENTIL_CURRY);
          return;
        }
      }
      if (
        phaseRef.current === "done" &&
        (key === " " || key === "enter" || key === "r")
      ) {
        e.preventDefault();
        if (recipeRef.current.id === INITIATION_RECIPE.id) {
          startRecipe(LENTIL_CURRY);
        } else {
          replayCurrent();
        }
        return;
      }
      if (phaseRef.current === "done" && key === "m") {
        e.preventDefault();
        openMenu();
        return;
      }
      if (phaseRef.current !== "playing") return;

      if (key === " ") {
        e.preventDefault();
        attemptHit("any");
        return;
      }

      for (const lane of LANE_ORDER) {
        if (LANE_META[lane].keys.includes(key)) {
          e.preventDefault();
          attemptHit(lane);
          return;
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [attemptHit, openMenu, replayCurrent, startRecipe]);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setMuted(!next);
    if (next) playHit("good");
  };

  const remaining = Math.max(0, recipe.durationSec - now);
  const visibleNotes = notes.filter((n) => isVisible(n, now));
  const isInitiation = recipe.id === INITIATION_RECIPE.id;

  return (
    <div className="cabinet-shell">
      <div className="cabinet-marquee" aria-hidden>
        <span className="marquee-brand">LANES</span>
        <span className="marquee-dot">●</span>
        <span className="marquee-sub">ARCADE COOK</span>
      </div>

      <div className="cabinet-bezel">
        <div className="cabinet-screen">
          <header className="hud">
            <div className="hud-left">
              <p className="hud-recipe">{recipe.title}</p>
              <p className="hud-meta">
                {phase === "playing"
                  ? formatTime(remaining)
                  : formatTime(recipe.durationSec)}{" "}
                · {stats.hit}/{stats.total}
              </p>
            </div>
            <div className="hud-center">
              {phase === "playing" && judgmentBanner && (
                <span
                  className={`judgment judgment-${judgmentBanner.kind}`}
                  key={judgmentBanner.text + judgmentBanner.kind + now}
                >
                  {judgmentBanner.text}
                </span>
              )}
            </div>
            <div className="hud-right">
              <div className="score-block">
                <span className="score-label">SCORE</span>
                <span className="score-value">{stats.score}</span>
              </div>
              <div className="combo-block">
                <span className="combo-label">COMBO</span>
                <span className={`combo-value ${stats.combo > 0 ? "hot" : ""}`}>
                  {stats.combo}x
                </span>
              </div>
              <button
                type="button"
                className="sound-toggle"
                onClick={toggleSound}
                aria-pressed={soundOn}
              >
                {soundOn ? "SND" : "MUTE"}
              </button>
            </div>
          </header>

          {phase === "ready" && menuOpen && (
            <MenuOverlay onPick={startRecipe} />
          )}

          {phase === "done" && (
            <DoneOverlay
              stats={stats}
              recipe={recipe}
              isInitiation={isInitiation}
              onReplay={replayCurrent}
              onCookCurry={() => startRecipe(LENTIL_CURRY)}
              onCookInitiation={() => startRecipe(INITIATION_RECIPE)}
              onMenu={openMenu}
            />
          )}

          <div className={`stage ${phase === "playing" ? "live" : "dimmed"}`}>
            <div className="highway">
              <div className="highway-vanish" />
              <div className="lane-rails">
                {LANE_ORDER.map((lane) => (
                  <div
                    key={lane}
                    className={`lane ${pressLane === lane ? "pressed" : ""}`}
                    style={
                      {
                        "--lane-accent": LANE_META[lane].accent,
                        "--lane-glow": LANE_META[lane].glow,
                      } as CSSProperties
                    }
                    onPointerDown={(e) => {
                      e.preventDefault();
                      if (phase === "playing") attemptHit(lane);
                    }}
                  >
                    <div className="lane-track">
                      <div className="lane-perspective">
                        {visibleNotes
                          .filter((n) => n.lane === lane)
                          .map((n) => {
                            const active = isInWindow(n, now);
                            const p = noteProgress(n, now);
                            const rem = windowRemaining(n, now);
                            // Map progress to perspective: far (top) → strike (bottom)
                            const y = active ? 1 : Math.min(1, Math.max(0, p));
                            const scale = active ? 1 : 0.45 + y * 0.55;
                            return (
                              <div
                                key={n.id}
                                className={`note ${active ? "note-active" : "note-approach"}`}
                                style={{
                                  ["--y" as string]: String(y),
                                  ["--scale" as string]: String(scale),
                                  ["--remain" as string]: String(rem),
                                }}
                              >
                                {active && (
                                  <div
                                    className="note-window"
                                    aria-hidden
                                  >
                                    <div
                                      className="note-window-fill"
                                      style={{
                                        transform: `scaleY(${rem})`,
                                      }}
                                    />
                                  </div>
                                )}
                                <span className="note-gem" />
                                <span className="note-label">{n.label}</span>
                                {active && (
                                  <span className="note-timer">
                                    {formatWindow(n.duration * rem)} left · tap
                                    when done
                                  </span>
                                )}
                              </div>
                            );
                          })}
                      </div>
                      <div className="strike-line">
                        <span className="strike-glow" />
                      </div>
                      {flashes
                        .filter((f) => f.lane === lane)
                        .map((f) => (
                          <div
                            key={f.id}
                            className={`hit-burst hit-${f.judgment}`}
                          />
                        ))}
                    </div>
                    <div className="lane-pad">
                      <span className="pad-key">{LANE_META[lane].key}</span>
                      <span className="pad-name">{LANE_META[lane].name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <footer className="cabinet-controls">
            <p>
              Do the step, then tap · <kbd>A</kbd> Board · <kbd>S</kbd> Pot ·{" "}
              <kbd>D</kbd> Finish · <kbd>Space</kbd> open step
            </p>
            <p className="controls-hint">
              Windows wait for real cook time · landscape works best
            </p>
          </footer>
        </div>
      </div>

      <div className="cabinet-foot" aria-hidden>
        <div className="cabinet-vent" />
        <div className="cabinet-badge">JAVIER&apos;S COUNTER</div>
        <div className="cabinet-vent" />
      </div>
    </div>
  );
}

function MenuOverlay({ onPick }: { onPick: (recipe: Recipe) => void }) {
  return (
    <div className="overlay start-overlay">
      <div className="overlay-card menu-card">
        <p className="overlay-brand">LANES</p>
        <h1 className="overlay-title">Pick a cook</h1>
        <p className="overlay-copy">
          Kitchens run at different tempos. Warm up on a short counter cook,
          then take the curry — or jump straight in.
        </p>
        <div className="recipe-pick">
          {RECIPES.map((r, i) => {
            const initiation = r.id === INITIATION_RECIPE.id;
            return (
              <button
                key={r.id}
                type="button"
                className={initiation ? "cta-start recipe-cta" : "cta-secondary recipe-cta"}
                onClick={() => onPick(r)}
              >
                <span className="recipe-cta-title">{r.title}</span>
                <span className="recipe-cta-meta">
                  {initiation ? "Initiation · " : ""}
                  {recipeBlurb(r)}
                  <span className="recipe-cta-key">
                    {" "}
                    · <kbd>{i + 1}</kbd>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        <p className="overlay-keys">
          <kbd>1</kbd> / <kbd>Space</kbd> warm-up · <kbd>2</kbd> /{" "}
          <kbd>Enter</kbd> curry
        </p>
      </div>
    </div>
  );
}

function DoneOverlay({
  stats,
  recipe,
  isInitiation,
  onReplay,
  onCookCurry,
  onCookInitiation,
  onMenu,
}: {
  stats: GameStats;
  recipe: Recipe;
  isInitiation: boolean;
  onReplay: () => void;
  onCookCurry: () => void;
  onCookInitiation: () => void;
  onMenu: () => void;
}) {
  const grade = plateGrade(stats);
  const acc = accuracyPct(stats);
  return (
    <div className="overlay done-overlay">
      <div className="overlay-card plated">
        <p className="overlay-brand">PLATED</p>
        <h2 className="overlay-title">{grade}</h2>
        <p className="done-recipe">{recipe.title}</p>
        <div className="plate-visual" aria-hidden>
          <div className="plate-rim">
            {isInitiation ? (
              <>
                <div className="plate-toast" />
                <div className="plate-oil" />
              </>
            ) : (
              <>
                <div className="plate-curry" />
                <div className="plate-rice" />
              </>
            )}
          </div>
        </div>
        <ul className="done-stats">
          <li>
            <span>Score</span>
            <strong>{stats.score}</strong>
          </li>
          <li>
            <span>Accuracy</span>
            <strong>{acc}%</strong>
          </li>
          <li>
            <span>Max combo</span>
            <strong>{stats.maxCombo}x</strong>
          </li>
          <li>
            <span>Perfect / Good / Miss</span>
            <strong>
              {stats.perfect} / {stats.good} / {stats.missed}
            </strong>
          </li>
        </ul>
        <div className="done-actions">
          {isInitiation ? (
            <>
              <button type="button" className="cta-start" onClick={onCookCurry}>
                COOK THE CURRY
              </button>
              <button
                type="button"
                className="cta-secondary"
                onClick={onReplay}
              >
                WARM UP AGAIN
              </button>
            </>
          ) : (
            <>
              <button type="button" className="cta-start" onClick={onReplay}>
                COOK AGAIN
              </button>
              <button
                type="button"
                className="cta-secondary"
                onClick={onCookInitiation}
              >
                COUNTER WARM-UP
              </button>
            </>
          )}
          <button type="button" className="cta-ghost" onClick={onMenu}>
            Pick a cook
          </button>
        </div>
        <p className="overlay-keys">
          {isInitiation ? (
            <>
              <kbd>Space</kbd> curry · <kbd>R</kbd> replay · <kbd>M</kbd> menu
            </>
          ) : (
            <>
              <kbd>R</kbd> or <kbd>Space</kbd> replay · <kbd>M</kbd> menu
            </>
          )}
        </p>
      </div>
    </div>
  );
}
