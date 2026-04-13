/**
 * Entrada con formato al escribir: el estado guarda valor canónico (sin separadores).
 * USD: dígitos y hasta 2 decimales (ej. canónico "1234567.50").
 * Cantidad: solo enteros (ej. "15000").
 * Visualización: separadores de miles estilo en-US (comas) para reducir errores con ceros.
 */

/** Lee lo que el usuario escribió y produce el string canónico USD guardado en el formulario. */
export function parseUsdInputToCanonical(raw: string): string {
  const s = raw.replace(/[^\d.]/g, "");
  const firstDot = s.indexOf(".");
  if (firstDot === -1) {
    return s.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  }
  const intPart = s
    .slice(0, firstDot)
    .replace(/\D/g, "")
    .replace(/^0+(?=\d)/, "");
  const afterDot = s.slice(firstDot + 1).replace(/\D/g, "");
  const decPart = afterDot.slice(0, 2);
  if (s.slice(firstDot).match(/^\.\s*$/) || (afterDot.length === 0 && raw.trim().endsWith("."))) {
    return (intPart || "0") + ".";
  }
  if (decPart.length > 0) {
    return intPart + "." + decPart;
  }
  return intPart + ".";
}

/** Canónico → texto con comas en miles y punto decimal (.); admite "1234." mientras se escribe. */
export function formatUsdForDisplay(canonical: string): string {
  if (!canonical) return "";
  const hasDot = canonical.includes(".");
  const parts = canonical.split(".");
  const intRaw = (parts[0] ?? "").replace(/\D/g, "");
  const decRaw = parts
    .slice(1)
    .join("")
    .replace(/\D/g, "")
    .slice(0, 2);
  if (!hasDot) {
    if (intRaw === "") return "";
    const intNum = parseInt(intRaw, 10);
    return intNum.toLocaleString("en-US");
  }
  const intNum = intRaw === "" ? 0 : parseInt(intRaw, 10);
  const intFmt = intNum.toLocaleString("en-US");
  if (decRaw.length > 0) return intFmt + "." + decRaw;
  if (canonical.endsWith(".")) return intFmt + ".";
  return intFmt;
}

export function parseQuantityInputToCanonical(raw: string): string {
  return raw.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
}

export function formatQuantityForDisplay(canonical: string): string {
  if (!canonical) return "";
  const n = parseInt(canonical, 10);
  if (Number.isNaN(n)) return "";
  return n.toLocaleString("en-US");
}

export function isValidUsdCanonical(c: string): boolean {
  if (!c || c === ".") return false;
  if (c.endsWith(".")) return false;
  if (!/^\d+$/.test(c) && !/^\d+\.\d{1,2}$/.test(c)) return false;
  const n = parseFloat(c);
  return Number.isFinite(n) && n >= 0;
}

export function isValidQuantityCanonical(c: string): boolean {
  if (!c) return false;
  return /^\d+$/.test(c);
}
