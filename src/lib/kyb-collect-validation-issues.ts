import type { FormState } from "@/lib/kyb-field-complete";
import { isFieldComplete } from "@/lib/kyb-field-complete";
import { displayLabelForSummaryField } from "@/lib/kyb-form-summary-format";
import { getFormatErrorForField } from "@/lib/kyb-format-validation";
import type { KybDocCompletenessContext } from "@/lib/kyb-documentacion";
import {
  formatMaxMb,
  KYB_MAX_TOTAL_ATTACHMENT_BYTES,
} from "@/lib/kyb-attachment-limits";
import type { KybFieldVisibilityContext } from "@/lib/kyb-step-field-visibility";
import { isKybStepFieldVisible } from "@/lib/kyb-step-field-visibility";
import type { KybStep } from "@/lib/kyb-steps";

/**
 * Recorre los pasos visibles y devuelve mensajes legibles para el usuario.
 * Incluye comprobación de tamaño total de adjuntos en memoria (`attachmentFiles`).
 */
export function collectKybValidationIssues(
  steps: KybStep[],
  values: FormState,
  visibilityCtx: KybFieldVisibilityContext,
  docCtx: KybDocCompletenessContext,
  attachmentFiles: Record<string, File | undefined>,
  maxTotalAttachmentBytes: number = KYB_MAX_TOTAL_ATTACHMENT_BYTES,
): string[] {
  const issues: string[] = [];

  let totalBytes = 0;
  for (const file of Object.values(attachmentFiles)) {
    if (file) totalBytes += file.size;
  }
  if (totalBytes > maxTotalAttachmentBytes) {
    issues.push(
      `Adjuntos: el total es de ${formatMaxMb(totalBytes)} MB y supera el máximo permitido (${formatMaxMb(maxTotalAttachmentBytes)} MB). Reduzca el número de archivos o comprima los PDF.`,
    );
  }

  for (const step of steps) {
    for (const f of step.fields) {
      if (f.hidden) continue;
      if (!isKybStepFieldVisible(step, f, values, visibilityCtx)) continue;
      if (f.type === "heading" || f.type === "static") continue;
      if (f.type === "representante_cierre_flow") continue;

      const label = displayLabelForSummaryField(f, values, step.id);
      const fmt = getFormatErrorForField(f, values);
      if (fmt) {
        issues.push(`${step.title}: ${label} — ${fmt}`);
        continue;
      }
      if (!isFieldComplete(f, values, docCtx)) {
        issues.push(
          `${step.title}: ${label} — falta completar o el valor no es válido.`,
        );
      }
    }
  }

  return issues;
}
