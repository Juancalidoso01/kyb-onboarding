"use client";

import type { FormEvent, KeyboardEvent } from "react";
import {
  formatQuantityForDisplay,
  formatUsdForDisplay,
  parseQuantityInputToCanonical,
  parseUsdInputToCanonical,
} from "@/lib/kyb-number-input-format";

type Props = {
  id: string;
  value: string;
  onChange: (canonical: string) => void;
  variant: "usd" | "quantity";
  inputClass: string;
  placeholder?: string;
  invalid?: boolean;
  onTypingKey?: (e: KeyboardEvent<HTMLInputElement>) => void;
  onInputFeedback?: (e: FormEvent<HTMLInputElement>) => void;
};

/**
 * Montos USD (prefijo US$) o cantidades enteras con separadores de miles al escribir.
 */
export function KybFormattedNumberField({
  id,
  value,
  onChange,
  variant,
  inputClass,
  placeholder,
  invalid,
  onTypingKey,
  onInputFeedback,
}: Props) {
  const display =
    variant === "usd"
      ? formatUsdForDisplay(value)
      : formatQuantityForDisplay(value);

  const baseInvalid = invalid
    ? "border-red-400/95 focus:border-red-500 focus:ring-red-500/20"
    : "";

  const common =
    `${inputClass} tabular-nums ${baseInvalid}`.trim();

  const onInput = (e: FormEvent<HTMLInputElement>) => {
    onInputFeedback?.(e);
    const raw = e.currentTarget.value;
    const canon =
      variant === "usd"
        ? parseUsdInputToCanonical(raw)
        : parseQuantityInputToCanonical(raw);
    onChange(canon);
  };

  if (variant === "usd") {
    return (
      <div className="relative">
        <span
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500"
          aria-hidden
        >
          US$
        </span>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          className={`${common} pl-[3.25rem]`}
          placeholder={placeholder ?? "0"}
          value={display}
          onChange={onInput}
          onKeyDown={onTypingKey}
          aria-invalid={invalid || undefined}
          aria-describedby={undefined}
        />
      </div>
    );
  }

  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      className={common}
      placeholder={placeholder ?? "0"}
      value={display}
      onChange={onInput}
      onKeyDown={onTypingKey}
      aria-invalid={invalid || undefined}
    />
  );
}
