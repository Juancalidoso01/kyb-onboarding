"use client";

import QRCode from "qrcode";
import { useCallback, useEffect, useRef, useState } from "react";
import { KYB_FIELD_HINT_CLASS } from "@/lib/kyb-prose-classes";
import type { FormState } from "@/lib/kyb-field-complete";
import type { KybFirmaPaquetePayload } from "@/lib/kyb-firma-paquete";

type Props = {
  values: FormState;
  meta: KybFirmaPaquetePayload["meta"];
  onRemotePatch: (patch: Partial<FormState>) => void;
  onFlushDraft: () => void;
};

type PollStatus = "pending" | "partial" | "complete";

export function KybRepresentanteRemotoPanel({
  values,
  meta,
  onRemotePatch,
  onFlushDraft,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [qrSrc, setQrSrc] = useState<string | null>(null);
  const [pollStatus, setPollStatus] = useState<PollStatus | null>(null);
  const lastPatchJson = useRef<string>("");

  const publicUrl = code
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/verificar-representante?c=${encodeURIComponent(code)}`
    : "";

  const generar = useCallback(async () => {
    setErr(null);
    setBusy(true);
    setQrSrc(null);
    setPollStatus(null);
    lastPatchJson.current = "";
    try {
      const r = await fetch("/api/kyb/representante/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values, meta }),
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
        width: 220,
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
  }, [values, meta, onFlushDraft]);

  useEffect(() => {
    if (!code) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const r = await fetch(
          `/api/kyb/representante/session?code=${encodeURIComponent(code)}&role=desktop`,
        );
        const j = (await r.json()) as {
          status?: PollStatus;
          patch?: Partial<FormState> | null;
          error?: string;
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
      } catch {
        /* ignore transient poll errors */
      }
    };
    void tick();
    const id = window.setInterval(tick, 2500);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [code, onRemotePatch, onFlushDraft]);

  return (
    <div
      id="kyb-bloque-enlace-representante"
      className="scroll-mt-28 space-y-4 rounded-2xl border border-[#4749B6]/25 bg-gradient-to-br from-[#4749B6]/[0.07] to-white p-4 shadow-sm sm:p-6"
    >
      <div>
        <h3 className="text-sm font-semibold text-[#0B0B13]">
          Representante legal: firma y verificación (MetaMap)
        </h3>
        <p className={KYB_FIELD_HINT_CLASS}>
          Un solo enlace: genere el código QR para que el director o representante
          abra en su celular, complete la verificación de identidad (documento y
          selfie) y la firma digital. Los datos vuelven automáticamente a este
          formulario.
        </p>
      </div>

      <button
        type="button"
        disabled={busy}
        className="inline-flex w-full min-h-[48px] items-center justify-center rounded-2xl bg-gradient-to-r from-[#4749B6] to-[#3B3DA6] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#4749B6]/25 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => void generar()}
      >
        {busy ? "Generando…" : "Generar código QR para el representante"}
      </button>

      {err ? (
        <p className="rounded-lg border border-red-200 bg-red-50/90 px-3 py-2 text-sm text-red-900">
          {err}
        </p>
      ) : null}

      {qrSrc ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-200/90 bg-white/95 p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrSrc} alt="Código QR para abrir verificación en el móvil" width={220} height={220} />
          <p className="max-w-sm text-center text-xs text-slate-600">
            Escanee con la cámara del teléfono. Si no puede usar QR, copie el enlace:
          </p>
          <code className="max-w-full break-all rounded-lg bg-slate-100 px-2 py-1.5 text-[11px] text-slate-800">
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
            <p className="font-semibold">
              Firma y verificación recibidas en este equipo. Continúe con nombre y
              fecha de declaración abajo; el PDF se generará automáticamente.
            </p>
          ) : pollStatus === "partial" ? (
            <p>
              Recibiendo datos del móvil… complete ambos pasos en el celular
              (MetaMap y firma).
            </p>
          ) : (
            <p>
              <span className="font-semibold">Esperando al representante.</span>{" "}
              Mantenga esta pestaña abierta hasta que termine en el dispositivo
              móvil.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
