import type { FormState } from "@/lib/kyb-field-complete";
import type { KybFirmaPaquetePayload } from "@/lib/kyb-firma-paquete";
import { Redis as UpstashRedis } from "@upstash/redis";
import IoRedis from "ioredis";

/**
 * Sesión temporal escritorio ↔ móvil (código QR / enlace).
 *
 * - Memoria (`globalThis`): un solo proceso Node (`next dev` o un réplica).
 * - Redis en la nube (Vercel / varias instancias), en este orden:
 *   1) API REST de Upstash: `UPSTASH_REDIS_REST_URL` (https://…) + `UPSTASH_REDIS_REST_TOKEN`
 *      o integración Vercel KV: `KV_REST_API_URL` + `KV_REST_API_TOKEN`
 *   2) URL de `redis-cli` (protocolo Redis con TLS): `REDIS_URL` = redis://default:…@….upstash.io:6379
 *      (la misma que muestra Upstash para redis-cli --tls; NO es la URL REST).
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

let upstashSingleton: UpstashRedis | null | undefined;

function getUpstashRest(): UpstashRedis | null {
  if (upstashSingleton !== undefined) return upstashSingleton;
  const url = (
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.KV_REST_API_URL ||
    ""
  ).trim();
  const token = (
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.KV_REST_API_TOKEN ||
    ""
  ).trim();
  if (!url || !token) {
    upstashSingleton = null;
    return null;
  }
  if (url.startsWith("redis:") || url.startsWith("rediss:")) {
    upstashSingleton = null;
    return null;
  }
  try {
    upstashSingleton = new UpstashRedis({ url, token });
    return upstashSingleton;
  } catch {
    upstashSingleton = null;
    return null;
  }
}

let tcpSingleton: IoRedis | null | undefined;

function getTcpRedis(): IoRedis | null {
  if (tcpSingleton !== undefined) return tcpSingleton;
  const raw = (
    process.env.REDIS_URL ||
    process.env.UPSTASH_REDIS_REDIS_URL ||
    ""
  ).trim();
  if (!raw) {
    tcpSingleton = null;
    return null;
  }
  try {
    const needsTls =
      raw.includes("upstash.io") ||
      raw.startsWith("rediss:") ||
      raw.includes("tls=true");
    tcpSingleton = new IoRedis(raw, {
      maxRetriesPerRequest: 3,
      connectTimeout: 12_000,
      ...(needsTls ? { tls: {} } : {}),
    });
    return tcpSingleton;
  } catch {
    tcpSingleton = null;
    return null;
  }
}

function usesRemoteRedis(): boolean {
  return getUpstashRest() !== null || getTcpRedis() !== null;
}

function redisKey(code: string): string {
  return `${REDIS_PREFIX}${code}`;
}

async function redisSetJson(code: string, payload: SerializedEntry): Promise<void> {
  const key = redisKey(code);
  const body = JSON.stringify(payload);
  const rest = getUpstashRest();
  if (rest) {
    await rest.set(key, body, { ex: TTL_SEC });
    return;
  }
  const tcp = getTcpRedis();
  if (tcp) {
    await tcp.set(key, body, "EX", TTL_SEC);
  }
}

async function redisGetJson(code: string): Promise<SerializedEntry | null> {
  const key = redisKey(code);
  const rest = getUpstashRest();
  if (rest) {
    const raw = await rest.get<string | SerializedEntry>(key);
    if (raw == null) return null;
    const str = typeof raw === "string" ? raw : JSON.stringify(raw);
    try {
      const parsed = JSON.parse(str) as SerializedEntry;
      if (!parsed?.values || typeof parsed.createdAt !== "number") return null;
      return parsed;
    } catch {
      return null;
    }
  }
  const tcp = getTcpRedis();
  if (tcp) {
    const str = await tcp.get(key);
    if (str == null) return null;
    try {
      const parsed = JSON.parse(str) as SerializedEntry;
      if (!parsed?.values || typeof parsed.createdAt !== "number") return null;
      return parsed;
    } catch {
      return null;
    }
  }
  return null;
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
  const code = randomCode();
  const entry: RepresentantePairEntry = {
    createdAt: Date.now(),
    values: { ...values },
    meta: { ...meta },
    patch: null,
  };

  if (usesRemoteRedis()) {
    await redisSetJson(code, {
      createdAt: entry.createdAt,
      values: entry.values,
      meta: entry.meta,
      patch: entry.patch,
    });
    return code;
  }

  pruneMemory();
  getMemoryStore().set(code, entry);
  return code;
}

export async function getRepresentantePair(
  code: string,
): Promise<RepresentantePairEntry | null> {
  if (usesRemoteRedis()) {
    const parsed = await redisGetJson(code);
    if (!parsed) return null;
    const entry: RepresentantePairEntry = {
      createdAt: parsed.createdAt,
      values: parsed.values,
      meta: parsed.meta,
      patch: parsed.patch ?? null,
    };
    await redisSetJson(code, {
      createdAt: entry.createdAt,
      values: entry.values,
      meta: entry.meta,
      patch: entry.patch,
    });
    return entry;
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

  if (usesRemoteRedis()) {
    await redisSetJson(code, {
      createdAt: e.createdAt,
      values: e.values,
      meta: e.meta,
      patch: e.patch,
    });
    return true;
  }

  getMemoryStore().set(code, e);
  return true;
}
