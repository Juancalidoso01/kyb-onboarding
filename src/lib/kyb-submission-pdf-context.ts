import type { KybFieldVisibilityContext } from "@/lib/kyb-step-field-visibility";
import type { FormState } from "@/lib/kyb-field-complete";
import {
  DECLARACION_STEP_ID,
  filterStepsByCotizaBolsa,
  KYB_STEPS,
  REPRESENTANTE_CIERRE_STEP_ID,
  type KybStep,
} from "@/lib/kyb-steps";

export type SubmissionSlotCounts = {
  juntaMemberSlots: number;
  bfMemberSlots: number;
  pepMemberSlots: number;
};

/** Misma lógica que el asistente (visibleSteps + exclusión declaración/cierre). */
export function buildSummaryContextForPdf(
  values: FormState,
  slots: SubmissionSlotCounts,
): { summarySteps: KybStep[]; visibility: KybFieldVisibilityContext } {
  const visibleSteps = filterStepsByCotizaBolsa(
    KYB_STEPS,
    values.cotiza_bolsa ?? "",
  );
  const summarySteps = visibleSteps.filter(
    (s) =>
      s.id !== DECLARACION_STEP_ID && s.id !== REPRESENTANTE_CIERRE_STEP_ID,
  );
  const visibility: KybFieldVisibilityContext = {
    juntaMemberSlots: Math.max(1, Math.floor(slots.juntaMemberSlots)),
    bfMemberSlots: Math.max(1, Math.floor(slots.bfMemberSlots)),
    pepMemberSlots: Math.max(1, Math.floor(slots.pepMemberSlots)),
  };
  return { summarySteps, visibility };
}
