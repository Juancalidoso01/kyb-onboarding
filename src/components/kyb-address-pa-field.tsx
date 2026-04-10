"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { KeyboardEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { PANAMA_ADDRESS_LOCAL_SUGGESTIONS } from "@/data/panama-address-seed";
import {
  formatGeoapifyDisplay,
  geoapifyAutocompletePanamaClientSide,
  geoapifyParsedSummary,
  type GeoapifyAddressItem,
} from "@/lib/geoapify-address";

/** Tiempo mínimo de la animación de “carga de base” al montar el campo. */
const MIN_BOOT_MS = 1400;

const OTHER_OPTION = "Otra dirección (especificar)";

function parsedFromLocalPick(addr: string): string {
  if (addr === OTHER_OPTION) return "";
  const m = addr.match(/^(.+),\s*(.+)$/);
  if (m) {
    return `Barrio / corregimiento: ${m[1].trim()} · Provincia / región: ${m[2].trim()}`;
  }
  return "";
}

type SuggestionRow =
  | { kind: "local"; text: string }
  | { kind: "api"; text: string; item: GeoapifyAddressItem };

export type KybAddressStructuredMeta = {
  provincia: string;
  ciudad: string;
};

type Props = {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  inputClass: string;
  onTypingKey: (e: KeyboardEvent) => void;
  /** Al elegir sugerencia del API o de la lista local con formato «barrio, provincia». */
  onStructuredFromApi?: (meta: KybAddressStructuredMeta) => void;
};

