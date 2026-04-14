import { KYB_ACTIVITY_NOT_LISTED_VALUE } from "@/lib/kyb-activity-extra-option";
import {
  DOCUMENTACION_ENTREGAR_STEP_ID,
  empresaOperaEnPanama,
} from "@/lib/kyb-documentacion";
import type { FormState } from "@/lib/kyb-field-complete";
import { PEP_STEP_ID, pepFieldMemberSlot } from "@/lib/kyb-pep-content";
import {
  algunaSeleccionServicioPuntoPago,
  BENEFICIARIOS_FINALES_STEP_ID,
  bfFieldMemberSlot,
  JUNTA_DIRECTIVA_STEP_ID,
  juntaFieldMemberSlot,
  type KybField,
  type KybStep,
} from "@/lib/kyb-steps";

export type KybFieldVisibilityContext = {
  juntaMemberSlots: number;
  bfMemberSlots: number;
  pepMemberSlots: number;
};

/** Misma lógica que el filtro del wizard: qué campos se muestran en un paso. */
export function isKybStepFieldVisible(
  step: KybStep,
  f: KybField,
  values: FormState,
  ctx: KybFieldVisibilityContext,
): boolean {
  if (f.hidden) return false;
  if (step.id === JUNTA_DIRECTIVA_STEP_ID) {
    const slot = juntaFieldMemberSlot(f.id);
    if (slot !== null && slot > ctx.juntaMemberSlots) return false;
  }
  if (step.id === BENEFICIARIOS_FINALES_STEP_ID) {
    const slot = bfFieldMemberSlot(f.id);
    if (slot !== null && slot > ctx.bfMemberSlots) return false;
    const bfSuffix = f.id.match(/^bf_\d+_(.+)$/)?.[1];
    if (
      bfSuffix === "fecha_nacimiento" ||
      bfSuffix === "nombre_completo" ||
      bfSuffix === "cedula_pasaporte"
    ) {
      const tipo = (values[`bf_${slot}_tipo_persona`] ?? "").trim();
      if (tipo !== "N") return false;
    }
    if (bfSuffix === "razon_social" || bfSuffix === "ruc") {
      const tipo = (values[`bf_${slot}_tipo_persona`] ?? "").trim();
      if (tipo !== "J") return false;
    }
  }
  if (f.id === "actividad_empresa_especifique") {
    return values.actividad_empresa === KYB_ACTIVITY_NOT_LISTED_VALUE;
  }
  if (f.id === "rep_actividad_economica_especifique") {
    return values.rep_actividad_economica === KYB_ACTIVITY_NOT_LISTED_VALUE;
  }
  if (f.id === "doc_identidad_otro") {
    return values.doc_identidad_tipo === "otro_id";
  }
  if (f.id === "persona_contacto_cargo_especifique") {
    return values.persona_contacto_cargo === "otro_cargo";
  }
  if (f.id === "static_perfil_ref" || f.id === "pp_metricas_servicios_ui") {
    return algunaSeleccionServicioPuntoPago(values);
  }
  if (f.id === "operaciones_frecuencia_otro") {
    return values.operaciones_frecuencia === "otro";
  }
  if (f.id === "volumen_operaciones_otros") {
    return values.volumen_operaciones_anual === "otros";
  }
  if (f.id === "ref_tipo_otro_descripcion") {
    return values.ref_tipo === "otro";
  }
  if (f.id === "doc_nac_nis_numero") {
    return (
      step.id === DOCUMENTACION_ENTREGAR_STEP_ID &&
      empresaOperaEnPanama(values) &&
      (values.doc_upl_factura_servicios ?? "").trim().length > 0
    );
  }
  if (step.id === PEP_STEP_ID) {
    const pepSlot = pepFieldMemberSlot(f.id);
    if (pepSlot !== null && pepSlot > ctx.pepMemberSlots) return false;
    if (pepSlot !== null) return values.pep_alguno_catalogado === "si";
  }
  return true;
}
