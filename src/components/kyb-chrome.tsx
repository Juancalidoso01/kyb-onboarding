"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { PpAmbient } from "@/components/pp-ambient";
import { useKybPersonalizationOptional } from "@/context/kyb-personalization";
import {
  KYB_LOCAL_STORAGE_KEY,
  readDiligenciaNombreFromDraft,
  readDraft,
  shouldShowFirmaDirectorNav,
} from "@/lib/kyb-local-draft";
import { KYB_STEPS } from "@/lib/kyb-steps";

const BUSINESS_HUB_URL = "https://puntopago.net/business/paymentshub/";

export function KybChrome({ children }: { children: ReactNode }) {
  const personalization = useKybPersonalizationOptional();
  const liveNombre = (personalization?.liveDiligenciaNombre ?? "").trim();
  const [draftNombre, setDraftNombre] = useState("");
  const [showFirmaDirector, setShowFirmaDirector] = useState(false);

  const syncFromStorage = useCallback(() => {
    setDraftNombre(readDiligenciaNombreFromDraft(KYB_STEPS));
    setShowFirmaDirector(shouldShowFirmaDirectorNav(readDraft(KYB_STEPS)));
  }, []);

  useEffect(() => {
    syncFromStorage();
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === KYB_LOCAL_STORAGE_KEY) syncFromStorage();
    };
    const onDraftSaved: EventListener = () => syncFromStorage();
    window.addEventListener("storage", onStorage);
    window.addEventListener("kyb-draft-saved", onDraftSaved);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("kyb-draft-saved", onDraftSaved);
    };
  }, [syncFromStorage]);

  const headerNombre = liveNombre || draftNombre;

  return (
    <div className="pp-page-bg relative min-h-screen">
      <PpAmbient />
      <header className="sticky top-0 z-50 border-b border-white/60 bg-white/80 shadow-sm shadow-slate-900/[0.04] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-start justify-between gap-4 px-4 py-3 sm:items-center sm:px-6 sm:py-3.5">
          <a
            href="https://puntopago.net/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex min-w-0 flex-1 items-start gap-2.5 sm:items-center"
          >
            <span
              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#4749B6] to-[#3B3DA6] text-sm font-bold text-white shadow-md shadow-[#4749B6]/30 ring-1 ring-white/20 transition duration-300 group-hover:scale-105 group-hover:shadow-lg sm:mt-0"
              aria-hidden
            >
              PP
            </span>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block text-[15px] font-bold tracking-tight text-[#0B0B13]">
                Punto Pago
              </span>
              <span className="mt-0.5 block text-[11px] font-medium text-slate-500">
                Onboarding · Persona jurídica
              </span>
              {headerNombre ? (
                <span className="mt-2 block text-sm leading-snug text-slate-700">
                  <span className="font-semibold text-[#4749B6]">
                    {headerNombre}
                  </span>
                  {", sigamos con la siguiente información."}
                </span>
              ) : null}
            </span>
          </a>
          <nav className="flex shrink-0 flex-wrap items-center justify-end gap-1 sm:flex-nowrap">
            {showFirmaDirector ? (
              <a
                href="/firmar-director"
                className="rounded-lg px-2.5 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-[#4749B6] sm:px-3 sm:text-sm"
              >
                Firma del director
              </a>
            ) : null}
            <a
              href={BUSINESS_HUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg px-2.5 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-[#4749B6] sm:px-3 sm:text-sm"
            >
              Business
            </a>
            <a
              href="https://puntopago.net/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg px-2.5 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-[#4749B6] sm:px-3 sm:text-sm"
            >
              Sitio principal
            </a>
          </nav>
        </div>
        <div
          className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#4749B6]/40 to-transparent"
          aria-hidden
        />
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pt-10">
        {children}
      </main>

      <footer className="relative z-10 border-t border-white/50 bg-white/55 py-8 text-center text-xs text-slate-500 backdrop-blur-md">
        <p>
          <span className="font-medium text-slate-600">Grupo Punto Pago</span>
          {" · "}
          Formulario de debida diligencia (KYB).{" "}
          <a
            href="https://puntopago.net/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#4749B6] underline-offset-2 hover:underline"
          >
            puntopago.net
          </a>
        </p>
      </footer>
    </div>
  );
}
