/** Marca en este navegador que el flujo móvil de verificación + firma ya terminó para un código de sesión. */
const PREFIX = "kyb-rep-verify-done";

export function verificarRepresentanteStorageKey(code: string): string {
  return `${PREFIX}:${code.trim()}`;
}

export function markVerificarRepresentanteCompleto(code: string): void {
  if (typeof window === "undefined" || !code.trim()) return;
  try {
    localStorage.setItem(verificarRepresentanteStorageKey(code), "1");
  } catch {
    /* ignore */
  }
}

export function isVerificarRepresentanteCompleto(code: string): boolean {
  if (typeof window === "undefined" || !code.trim()) return false;
  try {
    return localStorage.getItem(verificarRepresentanteStorageKey(code)) === "1";
  } catch {
    return false;
  }
}
