/** Tiny Web Audio blips — muted by default. */

let ctx: AudioContext | null = null;
let muted = true;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

export function isMuted(): boolean {
  return muted;
}

export function setMuted(value: boolean): void {
  muted = value;
  if (!value) {
    const c = getCtx();
    void c?.resume();
  }
}

function beep(freq: number, duration: number, type: OscillatorType, gain = 0.08) {
  if (muted) return;
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.value = gain;
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  osc.connect(g);
  g.connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + duration);
}

export function playHit(kind: "perfect" | "good"): void {
  if (kind === "perfect") {
    beep(880, 0.08, "square", 0.07);
    beep(1320, 0.06, "triangle", 0.05);
  } else {
    beep(660, 0.07, "square", 0.05);
  }
}

export function playMiss(): void {
  beep(140, 0.12, "sawtooth", 0.04);
}

export function playStart(): void {
  beep(440, 0.08, "square", 0.06);
  setTimeout(() => beep(660, 0.1, "square", 0.06), 90);
}

export function playDone(): void {
  beep(523, 0.1, "triangle", 0.06);
  setTimeout(() => beep(659, 0.1, "triangle", 0.06), 100);
  setTimeout(() => beep(784, 0.18, "triangle", 0.07), 200);
}
