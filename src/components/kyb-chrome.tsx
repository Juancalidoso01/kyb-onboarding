"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { PpAmbient } from "@/components/pp-ambient";
import {
  KYB_LOCAL_STORAGE_KEY,
  readDraft,
  shouldShowFirmaDirectorNav,
} from "@/lib/kyb-local-draft";
import { KYB_STEPS } from "@/lib/kyb-steps";

const BUSINESS_HUB_URL = "https://puntopago.net/business/paymentshub/";

export function KybChrome({ children }: { children: ReactNode }) {
  const [showFirmaDirector, setShowFirmaDirector] = useState(false);

  const syncFirmaNav = useCallback(() => {
    setShowFirmaDirector(shouldShowFirmaDirectorNav(readDraft(KYB_STEPS)));
  }, []);

  useEffect(() => {
    syncFirmaNav();
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === KYB_LOCAL_STORAGE_KEY) syncFirmaNav();
    };
    const onDraftSaved: EventListener = () => syncFirmaNav();
    window.addEventListener("storage", onStorage);
    window.addEventListener("kyb-draft-saved", onDraftSaved);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("kyb-draft-saved", onDraftSaved);
    };
  }, [syncFirmaNav]);

  return (
    <div className="pp-page-bg relative min-h-screen">
      <PpAmbient />
      <header className="sticky top-0 z-50 border-b border-white/60 bg-white/80 shadow-sm shadow-slate-900/[0.04] backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
          <a
            href="https://puntopago.net/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2.5"
          >
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#4749B6] to-[#3B3DA6] text-sm font-bold text-white shadow-md shadow-[#4749B6]/30 ring-1 ring-white/20 transition duration-300 group-hover:scale-105 group-hover:shadow-lg"
              aria-hidden
            >
              PP
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-[15px] font-bold tracking-tight text-[#0B0B13]">
                Punto Pago
              </span>
              <span className="text-[11px] font-medium text-slate-500">
                Onboarding · Persona jurídica
              </span>
            </span>
          </a>
          <nav className="hidden items-center gap-1 sm:flex">
            {showFirmaDirector ? (
              <a
                href="/firmar-director"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-[#4749B6]"
              >
                Firma del director
              </a>
            ) : null}
            <a
              href={BUSINESS_HUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-[#4749B6]"
            >
              Business
            </a>
            <a
              href="https://puntopago.net/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-[#4749B6]"
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

      <main className="relative z-10 mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6 sm:pt-10">
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
