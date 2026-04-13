import { NextResponse } from "next/server";
import type { FormState } from "@/lib/kyb-field-complete";
import { googleSheetsDriveConfigured } from "@/lib/kyb-google-credentials";
import { syncKybSubmissionToGoogle } from "@/lib/kyb-google-sync";
import type { SubmissionSlotCounts } from "@/lib/kyb-submission-pdf-context";

export const runtime = "nodejs";

function bad(msg: string, status = 400) {
  return NextResponse.json({ ok: false, error: msg }, { status });
}

export async function POST(req: Request) {
  if (!googleSheetsDriveConfigured()) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "google_env_incomplete",
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return bad("invalid_json");
  }
  if (!body || typeof body !== "object") return bad("invalid_body");

  const o = body as {
    formRef?: string;
    values?: unknown;
    juntaMemberSlots?: unknown;
    bfMemberSlots?: unknown;
    pepMemberSlots?: unknown;
  };

  const formRef = typeof o.formRef === "string" ? o.formRef.trim() : "";
  if (!formRef) return bad("missing_formRef");
  if (!o.values || typeof o.values !== "object") return bad("missing_values");

  const slots: SubmissionSlotCounts = {
    juntaMemberSlots: Number(o.juntaMemberSlots) || 1,
    bfMemberSlots: Number(o.bfMemberSlots) || 1,
    pepMemberSlots: Number(o.pepMemberSlots) || 1,
  };

  const result = await syncKybSubmissionToGoogle({
    formRef,
    values: o.values as FormState,
    slots,
  });

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: result.error ?? "sync_failed",
        driveFileId: result.driveFileId,
        driveViewUrl: result.driveViewUrl,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    driveFileId: result.driveFileId,
    driveViewUrl: result.driveViewUrl,
  });
}
