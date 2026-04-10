"use client";

import type { KeyboardEvent } from "react";
import { isoToPanama, panamaToIso } from "@/lib/kyb-date";

type Props = {
  value: string;
  onChange: (v: string) => void;
  className: string;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
};

/**
 * Calendario nativo (type=date) + valor almacenado como DD-MM-AAAA.
 */
export function KybDateField({ value, onChange, className, onKeyDown }: Props) {
  const iso = panamaToIso(value.trim());

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
      <input
        type="date"
        className={className}
        value={iso}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v ? isoToPanama(v) : "");
        }}
        onKeyDown={onKeyDown}
        lang="es-PA"
      />
      <span className="text-xs text-slate-500">Formato: DD-MM-AAAA</span>
    </div>
  );
}
