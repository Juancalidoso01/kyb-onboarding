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
