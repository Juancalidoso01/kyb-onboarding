"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { KeyboardEvent, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { KybCombobox } from "@/components/kyb-combobox";
import { KybDateField } from "@/components/kyb-date-field";
import { KybLanding } from "@/components/kyb-landing";
import { PAIS_OPTIONS } from "@/data/paises";
import {
  useActivityOptions,
  useProfessionOptions,
} from "@/hooks/use-kyb-sheet-options";
import type { FormState } from "@/lib/kyb-field-complete";
import { isFieldComplete } from "@/lib/kyb-field-complete";
import type { KybField, KybStep } from "@/lib/kyb-steps";
import {
  isRenderableValueField,
  KYB_STEPS,
  NOMBRE_DILIGENCIA_FIELD_ID,
} from "@/lib/kyb-steps";
import { playFieldComplete, playKeyTap, unlockAudio } from "@/lib/kyb-sounds";

function stepVariantsFor(reduce: boolean) {
  if (reduce) {
    return {
      initial: { opacity: 0 },
      animate: {
        opacity: 1,
        transition: { duration: 0.2 },
      },
      exit: { opacity: 0, transition: { duration: 0.15 } },
    };
  }
  return {
    initial: { opacity: 0, x: 28, filter: "blur(4px)" },
    animate: {
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
      transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const },
    },
    exit: {
      opacity: 0,
      x: -20,
      filter: "blur(3px)",
      transition: { duration: 0.28, ease: [0.4, 0, 1, 1] as const },
    },
  };
}

const fieldStagger = 0.035;

