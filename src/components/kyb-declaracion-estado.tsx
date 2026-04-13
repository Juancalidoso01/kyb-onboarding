"use client";

import type { FormState } from "@/lib/kyb-field-complete";

export function KybDeclaracionWitness({ values }: { values: FormState }) {
  const vid = (values.decl_metamap_verification_id ?? "").trim();
  const sig = (values.decl_firma_canvas_data_url ?? "").trim();
  if (!vid || !sig) return null;
  return (
    <div className="rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/95 to-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-emerald-900">
        Listo: KYC MetaMap y firma digital registrados
      </p>
      <p className="mt-2 text-sm text-emerald-900/85">
        Los datos quedaron listos para revisión. Si falta, complete el nombre y la
        fecha del firmante abajo; el PDF se descargará automáticamente al cumplir
        todos los requisitos.
      </p>
    </div>
  );
}

export function KybDeclaracionFinalSuccess({ open }: { open: boolean }) {
  if (!open) return null;
  return (
    <div
      className="rounded-2xl border border-[#4749B6]/25 bg-[#4749B6]/[0.08] p-6 text-center shadow-sm"
      role="status"
      aria-live="polite"
    >
      <p className="text-lg font-bold text-[#0B0B13]">
        Formulario completado satisfactoriamente
      </p>
      <p className="mt-2 text-sm text-slate-700">
        Se generó y descargó el PDF con el resumen y la firma. Conserve el archivo
        y coordine el envío con su asesor de Punto Pago.
      </p>
    </div>
  );
}
