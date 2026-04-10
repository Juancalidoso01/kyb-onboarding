"use client";

import { useEffect, useState } from "react";

export type SheetOptionsKind = "actividades" | "profesiones";

export function useKybSheetOptions(kind: SheetOptionsKind) {
  const [options, setOptions] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/kyb/sheet-options?kind=${kind}`)
      .then((r) => r.json())
      .then((j: { options?: { value: string; label: string }[] }) => {
        if (!cancelled && Array.isArray(j.options)) setOptions(j.options);
      })
      .catch(() => {
        if (!cancelled) setOptions([]);
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
