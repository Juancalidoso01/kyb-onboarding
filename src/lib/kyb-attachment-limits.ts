/**
 * Límites de adjuntos al finalizar KYB (subida multipart a `/api/kyb/google/submission`).
 * Vercel suele limitar el cuerpo de la petición (~4.5 MB); el tope total evita 413 opacos.
 * El tope por archivo evita un solo documento enorme.
 */
export const KYB_MAX_ATTACHMENT_BYTES_PER_FILE = 4 * 1024 * 1024; // 4 MiB

/** Suma de todos los adjuntos (sin el JSON del payload). Debe caber en el límite de la plataforma. */
export const KYB_MAX_TOTAL_ATTACHMENT_BYTES = 4 * 1024 * 1024; // 4 MiB

export function formatMaxMb(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(1).replace(/\.0$/, "");
}
