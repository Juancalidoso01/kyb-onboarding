import type { FormState } from "@/lib/kyb-field-complete";
import type { KybFirmaPaquetePayload } from "@/lib/kyb-firma-paquete";

/** Solo importar desde Route Handlers (Node). Map en memoria: en serverless puede no compartirse entre instancias; sirve para dev y tráfico bajo. */
type RepresentantePairMeta = KybFirmaPaquetePayload["meta"];

type RepresentantePairEntry = {
  createdAt: number;
  values: FormState;
  meta: RepresentantePairMeta;
  patch: Partial<FormState> | null;
};

const TTL_MS = 20 * 60 * 1000;
const store = new Map<string, RepresentantePairEntry>();

function prune(): void {
  const now = Date.now();
  for (const [k, v] of store) {
    if (now - v.createdAt > TTL_MS) store.delete(k);
  }
}

function randomCode(): string {
  const a = new Uint8Array(8);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function createRepresentantePair(
  values: FormState,
  meta: RepresentantePairMeta,
): string {
  prune();
  const code = randomCode();
  store.set(code, {
    createdAt: Date.now(),
    values: { ...values },
    meta: { ...meta },
    patch: null,
  });
  return code;
}

export function getRepresentantePair(
  code: string,
): RepresentantePairEntry | null {
  prune();
  const e = store.get(code);
  if (!e) return null;
  if (Date.now() - e.createdAt > TTL_MS) {
    store.delete(code);
    return null;
  }
  return e;
}

const PATCH_KEYS = [
  "decl_metamap_verification_id",
  "decl_metamap_identity_id",
  "decl_firma_canvas_data_url",
] as const;

export function applyRepresentantePatch(
  code: string,
  raw: Partial<FormState>,
): boolean {
  const e = getRepresentantePair(code);
  if (!e) return false;
  const slice: Partial<FormState> = {};
  for (const k of PATCH_KEYS) {
    if (raw[k] !== undefined) slice[k] = raw[k] ?? "";
  }
  e.patch = { ...(e.patch ?? {}), ...slice };
  return true;
}
