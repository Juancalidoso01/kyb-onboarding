import type { KybField } from "@/lib/kyb-steps";
import { isValidPanamaDate } from "@/lib/kyb-date";

export type FormState = Record<string, string>;

export function isFieldComplete(field: KybField, values: FormState): boolean {
  const v = values[field.id] ?? "";

  switch (field.type) {
    case "checkbox":
      return v === "true";
    case "select":
    case "yesno":
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
