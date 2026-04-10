"use client";

import { useMemo, useState } from "react";
import type { KybField, KybStep } from "@/lib/kyb-steps";
import { isRenderableValueField, KYB_STEPS } from "@/lib/kyb-steps";

type FormState = Record<string, string>;

const initialState = (): FormState => {
  const s: FormState = {};
  for (const step of KYB_STEPS) {
    for (const f of step.fields) {
      if (!isRenderableValueField(f)) continue;
      s[f.id] = "";
    }
  }
  return s;
};

export function OnboardingWizard({ steps = KYB_STEPS }: { steps?: KybStep[] }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState<FormState>(initialState);
  const [apiStatus, setApiStatus] = useState<string | null>(null);

  const step = steps[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === steps.length - 1;

  const progress = useMemo(
    () => Math.round(((stepIndex + 1) / steps.length) * 100),
    [stepIndex, steps.length],
  );

  const setField = (id: string, v: string) => {
    setValues((prev) => ({ ...prev, [id]: v }));
  };

  const toggleCheckbox = (id: string) => {
    setValues((prev) => ({
      ...prev,
      [id]: prev[id] === "true" ? "" : "true",
    }));
  };

  const pingApi = async () => {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
    try {
      const r = await fetch(`${base}/health`);
      const j = await r.json();
      setApiStatus(`API: ${j.status ?? "ok"}`);
    } catch {
      setApiStatus("API no disponible (¿iniciaste uvicorn en :8000?)");
    }
  };

  const submitDraft = async () => {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
    try {
      const r = await fetch(`${base}/api/v1/onboarding/draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const j = await r.json();
      setApiStatus(`Borrador enviado: ${JSON.stringify(j)}`);
    } catch (e) {
      setApiStatus(`Error al enviar: ${String(e)}`);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#4749B6] focus:ring-2 focus:ring-[#4749B6]/20";

  const renderField = (field: KybField) => {
    if (field.type === "heading") {
      return (
        <div key={field.id} className="pt-2">
          <h3 className="border-b border-[#4749B6]/15 pb-2 text-sm font-semibold tracking-tight text-[#0B0B13]">
            {field.label}
          </h3>
        </div>
      );
    }

    if (field.type === "static") {
      return (
        <div
          key={field.id}
          className="rounded-xl border border-slate-200/90 border-l-[3px] border-l-[#4749B6] bg-white/90 p-4 text-xs leading-relaxed text-slate-700 shadow-sm"
        >
          {field.hint ? <p className="whitespace-pre-wrap">{field.hint}</p> : null}
        </div>
      );
    }

    if (field.type === "checkbox") {
      return (
        <label
          key={field.id}
          className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200/90 bg-white px-3.5 py-3 shadow-sm transition hover:border-[#4749B6]/25 hover:shadow-md"
        >
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#4749B6] focus:ring-[#4749B6]"
            checked={values[field.id] === "true"}
            onChange={() => toggleCheckbox(field.id)}
          />
          <span className="text-sm font-medium text-slate-800">{field.label}</span>
        </label>
      );
    }

    return (
      <label key={field.id} className="block">
        <span
          className={`mb-1.5 block font-medium text-[#0B0B13] ${
            field.type === "yesno" && field.label.length > 160
              ? "text-xs leading-snug sm:text-sm"
              : "text-sm"
          }`}
        >
          {field.label}
        </span>
        {field.type === "textarea" ? (
          <textarea
            className={`${inputClass} min-h-[96px]`}
            rows={3}
            placeholder={field.placeholder}
            value={values[field.id] ?? ""}
            onChange={(e) => setField(field.id, e.target.value)}
          />
        ) : field.type === "select" ? (
          <select
            className={inputClass}
            value={values[field.id] ?? ""}
            onChange={(e) => setField(field.id, e.target.value)}
          >
            {(field.options ?? []).map((o) => (
              <option key={o.value || "empty"} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ) : field.type === "yesno" ? (
          <select
            className={inputClass}
            value={values[field.id] ?? ""}
            onChange={(e) => setField(field.id, e.target.value)}
          >
            <option value="">Seleccionar…</option>
            <option value="si">Sí</option>
            <option value="no">No</option>
          </select>
        ) : (
          <input
            type={field.type === "email" ? "email" : field.type === "tel" ? "tel" : "text"}
            className={inputClass}
            placeholder={field.placeholder}
            value={values[field.id] ?? ""}
            onChange={(e) => setField(field.id, e.target.value)}
          />
        )}
        {field.hint ? (
          <span className="mt-1.5 block text-xs text-slate-500">{field.hint}</span>
        ) : null}
      </label>
    );
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_4px_24px_-4px_rgba(15,23,42,0.08),0_0_0_1px_rgba(15,23,42,0.04)]">
        <div className="border-b border-slate-100 bg-gradient-to-br from-[#4749B6]/[0.07] via-white to-white px-5 py-6 sm:px-8 sm:py-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#4749B6]">
            Punto Pago Panamá
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#0B0B13] sm:text-[1.75rem] sm:leading-tight">
            Formulario KYB
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
            Debida diligencia · Persona jurídica. Alineado al PDF oficial V002-2026.
            Cada paso indica la página del impreso. Si un dato no aplica, use{" "}
            <span className="font-semibold text-slate-800">N/A</span>.
          </p>
          <div className="mt-5">
            <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
              <span>Progreso</span>
              <span className="tabular-nums font-semibold text-[#4749B6]">
                {progress}%
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200/90">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#4749B6] to-[#3B3DA6] transition-[width] duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Paso <span className="font-medium text-slate-700">{stepIndex + 1}</span>{" "}
              de <span className="font-medium text-slate-700">{steps.length}</span>
            </p>
          </div>
        </div>

        <section className="px-5 py-6 sm:px-8 sm:py-8">
          {step.pdfPage ? (
            <p className="mb-3 inline-flex items-center rounded-lg bg-[#4749B6]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#3B3DA6]">
              {step.pdfPage}
            </p>
          ) : null}
          <h2 className="text-base font-bold leading-snug text-[#0B0B13] sm:text-lg">
            {step.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {step.description}
          </p>

          <div className="mt-7 space-y-4">{step.fields.map(renderField)}</div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-8">
            <button
              type="button"
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={isFirst}
              onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
            >
              Anterior
            </button>
            <div className="flex flex-wrap gap-2">
              {!isLast ? (
                <button
                  type="button"
                  className="rounded-xl bg-gradient-to-b from-[#4749B6] to-[#3B3DA6] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#4749B6]/25 transition hover:brightness-105 active:brightness-95"
                  onClick={() =>
                    setStepIndex((i) => Math.min(steps.length - 1, i + 1))
                  }
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="button"
                  className="rounded-xl bg-gradient-to-b from-[#4749B6] to-[#3B3DA6] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#4749B6]/25 transition hover:brightness-105 active:brightness-95"
                  onClick={submitDraft}
                >
                  Enviar borrador
                </button>
              )}
            </div>
          </div>
        </section>
      </div>

      <p className="mt-6 text-center text-xs text-slate-500">
        <button
          type="button"
          className="font-medium text-[#4749B6] underline-offset-2 hover:underline"
          onClick={pingApi}
        >
          Probar conexión con API
        </button>
        {apiStatus ? (
          <span className="ml-2 text-slate-600">{apiStatus}</span>
        ) : null}
      </p>
    </div>
  );
}
