"use client";

import QRCode from "qrcode";
import { useCallback, useEffect, useRef, useState } from "react";
import { KYB_FIELD_HINT_CLASS } from "@/lib/kyb-prose-classes";
import type { FormState } from "@/lib/kyb-field-complete";
import type { KybFirmaPaquetePayload } from "@/lib/kyb-firma-paquete";

type PollStatus = "pending" | "partial" | "complete";

type Props = {
  values: FormState;
  meta: KybFirmaPaquetePayload["meta"];
  onRemotePatch: (patch: Partial<FormState>) => void;
  onFlushDraft: () => void;
  setField: (id: string, v: string) => void;
  onFinalizar: (patch: Partial<FormState>) => Promise<string>;
  onTerminado: () => void;
};

export function KybRepresentanteCierrePaso({
  values,
  meta,
  onRemotePatch,
  onFlushDraft,
  setField,
  onFinalizar,
  onTerminado,
}: Props) {
  const refGuardado = (values.decl_formulario_ref ?? "").trim();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [qrSrc, setQrSrc] = useState<string | null>(null);
  const [pollStatus, setPollStatus] = useState<PollStatus | null>(null);
  const lastPatchJson = useRef<string>("");
  const finalizarEnCursoRef = useRef(false);
  const sesionIniciadaRef = useRef(false);
  const valuesRef = useRef(values);
  valuesRef.current = values;
  const metaRef = useRef(meta);
  metaRef.current = meta;
  const [fase, setFase] = useState<
    "qr" | "finalizando" | "listo"
  >(refGuardado ? "listo" : "qr");
  const [numeroFormulario, setNumeroFormulario] = useState(refGuardado);

  const publicUrl = code
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/verificar-representante?c=${encodeURIComponent(code)}`
    : "";

  const crearSesion = useCallback(async () => {
    setErr(null);
    setBusy(true);
    setQrSrc(null);
    setPollStatus(null);
    lastPatchJson.current = "";
    try {
      const r = await fetch("/api/kyb/representante/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          values: valuesRef.current,
          meta: metaRef.current,
        }),
      });
      const j = (await r.json()) as { code?: string; error?: string };
      if (!r.ok || !j.code) {
        setErr(j.error ?? "No se pudo crear el enlace. Intente de nuevo.");
        setCode(null);
        return;
      }
      setCode(j.code);
      const url = `${window.location.origin}/verificar-representante?c=${encodeURIComponent(j.code)}`;
      const dataUrl = await QRCode.toDataURL(url, {
        width: 240,
        margin: 2,
        color: { dark: "#0f172a", light: "#ffffffff" },
      });
      setQrSrc(dataUrl);
      onFlushDraft();
    } catch {
      setErr("Error de red al generar el código.");
      setCode(null);
    } finally {
      setBusy(false);
    }
  }, [onFlushDraft]);

  useEffect(() => {
    if (refGuardado || sesionIniciadaRef.current) return;
    sesionIniciadaRef.current = true;
    void crearSesion();
  }, [refGuardado, crearSesion]);

  useEffect(() => {
    if (!code || refGuardado) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const r = await fetch(
          `/api/kyb/representante/session?code=${encodeURIComponent(code)}&role=desktop`,
        );
        const j = (await r.json()) as {
          status?: PollStatus;
          patch?: Partial<FormState> | null;
        };
        if (cancelled || !r.ok) return;
        const st = j.status ?? "pending";
        setPollStatus(st);
        const patch = j.patch ?? {};
        const pj = JSON.stringify(patch);
        if (pj !== lastPatchJson.current && Object.keys(patch).length > 0) {
          lastPatchJson.current = pj;
          onRemotePatch(patch);
          onFlushDraft();
        }
        if (st === "complete" && !finalizarEnCursoRef.current) {
          finalizarEnCursoRef.current = true;
          setFase("finalizando");
          try {
            const ref = await onFinalizar(patch);
            setField("decl_formulario_ref", ref);
            setNumeroFormulario(ref);
            setFase("listo");
            onTerminado();
            onFlushDraft();
          } catch {
            finalizarEnCursoRef.current = false;
            setFase("qr");
            setErr(
              "No se pudo generar el PDF o el número de formulario. Recargue la página o pulse Reintentar.",
            );
          }
        }
      } catch {
        /* ignore */
      }
    };
    void tick();
    const id = window.setInterval(tick, 2500);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [code, refGuardado, onRemotePatch, onFlushDraft, onFinalizar, setField, onTerminado]);

  if (fase === "listo" && numeroFormulario) {
    return (
      <div className="space-y-5 rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/95 via-white to-[#4749B6]/[0.06] p-6 shadow-sm sm:p-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-800">
            Gracias por completar el proceso
          </p>
          <h3 className="mt-2 text-xl font-bold text-[#0B0B13]">
            Formulario enviado correctamente
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">
            La verificación de identidad (MetaMap) y la firma digital quedaron
            registradas. Se descargó el PDF con el resumen; consérvelo para sus
            registros y compártalo con su asesor de Punto Pago.
          </p>
          <div className="mt-6 rounded-xl border border-slate-200/90 bg-white px-4 py-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Número de formulario
            </p>
            <p className="mt-1 font-mono text-lg font-bold text-[#4749B6]">
              {numeroFormulario}
            </p>
            <p className="mt-2 text-xs text-slate-600">
              Use este número como referencia ante Punto Pago o en cualquier
              seguimiento.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (fase === "finalizando") {
    return (
      <div
        className="rounded-2xl border border-[#4749B6]/25 bg-white/95 p-8 text-center shadow-sm"
        role="status"
        aria-live="polite"
      >
        <p className="text-sm font-semibold text-[#4749B6]">
          Finalizando formulario…
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Generando PDF y asignando número de referencia.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-2xl border border-[#4749B6]/25 bg-gradient-to-br from-[#4749B6]/[0.07] to-white p-5 shadow-sm sm:p-7">
      <div>
        <h3 className="text-base font-semibold text-[#0B0B13]">
          Firma y verificación del representante legal
        </h3>
        <p className={KYB_FIELD_HINT_CLASS}>
          En un solo flujo en el celular del director o representante: validación
          de identidad con MetaMap (documento y selfie) y firma digital. Escanee
          el código QR con la cámara del teléfono; no hace falta instalar una app.
        </p>
      </div>

      {busy && !qrSrc ? (
        <p className="text-sm text-slate-600">Preparando código QR…</p>
      ) : null}

      {err ? (
        <div className="space-y-3">
          <p className="rounded-lg border border-red-200 bg-red-50/90 px-3 py-2 text-sm text-red-900">
            {err}
          </p>
          <button
            type="button"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
            onClick={() => void crearSesion()}
          >
            Reintentar
          </button>
        </div>
      ) : null}

      {qrSrc ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-slate-200/90 bg-white/95 p-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrSrc}
            alt="Código QR: verificación MetaMap y firma en el móvil"
            width={240}
            height={240}
          />
          <p className="max-w-sm text-center text-xs text-slate-600">
            Si no puede usar la cámara, abra este enlace en el celular del
            representante:
          </p>
          <code className="max-w-full break-all rounded-lg bg-slate-100 px-2 py-2 text-[11px] text-slate-800">
            {publicUrl}
          </code>
        </div>
      ) : null}

      {code ? (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            pollStatus === "complete"
              ? "border-emerald-200/90 bg-emerald-50/90 text-emerald-950"
              : pollStatus === "partial"
                ? "border-amber-200/90 bg-amber-50/80 text-amber-950"
                : "border-slate-200/90 bg-slate-50/90 text-slate-800"
          }`}
          role="status"
          aria-live="polite"
        >
          {pollStatus === "complete" ? (
            <p className="font-medium">Verificación y firma recibidas.</p>
          ) : pollStatus === "partial" ? (
            <p>
              Recibiendo datos del móvil… El representante debe completar{" "}
              <strong>MetaMap</strong> y <strong>firma digital</strong>.
            </p>
          ) : (
            <p>
              <span className="font-semibold">Esperando al representante.</span>{" "}
              Deje esta ventana abierta hasta que termine ambos pasos en el
              dispositivo móvil.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
