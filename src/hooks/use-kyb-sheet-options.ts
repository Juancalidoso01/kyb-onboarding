"use client";

import { useEffect, useState } from "react";
import {
  FALLBACK_ACTIVIDADES,
  FALLBACK_PROFESIONES,
} from "@/lib/kyb-sheet-csv";

export type SheetOptionsKind = "actividades" | "profesiones";

function fallbackFor(kind: SheetOptionsKind) {
  return kind === "profesiones" ? FALLBACK_PROFESIONES : FALLBACK_ACTIVIDADES;
}

export function useKybSheetOptions(kind: SheetOptionsKind) {
  const [options, setOptions] = useState<{ value: string; label: string }[]>(() =>
    fallbackFor(kind),
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fallback = fallbackFor(kind);

    fetch(`/api/kyb/sheet-options?kind=${kind}`)
      .then(async (r) => {
        const j: unknown = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const opts = (j as { options?: unknown }).options;
        if (!Array.isArray(opts) || opts.length === 0) return fallback;
        return opts as { value: string; label: string }[];
      })
      .then((opts) => {
        if (!cancelled) setOptions(opts);
      })
      .catch(() => {
        if (!cancelled) setOptions(fallback);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [kind]);

  return { options, loading };
}

export function useActivityOptions() {
  return useKybSheetOptions("actividades");
}

export function useProfessionOptions() {
  return useKybSheetOptions("profesiones");
}
