import { KYB_ACTIVITY_NOT_LISTED_VALUE } from "@/lib/kyb-activity-extra-option";
import {
  expectPanamaPhoneForField,
  isValidEmailFormat,
  normalizePercentInput,
  PHONE_TEXT_FIELD_IDS,
  validatePhoneValue,
} from "@/lib/kyb-format-validation";
import {
  isValidQuantityCanonical,
  isValidUsdCanonical,
} from "@/lib/kyb-number-input-format";
import {
  type KybField,
  PP_SERVICIOS_CHECKBOX_IDS,
  PP_SV_METRICA_PAIRS,
} from "@/lib/kyb-steps";
import { PAIS_PANAMA } from "@/data/paises";
import { isValidPanamaDate } from "@/lib/kyb-date";
import { PEP_DETAIL_FIELD_IDS } from "@/lib/kyb-pep-content";

export type FormState = Record<string, string>;

function puntoPagoServiciosComplete(values: FormState): boolean {
  const any = PP_SERVICIOS_CHECKBOX_IDS.some((id) => values[id] === "true");
  if (!any) return false;
  if (values.pp_sv_otros === "true") {
    if ((values.pp_sv_otros_especifique ?? "").trim().length === 0)
      return false;
  }
  for (const row of PP_SV_METRICA_PAIRS) {
    if (values[row.serviceId] === "true") {
      const m = (values[row.montoId] ?? "").trim();
      const t = (values[row.txId] ?? "").trim();
      if (!m || m.endsWith(".")) return false;
      if (!isValidUsdCanonical(m)) return false;
      if (!t) return false;
      if (!isValidQuantityCanonical(t)) return false;
    }
  }
  return true;
}

