"use client";

import Script from "next/script";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { KYB_FIELD_HINT_CLASS } from "@/lib/kyb-prose-classes";
import type { FormState } from "@/lib/kyb-field-complete";
import { getMetamapPublicConfig } from "@/lib/kyb-metamap-config";

const METAMAP_SCRIPT_SRC = "https://web-button.metamap.com/button.js";

type Props = {
  values: FormState;
  setField: (id: string, v: string) => void;
};

export function KybMetamapDirectorKyc({ values, setField }: Props) {
  const cfg = getMetamapPublicConfig();
  const [scriptReady, setScriptReady] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const metadataJson = useMemo(
    () =>
      JSON.stringify({
        source: "kyb-onboarding-pj",
        razonSocial: (values.razon_social ?? "").trim(),
        repCorreo: (values.rep_correo ?? "").trim(),
        nombreDiligencia: (values.nombre_diligencia ?? "").trim(),
      }),
    [values.razon_social, values.rep_correo, values.nombre_diligencia],
  );

  const attachListeners = useCallback(
    (el: HTMLElement) => {
      const onStart = () => {
        window.__kybMetamapModalOpen = true;
      };
      const onFinish = (e: Event) => {
        window.__kybMetamapModalOpen = false;
        const d = (e as CustomEvent<Record<string, unknown>>).detail ?? {};
        const verificationId = String(
          (d as { verificationId?: string }).verificationId ??
            (d as { verification_id?: string }).verification_id ??
            "",
        );
        const identityId = String(
          (d as { identityId?: string }).identityId ??
            (d as { identity_id?: string }).identity_id ??
            "",
        );
        setField("decl_metamap_verification_id", verificationId);
        setField("decl_metamap_identity_id", identityId.trim());
      };
      const onExit = () => {
        window.__kybMetamapModalOpen = false;
      };
      el.addEventListener("metamap:userStartedSdk", onStart);
      el.addEventListener("metamap:userFinishedSdk", onFinish);
      el.addEventListener("metamap:exitedSdk", onExit);
      return () => {
        el.removeEventListener("metamap:userStartedSdk", onStart);
        el.removeEventListener("metamap:userFinishedSdk", onFinish);
        el.removeEventListener("metamap:exitedSdk", onExit);
      };
    },
    [setField],
  );

  useEffect(() => {
    if (!scriptReady || !cfg || !wrapRef.current) return;
    const host = wrapRef.current;
    host.replaceChildren();
    const btn = document.createElement("metamap-button");
    btn.setAttribute("clientid", cfg.clientId);
    btn.setAttribute("flowId", cfg.flowId);
    btn.setAttribute("metadata", metadataJson);
    btn.className =
      "absolute inset-0 z-20 min-h-[52px] min-w-[200px] block cursor-pointer opacity-0";
    btn.setAttribute("aria-label", "Iniciar verificación de identidad MetaMap");
    host.appendChild(btn);
    const detach = attachListeners(btn);
    return () => {
      detach();
      host.replaceChildren();
    };
  }, [scriptReady, cfg, metadataJson, attachListeners]);

  const vid = (values.decl_metamap_verification_id ?? "").trim();
  const hasVerification = vid.length > 0;

  return (
    <div className="space-y-4">
      <Script
        src={METAMAP_SCRIPT_SRC}
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />
      <div>
        <h3 className="text-sm font-semibold text-[#0B0B13]">
          Verificación de identidad del director o representante (MetaMap)
        </h3>
        <p className={KYB_FIELD_HINT_CLASS}>
          El director o representante legal debe validar identidad con documento
          vigente y selfie. Los metadatos envían razón social y correo del
          representante ya diligenciados para correlación en Metamap.
        </p>
      </div>

      {hasVerification ? (
        <div className="rounded-xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/90 to-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-emerald-900">
            Verificación registrada
          </p>
          <p className="mt-1 font-mono text-xs text-emerald-800">
            verificationId: {vid}
          </p>
          {(values.decl_metamap_identity_id ?? "").trim() ? (
            <p className="mt-1 font-mono text-xs text-emerald-700">
              identityId: {(values.decl_metamap_identity_id ?? "").trim()}
            </p>
          ) : null}
          <button
            type="button"
            className="mt-3 text-sm font-medium text-[#4749B6] underline-offset-2 hover:underline"
            onClick={() => {
              setField("decl_metamap_verification_id", "");
              setField("decl_metamap_identity_id", "");
            }}
          >
            Borrar y repetir verificación
          </button>
        </div>
      ) : (
        <div className="relative w-full min-h-[52px]">
          <div
            ref={wrapRef}
            className="absolute inset-0 z-20 min-h-[52px]"
            aria-hidden
          />
          <button
            type="button"
            className="pointer-events-none relative z-10 flex w-full min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#4749B6] to-[#3B3DA6] px-6 py-4 text-base font-bold text-white shadow-lg shadow-[#4749B6]/30"
            tabIndex={-1}
          >
            Verificar identidad (selfie y documento)
          </button>
          {!scriptReady ? (
            <p className="mt-2 text-center text-xs text-slate-500">
              Cargando verificación…
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
