import type { FormState } from "@/lib/kyb-field-complete";
import { allDocumentacionUploadKeys } from "@/lib/kyb-documentacion";
import {
  PEP_MEMBER_FIELD_SUFFIXES,
  PEP_MEMBER_SLOTS_MAX,
} from "@/lib/kyb-pep-content";
import {
  allPuntoPagoMetricFieldKeys,
  BF_MEMBER_SLOTS_MAX,
  JUNTA_MEMBER_SLOTS_MAX,
  KYB_PDF_FORM_VERSION,
  PP_SERVICIOS_CHECKBOX_IDS,
} from "@/lib/kyb-steps";
import type { KybStep } from "@/lib/kyb-steps";
import { isRenderableValueField } from "@/lib/kyb-steps";

/** Clave única por origen; si cambia la versión del PDF se invalidan borradores viejos. */
export const KYB_LOCAL_STORAGE_KEY = "kyb-pj-form-draft";

export type KybLocalDraft = {
  version: string;
  stepIndex: number;
  values: FormState;
  savedAt: number;
  /** Cuántas filas de junta/consejo estaban visibles (1–5). */
  juntaMemberSlots?: number;
  /** Cuántas filas de beneficiario final estaban visibles (1–20). */
  bfMemberSlots?: number;
  /** Cuántas personas PEP estaban visibles (1–5). */
  pepMemberSlots?: number;
};

function notifyDraftStorageListeners(): void {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new CustomEvent("kyb-draft-saved"));
  } catch {
    /* ignore */
  }
}

/**
 * Enlace "Firma del director" solo si hay datos del flujo móvil (MetaMap / firma)
 * en el borrador local y el formulario aún no tiene referencia de envío.
 */
export function shouldShowFirmaDirectorNav(draft: KybLocalDraft | null): boolean {
  if (!draft?.values) return false;
  const v = draft.values;
  if ((v.decl_formulario_ref ?? "").trim()) return false;
  const hasFirma = (v.decl_firma_canvas_data_url ?? "").trim().length > 0;
  const hasMetamap =
    (v.decl_metamap_verification_id ?? "").trim().length > 0 ||
    (v.decl_metamap_identity_id ?? "").trim().length > 0;
  return hasFirma || hasMetamap;
}

export function buildEmptyFormState(steps: KybStep[]): FormState {
  const s: FormState = {};
  for (const st of steps) {
    for (const f of st.fields) {
      if (!isRenderableValueField(f)) continue;
      s[f.id] = "";
    }
  }
  for (const k of allDocumentacionUploadKeys()) {
    if (!(k in s)) s[k] = "";
  }
  for (const id of PP_SERVICIOS_CHECKBOX_IDS) {
    if (!(id in s)) s[id] = "";
  }
  for (const k of allPuntoPagoMetricFieldKeys()) {
    if (!(k in s)) s[k] = "";
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
      notifyDraftStorageListeners();
      return null;
    }
    const base = buildEmptyFormState(steps);
    const merged = mergeDraftValues(base, d.values as FormState);
    for (const s of PEP_MEMBER_FIELD_SUFFIXES) {
      const legacy = `pep_${s}`;
      const slot1 = `pep_1_${s}`;
      if (
        (merged[legacy] ?? "").trim() &&
        !(merged[slot1] ?? "").trim()
      ) {
        merged[slot1] = merged[legacy];
      }
    }
    if (
      (merged.decl_nombre_cliente ?? "").trim() &&
      !(merged.decl_director_nombre ?? "").trim()
    ) {
      merged.decl_director_nombre = merged.decl_nombre_cliente;
    }
    const maxStep = Math.max(0, steps.length - 1);
    const juntaMemberSlots =
      typeof d.juntaMemberSlots === "number" &&
      d.juntaMemberSlots >= 1 &&
      d.juntaMemberSlots <= JUNTA_MEMBER_SLOTS_MAX
        ? d.juntaMemberSlots
        : 1;
    const bfMemberSlots =
      typeof d.bfMemberSlots === "number" &&
      d.bfMemberSlots >= 1 &&
      d.bfMemberSlots <= BF_MEMBER_SLOTS_MAX
        ? d.bfMemberSlots
        : 1;
    const pepMemberSlots =
      typeof d.pepMemberSlots === "number" &&
      d.pepMemberSlots >= 1 &&
      d.pepMemberSlots <= PEP_MEMBER_SLOTS_MAX
        ? d.pepMemberSlots
        : 1;
    return {
      version: KYB_PDF_FORM_VERSION,
      stepIndex: Math.min(Math.max(0, d.stepIndex), maxStep),
      values: merged,
      savedAt: d.savedAt,
      juntaMemberSlots,
      bfMemberSlots,
      pepMemberSlots,
    };
  } catch {
    return null;
  }
}

export function saveDraft(
  payload: Pick<KybLocalDraft, "stepIndex" | "values"> & {
    juntaMemberSlots?: number;
    bfMemberSlots?: number;
    pepMemberSlots?: number;
  },
): void {
  if (typeof window === "undefined") return;
  try {
    const full: KybLocalDraft = {
      version: KYB_PDF_FORM_VERSION,
      stepIndex: payload.stepIndex,
      values: payload.values,
      savedAt: Date.now(),
      ...(typeof payload.juntaMemberSlots === "number" &&
      payload.juntaMemberSlots >= 1 &&
      payload.juntaMemberSlots <= JUNTA_MEMBER_SLOTS_MAX
        ? { juntaMemberSlots: payload.juntaMemberSlots }
        : {}),
      ...(typeof payload.bfMemberSlots === "number" &&
      payload.bfMemberSlots >= 1 &&
      payload.bfMemberSlots <= BF_MEMBER_SLOTS_MAX
        ? { bfMemberSlots: payload.bfMemberSlots }
        : {}),
      ...(typeof payload.pepMemberSlots === "number" &&
      payload.pepMemberSlots >= 1 &&
      payload.pepMemberSlots <= PEP_MEMBER_SLOTS_MAX
        ? { pepMemberSlots: payload.pepMemberSlots }
        : {}),
    };
    localStorage.setItem(KYB_LOCAL_STORAGE_KEY, JSON.stringify(full));
    notifyDraftStorageListeners();
  } catch {
    /* almacenamiento lleno o modo privado */
  }
}

export function clearDraft(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KYB_LOCAL_STORAGE_KEY);
    notifyDraftStorageListeners();
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
