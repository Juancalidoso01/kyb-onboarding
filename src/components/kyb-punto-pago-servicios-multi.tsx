"use client";

import { useEffect, useId, useRef, useState } from "react";
import { PP_SERVICIOS_MULTI_OPTIONS } from "@/lib/kyb-steps";
import { KYB_FIELD_HINT_CLASS } from "@/lib/kyb-prose-classes";
import type { FormState } from "@/lib/kyb-field-complete";
import { playChoiceTick } from "@/lib/kyb-sounds";

type Props = {
  values: FormState;
  setField: (id: string, v: string) => void;
  label: string;
  hint?: string;
};

export function KybPuntoPagoServiciosMulti({
  values,
  setField,
  label,
  hint,
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const btnId = useId();

  const selected = PP_SERVICIOS_MULTI_OPTIONS.filter(
    (o) => values[o.id] === "true",
  );

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = (id: string) => {
    playChoiceTick();
    const on = values[id] === "true";
    setField(id, on ? "" : "true");
  };

  const remove = (id: string) => {
    playChoiceTick();
    setField(id, "");
  };

  return (
    <div ref={rootRef} className="relative">
      <span className="mb-1.5 block text-sm font-medium text-[#0B0B13]">
        {label}
      </span>

      <button
        type="button"
        id={btnId}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => {
          playChoiceTick();
          setOpen((o) => !o);
        }}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200/95 bg-white/95 px-4 py-3 text-left text-sm text-slate-900 shadow-sm outline-none transition hover:border-[#4749B6]/35 focus:border-[#4749B6] focus:ring-2 focus:ring-[#4749B6]/20"
      >
        <span className="text-slate-700">
          {selected.length === 0 ? (
            <span className="text-slate-400">
              Elija uno o más servicios…
            </span>
          ) : (
            <span className="font-medium text-[#4749B6]">
              {selected.length} seleccionado{selected.length === 1 ? "" : "s"}
            </span>
          )}
        </span>
        <svg
          className={`h-5 w-5 shrink-0 text-[#4749B6] transition-transform ${
            open ? "rotate-180" : ""
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open ? (
        <div
          className="absolute left-0 right-0 z-40 mt-2 max-h-72 overflow-y-auto rounded-xl border border-slate-200/95 bg-white py-1 shadow-lg ring-1 ring-slate-900/5"
          role="listbox"
          aria-multiselectable="true"
          aria-labelledby={btnId}
        >
          {PP_SERVICIOS_MULTI_OPTIONS.map((opt) => {
            const active = values[opt.id] === "true";
            return (
              <button
                key={opt.id}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => toggle(opt.id)}
                className={`flex w-full items-start gap-3 px-4 py-3 text-left text-sm transition ${
                  active
                    ? "bg-[#4749B6]/[0.08] text-[#0B0B13]"
                    : "text-slate-800 hover:bg-slate-50"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition ${
                    active
                      ? "border-[#4749B6] bg-[#4749B6] text-white"
                      : "border-slate-300 bg-white"
                  }`}
                  aria-hidden
                >
                  {active ? (
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : null}
                </span>
                <span className="leading-snug">{opt.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="mt-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
          Opciones seleccionadas
        </p>
        {selected.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200/90 bg-slate-50/80 px-3 py-4 text-center text-sm text-slate-400">
            Aún no ha elegido servicios. Use el botón de arriba para abrir la lista.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {selected.map((opt) => (
              <li
                key={opt.id}
                className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-[#4749B6]/25 bg-[#4749B6]/[0.09] pl-2.5 pr-1 py-1 text-sm text-[#0B0B13]"
              >
                <span className="truncate">{opt.label}</span>
                <button
                  type="button"
                  className="shrink-0 rounded-md p-1 text-[#4749B6] hover:bg-[#4749B6]/15"
                  aria-label={`Quitar ${opt.label}`}
                  onClick={() => remove(opt.id)}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {hint ? <p className={`mt-4 ${KYB_FIELD_HINT_CLASS}`}>{hint}</p> : null}
    </div>
  );
}
