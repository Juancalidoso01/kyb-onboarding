import type { ReactNode } from "react";

const BUSINESS_HUB_URL = "https://puntopago.net/business/paymentshub/";

export function KybChrome({ children }: { children: ReactNode }) {
  return (
    <div className="pp-page-bg min-h-screen">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
          <a
            href="https://puntopago.net/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2.5"
          >
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4749B6] text-sm font-bold text-white shadow-sm ring-1 ring-black/5 transition group-hover:bg-[#3B3DA6]"
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

      <main className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6 sm:pt-10">
        {children}
      </main>

      <footer className="border-t border-slate-200/80 bg-white/60 py-8 text-center text-xs text-slate-500 backdrop-blur-sm">
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
