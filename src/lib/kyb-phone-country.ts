import { dialDigitsForPaisNombre } from "@/data/pais-prefijo-telefono";
import type { FormState } from "@/lib/kyb-field-complete";

/** Teléfonos donde mostramos prefijo fijo + parte nacional (un número típico). */
export const PHONE_SPLIT_PREFIX_FIELD_IDS = new Set([
  "persona_contacto_telefono",
  "rep_telefono",
  "ref_telefono",
]);

export function phoneCountrySourceKey(
  fieldId: string,
): keyof FormState | null {
  switch (fieldId) {
    case "persona_contacto_telefono":
    case "ref_telefono":
      return "pais_opera";
    case "telefonos_generales":
    case "celulares_generales":
      return "pais";
    case "rep_telefono":
      return "rep_pais_residencia";
    default:
      return null;
  }
}

export function getDialDigitsForPhoneField(
  fieldId: string,
  values: FormState,
): string | null {
  const key = phoneCountrySourceKey(fieldId);
  if (!key) return null;
  return dialDigitsForPaisNombre(String(values[key] ?? ""));
}
