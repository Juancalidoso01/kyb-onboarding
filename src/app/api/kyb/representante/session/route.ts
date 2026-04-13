import { NextResponse } from "next/server";
import type { FormState } from "@/lib/kyb-field-complete";
import type { KybFirmaPaquetePayload } from "@/lib/kyb-firma-paquete";
import {
  applyRepresentantePatch,
  createRepresentantePair,
  getRepresentantePair,
} from "@/lib/representante-pair-store";

type RepresentantePairMeta = KybFirmaPaquetePayload["meta"];

export const runtime = "nodejs";

function bad(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return bad("invalid_json");
  }
  if (!body || typeof body !== "object") return bad("invalid_body");
  const o = body as { values?: unknown; meta?: unknown };
  if (!o.values || typeof o.values !== "object") return bad("missing_values");
  if (!o.meta || typeof o.meta !== "object") return bad("missing_meta");
  const meta = o.meta as RepresentantePairMeta;
  const values = o.values as FormState;
  const code = await createRepresentantePair(values, meta);
  return NextResponse.json({ code });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const role = searchParams.get("role") ?? "desktop";
  if (!code?.trim()) return bad("missing_code");
  const entry = await getRepresentantePair(code.trim());
  if (!entry) return bad("not_found", 404);
  if (role === "desktop") {
    const p = entry.patch ?? {};
    const vid = (p.decl_metamap_verification_id ?? "").trim();
    const sig = (p.decl_firma_canvas_data_url ?? "").trim();
    const hasAny =
      Boolean(vid) ||
      Boolean((p.decl_metamap_identity_id ?? "").trim()) ||
      Boolean(sig);
    const status =
      vid && sig ? "complete" : hasAny ? "partial" : "pending";
    return NextResponse.json({
      status,
      patch: entry.patch,
    });
  }
  if (role === "mobile") {
    return NextResponse.json({
      values: entry.values,
      meta: entry.meta,
    });
  }
  return bad("bad_role");
}

export async function PATCH(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return bad("invalid_json");
  }
  if (!body || typeof body !== "object") return bad("invalid_body");
  const o = body as { code?: string } & Partial<FormState>;
  const code = o.code?.trim();
  if (!code) return bad("missing_code");
  const rest: Partial<FormState> = { ...o };
  delete (rest as { code?: string }).code;
  const ok = await applyRepresentantePatch(code, rest);
  if (!ok) return bad("not_found", 404);
  return NextResponse.json({ ok: true });
}
