import type { FormState } from "@/lib/kyb-field-complete";
import { KYB_PDF_FORM_VERSION } from "@/lib/kyb-steps";
import type { KybStep } from "@/lib/kyb-steps";
import { isRenderableValueField } from "@/lib/kyb-steps";

/** Clave única por origen; si cambia la versión del PDF se invalidan borradores viejos. */
export const KYB_LOCAL_STORAGE_KEY = "kyb-pj-form-draft";

export type KybLocalDraft = {
  version: string;
  stepIndex: number;
  values: FormState;
  savedAt: number;
};

export function buildEmptyFormState(steps: KybStep[]): FormState {
  const s: FormState = {};
  for (const st of steps) {
    for (const f of st.fields) {
      if (!isRenderableValueField(f)) continue;
      s[f.id] = "";
    }
  }
  return s;
}

export function mergeDraftValues(base: FormState, saved: FormState): FormState {
  const out = { ...base };
  for (const k of Object.keys(out)) {
    if (k in saved && saved[k] !== undefined) {
      out[k] = saved[k] ?? "";
    }
  }
  return out;
}

/** Lee borrador válido y fusiona con los campos actuales del formulario (por si se añadieron ids nuevos). */
export function readDraft(steps: KybStep[]): KybLocalDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KYB_LOCAL_STORAGE_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as Partial<KybLocalDraft>;
    if (typeof d.savedAt !== "number" || typeof d.stepIndex !== "number" || !d.values) {
      return null;
    }
    if (d.version !== KYB_PDF_FORM_VERSION) {
      localStorage.removeItem(KYB_LOCAL_STORAGE_KEY);
      return null;
    }
    const base = buildEmptyFormState(steps);
    const merged = mergeDraftValues(base, d.values as FormState);
    const maxStep = Math.max(0, steps.length - 1);
    return {
      version: KYB_PDF_FORM_VERSION,
      stepIndex: Math.min(Math.max(0, d.stepIndex), maxStep),
      values: merged,
      savedAt: d.savedAt,
    };
  } catch {
    return null;
  }
}

export function saveDraft(payload: Pick<KybLocalDraft, "stepIndex" | "values">): void {
  if (typeof window === "undefined") return;
  try {
    const full: KybLocalDraft = {
      version: KYB_PDF_FORM_VERSION,
      stepIndex: payload.stepIndex,
      values: payload.values,
      savedAt: Date.now(),
    };
    localStorage.setItem(KYB_LOCAL_STORAGE_KEY, JSON.stringify(full));
  } catch {
    /* almacenamiento lleno o modo privado */
  }
}

export function clearDraft(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KYB_LOCAL_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function formatDraftSavedAt(savedAt: number): string {
  try {
    return new Intl.DateTimeFormat("es-PA", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(savedAt));
  } catch {
    return new Date(savedAt).toLocaleString("es-PA");
  }
}
