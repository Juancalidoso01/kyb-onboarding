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
    "w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

  const renderField = (field: KybField) => {
    if (field.type === "heading") {
      return (
        <div key={field.id} className="pt-2">
          <h3 className="border-b border-slate-200 pb-1 text-sm font-semibold text-slate-800">
            {field.label}
          </h3>
        </div>
      );
    }

    if (field.type === "static") {
      return (
        <div
          key={field.id}
          className="rounded-xl border border-slate-200 bg-slate-50/90 p-3 text-xs leading-relaxed text-slate-800"
        >
          {field.hint ? <p className="whitespace-pre-wrap">{field.hint}</p> : null}
        </div>
      );
    }

    if (field.type === "checkbox") {
      return (
        <label
          key={field.id}
          className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5"
        >
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
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
            className={`mb-1 block font-medium text-slate-700 ${
              field.type === "yesno" && field.label.length > 160
                ? "text-xs leading-snug sm:text-sm"
                : "text-sm"
            }`}
          >
            {field.label}
          </span>
        {field.type === "textarea" ? (
          <textarea
            className={`${inputClass} min-h-[88px]`}
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
          <span className="mt-1 block text-xs text-slate-500">{field.hint}</span>
        ) : null}
      </label>
    );
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-8">
        <p className="text-sm font-medium text-slate-500">
          Perfil del cliente PJ · Punto Pago Panamá
        </p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
          Formulario KYB — debida diligencia (PJ)
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Misma estructura y redacción que el PDF oficial V002-2026. Cada paso indica
          la página del impreso. Si un dato no aplica, use N/A.
        </p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-emerald-600 transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Paso {stepIndex + 1} de {steps.length}
        </p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {step.pdfPage ? (
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-slate-500">
            {step.pdfPage}
          </p>
        ) : null}
        <h2 className="text-base font-semibold leading-snug text-slate-900 sm:text-lg">
          {step.title}
        </h2>
        <p className="mt-2 text-sm text-slate-600">{step.description}</p>

        <div className="mt-6 space-y-4">{step.fields.map(renderField)}</div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-6">
          <button
            type="button"
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            disabled={isFirst}
            onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
          >
            Anterior
          </button>
          <div className="flex flex-wrap gap-2">
            {!isLast ? (
              <button
                type="button"
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                onClick={() =>
                  setStepIndex((i) => Math.min(steps.length - 1, i + 1))
                }
              >
                Siguiente
              </button>
            ) : (
              <button
                type="button"
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                onClick={submitDraft}
              >
                Enviar borrador
              </button>
            )}
          </div>
        </div>
      </section>

      <footer className="mt-8 space-y-2 text-xs text-slate-500">
        <p>
          <button
            type="button"
            className="text-emerald-700 underline"
            onClick={pingApi}
          >
            Probar conexión con API Python
          </button>
          {apiStatus ? <span className="ml-2">{apiStatus}</span> : null}
        </p>
      </footer>
    </div>
  );
}
