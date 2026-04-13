import type { FormState } from "@/lib/kyb-field-complete";
import type { KybFirmaPaquetePayload } from "@/lib/kyb-firma-paquete";
import { Redis } from "@upstash/redis";

/**
 * Sesión temporal escritorio ↔ móvil (código QR / enlace).
 *
 * - Memoria (`globalThis`): una sola instancia Node (p. ej. `next dev` o un solo réplica).
 * - Upstash Redis: serverless / varias instancias (Vercel). Defina en el entorno:
 *   `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN` (gratis en upstash.com).
 */
type RepresentantePairMeta = KybFirmaPaquetePayload["meta"];

type RepresentantePairEntry = {
  createdAt: number;
  values: FormState;
  meta: RepresentantePairMeta;
  patch: Partial<FormState> | null;
};

const TTL_MS = 20 * 60 * 1000;
const TTL_SEC = Math.ceil(TTL_MS / 1000);
const REDIS_PREFIX = "kyb:rep:";

type SerializedEntry = {
  createdAt: number;
  values: FormState;
  meta: RepresentantePairMeta;
  patch: Partial<FormState> | null;
};

function getMemoryStore(): Map<string, RepresentantePairEntry> {
  const g = globalThis as unknown as {
    __kybRepresentantePairStore?: Map<string, RepresentantePairEntry>;
  };
  if (!g.__kybRepresentantePairStore) {
    g.__kybRepresentantePairStore = new Map();
  }
  return g.__kybRepresentantePairStore;
}

let redisSingleton: Redis | null | undefined;

function getRedis(): Redis | null {
  if (redisSingleton !== undefined) return redisSingleton;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url?.trim() || !token?.trim()) {
    redisSingleton = null;
    return null;
  }
  try {
    redisSingleton = new Redis({ url, token });
    return redisSingleton;
  } catch {
    redisSingleton = null;
    return null;
  }
}

function redisKey(code: string): string {
  return `${REDIS_PREFIX}${code}`;
}

function pruneMemory(): void {
  const now = Date.now();
  const store = getMemoryStore();
  for (const [k, v] of store) {
    if (now - v.createdAt > TTL_MS) store.delete(k);
  }
}

function randomCode(): string {
  const a = new Uint8Array(8);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(16).padStart(2, "0")).join("");
}

function isEntryFresh(e: RepresentantePairEntry): boolean {
  return Date.now() - e.createdAt <= TTL_MS;
}

export async function createRepresentantePair(
  values: FormState,
  meta: RepresentantePairMeta,
): Promise<string> {
  const redis = getRedis();
  const code = randomCode();
  const entry: RepresentantePairEntry = {
    createdAt: Date.now(),
    values: { ...values },
    meta: { ...meta },
    patch: null,
  };

  if (redis) {
    const payload: SerializedEntry = {
      createdAt: entry.createdAt,
      values: entry.values,
      meta: entry.meta,
      patch: entry.patch,
    };
    await redis.set(redisKey(code), JSON.stringify(payload), { ex: TTL_SEC });
    return code;
  }

  pruneMemory();
  getMemoryStore().set(code, entry);
  return code;
}

export async function getRepresentantePair(
  code: string,
): Promise<RepresentantePairEntry | null> {
  const redis = getRedis();
  if (redis) {
    const raw = await redis.get<string>(redisKey(code));
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as SerializedEntry;
      if (!parsed?.values || typeof parsed.createdAt !== "number") return null;
      const entry: RepresentantePairEntry = {
        createdAt: parsed.createdAt,
        values: parsed.values,
        meta: parsed.meta,
        patch: parsed.patch ?? null,
      };
      await redis.set(
        redisKey(code),
        JSON.stringify({
          createdAt: entry.createdAt,
          values: entry.values,
          meta: entry.meta,
          patch: entry.patch,
        } satisfies SerializedEntry),
        { ex: TTL_SEC },
      );
      return entry;
    } catch {
      return null;
    }
  }

  pruneMemory();
  const e = getMemoryStore().get(code);
  if (!e) return null;
  if (!isEntryFresh(e)) {
    getMemoryStore().delete(code);
    return null;
  }
  return e;
}

const PATCH_KEYS = [
  "decl_metamap_verification_id",
  "decl_metamap_identity_id",
  "decl_firma_canvas_data_url",
] as const;

export async function applyRepresentantePatch(
  code: string,
  raw: Partial<FormState>,
): Promise<boolean> {
  const e = await getRepresentantePair(code);
  if (!e) return false;
  const slice: Partial<FormState> = {};
  for (const k of PATCH_KEYS) {
    if (raw[k] !== undefined) slice[k] = raw[k] ?? "";
  }
  e.patch = { ...(e.patch ?? {}), ...slice };

  const redis = getRedis();
  if (redis) {
    const payload: SerializedEntry = {
      createdAt: e.createdAt,
      values: e.values,
      meta: e.meta,
      patch: e.patch,
    };
    await redis.set(redisKey(code), JSON.stringify(payload), { ex: TTL_SEC });
    return true;
  }

  getMemoryStore().set(code, e);
  return true;
}
