"use client";

import type { KeyboardEvent } from "react";
import { useMemo } from "react";
import { normalizePhoneDigits } from "@/lib/kyb-format-validation";

type Props = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  dialDigits: string | null;
  splitPrefix: boolean;
  inputClass: string;
  invalid: boolean;
  placeholder?: string;
  hint?: string;
  formatErr: string | null;
  onTypingKey: (e: KeyboardEvent) => void;
};

export function KybPhoneField({
  label,
  value,
  onChange,
  dialDigits,
  splitPrefix,
  inputClass,
  invalid,
  placeholder,
  hint,
  formatErr,
  onTypingKey,
}: Props) {
  const hasMultiNumberSeparators = useMemo(
    () => Boolean(value.trim()) && /[,;/|]/.test(value),
    [value],
  );

  const internationalMismatch = useMemo(() => {
    if (!splitPrefix || !dialDigits || !value.trim()) return false;
    if (hasMultiNumberSeparators) return true;
    const allD = normalizePhoneDigits(value);
    const dialN = normalizePhoneDigits(dialDigits);
    return !allD.startsWith(dialN);
  }, [value, dialDigits, splitPrefix, hasMultiNumberSeparators]);

  const useSplit =
    Boolean(splitPrefix && dialDigits) && !internationalMismatch;

  const nationalDigits = useMemo(() => {
    if (!useSplit || !dialDigits) return "";
    const allD = normalizePhoneDigits(value);
    const dialN = normalizePhoneDigits(dialDigits);
    if (allD.startsWith(dialN)) return allD.slice(dialN.length);
    return "";
  }, [value, dialDigits, useSplit]);

  const placeholderText = placeholder;

  if (!useSplit) {
    return (
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-[#0B0B13]">
          {label}
        </span>
        <input
          type="tel"
          className={inputClass}
          placeholder={
            dialDigits
              ? `Ej. +${dialDigits} … (varios: coma)`
              : placeholderText
          }
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onTypingKey}
          onFocus={() => {
            if (!dialDigits || value.trim()) return;
            onChange(`+${dialDigits} `);
          }}
          aria-invalid={invalid || undefined}
        />
        {hint ? (
          <span className="mt-1.5 block text-xs text-slate-500">{hint}</span>
        ) : null}
        {formatErr ? (
          <span
            className="mt-1.5 block text-xs font-medium text-red-600"
            role="alert"
          >
            {formatErr}
          </span>
        ) : null}
      </label>
    );
  }

  const onNationalChange = (raw: string) => {
    const n = normalizePhoneDigits(raw);
    if (!dialDigits) {
      onChange(n);
      return;
    }
    if (n === "") onChange("");
    else onChange(`+${dialDigits}${n}`);
  };

  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-[#0B0B13]">
        {label}
      </span>
      <div className="flex min-w-0 gap-2">
        <span
          className="inline-flex shrink-0 items-center rounded-xl border border-slate-200/95 bg-slate-50/90 px-3 py-2.5 text-sm font-semibold tabular-nums text-slate-700"
          aria-hidden
        >
          +{dialDigits}
        </span>
        <input
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          className={`min-w-0 flex-1 ${inputClass}`}
          placeholder={
            placeholderText ?? "Fijo o celular, 8 dígitos locales"
          }
          value={nationalDigits}
          onChange={(e) => onNationalChange(e.target.value)}
          onPaste={(e) => {
            const t = e.clipboardData.getData("text");
            if (/[,;/|]/.test(t)) {
              e.preventDefault();
              onChange(t.trim());
            }
          }}
          onKeyDown={onTypingKey}
          aria-invalid={invalid || undefined}
        />
      </div>
      {hint ? (
        <span className="mt-1.5 block text-xs text-slate-500">{hint}</span>
      ) : null}
      {formatErr ? (
        <span
          className="mt-1.5 block text-xs font-medium text-red-600"
          role="alert"
        >
          {formatErr}
        </span>
      ) : null}
    </label>
  );
}
