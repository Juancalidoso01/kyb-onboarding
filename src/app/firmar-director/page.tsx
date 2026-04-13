"use client";

import { useCallback, useState } from "react";
import { KybChrome } from "@/components/kyb-chrome";
import { KybDeclaracionResumen } from "@/components/kyb-declaracion-resumen";
import type { KybFirmaPaquetePayload } from "@/lib/kyb-firma-paquete";
import { parseFirmaPaqueteJson } from "@/lib/kyb-firma-paquete";
import { KYB_FIELD_HINT_CLASS } from "@/lib/kyb-prose-classes";
import {
  DECLARACION_STEP_ID,
  filterStepsByCotizaBolsa,
  KYB_STEPS,
} from "@/lib/kyb-steps";

export default function FirmarDirectorPage() {
  const [payload, setPayload] = useState<KybFirmaPaquetePayload | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const onFile = useCallback((file: File | null) => {
    setErr(null);
    setPayload(null);
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      const p = parseFirmaPaqueteJson(text);
      if (!p) {
        setErr(
          "No se reconoció el archivo. Debe ser el .json generado desde el formulario KYB (paquete para el director).",
        );
        return;
      }
      setPayload(p);
    };
    reader.onerror = () => setErr("No se pudo leer el archivo.");
    reader.readAsText(file);
  }, []);

  const visibleSteps = payload
    ? filterStepsByCotizaBolsa(KYB_STEPS, payload.meta.cotiza_bolsa).filter(
        (s) => s.id !== DECLARACION_STEP_ID,
      )
    : [];
  const vis = payload?.meta ?? {
    juntaMemberSlots: 1,
    bfMemberSlots: 1,
    pepMemberSlots: 1,
  };

  return (
    <KybChrome>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-xl font-bold text-[#0B0B13]">
          Revisión y firma del director
        </h1>
        <p className={KYB_FIELD_HINT_CLASS + " mt-2"}>
          Esta página está pensada para quien <strong>debe validar</strong> el
          borrador (director u oficial facultado), normalmente en otro equipo.
          Cargue el archivo <code className="rounded bg-slate-100 px-1 text-xs">.json</code>{" "}
          que le enviaron desde el formulario de onboarding.
        </p>

        <div className="mt-6 rounded-xl border border-slate-200/95 bg-white/90 p-4 shadow-sm">
          <label className="block text-sm font-semibold text-slate-800">
            Cargar paquete KYB (.json)
          </label>
          <input
            type="file"
            accept="application/json,.json"
            className="mt-2 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#4749B6]/10 file:px-3 file:py-2 file:text-xs file:font-medium file:text-[#4749B6]"
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
          />
        </div>

        {err ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50/90 px-3 py-2 text-sm text-red-900">
            {err}
          </p>
        ) : null}

        {payload ? (
          <div className="mt-8 space-y-6">
            <p className="text-sm text-slate-600">
              Versión formulario:{" "}
              <span className="font-mono text-xs">{payload.pdfFormVersion}</span>{" "}
              · Generado:{" "}
              {new Date(payload.createdAt).toLocaleString("es-PA", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
            <KybDeclaracionResumen
              steps={visibleSteps}
              values={payload.values}
              visibility={{
                juntaMemberSlots: vis.juntaMemberSlots,
                bfMemberSlots: vis.bfMemberSlots,
                pepMemberSlots: vis.pepMemberSlots,
              }}
            />
            {(payload.values.decl_metamap_verification_id ?? "").trim() ? (
              <div className="rounded-xl border border-slate-200/90 bg-white p-4 text-sm shadow-sm">
                <p className="font-semibold text-[#0B0B13]">
                  Verificación MetaMap (referencia)
                </p>
                <p className="mt-1 font-mono text-xs text-slate-700">
                  verificationId:{" "}
                  {(payload.values.decl_metamap_verification_id ?? "").trim()}
                </p>
                {(payload.values.decl_metamap_identity_id ?? "").trim() ? (
                  <p className="mt-1 font-mono text-xs text-slate-600">
                    identityId:{" "}
                    {(payload.values.decl_metamap_identity_id ?? "").trim()}
                  </p>
                ) : null}
              </div>
            ) : null}
            <div className="rounded-xl border border-emerald-200/90 bg-emerald-50/60 p-4 text-sm text-emerald-950">
              Si el resumen es correcto y está alineado con las facultades de la
              empresa, coordine con Grupo Punto Pago el canal oficial para la firma
              y el envío de documentación (el archivo JSON no sustituye por sí solo
              una firma electrónica certificada).
            </div>
          </div>
        ) : null}
      </div>
    </KybChrome>
  );
}
