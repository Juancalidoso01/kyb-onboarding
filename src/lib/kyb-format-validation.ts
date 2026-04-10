import type { FormState } from "@/lib/kyb-field-complete";
import { PAIS_PANAMA } from "@/data/paises";
import type { KybField } from "@/lib/kyb-steps";

/** Subconjunto práctico de correo con @, dominio y TLD con punto. */
const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function isValidEmailFormat(s: string): boolean {
  const t = s.trim();
  if (!t || t.length > 254) return false;
  return EMAIL_RE.test(t);
}

export function normalizePhoneDigits(s: string): string {
  return s.replace(/\D/g, "");
}

/** Un bloque (un número). Panamá: 8 dígitos nacionales o 507 + 8 dígitos. */
export function isLikelyPanamaPhoneSingle(s: string): boolean {
  const d = normalizePhoneDigits(s);
  if (d.length === 8) return /^[2-9]\d{7}$/.test(d);
  if (d.length === 11 && d.startsWith("507")) return /^507[2-9]\d{7}$/.test(d);
  return false;
}

/** E.164 aproximado: 8–15 dígitos en total. */
export function isLikelyInternationalPhoneSingle(s: string): boolean {
  const d = normalizePhoneDigits(s);
  return d.length >= 8 && d.length <= 15;
}

/** Varios números separados por coma, punto y coma o barra. */
export function validatePhoneValue(s: string, expectPanama: boolean): boolean {
  const parts = s
    .split(/[,;/|]+/)
    .map((x) => x.trim())
    .filter(Boolean);
  if (parts.length === 0) return false;
  return expectPanama
    ? parts.every(isLikelyPanamaPhoneSingle)
    : parts.every(isLikelyInternationalPhoneSingle);
}

export const PHONE_TEXT_FIELD_IDS = new Set([
  "telefonos_generales",
  "celulares_generales",
]);

export function isPhoneLikeField(field: KybField): boolean {
  return field.type === "tel" || PHONE_TEXT_FIELD_IDS.has(field.id);
}

/** Si el contexto del formulario indica teléfono panameño (+507 / 8 dígitos). */
export function expectPanamaPhoneForField(
  fieldId: string,
  values: FormState,
): boolean {
  switch (fieldId) {
    case "persona_contacto_telefono":
      return values.pais_opera === PAIS_PANAMA;
    case "telefonos_generales":
    case "celulares_generales":
      return values.pais === PAIS_PANAMA;
    case "rep_telefono":
      return values.rep_pais_residencia === PAIS_PANAMA;
    case "ref_telefono":
      return false;
    default:
      return false;
  }
}

export function getContactFormatError(
  field: KybField,
  values: FormState,
): string | null {
  const v = (values[field.id] ?? "").trim();
  if (!v) return null;

  if (field.type === "email") {
    if (!isValidEmailFormat(v)) {
      return "Use un correo válido (ej. contacto@empresa.com): un solo @, dominio y extensión (.com, .pa, etc.).";
    }
    return null;
  }

  if (isPhoneLikeField(field)) {
    const expectPa = expectPanamaPhoneForField(field.id, values);
    if (!validatePhoneValue(v, expectPa)) {
      return expectPa
        ? "Para Panamá indique +507 y 8 dígitos (ej. +507 6123-4567) u 8 dígitos locales. Puede separar varios números con coma."
        : "Use al menos 8 dígitos (puede incluir código de país). Varios números: sepárelos con coma.";
    }
    return null;
  }

  return null;
}

/** Solo dígitos; entero 0–100 para guardar en el estado (sin el símbolo %). */
export function normalizePercentInput(raw: string): string {
  const d = raw.replace(/\D/g, "");
  if (d === "") return "";
  let n = parseInt(d, 10);
  if (Number.isNaN(n)) return "";
  if (n > 100) n = 100;
  return String(n);
}

export function getPercentFormatError(
  field: KybField,
  values: FormState,
): string | null {
  if (field.type !== "percent") return null;
  const raw = (values[field.id] ?? "").trim();
  if (raw === "") return null;
  const norm = normalizePercentInput(raw);
  if (norm === "" && raw !== "") {
    return "Use solo números de 0 a 100. El símbolo % se muestra al lado; no hace falta escribirlo.";
  }
  if (norm === "") return null;
  const n = parseInt(norm, 10);
  if (n < 0 || n > 100) {
    return "El porcentaje debe estar entre 0 y 100.";
  }
  return null;
}

export function getFormatErrorForField(
  field: KybField,
  values: FormState,
): string | null {
  return getContactFormatError(field, values) ?? getPercentFormatError(field, values);
}
