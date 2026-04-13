"use client";

import { KYB_FIELD_HINT_CLASS } from "@/lib/kyb-prose-classes";
import { allDocumentacionUploadKeys } from "@/lib/kyb-documentacion";
import {
  displayLabelForSummaryField,
  formatKybValueForSummary,
} from "@/lib/kyb-form-summary-format";
import type { FormState } from "@/lib/kyb-field-complete";
import type { KybFieldVisibilityContext } from "@/lib/kyb-step-field-visibility";
import { isKybStepFieldVisible } from "@/lib/kyb-step-field-visibility";
import {
  isRenderableValueField,
  type KybField,
  type KybStep,
  PP_SERVICIOS_MULTI_OPTIONS,
  PP_SV_METRICA_PAIRS,
} from "@/lib/kyb-steps";

type Props = {
  steps: KybStep[];
  values: FormState;
  visibility: KybFieldVisibilityContext;
};

function includeFieldInSummaryTable(f: KybField): boolean {
  if (f.hidden) return false;
  if (f.type === "static" || f.type === "heading") return false;
  if (f.type === "declaracion_resumen" || f.type === "representante_cierre_flow")
    return false;
  if (
    f.type === "punto_pago_servicios_multi" ||
    f.type === "punto_pago_metricas_por_servicio" ||
    f.type === "documentacion_personas"
  ) {
    return false;
  }
  return true;
}

export function KybDeclaracionResumen({ steps, values, visibility }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-[#0B0B13]">
          Resumen del formulario diligenciado
        </h3>
        <p className={KYB_FIELD_HINT_CLASS}>
          Revise los datos antes de la declaración. Sirve como guía de lo
          registrado en este navegador (borrador local).
        </p>
      </div>
      {steps.map((st) => (
        <section
          key={st.id}
          className="rounded-xl border border-slate-200/90 bg-white/95 p-4 shadow-sm"
        >
          <h4 className="border-b border-slate-100 pb-2 text-xs font-bold uppercase tracking-wide text-slate-600">
            {st.title}
          </h4>
          <dl className="mt-3 space-y-2.5 text-sm">
            {st.fields
              .filter((f) => includeFieldInSummaryTable(f))
              .filter((f) => isKybStepFieldVisible(st, f, values, visibility))
              .filter((f) => isRenderableValueField(f))
              .map((f) => (
                <div
                  key={`${st.id}-${f.id}`}
                  className="grid gap-1 border-b border-slate-50 pb-2 last:border-0 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] sm:gap-3"
                >
                  <dt className="font-medium text-slate-600">
                    {displayLabelForSummaryField(f, values, st.id)}
                  </dt>
                  <dd className="min-w-0 break-words text-slate-900">
                    {formatKybValueForSummary(f, values)}
                  </dd>
                </div>
              ))}
            {st.id === "servicios_punto_pago" ? (
              <PuntoPagoResumenExtra values={values} />
            ) : null}
            {st.id === "documentacion_entregar" ? (
              <DocumentacionArchivosExtra values={values} />
            ) : null}
          </dl>
        </section>
      ))}
    </div>
  );
}

function PuntoPagoResumenExtra({ values }: { values: FormState }) {
  const selected = PP_SERVICIOS_MULTI_OPTIONS.filter(
    (o) => values[o.id] === "true",
  );
  if (selected.length === 0) return null;
  return (
    <>
      <div className="grid gap-1 border-b border-slate-50 pb-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] sm:gap-3">
        <dt className="font-medium text-slate-600">Servicios Punto Pago elegidos</dt>
        <dd className="text-slate-900">
          {selected.map((o) => o.label).join(" · ")}
        </dd>
      </div>
      <MetricasPpResumen values={values} />
    </>
  );
}

function MetricasPpResumen({ values }: { values: FormState }) {
  const rows: { label: string; text: string }[] = [];
  for (const row of PP_SV_METRICA_PAIRS) {
    if (values[row.serviceId] !== "true") continue;
    const opt = PP_SERVICIOS_MULTI_OPTIONS.find((o) => o.id === row.serviceId);
    const m = (values[row.montoId] ?? "").trim();
    const t = (values[row.txId] ?? "").trim();
    if (!m && !t) continue;
    rows.push({
      label: opt?.label ?? row.serviceId,
      text: `USD/mes: ${m || "—"} · Transacciones/mes: ${t || "—"}`,
    });
  }
  if (rows.length === 0) return null;
  return (
    <>
      {rows.map((r) => (
        <div
          key={r.label}
          className="grid gap-1 border-b border-slate-50 pb-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] sm:gap-3"
        >
          <dt className="font-medium text-slate-600">{r.label} — métricas</dt>
          <dd className="text-slate-900">{r.text}</dd>
        </div>
      ))}
    </>
  );
}

function DocumentacionArchivosExtra({ values }: { values: FormState }) {
  const keys = allDocumentacionUploadKeys().filter((k) =>
    (values[k] ?? "").trim(),
  );
  if (keys.length === 0) return null;
  return (
    <div className="grid gap-1 border-b border-slate-50 pb-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] sm:gap-3">
      <dt className="font-medium text-slate-600">Nombres de archivo cargados</dt>
      <dd className="text-slate-900">
        <ul className="list-inside list-disc space-y-0.5">
          {keys.map((k) => (
            <li key={k}>
              <span className="font-mono text-xs text-slate-600">{k}: </span>
              {values[k]}
            </li>
          ))}
        </ul>
      </dd>
    </div>
  );
}
