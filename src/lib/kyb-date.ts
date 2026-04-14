/** Fechas en formulario: DD-MM-AAAA (Panamá). */

const DDMMYYYY = /^(\d{2})-(\d{2})-(\d{4})$/;

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
