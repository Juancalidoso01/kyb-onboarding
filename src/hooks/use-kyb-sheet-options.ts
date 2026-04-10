"use client";

import { useEffect, useState } from "react";
import {
  FALLBACK_ACTIVIDADES,
  FALLBACK_PROFESIONES,
} from "@/lib/kyb-sheet-csv";
import { loadSheetOptionsClient } from "@/lib/kyb-sheet-load-client";

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

    loadSheetOptionsClient(kind)
      .then((opts) => {
        if (!cancelled) setOptions(opts.length > 0 ? opts : fallback);
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
