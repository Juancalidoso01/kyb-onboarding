/**
 * Sonidos breves con Web Audio API (sin archivos externos).
 * Móvil (Safari / Chrome Android): el contexto suele arrancar "suspended" hasta
 * un gesto del usuario; hay que llamar resume() y, idealmente, reanudar antes
 * de cada beep. iOS muchas veces no emite keydown por carácter con teclado
 * virtual — el formulario usa eventos input como respaldo.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (Ctx) ctx = new Ctx();
  }
  return ctx;
}

export function unlockAudio(): void {
  const c = getCtx();
  void c?.resume();
}

/**
 * Ejecuta síntesis solo cuando el contexto está en ejecución; si no, intenta
 * resume() (necesario en móvil tras el primer toque).
 */
function withRunningContext(play: (c: AudioContext, t: number) => void): void {
  const c = getCtx();
  if (!c) return;
  const go = () => {
    if (c.state !== "running") return;
    try {
      play(c, c.currentTime);
    } catch {
      /* algunos WebViews fallan con rampas exponenciales */
    }
  };
  if (c.state === "running") go();
  else void c.resume().then(go);
}

/** Tono corto al completar un campo (gancho verde). */
export function playFieldComplete(): void {
  withRunningContext((c, t) => {
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
  });
}

/** Toque tipo teclado (muy breve). */
export function playKeyTap(): void {
  withRunningContext((c, t) => {
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
  });
}
