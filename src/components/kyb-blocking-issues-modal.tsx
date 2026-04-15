"use client";

import { useEffect } from "react";

type Props = {
  open: boolean;
  title: string;
  issues: string[];
  onClose: () => void;
  /** Etiqueta del botón principal */
  closeLabel?: string;
};

export function KybBlockingIssuesModal({
  open,
  title,
  issues,
  onClose,
  closeLabel = "Entendido",
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="kyb-blocking-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div className="relative z-10 max-h-[min(85vh,560px)] w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl shadow-slate-900/20">
        <div className="border-b border-slate-100 bg-gradient-to-r from-[#4749B6]/10 to-white px-5 py-4">
          <h2
            id="kyb-blocking-modal-title"
            className="text-base font-bold text-[#0B0B13]"
          >
            {title}
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            Revise los puntos siguientes antes de continuar.
          </p>
        </div>
        <div className="max-h-[min(60vh,420px)] overflow-y-auto px-5 py-4">
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
            {issues.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>
        <div className="border-t border-slate-100 px-5 py-3">
          <button
            type="button"
            className="w-full rounded-xl bg-gradient-to-b from-[#4749B6] to-[#3B3DA6] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#4749B6]/25 transition hover:opacity-[0.97]"
            onClick={onClose}
          >
            {closeLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
