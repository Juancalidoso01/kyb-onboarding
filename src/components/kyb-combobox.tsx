"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";

export type ComboboxOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

/** Cada palabra del texto de búsqueda debe aparecer en la etiqueta (más tolerante que un solo substring). */
function labelMatchesQuery(label: string, value: string, queryNorm: string): boolean {
  if (!queryNorm) return true;
  const hay = `${norm(label)} ${norm(value)}`;
  const words = queryNorm.split(/\s+/).filter((w) => w.length > 0);
  if (words.length === 0) return true;
  return words.every((w) => hay.includes(w));
}

function isOptDisabled(o: ComboboxOption): boolean {
  return Boolean(o.disabled) || o.value.startsWith("__section_");
}

type Props = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  className: string;
  emptyMessage?: string;
  onTypingKey?: (e: KeyboardEvent<HTMLInputElement>) => void;
  /** Toque al escribir (móvil: teclado virtual). Mismo filtrado que en el wizard. */
  onInputFeedback?: (e: FormEvent<HTMLInputElement>) => void;
  disabled?: boolean;
};

export function KybCombobox({
  id: externalId,
  value,
  onChange,
  options,
  placeholder = "Buscar o seleccionar…",
  className,
  emptyMessage = "Sin coincidencias",
  onTypingKey,
  onInputFeedback,
  disabled = false,
}: Props) {
  const uid = useId();
  const listId = `${uid}-list`;
  const inputId = externalId ?? `${uid}-input`;

  const selected = useMemo(
    () => options.find((o) => o.value === value),
    [options, value],
  );
  const selectedLabel = selected?.label ?? "";

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const [hi, setHi] = useState(0);

  const filtered = useMemo(() => {
    const q = norm(query.trim());
    if (!q) return options;
    return options.filter((o) => labelMatchesQuery(o.label, o.value, q));
  }, [options, query]);

  const selectable = useMemo(
    () => filtered.filter((o) => !isOptDisabled(o)),
    [filtered],
  );

  useEffect(() => {
    if (open) setHi(0);
  }, [open, query, filtered.length]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const pick = useCallback(
    (opt: ComboboxOption) => {
      if (isOptDisabled(opt)) return;
      onChange(opt.value);
      setQuery("");
      setOpen(false);
    },
    [onChange],
  );

  const displayValue = open ? query : selectedLabel;

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    onTypingKey?.(e);
    if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
      return;
    }
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      setQuery(selectedLabel);
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHi((i) => Math.min(i + 1, Math.max(0, selectable.length - 1)));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHi((i) => Math.max(0, i - 1));
    }
    if (e.key === "Enter" && selectable[hi]) {
      e.preventDefault();
      pick(selectable[hi]);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        id={inputId}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        disabled={disabled}
        className={className}
        placeholder={placeholder}
        value={displayValue}
        onChange={(e) => {
          const v = e.target.value;
          setQuery(v);
          setOpen(true);
          if (!v) onChange("");
        }}
        onInput={(e) => {
          onInputFeedback?.(e);
        }}
        onFocus={() => {
          setOpen(true);
          setQuery(selectedLabel);
        }}
        onKeyDown={onKeyDown}
      />
      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-slate-200/95 bg-white py-1 text-sm shadow-lg"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-slate-500">{emptyMessage}</li>
          ) : (
            (() => {
              let sIdx = -1;
              return filtered.map((opt, i) => {
                const dis = isOptDisabled(opt);
                if (!dis) sIdx++;
                const isHi = !dis && sIdx === hi;
                return (
                  <li
                    key={`${opt.value}-${opt.label}-${i}`}
                    role="option"
                    aria-selected={value === opt.value}
                    aria-disabled={dis}
                    className={`px-3 py-2 ${
                      dis
                        ? "cursor-default bg-slate-50/90 font-semibold text-slate-500"
                        : `cursor-pointer text-slate-800 hover:bg-slate-50 ${
                            isHi ? "bg-[#4749B6]/12" : ""
                          }`
                    }`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      if (!dis) pick(opt);
                    }}
                  >
                    {opt.label}
                  </li>
                );
              });
            })()
          )}
        </ul>
      )}
    </div>
  );
}
