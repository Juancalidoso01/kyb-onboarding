import { KYB_ACTIVITY_NOT_LISTED_VALUE } from "@/lib/kyb-activity-extra-option";
import type { KybField } from "@/lib/kyb-steps";
import { isValidPanamaDate } from "@/lib/kyb-date";

export type FormState = Record<string, string>;

export function isFieldComplete(field: KybField, values: FormState): boolean {
  const v = values[field.id] ?? "";

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
    case "email":
    case "tel":
    case "text":
    case "textarea":
      return v.trim().length > 0;
    default:
      return false;
  }
}
