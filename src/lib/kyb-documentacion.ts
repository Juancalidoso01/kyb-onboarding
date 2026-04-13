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
