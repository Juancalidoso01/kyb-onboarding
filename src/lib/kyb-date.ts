/** Fechas en formulario: DD-MM-AAAA (Panamá). Momento de firma: DD-MM-AAAA HH:mm (hora Panamá). */

const DDMMYYYY = /^(\d{2})-(\d{2})-(\d{4})$/;
const DDMMYYYY_HHmm = /^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2})$/;

/** Hora local de Panamá en el momento indicado (sin DST). */
export function formatPanamaDateTimeNow(d = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Panama",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (t: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === t)?.value ?? "";
  const dd = get("day");
  const mm = get("month");
  const yyyy = get("year");
  const hh = get("hour");
  const min = get("minute");
  return `${dd}-${mm}-${yyyy} ${hh}:${min}`;
}

export function isValidPanamaDateTime(s: string): boolean {
  const t = s.trim();
  if (!DDMMYYYY_HHmm.test(t)) return false;
  const [, dd, mm, yyyy, hh, min] = t.match(DDMMYYYY_HHmm)!;
  if (!isValidPanamaDate(`${dd}-${mm}-${yyyy}`)) return false;
  const h = Number(hh);
  const m = Number(min);
  if (h < 0 || h > 23 || m < 0 || m > 59) return false;
  return true;
}

/**
 * Interpreta DD-MM-AAAA HH:mm como instante en America/Panama (UTC−5 fijo)
 * y comprueba que no sea posterior al instante actual.
 */
export function isPanamaDateTimeNotAfterNow(s: string): boolean {
  if (!isValidPanamaDateTime(s)) return false;
  const t = s.trim().match(DDMMYYYY_HHmm)!;
  const dd = Number(t[1]);
  const mm = Number(t[2]);
  const yyyy = Number(t[3]);
  const hh = Number(t[4]);
  const min = Number(t[5]);
  const utcMs = Date.UTC(yyyy, mm - 1, dd, hh + 5, min, 0, 0);
  return utcMs <= Date.now();
}

export function isValidPanamaDate(s: string): boolean {
  if (!DDMMYYYY.test(s.trim())) return false;
  const [, dd, mm, yyyy] = s.match(DDMMYYYY)!;
  const d = Number(dd);
  const m = Number(mm);
  const y = Number(yyyy);
  if (m < 1 || m > 12 || d < 1 || d > 31 || y < 1900 || y > 2100) return false;
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

/** Fecha de calendario local no posterior a hoy (evita fechas futuras en el formulario). */
export function isPanamaDateNotAfterToday(s: string): boolean {
  if (!isValidPanamaDate(s)) return false;
  const [, dd, mm, yyyy] = s.trim().match(DDMMYYYY)!;
  const chosen = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  chosen.setHours(0, 0, 0, 0);
  return chosen.getTime() <= today.getTime();
}

/** yyyy-mm-dd (input type=date) → DD-MM-AAAA */
export function isoToPanama(iso: string): string {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
  const [y, m, d] = iso.split("-");
  return `${d}-${m}-${y}`;
}

/** DD-MM-AAAA → yyyy-mm-dd */
export function panamaToIso(panama: string): string {
  const t = panama.trim();
  if (!DDMMYYYY.test(t)) return "";
  const [, dd, mm, yyyy] = t.match(DDMMYYYY)!;
  return `${yyyy}-${mm}-${dd}`;
}