export function isFieldComplete(field: KybField, values: FormState): boolean {
  const v = values[field.id] ?? "";

  if (field.type === "punto_pago_servicios_multi") {
    return puntoPagoServiciosComplete(values);
  }

  if (field.type === "punto_pago_metricas_por_servicio") {
    return puntoPagoServiciosComplete(values);
  }

  if ((PP_SERVICIOS_CHECKBOX_IDS as readonly string[]).includes(field.id)) {
    return puntoPagoServiciosComplete(values);
  }

  if (field.id === "pp_sv_otros_especifique") {
    if (values.pp_sv_otros !== "true") return true;
    return v.trim().length > 0;
  }

  if (field.id === "operaciones_frecuencia_otro") {
    if (values.operaciones_frecuencia !== "otro") return true;
    return v.trim().length > 0;
  }

  if (field.id === "volumen_operaciones_otros") {
    if (values.volumen_operaciones_anual !== "otros") return true;
    const c = v.trim();
    if (!c) return false;
    if (c.endsWith(".")) return false;
    return isValidUsdCanonical(c);
  }

  if (field.id === "ref_tipo_otro_descripcion") {
    if (values.ref_tipo !== "otro") return true;
    return v.trim().length > 0;
  }

  if ((PEP_DETAIL_FIELD_IDS as readonly string[]).includes(field.id)) {
    if (values.pep_alguno_catalogado !== "si") return true;
  }

  if (field.id === "doc_nac_nis_numero") {
    if ((values.pais_opera ?? "").trim() !== PAIS_PANAMA) return true;
    return v.trim().length > 0;
  }

  if (field.type === "documentacion_personas" || field.type === "file") {
    return true;
  }

  if (field.numberFormat === "usd") {
    const c = v.trim();
    if (!c) return false;
    if (c.endsWith(".")) return false;
    return isValidUsdCanonical(c);
  }
  if (field.numberFormat === "quantity") {
    const c = v.trim();
    if (!c) return false;
    return isValidQuantityCanonical(c);
  }

  const bfTipo = field.id.match(/^bf_(\d+)_tipo_persona$/);
  if (bfTipo) {
    return v === "N" || v === "J";
  }

  const bfNaturalOnly = field.id.match(
    /^bf_(\d+)_(fecha_nacimiento|nombre_completo|cedula_pasaporte)$/,
  );
  if (bfNaturalOnly) {
    const slot = bfNaturalOnly[1];
    const tipo = values[`bf_${slot}_tipo_persona`] ?? "";
    if (tipo !== "N") return true;
  }

  const bfJurOnly = field.id.match(/^bf_(\d+)_(razon_social|ruc)$/);
  if (bfJurOnly) {
    const slot = bfJurOnly[1];
    const tipo = values[`bf_${slot}_tipo_persona`] ?? "";
    if (tipo !== "J") return true;
  }

  if (field.id === "tipo_sociedad") {
    const ts = values.tipo_sociedad ?? "";
    if (!ts) return false;
    if (ts === "__otro__") {
      return (values.tipo_sociedad_otros_especifique ?? "").trim().length > 0;
    }
    return true;
  }

  if (field.id === "tipo_sociedad_otros_especifique") {
    if (values.tipo_sociedad !== "__otro__") return true;
    return v.trim().length > 0;
  }

  if (field.id === "actividad_empresa") {
    const a = values.actividad_empresa ?? "";
    if (!a) return false;
    if (a === KYB_ACTIVITY_NOT_LISTED_VALUE) {
      return (values.actividad_empresa_especifique ?? "").trim().length > 0;
    }
    return true;
  }

  if (field.id === "actividad_empresa_especifique") {
    if (values.actividad_empresa !== KYB_ACTIVITY_NOT_LISTED_VALUE) return true;
    return v.trim().length > 0;
  }

  if (field.id === "rep_actividad_economica") {
    const a = values.rep_actividad_economica ?? "";
    if (!a) return false;
    if (a === KYB_ACTIVITY_NOT_LISTED_VALUE) {
      return (values.rep_actividad_economica_especifique ?? "").trim().length > 0;
    }
    return true;
  }

  if (field.id === "rep_actividad_economica_especifique") {
    if (values.rep_actividad_economica !== KYB_ACTIVITY_NOT_LISTED_VALUE)
      return true;
    return v.trim().length > 0;
  }

  if (field.id === "doc_identidad_otro") {
    if (values.doc_identidad_tipo !== "otro_id") return true;
    return v.trim().length > 0;
  }

  if (field.id === "persona_contacto_cargo") {
    const c = values.persona_contacto_cargo ?? "";
    if (!c) return false;
    if (c === "otro_cargo") {
      return (values.persona_contacto_cargo_especifique ?? "").trim().length > 0;
    }
    return true;
  }

  if (field.id === "persona_contacto_cargo_especifique") {
    if (values.persona_contacto_cargo !== "otro_cargo") return true;
    return v.trim().length > 0;
  }

  if (field.hidden && field.id === "pais") {
    return (
      (values.pais ?? "").trim().length > 0 ||
      (values.pais_opera ?? "").trim().length > 0
    );
  }

  if (
    field.hidden &&
    (field.id === "ciudad" || field.id === "provincia")
  ) {
    return true;
  }

  if (PHONE_TEXT_FIELD_IDS.has(field.id)) {
    if (!v.trim()) return false;
    return validatePhoneValue(
      v,
      expectPanamaPhoneForField(field.id, values),
    );
  }

  switch (field.type) {
    case "checkbox":
      return v === "true";
    case "select":
    case "yesno":
    case "combobox":
    case "country":
    case "activity_search":
    case "profession_search":
      return v.trim().length > 0;
    case "date":
      return isValidPanamaDate(v);
    case "percent": {
      const raw = v.trim();
      if (raw === "") return true;
      const norm = normalizePercentInput(raw);
      if (norm === "") return false;
      const n = parseInt(norm, 10);
      return n >= 0 && n <= 100;
    }
    case "email":
      return v.trim().length > 0 && isValidEmailFormat(v);
    case "tel":
      if (!v.trim()) return false;
      return validatePhoneValue(
        v,
        expectPanamaPhoneForField(field.id, values),
      );
    case "text":
    case "textarea":
      return v.trim().length > 0;
    default:
      return false;
  }
}
