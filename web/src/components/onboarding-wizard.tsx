"use client";

import { useMemo, useState } from "react";
import type { KybStep } from "@/lib/kyb-steps";
import { KYB_STEPS } from "@/lib/kyb-steps";

type FormState = Record<string, string>;

const initialState = (): FormState => {
  const s: FormState = {};
  for (const step of KYB_STEPS) {
    for (const f of step.fields) {
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

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <header className="mb-8">
        <p className="text-sm font-medium text-slate-500">Onboarding KYB</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
          Alta de cliente
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Flujo por pasos. Sustituye los bloques por los campos reales de tu PDF
          (ver <code className="rounded bg-slate-100 px-1 text-xs">docs/MAPEO_PDF.md</code> en la raíz del repo
          ).
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
        <h2 className="text-lg font-semibold text-slate-900">{step.title}</h2>
        <p className="mt-1 text-sm text-slate-600">{step.description}</p>

        <div className="mt-6 space-y-4">
          {step.fields.map((field) => (
            <label key={field.id} className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">
                {field.label}
              </span>
              {field.type === "textarea" ? (
                <textarea
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-500/0 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  rows={3}
                  placeholder={field.placeholder}
                  value={values[field.id] ?? ""}
                  onChange={(e) => setField(field.id, e.target.value)}
                />
              ) : field.type === "select" ? (
                <select
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  value={values[field.id] ?? ""}
                  onChange={(e) => setField(field.id, e.target.value)}
                >
                  {(field.options ?? []).map((o) => (
                    <option key={o.value || "empty"} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  placeholder={field.placeholder}
                  value={values[field.id] ?? ""}
                  onChange={(e) => setField(field.id, e.target.value)}
                />
              )}
            </label>
          ))}
        </div>

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
