import { PAIS_OPTIONS } from "@/data/paises";
import type { FormState } from "@/lib/kyb-field-complete";
import {
  getReferenciasFieldLabel,
  REFERENCIAS_STEP_ID,
} from "@/lib/kyb-referencias-labels";
import type { KybField } from "@/lib/kyb-steps";

const MAX_LEN = 600;

function countryLabel(value: string): string {
  const v = value.trim();
  if (!v) return "—";
  const found = PAIS_OPTIONS.find((o) => o.value === v || o.label === v);
  return found ? found.label : v;
}

export function formatKybValueForSummary(field: KybField, values: FormState): string {
  const raw = values[field.id] ?? "";
  if (field.type === "file") {
    const n = raw.trim();
    return n ? `Archivo: ${n}` : "—";
  }
  if (field.type === "checkbox") {
    if (field.fileAttachmentId) {
      const upl = (values[field.fileAttachmentId] ?? "").trim();
      const chk = raw === "true";
      if (!chk && !upl) return "—";
      if (upl) return `Archivo: ${upl}`;
      return chk ? "Marcado (sin archivo)" : "—";
    }
    return raw === "true" ? "Sí" : "—";
  }
  if (field.type === "yesno") {
    const t = raw.trim();
    if (t === "si") return "Sí";
    if (t === "no") return "No";
    return "—";
  }
  if (field.type === "percent") {
    const t = raw.trim();
    return t ? `${t}%` : "—";
  }
  if (field.type === "select" || field.type === "combobox") {
    const t = raw.trim();
    if (!t) return "—";
    const opt = field.options?.find((o) => o.value === t);
    return opt?.label ?? t;
  }
  if (field.type === "country") {
    return countryLabel(raw);
  }
  if (field.type === "date") {
    const t = raw.trim();
    return t || "—";
  }
  if (field.type === "email" || field.type === "tel" || field.type === "text") {
    const t = raw.trim();
    if (!t) return "—";
    return t.length > MAX_LEN ? `${t.slice(0, MAX_LEN)}…` : t;
  }
  if (field.type === "textarea") {
    const t = raw.trim();
    if (!t) return "—";
    return t.length > MAX_LEN ? `${t.slice(0, MAX_LEN)}…` : t;
  }
  if (field.type === "activity_search" || field.type === "profession_search") {
    const t = raw.trim();
    return t || "—";
  }
  if (field.type === "punto_pago_servicios_multi" || field.type === "punto_pago_metricas_por_servicio") {
    return "—";
  }
  const t = raw.trim();
  if (!t) return "—";
  return t.length > MAX_LEN ? `${t.slice(0, MAX_LEN)}…` : t;
}

export function displayLabelForSummaryField(
  field: KybField,
  values: FormState,
  stepId: string,
): string {
  if (stepId === REFERENCIAS_STEP_ID) {
    const dyn = getReferenciasFieldLabel(field.id, values.ref_tipo ?? "");
    if (dyn) return dyn;
  }
  return field.label || field.id;
}
