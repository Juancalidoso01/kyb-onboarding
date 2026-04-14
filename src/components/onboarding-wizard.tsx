"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { FormEvent, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { KybCombobox } from "@/components/kyb-combobox";
import { KybDateField } from "@/components/kyb-date-field";
import { KybLanding } from "@/components/kyb-landing";
import { KybAddressPaField } from "@/components/kyb-address-pa-field";
import { KybFormattedNumberField } from "@/components/kyb-formatted-number-field";
import { KybPhoneField } from "@/components/kyb-phone-field";
import { PAIS_OPTIONS } from "@/data/paises";
import { KYB_ACTIVITY_NOT_LISTED_VALUE } from "@/lib/kyb-activity-extra-option";
import {
  useActivityOptions,
  useProfessionOptions,
} from "@/hooks/use-kyb-sheet-options";
import type { FormState } from "@/lib/kyb-field-complete";
import { isFieldComplete } from "@/lib/kyb-field-complete";
import {
  getFormatErrorForField,
  normalizePercentInput,
  PHONE_TEXT_FIELD_IDS,
} from "@/lib/kyb-format-validation";
import {
  getDialDigitsForPhoneField,
  PHONE_SPLIT_PREFIX_FIELD_IDS,
} from "@/lib/kyb-phone-country";
import { showPanamaAddressLookup } from "@/lib/kyb-panama-address-eligibility";
import type { KybField, KybStep } from "@/lib/kyb-steps";
import {
  buildEmptyFormState,
  clearDraft,
  readDraft,
  saveDraft,
} from "@/lib/kyb-local-draft";
import {
  KYB_FIELD_HINT_CLASS,
  KYB_STEP_DESCRIPTION_CLASS,
} from "@/lib/kyb-prose-classes";
import {
  getReferenciasFieldLabel,
  REFERENCIAS_STEP_ID,
} from "@/lib/kyb-referencias-labels";
import {
  allPepMemberFormKeys,
  formKeysForPepMemberSlot,
  PEP_MEMBER_SLOTS_MAX,
  PEP_STEP_ID,
} from "@/lib/kyb-pep-content";
import { type KybDocCompletenessContext } from "@/lib/kyb-documentacion";
import { KybDeclaracionResumen } from "@/components/kyb-declaracion-resumen";
import { KybDocumentacionPersonas } from "@/components/kyb-documentacion-personas";
import {
  formatMaxMb,
  KYB_MAX_TOTAL_ATTACHMENT_BYTES,
} from "@/lib/kyb-attachment-limits";
import { KybFileRow } from "@/components/kyb-file-row";
import { KybRepresentanteCierrePaso } from "@/components/kyb-representante-cierre-paso";
import {
  KybStepSectionsNavMobile,
  KybStepSectionsNavSidebar,
} from "@/components/kyb-step-sections-nav";
import { KybPuntoPagoServiciosMulti } from "@/components/kyb-punto-pago-servicios-multi";
import { KybPuntoPagoMetricasPorServicio } from "@/components/kyb-punto-pago-metricas-por-servicio";
import {
  formKeysForBfMemberSlot,
  formKeysForJuntaMemberSlot,
  isRenderableValueField,
  BENEFICIARIOS_FINALES_STEP_ID,
  BF_MEMBER_SLOTS_MAX,
  DECLARACION_STEP_ID,
  REPRESENTANTE_CIERRE_STEP_ID,
  filterStepsByCotizaBolsa,
  JUNTA_DIRECTIVA_STEP_ID,
  JUNTA_MEMBER_SLOTS_MAX,
  KYB_STEPS,
  NOMBRE_DILIGENCIA_FIELD_ID,
  PP_SV_METRICA_PAIRS,
} from "@/lib/kyb-steps";
import { isValidPanamaDate } from "@/lib/kyb-date";
import { buildAndDownloadKybPdf } from "@/lib/kyb-export-pdf";
import { isKybStepFieldVisible } from "@/lib/kyb-step-field-visibility";
import {
  playChoiceTick,
  playFieldComplete,
  playKeyTap,
  playWizardNav,
  unlockAudio,
} from "@/lib/kyb-sounds";
import { useKybPersonalizationOptional } from "@/context/kyb-personalization";

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

