"use client";

import type { KybStep } from "@/lib/kyb-steps";

type Props = {
  steps: KybStep[];
  activeIndex: number;
  onSelectStep: (index: number) => void;
};

type KybStepPairNavItem = {
  key: string;
  startIndex: number;
  endIndex: number;
  rangeLabel: string;
  titleLine: string;
};

function buildStepPairs(steps: KybStep[]): KybStepPairNavItem[] {
  const out: KybStepPairNavItem[] = [];
  for (let i = 0; i < steps.length; i += 2) {
    const a = steps[i];
    const b = steps[i + 1];
    const endIndex = b ? i + 1 : i;
    const n1 = i + 1;
    const n2 = endIndex + 1;
    const rangeLabel = b ? `Pasos ${n1}–${n2}` : `Paso ${n1}`;
    const titleLine = b ? `${a.title} · ${b.title}` : a.title;
    out.push({
      key: `${a.id}${b ? `__${b.id}` : ""}`,
      startIndex: i,
      endIndex,
      rangeLabel,
      titleLine,
    });
  }
  return out;
}

function pairIsActive(pair: KybStepPairNavItem, activeIndex: number): boolean {
  return activeIndex >= pair.startIndex && activeIndex <= pair.endIndex;
}

function pairButtonClass(active: boolean): string {
  const base =
    "w-full rounded-2xl border px-4 py-3.5 text-left transition duration-200";
  if (active) {
    return `${base} border-[#4749B6]/45 bg-[#4749B6]/[0.11] shadow-sm ring-1 ring-[#4749B6]/20`;
  }
  return `${base} border-slate-200/90 bg-white/90 text-slate-800 shadow-sm hover:border-[#4749B6]/35 hover:bg-white`;
}

/** Resumen en pares (2 secciones), sin scroll interno; se envuelve en varias líneas. */
export function KybStepSectionsNavMobile({
  steps,
  activeIndex,
  onSelectStep,
}: Props) {
  const pairs = buildStepPairs(steps);
  return (
    <div className="lg:hidden">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        Ir a sección
      </p>
      <nav
        className="flex flex-wrap gap-3"
        aria-label="Saltar entre secciones del formulario"
      >
        {pairs.map((pair) => {
          const active = pairIsActive(pair, activeIndex);
          return (
            <button
              key={pair.key}
              type="button"
              onClick={() => onSelectStep(pair.startIndex)}
              className={`${pairButtonClass(active)} min-w-0 flex-[1_1_calc(50%-0.375rem)] sm:flex-[1_1_calc(33.333%-0.5rem)]`}
            >
              <span
                className={`block text-[11px] font-bold uppercase tracking-wide ${active ? "text-[#4749B6]" : "text-slate-500"}`}
              >
                {pair.rangeLabel}
              </span>
              <span
                className={`mt-1 block text-sm font-semibold leading-snug ${active ? "text-[#0B0B13]" : "text-slate-800"}`}
              >
                {pair.titleLine}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export function KybStepSectionsNavSidebar({
  steps,
  activeIndex,
  onSelectStep,
}: Props) {
  const pairs = buildStepPairs(steps);
  return (
    <aside className="hidden w-[min(100%,20rem)] shrink-0 lg:block">
      <div className="sticky top-24 rounded-2xl border border-slate-200/80 bg-white/85 p-4 shadow-sm backdrop-blur-sm">
        <p className="border-b border-slate-100 pb-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          Secciones
        </p>
        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          Cada bloque agrupa dos pasos. Pulse para ir al inicio de ese bloque.
        </p>
        <nav
          className="mt-4 flex flex-col gap-2.5"
          aria-label="Saltar entre secciones del formulario"
        >
          {pairs.map((pair) => {
            const active = pairIsActive(pair, activeIndex);
            return (
              <button
                key={pair.key}
                type="button"
                onClick={() => onSelectStep(pair.startIndex)}
                className={pairButtonClass(active)}
              >
                <span
                  className={`block text-[11px] font-bold uppercase tracking-wide ${active ? "text-[#4749B6]" : "text-slate-500"}`}
                >
                  {pair.rangeLabel}
                </span>
                <span
                  className={`mt-1.5 block text-sm font-semibold leading-snug ${active ? "text-[#0B0B13]" : "text-slate-800"}`}
                >
                  {pair.titleLine}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
