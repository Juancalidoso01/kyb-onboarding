/**
 * Listados parametrizados en Google Sheets (Punto Pago).
 * Pestaña «Actividades» y «Profesiones» del mismo libro.
 *
 * Puede sobreescribirse la URL completa por variable de entorno.
 */

export const KYB_PARAM_SHEET_ID =
  "1tqZYs99XrnoQbLNCgH8GgoilIDTbc_ICKlbZqcS8K-w";

/** Pestaña «Actividades» */
export const KYB_SHEET_GID_ACTIVIDADES = "846907488";

/** Pestaña «Profesiones» (columnas Tipo / Español / Inglés) */
export const KYB_SHEET_GID_PROFESIONES = "664727064";

function defaultCsvUrl(gid: string): string {
  return `https://docs.google.com/spreadsheets/d/${KYB_PARAM_SHEET_ID}/export?format=csv&gid=${gid}`;
}

/** Listado de actividades económicas (empresa + representante). */
export function getActividadesCsvUrl(): string {
  return (
    process.env.NEXT_PUBLIC_KYB_ACTIVIDADES_CSV_URL ??
    process.env.NEXT_PUBLIC_KYB_ACTIVITY_SHEET_CSV_URL ??
    defaultCsvUrl(KYB_SHEET_GID_ACTIVIDADES)
  );
}

/** Listado de profesiones / ocupaciones. */
export function getProfesionesCsvUrl(): string {
  return (
    process.env.NEXT_PUBLIC_KYB_PROFESIONES_CSV_URL ??
    defaultCsvUrl(KYB_SHEET_GID_PROFESIONES)
  );
}
