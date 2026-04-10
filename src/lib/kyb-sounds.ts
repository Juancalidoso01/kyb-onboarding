/**
 * Sonidos breves con Web Audio API (sin archivos externos).
 * Requiere interacción del usuario antes (unlockAudio) por políticas del navegador.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (Ctx) ctx = new Ctx();
  }
  return ctx;
}

export function unlockAudio(): void {
  const c = getCtx();
  void c?.resume();
}

/** Tono corto al completar un campo (gancho verde). */
export function playFieldComplete(): void {
  const c = getCtx();
  if (!c || c.state !== "running") return;
  const t = c.currentTime;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(523.25, t);
  o.frequency.exponentialRampToValueAtTime(783.99, t + 0.06);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.09, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
  o.connect(g);
  g.connect(c.destination);
  o.start(t);
  o.stop(t + 0.15);
}

/** Toque tipo teclado (muy breve, variación leve de tono). */
export function playKeyTap(): void {
  const c = getCtx();
  if (!c || c.state !== "running") return;
  const t = c.currentTime;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(1180 + Math.random() * 180, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.045, t + 0.003);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.022);
  o.connect(g);
  g.connect(c.destination);
  o.start(t);
  o.stop(t + 0.024);
}
