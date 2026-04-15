/**
 * Sonidos breves con Web Audio API (sin archivos externos).
 * Móvil (Safari / Chrome Android): el contexto arranca "suspended" hasta un
 * gesto del usuario. Tras resume(), algunos navegadores actualizan el estado en
 * el siguiente frame: por eso encadenamos resume → requestAnimationFrame → play.
 * iOS muchas veces no emite keydown por carácter con teclado virtual — el
 * formulario usa input + keydown con el mismo debounce.
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
 * Si el contexto ya está en ejecución, reproduce en el mismo tick (mejor para
 * políticas de audio tras clic/tecla). Si está suspendido, resume() y un frame
 * de margen (Safari / WebKit móvil).
 */
function withRunningContext(play: (c: AudioContext, t: number) => void): void {
  const c = getCtx();
  if (!c) return;

  const tryPlay = (): boolean => {
    try {
      if (c.state !== "running") return false;
      play(c, c.currentTime);
      return true;
    } catch {
      return true;
    }
  };

  if (tryPlay()) return;

  void c.resume().then(() => {
    requestAnimationFrame(() => {
      if (tryPlay()) return;
      void c.resume().then(() => {
        requestAnimationFrame(() => {
          void tryPlay();
        });
      });
    });
  });
}

/** Pico de ganancia al marcar campo completo (equilibrado con toques de UI / teclado). */
const GAIN_FIELD_COMPLETE = 0.085;

/** Toque de teclado: mismo orden de magnitud que navegación y elección en listas. */
const GAIN_KEY_TAP = 0.055;

/** Siguiente / Anterior / envío (mismo nivel en todos los pasos). */
const GAIN_WIZARD_NAV = 0.05;

/** Lista desplegable, checkbox, elección en combobox sin tecla. */
const GAIN_CHOICE = 0.045;

/** Tono corto al completar un campo (gancho verde). */
export function playFieldComplete(): void {
  unlockAudio();
  withRunningContext((c, t) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(523.25, t);
    o.frequency.exponentialRampToValueAtTime(783.99, t + 0.06);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(GAIN_FIELD_COMPLETE, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
    o.connect(g);
    g.connect(c.destination);
    o.start(t);
    o.stop(t + 0.15);
  });
}

/** Toque tipo teclado (muy breve). */
export function playKeyTap(): void {
  unlockAudio();
  withRunningContext((c, t) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(1080 + Math.random() * 160, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(GAIN_KEY_TAP, t + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.022);
    o.connect(g);
    g.connect(c.destination);
    o.start(t);
    o.stop(t + 0.024);
  });
}

/** Navegación del formulario: volúmenes homogéneos entre pasos. */
export function playWizardNav(): void {
  unlockAudio();
  withRunningContext((c, t) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(860 + Math.random() * 90, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(GAIN_WIZARD_NAV, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.048);
    o.connect(g);
    g.connect(c.destination);
    o.start(t);
    o.stop(t + 0.052);
  });
}

/** Al elegir en lista, checkbox o ítem de combobox (sin evento input por tecla). */
export function playChoiceTick(): void {
  unlockAudio();
  withRunningContext((c, t) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(990 + Math.random() * 80, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(GAIN_CHOICE, t + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.038);
    o.connect(g);
    g.connect(c.destination);
    o.start(t);
    o.stop(t + 0.042);
  });
}