function FieldFormatStatus({
  complete,
  error,
}: {
  complete: boolean;
  error: string | null;
}) {
  return (
    <div className="flex w-10 shrink-0 items-center justify-center self-stretch">
      <AnimatePresence mode="wait">
        {error ? (
          <motion.div
            key="err"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 24 }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/15 ring-1 ring-red-500/30"
            title={error}
            role="img"
            aria-label={error}
          >
            <svg
              className="h-4 w-4 text-red-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </motion.div>
        ) : complete ? (
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
  const [values, setValues] = useState<FormState>(() => buildEmptyFormState(steps));
  const [juntaMemberSlots, setJuntaMemberSlots] = useState(1);
  const [bfMemberSlots, setBfMemberSlots] = useState(1);
  const [pepMemberSlots, setPepMemberSlots] = useState(1);
  const [landingDraftAt, setLandingDraftAt] = useState<number | null>(null);
  const [draftServerFeedback, setDraftServerFeedback] = useState<string | null>(
    null,
  );
  const [cierreRepresentanteListo, setCierreRepresentanteListo] =
    useState(false);
  const { options: activityOptions, loading: activityLoading } =
    useActivityOptions();
  const { options: professionOptions, loading: professionLoading } =
    useProfessionOptions();

  const visibleSteps = useMemo(
    () => filterStepsByCotizaBolsa(steps, values.cotiza_bolsa),
    [steps, values.cotiza_bolsa],
  );

  useEffect(() => {
    if (!started) return;
    if (visibleSteps.length === 0) return;
    if (stepIndex >= visibleSteps.length) {
      setStepIndex(visibleSteps.length - 1);
    }
  }, [started, visibleSteps, stepIndex]);

  const effectiveStepIndex =
    visibleSteps.length > 0
      ? Math.min(stepIndex, visibleSteps.length - 1)
      : 0;
  const step = visibleSteps[effectiveStepIndex];
  const isFirst = effectiveStepIndex === 0;
  const isLast = effectiveStepIndex === visibleSteps.length - 1;
  const esPasoCierre = step?.id === REPRESENTANTE_CIERRE_STEP_ID;

  const progress = useMemo(
    () =>
      Math.round(
        (visibleSteps.length > 0
          ? (effectiveStepIndex + 1) / visibleSteps.length
          : 0) * 100,
      ),
    [effectiveStepIndex, visibleSteps.length],
  );

  const jumpToStep = useCallback(
    (i: number) => {
      if (visibleSteps.length === 0) return;
      playWizardNav();
      setStepIndex(Math.max(0, Math.min(visibleSteps.length - 1, i)));
      requestAnimationFrame(() => {
        document
          .getElementById("kyb-wizard-card")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    },
    [visibleSteps.length],
  );

  const docCompletenessCtx = useMemo<KybDocCompletenessContext>(
    () => ({
      juntaMemberSlots,
      bfMemberSlots,
      omitirAccionistas: (values.cotiza_bolsa ?? "").trim() === "si",
    }),
    [juntaMemberSlots, bfMemberSlots, values.cotiza_bolsa],
  );

  const fieldVisibilityCtx = useMemo(
    () => ({
      juntaMemberSlots,
      bfMemberSlots,
      pepMemberSlots,
    }),
    [juntaMemberSlots, bfMemberSlots, pepMemberSlots],
  );

  const valuesRef = useRef(values);
  valuesRef.current = values;
  const visibleStepsRef = useRef(visibleSteps);
  visibleStepsRef.current = visibleSteps;
  const fieldVisibilityCtxRef = useRef(fieldVisibilityCtx);
  fieldVisibilityCtxRef.current = fieldVisibilityCtx;

  /** Archivos seleccionados en inputs file (solo memoria; para subida a Drive al finalizar). */
  const attachmentFilesRef = useRef<Record<string, File>>({});
  const registerAttachmentFile = useCallback((id: string, file: File | null) => {
    if (file) {
      attachmentFilesRef.current[id] = file;
    } else {
      delete attachmentFilesRef.current[id];
    }
  }, []);

  const firmaPaqueteMeta = useMemo(
    () => ({
      juntaMemberSlots,
      bfMemberSlots,
      pepMemberSlots,
      cotiza_bolsa: values.cotiza_bolsa ?? "",
    }),
    [
      juntaMemberSlots,
      bfMemberSlots,
      pepMemberSlots,
      values.cotiza_bolsa,
    ],
  );

  const flushDraftNow = useCallback(() => {
    if (!started) return;
    saveDraft({
      stepIndex,
      values,
      juntaMemberSlots,
      bfMemberSlots,
      pepMemberSlots,
    });
  }, [started, stepIndex, values, juntaMemberSlots, bfMemberSlots, pepMemberSlots]);

  const mergeRemoteRepresentantePatch = useCallback(
    (patch: Partial<FormState>) => {
      setValues((prev) => {
        const next: FormState = { ...prev };
        for (const [k, v] of Object.entries(patch)) {
          if (v !== undefined) next[k] = v;
        }
        return next;
      });
    },
    [],
  );

  const onFinalizarCierre = useCallback(
    async (patch: Partial<FormState>) => {
      let attachmentsTotal = 0;
      for (const f of Object.values(attachmentFilesRef.current)) {
        if (f) attachmentsTotal += f.size;
      }
      if (attachmentsTotal > KYB_MAX_TOTAL_ATTACHMENT_BYTES) {
        throw new Error(
          `Los archivos adjuntos superan en conjunto el máximo de ${formatMaxMb(KYB_MAX_TOTAL_ATTACHMENT_BYTES)} MB. Reduzca el número de documentos o comprima los PDF.`,
        );
      }

      const merged: FormState = { ...valuesRef.current };
      for (const [k, v] of Object.entries(patch)) {
        if (v !== undefined) merged[k] = v;
      }
      const summarySteps = visibleStepsRef.current.filter(
        (s) =>
          s.id !== DECLARACION_STEP_ID &&
          s.id !== REPRESENTANTE_CIERRE_STEP_ID,
      );
      buildAndDownloadKybPdf(
        merged,
        summarySteps,
        fieldVisibilityCtxRef.current,
      );
      mergeRemoteRepresentantePatch(patch);
      const r = await fetch("/api/kyb/form-reference", { method: "POST" });
      const j = (await r.json()) as { ref?: string };
      const ref = j.ref ?? `PP-KYB-${Date.now()}`;
      const mergedConRef: FormState = { ...merged, decl_formulario_ref: ref };
      const slots = fieldVisibilityCtxRef.current;
      try {
        const fd = new FormData();
        fd.append(
          "payload",
          JSON.stringify({
            formRef: ref,
            values: mergedConRef,
            juntaMemberSlots: slots.juntaMemberSlots,
            bfMemberSlots: slots.bfMemberSlots,
            pepMemberSlots: slots.pepMemberSlots,
          }),
        );
        for (const [k, file] of Object.entries(attachmentFilesRef.current)) {
          if (file) fd.append(`file_${k}`, file, file.name);
        }
        const gr = await fetch("/api/kyb/google/submission", {
          method: "POST",
          body: fd,
        });
        const gj = (await gr.json()) as {
          ok?: boolean;
          skipped?: boolean;
          reason?: string;
          error?: string;
        };
        if (gj.skipped) {
          console.warn(
            "[KYB] Google sync omitido:",
            gj.reason ?? "revisa variables en el servidor",
          );
        } else if (!gr.ok || !gj.ok) {
          console.error(
            "[KYB] Google sync error:",
            gr.status,
            gj.error ?? gj,
          );
        }
      } catch (e) {
        console.error("[KYB] Google sync fetch falló:", e);
      }
      return ref;
    },
    [mergeRemoteRepresentantePatch],
  );

  const redownloadKybPdf = useCallback(() => {
    const summarySteps = visibleSteps.filter(
      (s) =>
        s.id !== DECLARACION_STEP_ID &&
        s.id !== REPRESENTANTE_CIERRE_STEP_ID,
    );
    buildAndDownloadKybPdf(values, summarySteps, fieldVisibilityCtx);
  }, [values, visibleSteps, fieldVisibilityCtx]);

  const puedeContinuarDeclaracion = useMemo(() => {
    const nom = (values.decl_director_nombre ?? "").trim();
    const f = values.decl_fecha ?? "";
    return nom.length > 0 && isValidPanamaDate(f);
  }, [values.decl_director_nombre, values.decl_fecha]);

  useEffect(() => {
    if (!started) return;
    const sid = visibleSteps[effectiveStepIndex]?.id;
    if (sid !== DECLARACION_STEP_ID && sid !== REPRESENTANTE_CIERRE_STEP_ID)
      return;
    saveDraft({
      stepIndex,
      values,
      juntaMemberSlots,
      bfMemberSlots,
      pepMemberSlots,
    });
  }, [
    started,
    values,
    effectiveStepIndex,
    visibleSteps,
    stepIndex,
    juntaMemberSlots,
    bfMemberSlots,
    pepMemberSlots,
  ]);

  useEffect(() => {
    if (visibleSteps[effectiveStepIndex]?.id !== REPRESENTANTE_CIERRE_STEP_ID) {
      return;
    }
    setCierreRepresentanteListo(
      Boolean((values.decl_formulario_ref ?? "").trim()),
    );
  }, [
    visibleSteps,
    effectiveStepIndex,
    values.decl_formulario_ref,
  ]);

  const nombreDiligencia = (values[NOMBRE_DILIGENCIA_FIELD_ID] ?? "").trim();
  const canLeaveIntro = nombreDiligencia.length > 0;
  const personalization = useKybPersonalizationOptional();
  useEffect(() => {
    personalization?.setLiveDiligenciaNombre(nombreDiligencia);
  }, [nombreDiligencia, personalization]);

  const prevCompleteRef = useRef<Record<string, boolean>>({});
  /** Evita una ráfaga de «campo completo» al entrar: antes se sembraba prev vacío. */
  const fieldCompleteSeededRef = useRef(false);
  const lastKeySoundRef = useRef(0);

  useEffect(() => {
    const d = readDraft(steps);
    setLandingDraftAt(d ? d.savedAt : null);
  }, [steps]);

  useEffect(() => {
    if (!started) return;
    const t = window.setTimeout(() => {
      saveDraft({
        stepIndex,
        values,
        juntaMemberSlots,
        bfMemberSlots,
        pepMemberSlots,
      });
    }, 500);
    return () => window.clearTimeout(t);
  }, [started, stepIndex, values, juntaMemberSlots, bfMemberSlots, pepMemberSlots]);

  useEffect(() => {
    if (!started) return;
    const flush = () =>
      saveDraft({
        stepIndex,
        values,
        juntaMemberSlots,
        bfMemberSlots,
        pepMemberSlots,
      });
    const onVis = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("beforeunload", flush);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("beforeunload", flush);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [started, stepIndex, values, juntaMemberSlots, bfMemberSlots, pepMemberSlots]);

  useEffect(() => {
    if (!started) return;
    const onGesture = () => {
      unlockAudio();
    };
    window.addEventListener("pointerdown", onGesture, { once: true });
    window.addEventListener("touchstart", onGesture, {
      once: true,
      passive: true,
    });
    return () => {
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("touchstart", onGesture);
    };
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const op = (values.pais_opera ?? "").trim();
    if (op) {
      setValues((prev) => (prev.pais === op ? prev : { ...prev, pais: op }));
    }
  }, [started, values.pais_opera]);

  useEffect(() => {
    if (!started) return;
    if (values.pep_alguno_catalogado !== "si") {
      setPepMemberSlots(1);
    }
  }, [started, values.pep_alguno_catalogado]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (typeof window !== "undefined" && window.__kybMetamapModalOpen) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  useEffect(() => {
    if (!started) {
      fieldCompleteSeededRef.current = false;
      prevCompleteRef.current = {};
      return;
    }
    if (!fieldCompleteSeededRef.current) {
      fieldCompleteSeededRef.current = true;
      const next: Record<string, boolean> = {};
      for (const st of visibleSteps) {
        for (const f of st.fields) {
          if (!isRenderableValueField(f) || f.hidden) continue;
          next[f.id] = isFieldComplete(f, values, docCompletenessCtx);
        }
      }
      prevCompleteRef.current = next;
      return;
    }
    for (const st of visibleSteps) {
      for (const f of st.fields) {
        if (!isRenderableValueField(f) || f.hidden) continue;
        const c = isFieldComplete(f, values, docCompletenessCtx);
        const prev = prevCompleteRef.current[f.id];
        if (c && !prev) {
          playFieldComplete();
        }
        prevCompleteRef.current[f.id] = c;
      }
    }
  }, [values, started, visibleSteps, docCompletenessCtx]);

  /**
   * keydown se mantiene por compatibilidad con componentes; el sonido por
   * tecla va por inputTypingFeedback (input) para no duplicar en desktop y
   * para cubrir teclados virtuales que no disparan keydown por letra.
   */
  const typingKey = useCallback(() => {}, []);

  /** Teclado virtual / móvil: evento input por inserción (y escritura por voz, etc.). */
  const inputTypingFeedback = useCallback(
    (e: FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const ie = e.nativeEvent as InputEvent;
      if (typeof ie.inputType === "string") {
        if (ie.inputType.startsWith("delete")) return;
        if (
          ie.inputType === "insertFromPaste" ||
          ie.inputType === "insertFromDrop"
        ) {
          return;
        }
      }
      const now = Date.now();
      if (now - lastKeySoundRef.current < 42) return;
      lastKeySoundRef.current = now;
      playKeyTap();
    },
    [],
  );

  const setField = (id: string, v: string) => {
    setValues((prev) => {
      const next: FormState = { ...prev, [id]: v };
      if (id === "tipo_sociedad" && v !== "__otro__") {
        next.tipo_sociedad_otros_especifique = "";
      }
      if (id === "actividad_empresa" && v !== KYB_ACTIVITY_NOT_LISTED_VALUE) {
        next.actividad_empresa_especifique = "";
      }
      if (
        id === "rep_actividad_economica" &&
        v !== KYB_ACTIVITY_NOT_LISTED_VALUE
      ) {
        next.rep_actividad_economica_especifique = "";
      }
      if (id === "doc_identidad_tipo" && v !== "otro_id") {
        next.doc_identidad_otro = "";
      }
      if (id === "persona_contacto_cargo" && v !== "otro_cargo") {
        next.persona_contacto_cargo_especifique = "";
      }
      if (id === "operaciones_frecuencia" && v !== "otro") {
        next.operaciones_frecuencia_otro = "";
      }
      if (id === "volumen_operaciones_anual" && v !== "otros") {
        next.volumen_operaciones_otros = "";
      }
      if (id === "ref_tipo" && v !== "otro") {
        next.ref_tipo_otro_descripcion = "";
      }
      if (id === "doc_upl_factura_servicios" && !v.trim()) {
        next.doc_nac_nis_numero = "";
      }
      if (id === "pep_alguno_catalogado" && v !== "si") {
        for (const fid of allPepMemberFormKeys()) {
          next[fid] = "";
        }
      }
      const metricSvc = PP_SV_METRICA_PAIRS.find((m) => m.serviceId === id);
      if (metricSvc && v !== "true") {
        next[metricSvc.montoId] = "";
        next[metricSvc.txId] = "";
      }
      if (id === "pp_sv_otros" && v !== "true") {
        next.pp_sv_otros_especifique = "";
      }
      const tipoBf = id.match(/^bf_(\d+)_tipo_persona$/);
      if (tipoBf) {
        const sn = tipoBf[1];
        if (v === "N") {
          next[`bf_${sn}_razon_social`] = "";
          next[`bf_${sn}_ruc`] = "";
        } else if (v === "J") {
          next[`bf_${sn}_fecha_nacimiento`] = "";
          next[`bf_${sn}_nombre_completo`] = "";
          next[`bf_${sn}_cedula_pasaporte`] = "";
        } else if (v === "") {
          next[`bf_${sn}_fecha_nacimiento`] = "";
          next[`bf_${sn}_nombre_completo`] = "";
          next[`bf_${sn}_cedula_pasaporte`] = "";
          next[`bf_${sn}_razon_social`] = "";
          next[`bf_${sn}_ruc`] = "";
        }
      }
      return next;
    });
  };

  const toggleCheckbox = (id: string) => {
    setValues((prev) => {
      const next: FormState = {
        ...prev,
        [id]: prev[id] === "true" ? "" : "true",
      };
      if (id === "pp_sv_otros" && next[id] !== "true") {
        next.pp_sv_otros_especifique = "";
      }
      const metricSvc = PP_SV_METRICA_PAIRS.find((m) => m.serviceId === id);
      if (metricSvc && next[id] !== "true") {
        next[metricSvc.montoId] = "";
        next[metricSvc.txId] = "";
      }
      return next;
    });
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
      clearDraft();
      setDraftServerFeedback(`Borrador enviado: ${JSON.stringify(j)}`);
    } catch (e) {
      setDraftServerFeedback(`Error al enviar: ${String(e)}`);
    }
  };

  const continueFromLanding = () => {
    unlockAudio();
    const d = readDraft(steps);
    if (d) {
      setValues(d.values);
      setStepIndex(d.stepIndex);
      setJuntaMemberSlots(d.juntaMemberSlots ?? 1);
      setBfMemberSlots(d.bfMemberSlots ?? 1);
      setPepMemberSlots(d.pepMemberSlots ?? 1);
    } else {
      setValues(buildEmptyFormState(steps));
      setStepIndex(0);
      setJuntaMemberSlots(1);
      setBfMemberSlots(1);
      setPepMemberSlots(1);
    }
    setStarted(true);
  };

  const startFormFresh = () => {
    clearDraft();
    setValues(buildEmptyFormState(steps));
    setStepIndex(0);
    setJuntaMemberSlots(1);
    setBfMemberSlots(1);
    setPepMemberSlots(1);
    setLandingDraftAt(null);
    setCierreRepresentanteListo(false);
    unlockAudio();
    setStarted(true);
  };

  const clearLocalDraftOnly = () => {
    clearDraft();
    setValues(buildEmptyFormState(steps));
    setStepIndex(0);
    setJuntaMemberSlots(1);
    setBfMemberSlots(1);
    setPepMemberSlots(1);
    setLandingDraftAt(null);
    setCierreRepresentanteListo(false);
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200/95 bg-white/95 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition duration-200 placeholder:text-slate-400 focus:border-[#4749B6] focus:ring-2 focus:ring-[#4749B6]/20";

  const wrapField = (field: KybField, inner: ReactNode) => {
    if (
      field.type === "heading" ||
      field.type === "static" ||
      field.type === "documentacion_personas" ||
      field.type === "declaracion_resumen" ||
      field.type === "representante_cierre_flow"
    ) {
      return inner;
    }
    const complete = isFieldComplete(field, values, docCompletenessCtx);
    const formatErr = getFormatErrorForField(field, values);
    return (
      <div className="flex gap-1 sm:gap-2">
        <div className="min-w-0 flex-1">{inner}</div>
        <FieldFormatStatus complete={complete} error={formatErr} />
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
      const paras =
        field.staticParagraphs && field.staticParagraphs.length > 0
          ? field.staticParagraphs
          : field.hint
            ? [field.hint]
            : [];

      if (field.staticParagraphs && field.staticParagraphs.length > 0) {
        return (
          <motion.div
            key={field.id}
            className="rounded-xl border border-slate-200/90 border-l-[3px] border-l-[#4749B6] bg-gradient-to-br from-[#4749B6]/[0.06] via-white/95 to-slate-50/40 p-4 shadow-sm sm:p-5"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={reduce ? false : { opacity: 1, y: 0 }}
            transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="space-y-4">
              {field.staticParagraphs.map((text, pi) => (
                <motion.p
                  key={pi}
                  className="text-justify text-sm leading-[1.65] text-slate-700 hyphens-auto [text-align-last:left] sm:text-[0.9375rem]"
                  initial={reduce ? false : { opacity: 0, y: 12 }}
                  animate={reduce ? false : { opacity: 1, y: 0 }}
                  transition={{
                    delay: reduce ? 0 : 0.08 + pi * 0.12,
                    duration: 0.44,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {text}
                </motion.p>
              ))}
            </div>
          </motion.div>
        );
      }

      if (!paras.length) return null;

      return (
        <div
          key={field.id}
          className="rounded-xl border border-slate-200/90 border-l-[3px] border-l-[#4749B6] bg-white/90 p-4 text-xs leading-relaxed text-slate-700 shadow-sm"
        >
          <p className="whitespace-pre-wrap text-justify [text-align-last:left]">
            {paras[0]}
          </p>
        </div>
      );
    }

    if (field.type === "documentacion_personas") {
      return wrapField(
        field,
        <KybDocumentacionPersonas
          key={field.id}
          values={values}
          onFileName={setField}
          onFileObject={registerAttachmentFile}
          juntaMemberSlots={juntaMemberSlots}
          bfMemberSlots={bfMemberSlots}
          omitirAccionistas={(values.cotiza_bolsa ?? "").trim() === "si"}
        />,
      );
    }

    if (field.type === "declaracion_resumen") {
      const summarySteps = visibleSteps.filter(
        (s) => s.id !== DECLARACION_STEP_ID,
      );
      return wrapField(
        field,
        <KybDeclaracionResumen
          key={field.id}
          steps={summarySteps}
          values={values}
          visibility={fieldVisibilityCtx}
        />,
      );
    }

    if (field.type === "representante_cierre_flow") {
      return wrapField(
        field,
        <KybRepresentanteCierrePaso
          key={field.id}
          values={values}
          meta={firmaPaqueteMeta}
          onRemotePatch={mergeRemoteRepresentantePatch}
          onFlushDraft={flushDraftNow}
          setField={setField}
          onFinalizar={onFinalizarCierre}
          onTerminado={() => setCierreRepresentanteListo(true)}
        />,
      );
    }

    if (field.type === "punto_pago_servicios_multi") {
      return wrapField(
        field,
        <KybPuntoPagoServiciosMulti
          key={field.id}
          values={values}
          setField={setField}
          label={field.label}
          hint={field.hint}
        />,
      );
    }

    if (field.type === "punto_pago_metricas_por_servicio") {
      return wrapField(
        field,
        <KybPuntoPagoMetricasPorServicio
          key={field.id}
          values={values}
          setField={setField}
          inputClass={inputClass}
          onTypingKey={typingKey}
          onInputFeedback={inputTypingFeedback}
          label={field.label}
          hint={field.hint}
        />,
      );
    }

    const displayLabel =
      step?.id === REFERENCIAS_STEP_ID
        ? (getReferenciasFieldLabel(field.id, values.ref_tipo ?? "") ??
          field.label)
        : field.label;

    if (field.type === "file") {
      const inner = (
        <div key={field.id} className="block">
          <span className="mb-1.5 block text-sm font-medium text-[#0B0B13]">
            {displayLabel}
          </span>
          <KybFileRow
            id={field.id}
            fileName={values[field.id] ?? ""}
            onChange={setField}
            onFileObject={registerAttachmentFile}
            hint={field.hint}
          />
        </div>
      );
      return wrapField(field, inner);
    }

    if (field.type === "checkbox") {
      const inner = (
        <div key={field.id} className="space-y-3">
          <label className="group flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200/90 bg-white/95 px-3.5 py-3 shadow-sm transition duration-200 hover:border-[#4749B6]/35 hover:shadow-md">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#4749B6] transition focus:ring-[#4749B6]"
              checked={values[field.id] === "true"}
              onChange={() => {
                playChoiceTick();
                toggleCheckbox(field.id);
              }}
            />
            <span className="text-sm font-medium text-slate-800">
              {displayLabel}
            </span>
          </label>
          {field.fileAttachmentId ? (
            <div className="rounded-xl border border-slate-200/80 bg-white/80 px-3.5 py-3 sm:pl-10">
              <p className="mb-2 text-xs font-medium text-slate-600">
                Cargue el archivo correspondiente
              </p>
              <KybFileRow
                id={field.fileAttachmentId}
                fileName={values[field.fileAttachmentId] ?? ""}
                onChange={setField}
                onFileObject={registerAttachmentFile}
                hint="PDF, imagen u otros formatos compatibles."
              />
            </div>
          ) : null}
        </div>
      );
      return wrapField(field, inner);
    }

    if (field.type === "date") {
      const inner = (
        <label key={field.id} className="block">
          <span
            className={`mb-1.5 block font-medium text-[#0B0B13] ${
              displayLabel.length > 120
                ? "text-xs leading-snug sm:text-sm"
                : "text-sm"
            }`}
          >
            {displayLabel}
          </span>
          <KybDateField
            value={values[field.id] ?? ""}
            onChange={(v) => setField(field.id, v)}
            className={inputClass}
            onKeyDown={typingKey}
            onInput={inputTypingFeedback}
          />
          {field.hint ? (
            <span className={KYB_FIELD_HINT_CLASS}>{field.hint}</span>
          ) : null}
        </label>
      );
      return wrapField(field, inner);
    }

    if (field.type === "combobox") {
      const inner = (
        <div key={field.id} className="block">
          <span className="mb-1.5 block text-sm font-medium text-[#0B0B13]">
            {displayLabel}
          </span>
          <KybCombobox
            options={field.options ?? []}
            value={values[field.id] ?? ""}
            onChange={(v) => setField(field.id, v)}
            placeholder={field.placeholder ?? "Buscar o seleccionar…"}
            className={inputClass}
            emptyMessage="Sin coincidencias"
            onTypingKey={typingKey}
            onInputFeedback={inputTypingFeedback}
            onPick={playChoiceTick}
          />
          {field.hint ? (
            <span className={KYB_FIELD_HINT_CLASS}>{field.hint}</span>
          ) : null}
        </div>
      );
      return wrapField(field, inner);
    }

    if (field.type === "country") {
      const bfPaisNac = field.id.match(/^bf_(\d+)_pais_nacimiento$/);
      let countryLabel = displayLabel;
      if (bfPaisNac) {
        const sn = bfPaisNac[1];
        const tipo = (values[`bf_${sn}_tipo_persona`] ?? "").trim();
        if (tipo === "N") countryLabel = "País de nacimiento";
        else if (tipo === "J") countryLabel = "País de constitución";
        else countryLabel = "País de nacimiento o de constitución";
      }

      const inner = (
        <div key={field.id} className="block">
          <span className="mb-1.5 block text-sm font-medium text-[#0B0B13]">
            {countryLabel}
          </span>
          <KybCombobox
            options={PAIS_OPTIONS}
            value={values[field.id] ?? ""}
            onChange={(v) => setField(field.id, v)}
            placeholder={field.placeholder ?? "Buscar país…"}
            className={inputClass}
            emptyMessage="Sin coincidencias"
            onTypingKey={typingKey}
            onInputFeedback={inputTypingFeedback}
            onPick={playChoiceTick}
          />
          {field.hint ? (
            <span className={KYB_FIELD_HINT_CLASS}>{field.hint}</span>
          ) : null}
        </div>
      );
      return wrapField(field, inner);
    }

    if (field.type === "activity_search") {
      const inner = (
        <div key={field.id} className="block">
          <span className="mb-1.5 block text-sm font-medium text-[#0B0B13]">
            {displayLabel}
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
            onInputFeedback={inputTypingFeedback}
            onPick={playChoiceTick}
            disabled={activityLoading}
          />
          {field.hint ? (
            <span className={KYB_FIELD_HINT_CLASS}>{field.hint}</span>
          ) : null}
        </div>
      );
      return wrapField(field, inner);
    }

    if (field.type === "profession_search") {
      const inner = (
        <div key={field.id} className="block">
          <span className="mb-1.5 block text-sm font-medium text-[#0B0B13]">
            {displayLabel}
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
            onInputFeedback={inputTypingFeedback}
            onPick={playChoiceTick}
            disabled={professionLoading}
          />
          {field.hint ? (
            <span className={KYB_FIELD_HINT_CLASS}>{field.hint}</span>
          ) : null}
        </div>
      );
      return wrapField(field, inner);
    }

    if (field.type === "percent") {
      const formatErr = getFormatErrorForField(field, values);
      const invalid = Boolean(formatErr);
      const pctClass = invalid
        ? `${inputClass} border-red-400/95 pr-10 tabular-nums focus:border-red-500 focus:ring-red-500/20`
        : `${inputClass} pr-10 tabular-nums`;

      const inner = (
        <label key={field.id} className="block">
          <span className="mb-1.5 block text-sm font-medium text-[#0B0B13]">
            {displayLabel}
          </span>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              className={pctClass}
              placeholder={field.placeholder ?? "0–100"}
              value={normalizePercentInput(values[field.id] ?? "")}
              onChange={(e) =>
                setField(field.id, normalizePercentInput(e.target.value))
              }
              onBlur={() => {
                const id = field.id;
                const normalized = normalizePercentInput(values[id] ?? "");
                if (normalized !== (values[id] ?? "")) setField(id, normalized);
              }}
              onInput={inputTypingFeedback}
              onKeyDown={typingKey}
              aria-invalid={invalid || undefined}
            />
            <span
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500"
              aria-hidden
            >
              %
            </span>
          </div>
          {field.hint ? (
            <span className={KYB_FIELD_HINT_CLASS}>{field.hint}</span>
          ) : null}
          {formatErr ? (
            <span className="mt-1.5 block text-xs font-medium text-red-600" role="alert">
              {formatErr}
            </span>
          ) : null}
        </label>
      );
      return wrapField(field, inner);
    }

    if (field.type === "tel" || PHONE_TEXT_FIELD_IDS.has(field.id)) {
      const formatErr = getFormatErrorForField(field, values);
      const contactInputInvalid = formatErr !== null;
      const fieldInputClass = contactInputInvalid
        ? `${inputClass} border-red-400/95 focus:border-red-500 focus:ring-red-500/20`
        : inputClass;
      const dial = getDialDigitsForPhoneField(field.id, values);
      const split = PHONE_SPLIT_PREFIX_FIELD_IDS.has(field.id);
      const inner = (
        <div key={field.id} className="block">
          <KybPhoneField
            label={displayLabel}
            value={values[field.id] ?? ""}
            onChange={(v) => setField(field.id, v)}
            dialDigits={dial}
            splitPrefix={split}
            inputClass={fieldInputClass}
            invalid={contactInputInvalid}
            placeholder={field.placeholder}
            hint={field.hint}
            formatErr={formatErr}
            onTypingKey={typingKey}
            onInputFeedback={inputTypingFeedback}
          />
        </div>
      );
      return wrapField(field, inner);
    }

    if (
      field.type === "textarea" &&
      (/^junta_\d+_direccion$/.test(field.id) ||
        /^bf_\d+_direccion$/.test(field.id) ||
        field.id === "rep_direccion")
    ) {
      const addressVariant =
        field.id === "rep_direccion" && showPanamaAddressLookup(values)
          ? "panama"
          : "worldwide";
      const inner = (
        <div key={field.id} className="block">
          <KybAddressPaField
            variant={addressVariant}
            label={displayLabel}
            hint={field.hint}
            value={values[field.id] ?? ""}
            onChange={(v) => setField(field.id, v)}
            inputClass={inputClass}
            onTypingKey={typingKey}
            onInputFeedback={inputTypingFeedback}
          />
        </div>
      );
      return wrapField(field, inner);
    }

    if (
      (field.id === "direccion_comercial" ||
        field.id === "direccion_auxiliar") &&
      field.type === "textarea" &&
      showPanamaAddressLookup(values)
    ) {
      const inner = (
        <div key={field.id} className="block">
          <KybAddressPaField
            label={displayLabel}
            hint={field.hint}
            value={values[field.id] ?? ""}
            onChange={(v) => setField(field.id, v)}
            inputClass={inputClass}
            onTypingKey={typingKey}
            onInputFeedback={inputTypingFeedback}
            onStructuredFromApi={
              field.id === "direccion_comercial"
                ? (meta) => {
                    setValues((prev) => ({
                      ...prev,
                      provincia: meta.provincia,
                      ciudad: meta.ciudad,
                    }));
                  }
                : undefined
            }
          />
        </div>
      );
      return wrapField(field, inner);
    }

    const formatErr = getFormatErrorForField(field, values);
    const contactInputInvalid =
      formatErr !== null && field.type === "email";
    const fieldInputClass = contactInputInvalid
      ? `${inputClass} border-red-400/95 focus:border-red-500 focus:ring-red-500/20`
      : inputClass;

    const inner = (
      <label key={field.id} className="block">
        <span
          className={`mb-1.5 block font-medium text-[#0B0B13] ${
            field.type === "yesno" && displayLabel.length > 160
              ? "text-justify text-xs leading-snug sm:text-sm"
              : "text-sm"
          }`}
        >
          {displayLabel}
        </span>
        {field.type === "textarea" ? (
          <textarea
            className={`${inputClass} min-h-[96px]`}
            rows={3}
            placeholder={field.placeholder}
            value={values[field.id] ?? ""}
            onChange={(e) => setField(field.id, e.target.value)}
            onInput={inputTypingFeedback}
            onKeyDown={typingKey}
            required={field.id === NOMBRE_DILIGENCIA_FIELD_ID}
          />
        ) : field.type === "select" ? (
          <select
            className={inputClass}
            value={values[field.id] ?? ""}
            onChange={(e) => {
              playChoiceTick();
              setField(field.id, e.target.value);
            }}
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
            onChange={(e) => {
              playChoiceTick();
              setField(field.id, e.target.value);
            }}
          >
            <option value="">Seleccionar…</option>
            <option value="si">Sí</option>
            <option value="no">No</option>
          </select>
        ) : field.numberFormat ? (
          <KybFormattedNumberField
            id={field.id}
            value={values[field.id] ?? ""}
            onChange={(canon) => setField(field.id, canon)}
            variant={field.numberFormat}
            inputClass={inputClass}
            placeholder={field.placeholder}
            invalid={formatErr !== null}
            onTypingKey={typingKey}
            onInputFeedback={inputTypingFeedback}
          />
        ) : (
          <input
            type={field.type === "email" ? "email" : "text"}
            className={fieldInputClass}
            placeholder={field.placeholder}
            value={values[field.id] ?? ""}
            onChange={(e) => setField(field.id, e.target.value)}
            onInput={inputTypingFeedback}
            onKeyDown={typingKey}
            required={field.id === NOMBRE_DILIGENCIA_FIELD_ID}
            aria-invalid={contactInputInvalid || undefined}
          />
        )}
        {field.hint ? (
          <span className={KYB_FIELD_HINT_CLASS}>{field.hint}</span>
        ) : null}
        {formatErr ? (
          <span className="mt-1.5 block text-xs font-medium text-red-600" role="alert">
            {formatErr}
          </span>
        ) : null}
      </label>
    );
    return wrapField(field, inner);
  };

  if (!started) {
    return (
      <KybLanding
        onContinue={continueFromLanding}
        savedDraftAt={landingDraftAt}
        onStartFresh={startFormFresh}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-8">
        <div className="min-w-0 flex-1 space-y-5">
          {canLeaveIntro ? (
            <KybStepSectionsNavMobile
              steps={visibleSteps}
              activeIndex={effectiveStepIndex}
              onSelectStep={jumpToStep}
            />
          ) : null}
          <motion.div
            id="kyb-wizard-card"
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
              Paso{" "}
              <span className="font-medium text-slate-700">
                {effectiveStepIndex + 1}
              </span>{" "}
              de{" "}
              <span className="font-medium text-slate-700">
                {visibleSteps.length}
              </span>
            </p>
            <p className="mt-2 text-[11px] leading-snug text-slate-400">
              Avance guardado en este navegador.{" "}
              <button
                type="button"
                className="font-medium text-[#4749B6] underline-offset-2 hover:underline"
                onClick={clearLocalDraftOnly}
              >
                Borrar borrador local
              </button>
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
              {step.description.trim() ? (
                <p className={KYB_STEP_DESCRIPTION_CLASS}>{step.description}</p>
              ) : null}

              <div
                className={`space-y-4 ${step.description.trim() ? "mt-7" : "mt-5"}`}
              >
                {step.fields
                  .filter((f) => {
                    if (f.hidden) return false;
                    return isKybStepFieldVisible(step, f, values, fieldVisibilityCtx);
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
                {step.id === JUNTA_DIRECTIVA_STEP_ID &&
                (juntaMemberSlots < JUNTA_MEMBER_SLOTS_MAX ||
                  juntaMemberSlots > 1) ? (
                  <motion.div
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={reduce ? false : { opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-wrap items-center justify-center gap-3 pt-2"
                  >
                    {juntaMemberSlots < JUNTA_MEMBER_SLOTS_MAX ? (
                      <button
                        type="button"
                        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border-2 border-dashed border-[#4749B6]/35 bg-[#4749B6]/[0.04] px-4 py-2.5 text-sm font-semibold text-[#4749B6] shadow-sm transition hover:border-[#4749B6]/55 hover:bg-[#4749B6]/[0.08]"
                        aria-label="Agregar otro miembro de la junta o consejo"
                        onClick={() =>
                          setJuntaMemberSlots((n) =>
                            Math.min(JUNTA_MEMBER_SLOTS_MAX, n + 1),
                          )
                        }
                      >
                        <span className="text-lg leading-none" aria-hidden>
                          +
                        </span>
                        <span className="ml-2">Agregar miembro</span>
                      </button>
                    ) : null}
                    {juntaMemberSlots > 1 ? (
                      <button
                        type="button"
                        className="rounded-xl border border-red-200/90 bg-red-50/80 px-4 py-2.5 text-sm font-semibold text-red-800 shadow-sm transition hover:border-red-300 hover:bg-red-50"
                        aria-label="Eliminar el último miembro añadido y borrar sus datos"
                        onClick={() => {
                          const slot = juntaMemberSlots;
                          setValues((prev) => {
                            const next = { ...prev };
                            for (const id of formKeysForJuntaMemberSlot(slot)) {
                              next[id] = "";
                            }
                            return next;
                          });
                          setJuntaMemberSlots((n) => Math.max(1, n - 1));
                        }}
                      >
                        Eliminar último miembro
                      </button>
                    ) : null}
                  </motion.div>
                ) : null}
                {step.id === BENEFICIARIOS_FINALES_STEP_ID &&
                (bfMemberSlots < BF_MEMBER_SLOTS_MAX || bfMemberSlots > 1) ? (
                  <motion.div
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={reduce ? false : { opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-wrap items-center justify-center gap-3 pt-2"
                  >
                    {bfMemberSlots < BF_MEMBER_SLOTS_MAX ? (
                      <button
                        type="button"
                        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border-2 border-dashed border-[#4749B6]/35 bg-[#4749B6]/[0.04] px-4 py-2.5 text-sm font-semibold text-[#4749B6] shadow-sm transition hover:border-[#4749B6]/55 hover:bg-[#4749B6]/[0.08]"
                        aria-label="Agregar otra fila de beneficiario final o accionista"
                        onClick={() =>
                          setBfMemberSlots((n) =>
                            Math.min(BF_MEMBER_SLOTS_MAX, n + 1),
                          )
                        }
                      >
                        <span className="text-lg leading-none" aria-hidden>
                          +
                        </span>
                        <span className="ml-2">Agregar persona</span>
                      </button>
                    ) : null}
                    {bfMemberSlots > 1 ? (
                      <button
                        type="button"
                        className="rounded-xl border border-red-200/90 bg-red-50/80 px-4 py-2.5 text-sm font-semibold text-red-800 shadow-sm transition hover:border-red-300 hover:bg-red-50"
                        aria-label="Eliminar la última fila añadida y borrar sus datos"
                        onClick={() => {
                          const slot = bfMemberSlots;
                          setValues((prev) => {
                            const next = { ...prev };
                            for (const id of formKeysForBfMemberSlot(slot)) {
                              next[id] = "";
                            }
                            return next;
                          });
                          setBfMemberSlots((n) => Math.max(1, n - 1));
                        }}
                      >
                        Eliminar última fila
                      </button>
                    ) : null}
                  </motion.div>
                ) : null}
                {step.id === PEP_STEP_ID &&
                values.pep_alguno_catalogado === "si" &&
                (pepMemberSlots < PEP_MEMBER_SLOTS_MAX ||
                  pepMemberSlots > 1) ? (
                  <motion.div
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={reduce ? false : { opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-wrap items-center justify-center gap-3 pt-2"
                  >
                    {pepMemberSlots < PEP_MEMBER_SLOTS_MAX ? (
                      <button
                        type="button"
                        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border-2 border-dashed border-[#4749B6]/35 bg-[#4749B6]/[0.04] px-4 py-2.5 text-sm font-semibold text-[#4749B6] shadow-sm transition hover:border-[#4749B6]/55 hover:bg-[#4749B6]/[0.08]"
                        aria-label="Agregar otra persona PEP catalogada"
                        onClick={() =>
                          setPepMemberSlots((n) =>
                            Math.min(PEP_MEMBER_SLOTS_MAX, n + 1),
                          )
                        }
                      >
                        <span className="text-lg leading-none" aria-hidden>
                          +
                        </span>
                        <span className="ml-2">Agregar persona</span>
                      </button>
                    ) : null}
                    {pepMemberSlots > 1 ? (
                      <button
                        type="button"
                        className="rounded-xl border border-red-200/90 bg-red-50/80 px-4 py-2.5 text-sm font-semibold text-red-800 shadow-sm transition hover:border-red-300 hover:bg-red-50"
                        aria-label="Eliminar la última persona añadida y borrar sus datos"
                        onClick={() => {
                          const slot = pepMemberSlots;
                          setValues((prev) => {
                            const next = { ...prev };
                            for (const id of formKeysForPepMemberSlot(slot)) {
                              next[id] = "";
                            }
                            return next;
                          });
                          setPepMemberSlots((n) => Math.max(1, n - 1));
                        }}
                      >
                        Eliminar última persona
                      </button>
                    ) : null}
                  </motion.div>
                ) : null}
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100/90 pt-8">
                <div className="flex flex-wrap items-center gap-3">
                  <motion.button
                    type="button"
                    className="rounded-xl border border-slate-200/95 bg-white/90 px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    disabled={isFirst}
                    onClick={() => {
                      playWizardNav();
                      setStepIndex((j) => Math.max(0, j - 1));
                    }}
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
                        playWizardNav();
                        saveDraft({
                          stepIndex,
                          values,
                          juntaMemberSlots,
                          bfMemberSlots,
                          pepMemberSlots,
                        });
                        setStarted(false);
                        setStepIndex(0);
                        const d = readDraft(steps);
                        setLandingDraftAt(d ? d.savedAt : null);
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
                      disabled={
                        (step.id === "intro_formulario" && !canLeaveIntro) ||
                        (step.id === DECLARACION_STEP_ID &&
                          !puedeContinuarDeclaracion)
                      }
                      onClick={() => {
                        if (step.id === "intro_formulario" && !canLeaveIntro) {
                          return;
                        }
                        if (
                          step.id === DECLARACION_STEP_ID &&
                          !puedeContinuarDeclaracion
                        ) {
                          return;
                        }
                        playWizardNav();
                        setStepIndex((j) =>
                          Math.min(visibleSteps.length - 1, j + 1),
                        );
                      }}
                      whileHover={{
                        scale:
                          (step.id === "intro_formulario" && !canLeaveIntro) ||
                          (step.id === DECLARACION_STEP_ID &&
                            !puedeContinuarDeclaracion)
                            ? 1
                            : 1.03,
                        boxShadow:
                          (step.id === "intro_formulario" && !canLeaveIntro) ||
                          (step.id === DECLARACION_STEP_ID &&
                            !puedeContinuarDeclaracion)
                            ? undefined
                            : "0 12px 28px -6px rgba(71,73,182,0.45)",
                      }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {step.id === DECLARACION_STEP_ID
                        ? "Continuar a firma del representante"
                        : "Siguiente"}
                    </motion.button>
                  ) : esPasoCierre ? (
                    cierreRepresentanteListo ? (
                      <motion.button
                        type="button"
                        className="rounded-xl border border-slate-200/95 bg-white/95 px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm"
                        onClick={() => {
                          redownloadKybPdf();
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Descargar PDF
                      </motion.button>
                    ) : (
                      <p className="max-w-[14rem] text-right text-xs leading-snug text-slate-500 sm:max-w-xs">
                        Cuando el representante termine en el celular, use{" "}
                        <span className="font-medium text-slate-600">
                          Finalizar formulario y descargar PDF
                        </span>{" "}
                        arriba o espere a que avance solo.
                      </p>
                    )
                  ) : (
                    <motion.button
                      type="button"
                      className="rounded-xl bg-gradient-to-b from-[#4749B6] to-[#3B3DA6] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#4749B6]/30"
                      onClick={() => {
                        playWizardNav();
                        void submitDraft();
                      }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      Enviar borrador
                    </motion.button>
                  )}
                </div>
                {draftServerFeedback ? (
                  <p
                    className="mt-4 w-full text-xs text-slate-600"
                    role="status"
                  >
                    {draftServerFeedback}
                  </p>
                ) : null}
              </div>
            </motion.div>
          </AnimatePresence>
        </section>
      </motion.div>
        </div>
        {canLeaveIntro ? (
          <KybStepSectionsNavSidebar
            steps={visibleSteps}
            activeIndex={effectiveStepIndex}
            onSelectStep={jumpToStep}
          />
        ) : null}
      </div>
    </div>
  );
}
