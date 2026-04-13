"use client";

import type { FormEvent, KeyboardEvent } from "react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { isValidPanamaDate } from "@/lib/kyb-date";

type Props = {
  value: string;
  onChange: (v: string) => void;
  className: string;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  onInput?: (e: FormEvent<HTMLInputElement>) => void;
};

const MONTHS_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
] as const;

const WEEKDAYS_ES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"] as const;

const MIN_YEAR = 1900;
const MAX_YEAR = 2100;

function parsePanamaParts(s: string): { d: number; m: number; y: number } | null {
  const t = s.trim();
  if (!isValidPanamaDate(t)) return null;
  const [dd, mm, yyyy] = t.split("-").map(Number);
  return { d: dd, m: mm, y: yyyy };
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function buildCells(year: number, monthIndex: number): (number | null)[] {
  const firstDow = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function todayParts() {
  const n = new Date();
  return { y: n.getFullYear(), m: n.getMonth(), d: n.getDate() };
}

/**
 * Campo de fecha DD-MM-AAAA: escritura directa + calendario con selector de mes y año (salto rápido a fechas antiguas).
 */
export function KybDateField({
  value,
  onChange,
  className,
  onKeyDown,
  onInput,
}: Props) {
  const uid = useId();
  const panelId = `${uid}-panel`;
  const containerRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  const parsed = useMemo(() => parsePanamaParts(value), [value]);
  const initialView = useMemo(() => {
    if (parsed) return { y: parsed.y, m: parsed.m - 1 };
    const t = todayParts();
    return { y: t.y, m: t.m };
  }, [parsed]);

  const [viewY, setViewY] = useState(initialView.y);
  const [viewM, setViewM] = useState(initialView.m);

  useEffect(() => {
    if (!open) return;
    setViewY(initialView.y);
    setViewM(initialView.m);
  }, [open, initialView.y, initialView.m]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const cells = useMemo(() => buildCells(viewY, viewM), [viewY, viewM]);
  const t = todayParts();
  const isToday = (day: number) =>
    day > 0 && viewY === t.y && viewM === t.m && day === t.d;
  const isSelected = (day: number) =>
    Boolean(parsed && viewY === parsed.y && viewM === parsed.m - 1 && day === parsed.d);

  const yearOptions = useMemo(() => {
    const out: number[] = [];
    for (let y = MAX_YEAR; y >= MIN_YEAR; y--) out.push(y);
    return out;
  }, []);

  const pickDay = (day: number) => {
    onChange(`${pad(day)}-${pad(viewM + 1)}-${viewY}`);
    setOpen(false);
    btnRef.current?.focus();
  };

  const shiftMonth = (delta: number) => {
    const d = new Date(viewY, viewM + delta, 1);
    let y = d.getFullYear();
    let m = d.getMonth();
    if (y < MIN_YEAR) {
      y = MIN_YEAR;
      m = 0;
    }
    if (y > MAX_YEAR) {
      y = MAX_YEAR;
      m = 11;
    }
    setViewY(y);
    setViewM(m);
  };

  const panelClass =
    "absolute left-0 top-full z-[60] mt-1.5 w-[min(100vw-2rem,320px)] rounded-xl border border-slate-200/95 bg-white p-3 shadow-lg shadow-slate-900/10 ring-1 ring-slate-900/5";

  const controlSelect =
    "rounded-lg border border-slate-200/95 bg-white px-2 py-1.5 text-sm font-medium text-slate-800 outline-none transition focus:border-[#4749B6] focus:ring-2 focus:ring-[#4749B6]/20";

  const navBtn =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200/90 text-slate-600 transition hover:border-[#4749B6]/35 hover:bg-[#4749B6]/[0.06] hover:text-[#4749B6] focus:outline-none focus:ring-2 focus:ring-[#4749B6]/25";

  return (
    <div ref={containerRef} className="relative flex flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-2">
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="DD-MM-AAAA"
          className={`min-w-0 flex-1 ${className}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onInput={onInput}
          onKeyDown={onKeyDown}
          aria-describedby={`${uid}-hint`}
        />
        <button
          ref={btnRef}
          type="button"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200/95 bg-white/95 px-3.5 py-2.5 text-sm font-semibold text-[#4749B6] shadow-sm outline-none transition hover:border-[#4749B6]/40 hover:bg-[#4749B6]/[0.06] focus:border-[#4749B6] focus:ring-2 focus:ring-[#4749B6]/20 sm:min-w-[52px]"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-controls={panelId}
          title="Abrir calendario"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
          <span className="sm:sr-only">Calendario</span>
        </button>
      </div>

      <p id={`${uid}-hint`} className="text-xs text-slate-500">
        Escriba la fecha o use el calendario. Mes y año se eligen en listas para ir rápido a fechas
        antiguas.
      </p>

      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label="Seleccionar fecha"
          className={panelClass}
        >
          <div className="mb-2 flex items-center gap-1.5">
            <button type="button" className={navBtn} onClick={() => shiftMonth(-1)} aria-label="Mes anterior">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <select
              className={`${controlSelect} min-w-0 flex-1`}
              value={viewM}
              onChange={(e) => setViewM(Number(e.target.value))}
              aria-label="Mes"
            >
              {MONTHS_ES.map((name, i) => (
                <option key={name} value={i}>
                  {name}
                </option>
              ))}
            </select>
            <select
              className={`${controlSelect} w-[5.5rem] sm:w-24`}
              value={viewY}
              onChange={(e) => setViewY(Number(e.target.value))}
              aria-label="Año"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <button type="button" className={navBtn} onClick={() => shiftMonth(1)} aria-label="Mes siguiente">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {WEEKDAYS_ES.map((w) => (
              <div key={w} className="py-1">
                {w}
              </div>
            ))}
          </div>

          <div className="mt-0.5 grid grid-cols-7 gap-1">
            {cells.map((day, i) =>
              day === null ? (
                <div key={`e-${i}`} className="aspect-square" />
              ) : (
                <button
                  key={`${viewY}-${viewM}-${day}`}
                  type="button"
                  onClick={() => pickDay(day)}
                  className={`flex aspect-square items-center justify-center rounded-lg text-sm font-medium transition ${
                    isSelected(day)
                      ? "bg-[#4749B6] text-white shadow-md shadow-[#4749B6]/25"
                      : isToday(day)
                        ? "bg-[#4749B6]/12 text-[#4749B6] ring-1 ring-[#4749B6]/30"
                        : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {day}
                </button>
              ),
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2">
            <button
              type="button"
              className="text-xs font-semibold text-[#4749B6] hover:underline"
              onClick={() => {
                const { y, m, d } = todayParts();
                onChange(`${pad(d)}-${pad(m + 1)}-${y}`);
                setOpen(false);
                btnRef.current?.focus();
              }}
            >
              Hoy
            </button>
            <button
              type="button"
              className="text-xs font-medium text-slate-500 hover:text-slate-700"
              onClick={() => {
                onChange("");
                setOpen(false);
                btnRef.current?.focus();
              }}
            >
              Limpiar
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
