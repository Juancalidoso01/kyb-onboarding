import { PAIS_PANAMA } from "@/data/paises";

/** Paso con checklist de documentos y adjuntos. */
export const DOCUMENTACION_ENTREGAR_STEP_ID = "documentacion_entregar" as const;

/** Campo sintético que renderiza listas de carga por junta / accionistas / representante. */
export const DOCUMENTACION_PERSONAS_FIELD_ID = "doc_seccion_personas" as const;

/**
 * Formatos habituales de documento e imagen para `accept` en inputs file (navegador).
 */
export const KYB_FILE_ACCEPT =
  ".pdf,.jpg,.jpeg,.png,.webp,.tif,.tiff,.heic,.doc,.docx,.xls,.xlsx,.ppt,.pptx,application/pdf,image/*";

const MAX_JUNTA = 5;
const MAX_BF = 20;

/** Claves de estado para nombres de archivo adjuntos (referencia local; no se suben en este flujo). */
export function allDocumentacionUploadKeys(): string[] {
  const keys: string[] = [];
  for (let n = 1; n <= MAX_JUNTA; n++) keys.push(`doc_upl_junta_${n}`);
  for (let n = 1; n <= MAX_BF; n++) keys.push(`doc_upl_bf_${n}`);
  keys.push(
    "doc_upl_representante",
    "doc_upl_factura_servicios",
    "doc_upl_aviso",
    "doc_upl_pacto",
    "doc_upl_origen",
    "doc_upl_ref_banc",
  );
  return keys;
}

export function empresaOperaEnPanama(values: Record<string, string>): boolean {
  return (values.pais_opera ?? "").trim() === PAIS_PANAMA;
}

/** Contexto para saber cuántas filas de junta/BF aplican y si se omite accionistas (cotiza en bolsa). */
export type KybDocCompletenessContext = {
  juntaMemberSlots: number;
  bfMemberSlots: number;
  omitirAccionistas: boolean;
};

/** Cédulas/pasaportes junta + BF (si aplica) + representante: todos con nombre de archivo cargado. */
export function isDocumentacionPersonasBlockComplete(
  values: Record<string, string>,
  ctx: KybDocCompletenessContext,
): boolean {
  const jSlots = Math.min(MAX_JUNTA, Math.max(1, ctx.juntaMemberSlots));
  const bfSlots = Math.min(MAX_BF, Math.max(1, ctx.bfMemberSlots));
  for (let s = 1; s <= jSlots; s++) {
    if (!(values[`doc_upl_junta_${s}`] ?? "").trim()) return false;
  }
  if (!ctx.omitirAccionistas) {
    for (let s = 1; s <= bfSlots; s++) {
      if (!(values[`doc_upl_bf_${s}`] ?? "").trim()) return false;
    }
  }
  return Boolean((values.doc_upl_representante ?? "").trim());
}

/** Nombre mostrado para fila de beneficiario final / accionista. */
export function nombreAccionistaParaDocumentos(
  values: Record<string, string>,
  slot: number,
): string {
  const tipo = (values[`bf_${slot}_tipo_persona`] ?? "").trim();
  if (tipo === "J") {
    return (values[`bf_${slot}_razon_social`] ?? "").trim();
  }
  if (tipo === "N") {
    return (values[`bf_${slot}_nombre_completo`] ?? "").trim();
  }
  return "";
}
