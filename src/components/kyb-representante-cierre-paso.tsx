"use client";

import QRCode from "qrcode";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { KybRepresentanteExitoPanel } from "@/components/kyb-representante-exito-panel";
import type { FormState } from "@/lib/kyb-field-complete";
import type { KybFirmaPaquetePayload } from "@/lib/kyb-firma-paquete";

type PollStatus = "pending" | "partial" | "complete";

const SHARE_TITLE = "Verificación y firma — Formulario KYB Punto Pago";
const SHARE_TEXT =
  "Abra este enlace en su celular para completar la verificación de identidad y la firma digital del formulario.";

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
  const [shareNotice, setShareNotice] = useState<"copied" | "error" | null>(
    null,
  );

  const publicUrl = code
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/verificar-representante?c=${encodeURIComponent(code)}`
    : "";

  const patchFromValues = useMemo(
    () => ({
      decl_metamap_verification_id:
        values.decl_metamap_verification_id ?? "",
      decl_metamap_identity_id: values.decl_metamap_identity_id ?? "",
      decl_firma_canvas_data_url: values.decl_firma_canvas_data_url ?? "",
    }),
    [
      values.decl_metamap_verification_id,
      values.decl_metamap_identity_id,
      values.decl_firma_canvas_data_url,
    ],
  );

  const datosRepresentanteListos =
    (patchFromValues.decl_metamap_verification_id ?? "").trim() !== "" &&
    (patchFromValues.decl_firma_canvas_data_url ?? "").trim() !== "";

  const copyPublicUrl = useCallback(async (): Promise<boolean> => {
    if (!publicUrl) return false;
    try {
      await navigator.clipboard.writeText(publicUrl);
      return true;
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = publicUrl;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        return ok;
      } catch {
        return false;
      }
    }
  }, [publicUrl]);

  const shareOrCopyLink = useCallback(async () => {
    if (!publicUrl) return;
    setShareNotice(null);
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      const payloads: ShareData[] = [
        { title: SHARE_TITLE, text: SHARE_TEXT, url: publicUrl },
        { url: publicUrl },
      ];
      for (const data of payloads) {
        if (typeof navigator.canShare === "function" && !navigator.canShare(data)) {
          continue;
        }
        try {
          await navigator.share(data);
          return;
        } catch (e) {
          if (e instanceof Error && e.name === "AbortError") return;
        }
      }
    }
    const ok = await copyPublicUrl();
    setShareNotice(ok ? "copied" : "error");
  }, [publicUrl, copyPublicUrl]);

  const copyLinkOnly = useCallback(async () => {
    setShareNotice(null);
    const ok = await copyPublicUrl();
    setShareNotice(ok ? "copied" : "error");
  }, [copyPublicUrl]);

  useEffect(() => {
    if (!shareNotice) return;
    const t = window.setTimeout(() => setShareNotice(null), 3500);
    return () => window.clearTimeout(t);
  }, [shareNotice]);

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

  const finalizeWithPatch = useCallback(
    async (patch: Partial<FormState>) => {
      if (finalizarEnCursoRef.current) return;
      finalizarEnCursoRef.current = true;
      setFase("finalizando");
      setErr(null);
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
          "No se pudo generar el PDF o el número de formulario. Recargue la página o pulse Reintentar finalizar.",
        );
      }
    },
    [onFinalizar, setField, onTerminado, onFlushDraft],
  );

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
          const patchToUse =
            Object.keys(patch).length > 0 ? patch : patchFromValues;
          void finalizeWithPatch(patchToUse);
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
  }, [
    code,
    refGuardado,
    onRemotePatch,
    onFlushDraft,
    finalizeWithPatch,
    patchFromValues,
  ]);

  if (fase === "listo" && numeroFormulario) {
    return (
      <KybRepresentanteExitoPanel
        variant="desktop"
        numeroFormulario={numeroFormulario}
      />
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
            alt="Código QR para verificación de identidad y firma digital en el celular del representante o director autorizado"
            width={240}
            height={240}
          />
          <p className="max-w-sm text-center text-xs text-slate-600">
            Si no puede usar la cámara, abra este enlace en el celular del
            representante o director autorizado:
          </p>
          <code className="max-w-full break-all rounded-lg bg-slate-100 px-2 py-2 text-[11px] text-slate-800">
            {publicUrl}
          </code>
          <div className="flex w-full max-w-md flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              type="button"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-b from-[#4749B6] to-[#3B3DA6] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#4749B6]/25 transition hover:opacity-[0.97] active:scale-[0.99]"
              onClick={() => void shareOrCopyLink()}
            >
              Compartir enlace
            </button>
            <button
              type="button"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
              onClick={() => void copyLinkOnly()}
            >
              Copiar enlace
            </button>
          </div>
          <p className="max-w-md text-center text-[11px] leading-snug text-slate-500">
            En el teléfono, «Compartir enlace» abre el menú del sistema (WhatsApp,
            correo, etc.). En la computadora, si no hay menú de compartir, se
            copia el enlace al portapapeles.
          </p>
          {shareNotice === "copied" ? (
            <p
              className="text-center text-xs font-medium text-emerald-700"
              role="status"
            >
              Enlace copiado al portapapeles.
            </p>
          ) : null}
          {shareNotice === "error" ? (
            <p
              className="text-center text-xs font-medium text-red-700"
              role="alert"
            >
              No se pudo copiar. Seleccione el enlace arriba y cópielo manualmente.
            </p>
          ) : null}
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
              Recibiendo datos del móvil… La persona debe completar la{" "}
              <strong>verificación de identidad</strong> y la{" "}
              <strong>firma digital</strong>.
            </p>
          ) : (
            <p>
              <span className="font-semibold">Esperando al representante o director autorizado.</span>{" "}
              Deje esta ventana abierta hasta que termine ambos pasos en el
              dispositivo móvil.
            </p>
          )}
        </div>
      ) : null}

      {datosRepresentanteListos && !refGuardado && fase === "qr" ? (
        <div className="rounded-2xl border border-emerald-200/90 bg-emerald-50/70 p-5 shadow-sm">
          <p className="text-sm font-medium text-emerald-950">
            Verificación y firma ya figuran en el formulario.
          </p>
          <p className="mt-2 text-xs leading-relaxed text-emerald-900/90">
            Si esta pantalla no pasó sola al mensaje de finalizado, pulse el
            botón para generar el PDF y el número de formulario en este equipo.
          </p>
          <button
            type="button"
            className="mt-4 w-full rounded-xl bg-gradient-to-b from-emerald-600 to-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-600/25 transition hover:opacity-[0.97] sm:w-auto"
            onClick={() => void finalizeWithPatch(patchFromValues)}
          >
            Finalizar formulario y descargar PDF
          </button>
        </div>
      ) : null}
    </div>
  );
}
