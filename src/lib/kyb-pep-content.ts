/**
 * Paso PEP — definición breve y campos por persona (hasta `PEP_MEMBER_SLOTS_MAX`).
 */

/** Máximo de personas PEP declaradas en el formulario web. */
export const PEP_MEMBER_SLOTS_MAX = 5;

/** Sufijos de `pep_{slot}_*` (mismo orden que en `kyb-steps`). */
export const PEP_MEMBER_FIELD_SUFFIXES = [
  "primer_nombre",
  "segundo_nombre",
  "primer_apellido",
  "segundo_apellido",
  "nacionalidad",
  "cedula_pasaporte",
  "periodo_cargo",
  "pais",
  "funciones_cargo",
  "parentesco",
] as const;

/** Índice de miembro (1..N) si el id pertenece al bloque PEP por slot. */
export function pepFieldMemberSlot(fieldId: string): number | null {
  const h = fieldId.match(/^__h_pep_(\d+)$/);
  if (h) return parseInt(h[1], 10);
  const p = fieldId.match(/^pep_(\d+)_/);
  if (p) return parseInt(p[1], 10);
  return null;
}

export function formKeysForPepMemberSlot(slot: number): string[] {
  return PEP_MEMBER_FIELD_SUFFIXES.map((s) => `pep_${slot}_${s}`);
}

/** Todas las claves `pep_1_*` … `pep_MAX_*` (p. ej. vaciar al responder «No»). */
export function allPepMemberFormKeys(): string[] {
  return Array.from({ length: PEP_MEMBER_SLOTS_MAX }, (_, i) => i + 1).flatMap(
    (slot) => formKeysForPepMemberSlot(slot),
  );
}

export const PEP_STEP_ID = "pep" as const;

/**
 * Texto corto opcional (p. ej. PDF o ayudas). El paso prioriza `description` + pregunta en UI.
 */
export const KYB_TEXT_PEP_STATIC_PARAGRAPHS: string[] = [
  "PEP: quien desempeña o desempeñó función pública relevante (u homóloga internacional) o es familiar cercano o colaborador cercano según la norma. En Panamá rige en especial la Ley 23/2015 y debida diligencia sectorial.",
];

/** @deprecated Preferir `KYB_TEXT_PEP_STATIC_PARAGRAPHS`. */
export const KYB_TEXT_PEP_DEFINICION = KYB_TEXT_PEP_STATIC_PARAGRAPHS.join("\n\n");
