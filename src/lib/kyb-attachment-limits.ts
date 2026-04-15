/**
 * Límites de adjuntos al finalizar KYB (subida multipart a `/api/kyb/google/submission`).
 *
 * Nota: Vercel Hobby suele limitar el cuerpo de la petición (~4.5 MB). Si el POST
 * devuelve 413 con adjuntos grandes, hace falta plan superior, Fluid Compute o
 * subida directa a almacenamiento (p. ej. URL firmada a GCS/S3).
 */
export const KYB_MAX_ATTACHMENT_BYTES_PER_FILE = 15 * 1024 * 1024; // 15 MiB por documento

/** Suma de todos los adjuntos (sin el JSON del payload). */
export const KYB_MAX_TOTAL_ATTACHMENT_BYTES = 50 * 1024 * 1024; // 50 MiB en conjunto

export function formatMaxMb(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(1).replace(/\.0$/, "");
}
