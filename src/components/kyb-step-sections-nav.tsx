"use client";

import type { KybStep } from "@/lib/kyb-steps";

type Props = {
  steps: KybStep[];
  activeIndex: number;
  onSelectStep: (index: number) => void;
};

function stepButtonClass(active: boolean): string {
  const base =
    "flex w-full items-start gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs leading-snug transition duration-200";
  if (active) {
    return `${base} bg-[#4749B6]/12 font-semibold text-[#4749B6] ring-1 ring-[#4749B6]/25 shadow-sm`;
  }
  return `${base} text-slate-600 hover:bg-slate-100/90 hover:text-[#0B0B13]`;
}

/** Carrusel horizontal arriba del formulario (móvil / tablet). */
export function KybStepSectionsNavMobile({
  steps,
  activeIndex,
  onSelectStep,
}: Props) {
  return (
    <div className="lg:hidden">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        Ir a sección
      </p>
      <nav
        className="-mx-1 flex gap-2 overflow-x-auto pb-2 pt-0.5 [scrollbar-color:rgba(71,73,182,0.35)_transparent]"
        aria-label="Saltar entre secciones del formulario"
      >
        {steps.map((st, i) => (
          <button
            key={st.id}
            type="button"
            onClick={() => onSelectStep(i)}
            className={`max-w-[min(220px,72vw)] shrink-0 rounded-xl border px-3 py-2 text-left text-xs font-medium leading-snug transition ${
              i === activeIndex
                ? "border-[#4749B6]/40 bg-[#4749B6]/10 text-[#4749B6]"
                : "border-slate-200/90 bg-white/90 text-slate-700 shadow-sm hover:border-[#4749B6]/30"
            }`}
          >
            <span className="tabular-nums text-[10px] font-bold text-slate-400">
              {i + 1}/{steps.length}
            </span>
            <span className="mt-0.5 line-clamp-2 block">{st.title}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

/** Leyenda fija a la derecha del formulario (escritorio). */
export function KybStepSectionsNavSidebar({
  steps,
  activeIndex,
  onSelectStep,
}: Props) {
  return (
    <aside className="hidden w-56 shrink-0 lg:block">
      <div className="sticky top-24 rounded-2xl border border-slate-200/80 bg-white/80 p-3 shadow-sm backdrop-blur-sm">
        <p className="border-b border-slate-100 pb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
          Secciones
        </p>
        <p className="mt-2 text-[10px] leading-relaxed text-slate-400">
          Pulse para ir directamente a un paso.
        </p>
        <nav
          className="mt-3 max-h-[min(70vh,36rem)] space-y-0.5 overflow-y-auto pr-1 [scrollbar-color:rgba(148,163,184,0.5)_transparent]"
          aria-label="Saltar entre secciones del formulario"
        >
          {steps.map((st, i) => (
            <button
              key={st.id}
              type="button"
              onClick={() => onSelectStep(i)}
              className={stepButtonClass(i === activeIndex)}
            >
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[10px] font-bold tabular-nums ${
                  i === activeIndex
                    ? "bg-[#4749B6] text-white"
                    : "bg-slate-200/80 text-slate-600"
                }`}
              >
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 hyphens-auto [overflow-wrap:anywhere]">
                {st.title}
              </span>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}
