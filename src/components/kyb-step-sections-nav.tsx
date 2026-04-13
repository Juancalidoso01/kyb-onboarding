"use client";

import type { KybStep } from "@/lib/kyb-steps";

type Props = {
  steps: KybStep[];
  activeIndex: number;
  onSelectStep: (index: number) => void;
};

function navShortLabel(step: KybStep): string {
  const s = (step.navLabel ?? "").trim();
  return s || step.title;
}

type KybStepPairNavItem = {
  key: string;
  startIndex: number;
  endIndex: number;
  rangeBadge: string;
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
    const rangeBadge = b ? `${n1}–${n2}` : `${n1}`;
    const titleLine = b
      ? `${navShortLabel(a)} · ${navShortLabel(b)}`
      : navShortLabel(a);
    out.push({
      key: `${a.id}${b ? `__${b.id}` : ""}`,
      startIndex: i,
      endIndex,
      rangeBadge,
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
    "w-full rounded-xl border px-3.5 py-2.5 text-left transition duration-200";
  if (active) {
    return `${base} border-[#4749B6]/40 bg-[#4749B6]/[0.09] shadow-sm ring-1 ring-[#4749B6]/15`;
  }
  return `${base} border-slate-200/85 bg-white/95 text-slate-800 hover:border-[#4749B6]/28 hover:bg-white`;
}

/** Resumen en pares (2 secciones), sin scroll interno; etiquetas cortas (`navLabel`). */
export function KybStepSectionsNavMobile({
  steps,
  activeIndex,
  onSelectStep,
}: Props) {
  const pairs = buildStepPairs(steps);
  return (
    <div className="lg:hidden">
      <p className="mb-2.5 text-[11px] font-medium tracking-wide text-slate-500">
        Ir a sección
      </p>
      <nav
        className="flex flex-wrap gap-2.5"
        aria-label="Saltar entre secciones del formulario"
      >
        {pairs.map((pair) => {
          const active = pairIsActive(pair, activeIndex);
          return (
            <button
              key={pair.key}
              type="button"
              onClick={() => onSelectStep(pair.startIndex)}
              className={`${pairButtonClass(active)} min-w-0 flex-[1_1_calc(50%-0.3125rem)] sm:flex-[1_1_calc(33.333%-0.42rem)]`}
            >
              <span className="flex items-center gap-2">
                <span
                  className={`inline-flex h-6 min-w-[1.75rem] items-center justify-center rounded-md px-1.5 text-xs font-semibold tabular-nums ${
                    active
                      ? "bg-[#4749B6] text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {pair.rangeBadge}
                </span>
                <span
                  className={`min-w-0 flex-1 text-sm font-medium leading-snug ${active ? "text-[#0B0B13]" : "text-slate-700"}`}
                >
                  {pair.titleLine}
                </span>
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
    <aside className="hidden w-full max-w-[21rem] shrink-0 lg:block xl:max-w-[22.5rem]">
      <div className="sticky top-24 rounded-2xl border border-slate-200/75 bg-white/90 p-4 shadow-[0_4px_24px_-8px_rgba(15,23,42,0.12)] backdrop-blur-sm">
        <p className="text-xs font-semibold tracking-wide text-slate-600">
          Secciones
        </p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">
          Guía rápida: cada fila son dos pasos. Pulse para ir al primero del
          bloque.
        </p>
        <nav
          className="mt-4 flex flex-col gap-2"
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
                <span className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 inline-flex h-7 min-w-[2rem] shrink-0 items-center justify-center rounded-lg px-2 text-xs font-bold tabular-nums ${
                      active
                        ? "bg-[#4749B6] text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {pair.rangeBadge}
                  </span>
                  <span
                    className={`min-w-0 flex-1 text-[15px] font-medium leading-snug tracking-tight ${active ? "text-[#0B0B13]" : "text-slate-700"}`}
                  >
                    {pair.titleLine}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
