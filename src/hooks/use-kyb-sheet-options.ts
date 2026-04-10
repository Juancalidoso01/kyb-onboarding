"use client";

import { useEffect, useState } from "react";
import { appendActivityNotListedOption } from "@/lib/kyb-activity-extra-option";
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
  const [options, setOptions] = useState<{ value: string; label: string }[]>(() => {
    const base = fallbackFor(kind);
    return kind === "actividades" ? appendActivityNotListedOption(base) : base;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fallback = fallbackFor(kind);

    loadSheetOptionsClient(kind)
      .then((opts) => {
        if (!cancelled) setOptions(opts);
      })
      .catch(() => {
        if (!cancelled) {
          setOptions(
            kind === "actividades"
              ? appendActivityNotListedOption(fallback)
              : fallback,
          );
        }
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