function FieldCheck({ show }: { show: boolean }) {
  return (
    <div className="flex w-10 shrink-0 items-center justify-center self-stretch">
      <AnimatePresence mode="wait">
        {show ? (
          <motion.div
            key="ok"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 24 }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/25"
            aria-hidden
          >
            <svg
              className="h-4 w-4 text-emerald-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function OnboardingWizard({ steps = KYB_STEPS }: { steps?: KybStep[] }) {
  const reduceMotion = useReducedMotion();
  const reduce = Boolean(reduceMotion);
  const [started, setStarted] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState<FormState>(() => {
    const s: FormState = {};
    for (const step of KYB_STEPS) {
      for (const f of step.fields) {
        if (!isRenderableValueField(f)) continue;
        s[f.id] = "";
      }
    }
    return s;
  });
  const [apiStatus, setApiStatus] = useState<string | null>(null);
  const { options: activityOptions, loading: activityLoading } =
    useActivityOptions();
  const { options: professionOptions, loading: professionLoading } =
    useProfessionOptions();

  const step = steps[stepIndex];
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === steps.length - 1;

  const progress = useMemo(
    () => Math.round(((stepIndex + 1) / steps.length) * 100),
    [stepIndex, steps.length],
  );

  const nombreDiligencia = (values[NOMBRE_DILIGENCIA_FIELD_ID] ?? "").trim();
  const canLeaveIntro = nombreDiligencia.length > 0;

  const prevCompleteRef = useRef<Record<string, boolean>>({});
  const lastKeySoundRef = useRef(0);

  useEffect(() => {
    if (!started) return;
    const onPointer = () => {
      unlockAudio();
    };
    window.addEventListener("pointerdown", onPointer, { once: true });
    return () => window.removeEventListener("pointerdown", onPointer);
  }, [started]);

  useEffect(() => {
    if (!started) return;
    for (const st of steps) {
      for (const f of st.fields) {
        if (!isRenderableValueField(f)) continue;
        const c = isFieldComplete(f, values);
        const prev = prevCompleteRef.current[f.id];
        if (c && !prev) {
          playFieldComplete();
        }
        prevCompleteRef.current[f.id] = c;
      }
    }
  }, [values, started, steps]);

  const typingKey = useCallback((e: KeyboardEvent) => {
    if (e.key.length !== 1) return;
    const now = Date.now();
    if (now - lastKeySoundRef.current < 42) return;
    lastKeySoundRef.current = now;
    playKeyTap();
  }, []);

  const setField = (id: string, v: string) => {
    setValues((prev) => {
      const next: FormState = { ...prev, [id]: v };
      if (id === "tipo_sociedad" && v !== "__otro__") {
        next.tipo_sociedad_otros_especifique = "";
      }
      return next;
    });
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
    "w-full rounded-xl border border-slate-200/95 bg-white/95 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 focus:border-[#4749B6] focus:ring-2 focus:ring-[#4749B6]/20";

  const wrapField = (field: KybField, inner: ReactNode) => {
    if (field.type === "heading" || field.type === "static") {
      return inner;
    }
    const complete = isFieldComplete(field, values);
    return (
      <div className="flex gap-1 sm:gap-2">
        <div className="min-w-0 flex-1">{inner}</div>
        <FieldCheck show={complete} />
      </div>
    );
  };

  const renderField = (field: KybField) => {
    if (field.type === "heading") {
      return (
        <div key={field.id} className="pt-2">
          <h3 className="border-b border-[#4749B6]/20 pb-2 text-sm font-semibold tracking-tight text-[#0B0B13]">
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
      const inner = (
        <label
          key={field.id}
          className="group flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200/90 bg-white/95 px-3.5 py-3 shadow-sm transition duration-200 hover:border-[#4749B6]/35 hover:shadow-md"
        >
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#4749B6] transition focus:ring-[#4749B6]"
            checked={values[field.id] === "true"}
            onChange={() => toggleCheckbox(field.id)}
          />
          <span className="text-sm font-medium text-slate-800">{field.label}</span>
        </label>
      );
      return wrapField(field, inner);
    }

    if (field.type === "date") {
      const inner = (
        <label key={field.id} className="block">
          <span
            className={`mb-1.5 block font-medium text-[#0B0B13] ${
              field.label.length > 120 ? "text-xs leading-snug sm:text-sm" : "text-sm"
            }`}
          >
            {field.label}
          </span>
          <KybDateField
            value={values[field.id] ?? ""}
            onChange={(v) => setField(field.id, v)}
            className={inputClass}
          />
          {field.hint ? (
            <span className="mt-1.5 block text-xs text-slate-500">{field.hint}</span>
          ) : null}
        </label>
      );
      return wrapField(field, inner);
    }

    if (field.type === "combobox") {
      const inner = (
        <div key={field.id} className="block">
          <span className="mb-1.5 block text-sm font-medium text-[#0B0B13]">
            {field.label}
          </span>
          <KybCombobox
            options={field.options ?? []}
            value={values[field.id] ?? ""}
            onChange={(v) => setField(field.id, v)}
            placeholder={field.placeholder ?? "Buscar o seleccionar…"}
            className={inputClass}
            emptyMessage="Sin coincidencias"
            onTypingKey={typingKey}
          />
          {field.hint ? (
            <span className="mt-1.5 block text-xs text-slate-500">{field.hint}</span>
          ) : null}
        </div>
      );
      return wrapField(field, inner);
    }

    if (field.type === "country") {
      const inner = (
        <div key={field.id} className="block">
          <span className="mb-1.5 block text-sm font-medium text-[#0B0B13]">
            {field.label}
          </span>
          <KybCombobox
            options={PAIS_OPTIONS}
            value={values[field.id] ?? ""}
            onChange={(v) => setField(field.id, v)}
            placeholder={field.placeholder ?? "Buscar país…"}
            className={inputClass}
            emptyMessage="Sin coincidencias"
            onTypingKey={typingKey}
          />
          {field.hint ? (
            <span className="mt-1.5 block text-xs text-slate-500">{field.hint}</span>
          ) : null}
        </div>
      );
      return wrapField(field, inner);
    }

    if (field.type === "activity_search") {
      const inner = (
        <div key={field.id} className="block">
          <span className="mb-1.5 block text-sm font-medium text-[#0B0B13]">
            {field.label}
          </span>
          <KybCombobox
            options={activityOptions}
            value={values[field.id] ?? ""}
            onChange={(v) => setField(field.id, v)}
            placeholder={
              activityLoading
                ? "Cargando actividades…"
                : (field.placeholder ?? "Buscar actividad…")
            }
            className={inputClass}
            emptyMessage="Sin coincidencias"
            onTypingKey={typingKey}
            disabled={activityLoading}
          />
          {field.hint ? (
            <span className="mt-1.5 block text-xs text-slate-500">{field.hint}</span>
          ) : null}
        </div>
      );
      return wrapField(field, inner);
    }

    if (field.type === "profession_search") {
      const inner = (
        <div key={field.id} className="block">
          <span className="mb-1.5 block text-sm font-medium text-[#0B0B13]">
            {field.label}
          </span>
          <KybCombobox
            options={professionOptions}
            value={values[field.id] ?? ""}
            onChange={(v) => setField(field.id, v)}
            placeholder={
              professionLoading
                ? "Cargando profesiones…"
                : (field.placeholder ?? "Buscar profesión u ocupación…")
            }
            className={inputClass}
            emptyMessage="Sin coincidencias"
            onTypingKey={typingKey}
            disabled={professionLoading}
          />
          {field.hint ? (
            <span className="mt-1.5 block text-xs text-slate-500">{field.hint}</span>
          ) : null}
        </div>
      );
      return wrapField(field, inner);
    }

    const inner = (
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
            onKeyDown={typingKey}
            required={field.id === NOMBRE_DILIGENCIA_FIELD_ID}
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
            onKeyDown={typingKey}
            required={field.id === NOMBRE_DILIGENCIA_FIELD_ID}
          />
        )}
        {field.hint ? (
          <span className="mt-1.5 block text-xs text-slate-500">{field.hint}</span>
        ) : null}
      </label>
    );
    return wrapField(field, inner);
  };

  if (!started) {
    return (
      <KybLanding
        onContinue={() => {
          unlockAudio();
          setStarted(true);
        }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <motion.div
        className="overflow-hidden rounded-2xl border border-white/70 bg-white/75 shadow-[0_8px_40px_-12px_rgba(71,73,182,0.18),0_0_0_1px_rgba(15,23,42,0.05)] backdrop-blur-xl"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="border-b border-slate-100/90 bg-gradient-to-br from-[#4749B6]/[0.1] via-white/90 to-white/70 px-5 py-6 sm:px-8 sm:py-8">
          <motion.p
            className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#4749B6]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Punto Pago Panamá
          </motion.p>
          <motion.h1
            className="mt-2 text-2xl font-bold tracking-tight text-[#0B0B13] sm:text-[1.75rem] sm:leading-tight"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.45 }}
          >
            Formulario KYB
          </motion.h1>
          {nombreDiligencia && stepIndex > 0 ? (
            <motion.p
              className="mt-3 rounded-xl border border-[#4749B6]/20 bg-[#4749B6]/[0.06] px-3 py-2 text-sm text-slate-700"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="font-semibold text-[#4749B6]">{nombreDiligencia}</span>, sigamos
              con la siguiente información.
            </motion.p>
          ) : null}
          <div className="mt-5">
            <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
              <span>Progreso</span>
              <span className="tabular-nums font-semibold text-[#4749B6]">
                {progress}%
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200/90">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#4749B6] to-[#6366f1]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 22 }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Paso <span className="font-medium text-slate-700">{stepIndex + 1}</span>{" "}
              de <span className="font-medium text-slate-700">{steps.length}</span>
            </p>
          </div>
        </div>

        <section className="px-5 py-6 sm:px-8 sm:py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              variants={stepVariantsFor(reduce)}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <h2 className="text-base font-bold leading-snug text-[#0B0B13] sm:text-lg">
                {step.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {step.description}
              </p>

              <div className="mt-7 space-y-4">
                {step.fields
                  .filter((f) => {
                    if (f.id === "tipo_sociedad_otros_especifique") {
                      return values.tipo_sociedad === "__otro__";
                    }
                    return true;
                  })
                  .map((field, i) => (
                  <motion.div
                    key={`${step.id}-${field.id}-${i}`}
                    initial={reduce ? false : { opacity: 0, y: 10 }}
                    animate={reduce ? false : { opacity: 1, y: 0 }}
                    transition={{
                      delay: reduce ? 0 : 0.08 + Math.min(i * fieldStagger, 0.45),
                      duration: reduce ? 0 : 0.38,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    {renderField(field)}
                  </motion.div>
                ))}
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100/90 pt-8">
                <div className="flex flex-wrap items-center gap-3">
                  <motion.button
                    type="button"
                    className="rounded-xl border border-slate-200/95 bg-white/90 px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={isFirst}
                    onClick={() => setStepIndex((j) => Math.max(0, j - 1))}
                    whileHover={{ scale: isFirst ? 1 : 1.02 }}
                    whileTap={{ scale: isFirst ? 1 : 0.98 }}
                  >
                    Anterior
                  </motion.button>
                  {isFirst ? (
                    <button
                      type="button"
                      className="text-sm font-medium text-slate-500 underline-offset-2 transition hover:text-[#4749B6] hover:underline"
                      onClick={() => {
                        setStarted(false);
                        setStepIndex(0);
                      }}
                    >
                      Volver a la introducción
                    </button>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  {!isLast ? (
                    <motion.button
                      type="button"
                      className="rounded-xl bg-gradient-to-b from-[#4749B6] to-[#3B3DA6] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#4749B6]/30 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={step.id === "intro_formulario" && !canLeaveIntro}
                      onClick={() =>
                        setStepIndex((j) => Math.min(steps.length - 1, j + 1))
                      }
                      whileHover={{
                        scale: step.id === "intro_formulario" && !canLeaveIntro ? 1 : 1.03,
                        boxShadow:
                          step.id === "intro_formulario" && !canLeaveIntro
                            ? undefined
                            : "0 12px 28px -6px rgba(71,73,182,0.45)",
                      }}
                      whileTap={{ scale: 0.97 }}
                    >
                      Siguiente
                    </motion.button>
                  ) : (
                    <motion.button
                      type="button"
                      className="rounded-xl bg-gradient-to-b from-[#4749B6] to-[#3B3DA6] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#4749B6]/30"
                      onClick={submitDraft}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      Enviar borrador
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </section>
      </motion.div>

      <motion.p
        className="mt-6 text-center text-xs text-slate-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <button
          type="button"
          className="font-medium text-[#4749B6] underline-offset-2 transition hover:underline"
          onClick={pingApi}
        >
          Probar conexión con API
        </button>
        {apiStatus ? (
          <span className="ml-2 text-slate-600">{apiStatus}</span>
        ) : null}
      </motion.p>
    </div>
  );
}
