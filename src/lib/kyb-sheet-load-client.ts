import {
  FALLBACK_ACTIVIDADES,
  FALLBACK_PROFESIONES,
  parseParametrizedSheetCsv,
} from "@/lib/kyb-sheet-csv";
import { getActividadesCsvUrl, getProfesionesCsvUrl } from "@/lib/kyb-sheet-config";

export type SheetOptionsKind = "actividades" | "profesiones";

function fallbackFor(kind: SheetOptionsKind) {
  return kind === "profesiones" ? FALLBACK_PROFESIONES : FALLBACK_ACTIVIDADES;
}

function staticJsonUrl(kind: SheetOptionsKind): string {
  const base = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
  return `${base}/kyb-sheet-data/${kind}.json`;
}

function csvUrlFor(kind: SheetOptionsKind): string {
  return kind === "profesiones" ? getProfesionesCsvUrl() : getActividadesCsvUrl();
}

/**
 * Carga opciones en el navegador sin depender solo de /api (sirve para static export o sin servidor Node).
 * Orden: JSON en public/ → API Next → CSV directo desde Google → fallback local.
 */
export async function loadSheetOptionsClient(
  kind: SheetOptionsKind,
): Promise<{ value: string; label: string }[]> {
  const fallback = fallbackFor(kind);

  try {
    const r = await fetch(staticJsonUrl(kind), { cache: "no-store" });
    if (r.ok) {
      const j: unknown = await r.json();
      const opts = (j as { options?: unknown }).options;
      if (Array.isArray(opts) && opts.length > 0) {
        return opts as { value: string; label: string }[];
      }
    }
  } catch {
    /* siguiente estrategia */
  }

  try {
    const r = await fetch(`/api/kyb/sheet-options?kind=${kind}`, { cache: "no-store" });
    const j: unknown = await r.json().catch(() => ({}));
    if (r.ok) {
      const opts = (j as { options?: unknown }).options;
      if (Array.isArray(opts) && opts.length > 0) {
        return opts as { value: string; label: string }[];
      }
    }
  } catch {
    /* siguiente estrategia */
  }

  try {
    const r = await fetch(csvUrlFor(kind), { cache: "no-store", mode: "cors" });
    if (r.ok) {
      const text = await r.text();
      const parsed = parseParametrizedSheetCsv(text);
      if (parsed.length > 0) return parsed;
    }
  } catch {
    /* Google suele bloquear CORS desde el navegador; no es crítico */
  }

  return fallback;
}
