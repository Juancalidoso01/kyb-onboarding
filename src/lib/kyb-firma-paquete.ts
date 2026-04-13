import type { FormState } from "@/lib/kyb-field-complete";
import { KYB_PDF_FORM_VERSION } from "@/lib/kyb-steps";

/** Firma digital del director: paquete portable (correo, WhatsApp, almacenamiento seguro). */
export const KYB_FIRMA_PAQUETE_VERSION = 1 as const;

export type KybFirmaPaquetePayload = {
  kind: "kyb-firma-paquete";
  v: typeof KYB_FIRMA_PAQUETE_VERSION;
  pdfFormVersion: string;
  createdAt: number;
  /** Metadatos para reconstruir filtros del resumen */
  meta: {
    juntaMemberSlots: number;
    bfMemberSlots: number;
    pepMemberSlots: number;
    cotiza_bolsa: string;
  };
  values: FormState;
};

export function buildFirmaPaqueteFromWizard(
  values: FormState,
  meta: KybFirmaPaquetePayload["meta"],
): KybFirmaPaquetePayload {
  return {
    kind: "kyb-firma-paquete",
    v: KYB_FIRMA_PAQUETE_VERSION,
    pdfFormVersion: KYB_PDF_FORM_VERSION,
    createdAt: Date.now(),
    meta,
    values: { ...values },
  };
}

export function parseFirmaPaqueteJson(raw: string): KybFirmaPaquetePayload | null {
  try {
    const o = JSON.parse(raw) as unknown;
    if (!o || typeof o !== "object") return null;
    const p = o as Partial<KybFirmaPaquetePayload>;
    if (p.kind !== "kyb-firma-paquete" || p.v !== 1) return null;
    if (!p.values || typeof p.values !== "object") return null;
    if (!p.meta || typeof p.meta !== "object") return null;
    return p as KybFirmaPaquetePayload;
  } catch {
    return null;
  }
}

export function downloadFirmaPaqueteJson(
  payload: KybFirmaPaquetePayload,
  razonSocial: string,
): void {
  const safe = (razonSocial || "cliente")
    .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s\-_.]/g, "")
    .trim()
    .slice(0, 48)
    .replace(/\s+/g, "-");
  const ts = new Date(payload.createdAt).toISOString().slice(0, 10);
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `kyb-firma-director-${safe}-${ts}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
