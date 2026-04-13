"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { KybChrome } from "@/components/kyb-chrome";
import { KybFirmaDigitalPanel } from "@/components/kyb-firma-digital-panel";
import { KybMetamapDirectorKyc } from "@/components/kyb-metamap-director-kyc";
import { KYB_FIELD_HINT_CLASS } from "@/lib/kyb-prose-classes";
import type { FormState } from "@/lib/kyb-field-complete";
import type { KybFirmaPaquetePayload } from "@/lib/kyb-firma-paquete";

function emptyPatch(): Pick<
  FormState,
  | "decl_metamap_verification_id"
  | "decl_metamap_identity_id"
  | "decl_firma_canvas_data_url"
> {
  return {
    decl_metamap_verification_id: "",
    decl_metamap_identity_id: "",
    decl_firma_canvas_data_url: "",
  };
}

function VerificarRepresentanteInner() {
  const sp = useSearchParams();
  const code = (sp.get("c") ?? "").trim();
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState<FormState | null>(null);
  const [sent, setSent] = useState(false);
  const lastSentFp = useRef<string>("");

  const setField = useCallback((id: string, v: string) => {
    setValues((prev) => (prev ? { ...prev, [id]: v } : prev));
  }, []);

  const valuesRef = useRef(values);
  valuesRef.current = values;

  useEffect(() => {
    if (!code) {
      setLoading(false);
      setErr("Falta el código en el enlace. Vuelva a escanear el QR desde el formulario KYB.");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(
          `/api/kyb/representante/session?code=${encodeURIComponent(code)}&role=mobile`,
        );
        const j = (await r.json()) as {
          values?: FormState;
          meta?: KybFirmaPaquetePayload["meta"];
          error?: string;
        };
        if (cancelled) return;
        if (!r.ok || !j.values) {
          setErr(j.error === "not_found" ? "El enlace expiró o no es válido. Solicite un nuevo QR." : "No se pudo cargar la sesión.");
          setValues(null);
          return;
        }
        setValues({
          ...j.values,
          ...emptyPatch(),
        });
        setErr(null);
      } catch {
        if (!cancelled) setErr("Error de red.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code]);

  useEffect(() => {
    const v = valuesRef.current;
    if (!code || !v) return;
    const vid = (v.decl_metamap_verification_id ?? "").trim();
    const sig = (v.decl_firma_canvas_data_url ?? "").trim();
    if (!vid || !sig) {
      setSent(false);
      return;
    }
    const fp = `${vid.length}:${sig.slice(0, 80)}`;
    if (lastSentFp.current === fp) return;
    const t = window.setTimeout(async () => {
      try {
        const cur = valuesRef.current;
        if (!cur) return;
        const r = await fetch("/api/kyb/representante/session", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code,
            decl_metamap_verification_id:
              cur.decl_metamap_verification_id ?? "",
            decl_metamap_identity_id: cur.decl_metamap_identity_id ?? "",
            decl_firma_canvas_data_url: cur.decl_firma_canvas_data_url ?? "",
          }),
        });
        if (r.ok) {
          lastSentFp.current = fp;
          setSent(true);
        }
      } catch {
        /* retry on next effect cycle */
      }
    }, 600);
    return () => window.clearTimeout(t);
  }, [
    code,
    values?.decl_metamap_verification_id,
    values?.decl_metamap_identity_id,
    values?.decl_firma_canvas_data_url,
  ]);

  return (
    <KybChrome>
      <div className="mx-auto max-w-lg px-4 py-8 sm:px-6">
        <h1 className="text-xl font-bold text-[#0B0B13]">
          Verificación del representante
        </h1>
        <p className={KYB_FIELD_HINT_CLASS + " mt-2"}>
          Complete la verificación de identidad con MetaMap y luego su firma
          digital. Al terminar ambos pasos, los datos se envían al formulario en
          el equipo donde se generó el código.
        </p>

        {loading ? (
          <p className="mt-6 text-sm text-slate-600">Cargando…</p>
        ) : null}

        {err ? (
          <p className="mt-6 rounded-lg border border-red-200 bg-red-50/90 px-3 py-2 text-sm text-red-900">
            {err}
          </p>
        ) : null}

        {values && !err ? (
          <div className="mt-8 space-y-10">
            <KybMetamapDirectorKyc values={values} setField={setField} />
            <div className="border-t border-slate-200/90 pt-8">
              <KybFirmaDigitalPanel values={values} setField={setField} />
            </div>
            {sent ? (
              <div className="rounded-xl border border-emerald-200/90 bg-emerald-50/90 p-4 text-sm font-medium text-emerald-950">
                Listo. Los datos se sincronizaron con el formulario principal.
                Puede cerrar esta página.
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </KybChrome>
  );
}

export default function VerificarRepresentantePage() {
  return (
    <Suspense
      fallback={
        <KybChrome>
          <div className="mx-auto max-w-lg px-4 py-10 text-sm text-slate-600">
            Cargando…
          </div>
        </KybChrome>
      }
    >
      <VerificarRepresentanteInner />
    </Suspense>
  );
}
