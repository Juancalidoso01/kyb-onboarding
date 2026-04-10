/**
 * CSV exportado por Google Sheets (listados de Actividades / Profesiones).
 * Se usa la columna en español (segunda columna: «Español» / «Esp»).
 */

export const FALLBACK_ACTIVIDADES: { value: string; label: string }[] = [
  { value: "Comercio al por mayor y menor", label: "Comercio al por mayor y menor" },
  { value: "Servicios profesionales", label: "Servicios profesionales" },
  { value: "Industria / manufactura", label: "Industria / manufactura" },
  { value: "Construcción", label: "Construcción" },
  {
    value: "Otra actividad (detallar en observaciones)",
    label: "Otra actividad (detallar en observaciones)",
  },
];

export const FALLBACK_PROFESIONES: { value: string; label: string }[] = [
  { value: "Abogado (a)", label: "Abogado (a)" },
  { value: "Contador (a)", label: "Contador (a)" },
  { value: "Administrador (a)", label: "Administrador (a)" },
  { value: "Comerciante", label: "Comerciante" },
  { value: "Otra profesión (detallar en observaciones)", label: "Otra profesión (detallar en observaciones)" },
];

/** Parser CSV mínimo con comillas y comas internas. */
export function parseCsvRow(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += c;
    }
  }
  result.push(current.trim());
  return result;
}

function isHeaderSpanishLabel(s: string): boolean {
  const t = s.trim().toLowerCase();
  return t === "esp" || t === "español" || t.startsWith("español ");
}

function shouldSkipRow(cols: string[], rowIndex: number): boolean {
  const tipo = (cols[0] ?? "").trim().toLowerCase();
  const esp = (cols[1] ?? "").trim();
  if (!esp || esp.length < 2) return true;
  if (isHeaderSpanishLabel(esp)) return true;
  if (tipo === "tipo" && rowIndex <= 2) return true;
  if (esp.toLowerCase().includes("palabras para el buscador")) return true;
  return false;
}

/**
 * Filas: Tipo | Español | (Inglés, …). Se indexa la etiqueta en español.
 */
export function parseParametrizedSheetCsv(csv: string): { value: string; label: string }[] {
  const text = csv.startsWith("\ufeff") ? csv.slice(1) : csv;
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const out: { value: string; label: string }[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < lines.length; i++) {
    const cols = parseCsvRow(lines[i]);
    if (cols.length < 2) continue;
    if (shouldSkipRow(cols, i)) continue;
    const label = cols[1].trim();
    if (!label || seen.has(label)) continue;
    seen.add(label);
    out.push({ value: label, label });
  }
  return out;
}
