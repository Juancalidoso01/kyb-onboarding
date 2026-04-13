import { KYB_ACTIVITY_NOT_LISTED_VALUE } from "@/lib/kyb-activity-extra-option";
import {
  expectPanamaPhoneForField,
  isValidEmailFormat,
  normalizePercentInput,
  PHONE_TEXT_FIELD_IDS,
  validatePhoneValue,
} from "@/lib/kyb-format-validation";
import type { KybField } from "@/lib/kyb-steps";
import { isValidPanamaDate } from "@/lib/kyb-date";

export type FormState = Record<string, string>;

export function isFieldComplete(field: KybField, values: FormState): boolean {
  const v = values[field.id] ?? "";

  const juntaTipo = field.id.match(/^junta_(\d+)_tipo_persona$/);
  if (juntaTipo) {
    return v === "N" || v === "J";
  }

  const juntaNaturalOnly = field.id.match(
    /^junta_(\d+)_(fecha_nacimiento|nombre_completo|cedula_pasaporte)$/,
  );
  if (juntaNaturalOnly) {
    const slot = juntaNaturalOnly[1];
    const tipo = values[`junta_${slot}_tipo_persona`] ?? "";
    if (tipo !== "N") return true;
  }

  const juntaJurOnly = field.id.match(/^junta_(\d+)_(razon_social|ruc)$/);
  if (juntaJurOnly) {
    const slot = juntaJurOnly[1];
    const tipo = values[`junta_${slot}_tipo_persona`] ?? "";
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
