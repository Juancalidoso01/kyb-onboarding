"use client";

import { KYB_FIELD_HINT_CLASS } from "@/lib/kyb-prose-classes";
import { buildAndDownloadKybPdf } from "@/lib/kyb-export-pdf";
import type { FormState } from "@/lib/kyb-field-complete";
import type { KybFieldVisibilityContext } from "@/lib/kyb-step-field-visibility";
import type { KybStep } from "@/lib/kyb-steps";

type Props = {
  values: FormState;
  summarySteps: KybStep[];
  visibility: KybFieldVisibilityContext;
  canDownload: boolean;
};

export function KybExportPdfPanel({
  values,
  summarySteps,
  visibility,
  canDownload,
}: Props) {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-sm sm:p-5">
      <div>
        <h3 className="text-sm font-semibold text-[#0B0B13]">
          Exportar PDF
        </h3>
        <p className={KYB_FIELD_HINT_CLASS}>
          Disponible cuando haya completado verificación MetaMap, firma digital, nombre del firmante y fecha de la declaración. El archivo incluye el resumen del borrador y la firma.
        </p>
      </div>
      <button
        type="button"
        disabled={!canDownload}
        className="inline-flex w-full min-h-[48px] items-center justify-center rounded-2xl bg-gradient-to-r from-[#4749B6] to-[#3B3DA6] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#4749B6]/30 disabled:cursor-not-allowed disabled:opacity-40"
        onClick={() => buildAndDownloadKybPdf(values, summarySteps, visibility)}
      >
        Descargar PDF
      </button>
    </div>
  );
}