export function KybAddressPaField({
  label,
  hint,
  value,
  onChange,
  inputClass,
  onTypingKey,
  onStructuredFromApi,
}: Props) {
  const [booting, setBooting] = useState(true);
  const [inputValue, setInputValue] = useState(value);
  const [open, setOpen] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [rows, setRows] = useState<SuggestionRow[]>([]);
  const [parsedHint, setParsedHint] = useState("");
  const selectedRef = useRef("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestSeq = useRef(0);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    let cancel = false;
    const t = window.setTimeout(() => {
      if (!cancel) setBooting(false);
    }, MIN_BOOT_MS);
    return () => {
      cancel = true;
      window.clearTimeout(t);
    };
  }, []);

  const finalizePick = useCallback(
    (text: string, parsed: string) => {
      const t = text.trim();
      selectedRef.current = t;
      setInputValue(t);
      onChange(t);
      setParsedHint(parsed);
      setOpen(false);
      setFetching(false);
      setRows([]);
      requestSeq.current += 1;
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    },
    [onChange],
  );

  const renderLocalRows = useCallback((raw: string) => {
    const lower = raw.toLowerCase();
    const matches = PANAMA_ADDRESS_LOCAL_SUGGESTIONS.filter((a) =>
      a.toLowerCase().includes(lower),
    );
    const out: SuggestionRow[] = [];
    if (matches.length === 0) {
      out.push({ kind: "local", text: OTHER_OPTION });
    } else {
      for (const a of matches) {
        out.push({ kind: "local", text: a });
      }
    }
    setRows(out);
    setOpen(true);
  }, []);

  const runSearch = useCallback(
    (raw: string, seq: number) => {
      const val = raw.trim();
      if (!val) {
        setRows([]);
        setOpen(false);
        setFetching(false);
        return;
      }
      const useRemote = val.length >= 2;
      if (useRemote) {
        setFetching(true);
        setOpen(true);
        setRows([]);
        debounceRef.current = setTimeout(() => {
          void geoapifyAutocompletePanamaClientSide(val)
            .then((items) => {
              if (seq !== requestSeq.current) return;
              setFetching(false);
              if (items.length > 0) {
                const apiRows: SuggestionRow[] = items.map((it) => ({
                  kind: "api" as const,
                  text: formatGeoapifyDisplay(it) || "Dirección",
                  item: it,
                }));
                apiRows.push({ kind: "local", text: OTHER_OPTION });
                setRows(apiRows);
              } else {
                renderLocalRows(val);
              }
              setOpen(true);
            })
            .catch(() => {
              if (seq !== requestSeq.current) return;
              setFetching(false);
              renderLocalRows(val);
              setOpen(true);
            });
        }, 250);
        return;
      }
      setFetching(false);
      renderLocalRows(val);
    },
    [renderLocalRows],
  );

  const onInputChange = (raw: string) => {
    if (selectedRef.current && raw.trim() !== selectedRef.current) {
      selectedRef.current = "";
    }
    setInputValue(raw);
    onChange(raw);
    if (!raw.trim()) {
      setParsedHint("");
      setRows([]);
      setOpen(false);
      setFetching(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const seq = ++requestSeq.current;
    runSearch(raw, seq);
  };

  const onPick = (row: SuggestionRow) => {
    if (row.kind === "local") {
      if (row.text === OTHER_OPTION) {
        finalizePick(inputValue, "");
        return;
      }
      const m = row.text.match(/^(.+),\s*(.+)$/);
      onStructuredFromApi?.({
        ciudad: m ? m[1].trim() : "",
        provincia: m ? m[2].trim() : "",
      });
      finalizePick(row.text, parsedFromLocalPick(row.text));
      return;
    }
    const item = row.item;
    onStructuredFromApi?.({
      provincia: (item.state ?? "").trim(),
      ciudad: (
        item.city ||
        item.suburb ||
        item.county ||
        ""
      ).trim(),
    });
    const fmt = formatGeoapifyDisplay(item);
    finalizePick(fmt, geoapifyParsedSummary(item));
  };

  return (
    <div className="relative block">
      <span className="mb-1.5 block text-sm font-medium text-[#0B0B13]">
        {label}
      </span>
      <p className="mb-2 text-xs text-slate-600">
        Escriba calle, barrio o zona y elija una sugerencia de la lista. Se
        combinan opciones frecuentes con búsqueda de direcciones en Panamá.
      </p>

      <div className="relative min-h-[96px]">
        <AnimatePresence>
          {booting ? (
            <motion.div
              key="boot"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-200/90 bg-white/92 px-4 py-6 backdrop-blur-sm"
              role="status"
              aria-live="polite"
              aria-label="Cargando sugerencias de dirección"
            >
              <span
                className="h-9 w-9 shrink-0 rounded-full border-2 border-[#4749B6]/20 border-t-[#4749B6] animate-spin"
                aria-hidden
              />
              <p className="text-center text-sm font-medium text-slate-700">
                Preparando direcciones para Panamá…
              </p>
              <p className="text-center text-xs text-slate-500">
                Un momento por favor.
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className={booting ? "pointer-events-none opacity-40" : ""}>
          <div className="relative">
            <textarea
              rows={3}
              className={`${inputClass} min-h-[96px] resize-y`}
              autoComplete="off"
              placeholder="Ej: Av. Central, Bella Vista, Panamá"
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={(e) => {
                onTypingKey(e);
                if (e.key === "Escape") {
                  setOpen(false);
                }
              }}
              onFocus={() => {
                if (inputValue.trim()) {
                  const seq = ++requestSeq.current;
                  runSearch(inputValue, seq);
                }
              }}
              onBlur={() => {
                window.setTimeout(() => {
                  setOpen(false);
                  setFetching(false);
                }, 160);
              }}
            />
            <AnimatePresence>
              {fetching && open ? (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute left-0 right-0 top-full z-30 mt-1 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-600 shadow-lg"
                >
                  <span
                    className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-[#4749B6]/25 border-t-[#4749B6] animate-spin"
                    aria-hidden
                  />
                  Consultando servicio de direcciones…
                </motion.div>
              ) : null}
            </AnimatePresence>

            {open && !fetching && rows.length > 0 ? (
              <ul
                id="kyb-address-pa-suggestions"
                role="listbox"
                className="absolute left-0 right-0 top-full z-40 mt-1 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-xl"
              >
                {rows.map((row, i) => {
                  const isOther = row.kind === "local" && row.text === OTHER_OPTION;
                  return (
                    <li
                      key={`${row.kind}-${i}-${row.text.slice(0, 24)}`}
                      role="option"
                      aria-selected={false}
                      className={
                        isOther
                          ? "cursor-pointer border-t border-slate-200 bg-amber-50/80 px-4 py-2.5 text-sm text-slate-700 hover:bg-amber-50"
                          : "cursor-pointer border-t border-slate-100 px-4 py-2.5 text-sm text-slate-800 first:border-t-0 hover:bg-[#4749B6]/[0.06]"
                      }
                      onMouseDown={(e) => {
                        e.preventDefault();
                        onPick(row);
                      }}
                    >
                      {row.text}
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>

          {parsedHint ? (
            <p className="mt-2 text-xs text-slate-600">{parsedHint}</p>
          ) : null}
          {hint ? (
            <span className="mt-1.5 block text-xs text-slate-500">{hint}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
