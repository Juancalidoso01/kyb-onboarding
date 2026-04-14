import { NextResponse } from "next/server";
import {
  KYB_MAX_ATTACHMENT_BYTES_PER_FILE,
  KYB_MAX_TOTAL_ATTACHMENT_BYTES,
} from "@/lib/kyb-attachment-limits";
import type { FormState } from "@/lib/kyb-field-complete";
import type { KybDriveAttachment } from "@/lib/kyb-google-sync";
import {
  googleSheetsDriveConfigured,
  loadGoogleServiceAccount,
} from "@/lib/kyb-google-credentials";
import { syncKybSubmissionToGoogle } from "@/lib/kyb-google-sync";
import {
  kybNotifyEmailConfigured,
  sendKybSubmissionNotifyEmail,
} from "@/lib/kyb-notify-email";
import type { SubmissionSlotCounts } from "@/lib/kyb-submission-pdf-context";

export const runtime = "nodejs";
/** Subida de varios adjuntos + PDF puede acercarse al límite en Hobby (10s); Pro permite más tiempo. */
export const maxDuration = 120;

function bad(msg: string, status = 400) {
  return NextResponse.json({ ok: false, error: msg }, { status });
}

function isBlobLike(v: unknown): v is Blob {
  return (
    typeof v === "object" &&
    v !== null &&
    "arrayBuffer" in v &&
    typeof (v as Blob).arrayBuffer === "function"
  );
}

/**
 * GET: diagnóstico sin secretos (abre en el navegador en producción).
 * Si `configured` es false, revisa variables en Vercel y el base64.
 */
export async function GET() {
  const sheet = Boolean(process.env.GOOGLE_SHEET_ID?.trim());
  const folder = Boolean(process.env.GOOGLE_DRIVE_FOLDER_ID?.trim());
  const credsOk = Boolean(loadGoogleServiceAccount());
  const configured = sheet && folder && credsOk;
  return NextResponse.json({
    configured,
    hasSheetId: sheet,
    hasFolderId: folder,
    hasCredentialsJson: credsOk,
    sheetTab: process.env.GOOGLE_SHEET_TAB?.trim() || "Hoja 1",
    notifyEmailConfigured: kybNotifyEmailConfigured(),
    hint: configured
      ? "Variables mínimas OK. Si aún falla el POST, revisa permisos del Sheet/carpeta y el nombre de la pestaña."
      : "Falta GOOGLE_SHEET_ID, GOOGLE_DRIVE_FOLDER_ID o credenciales válidas (BASE64).",
    notifyHint: kybNotifyEmailConfigured()
      ? "Correo interno: KYB_NOTIFY_EMAILS + RESEND_API_KEY + RESEND_FROM."
      : "Opcional: KYB_NOTIFY_EMAILS, RESEND_API_KEY, RESEND_FROM (Resend) para avisar al equipo.",
  });
}

export async function POST(req: Request) {
  if (!googleSheetsDriveConfigured()) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "google_env_incomplete",
    });
  }

  const ct = req.headers.get("content-type") || "";
  let formRef: string;
  let values: FormState;
  let slots: SubmissionSlotCounts;
  const attachments: KybDriveAttachment[] = [];

  if (ct.includes("multipart/form-data")) {
    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      return bad("invalid_multipart");
    }
    const payloadRaw = form.get("payload");
    if (typeof payloadRaw !== "string") return bad("missing_payload");
    let parsed: unknown;
    try {
      parsed = JSON.parse(payloadRaw);
    } catch {
      return bad("invalid_payload_json");
    }
    if (!parsed || typeof parsed !== "object") return bad("invalid_payload");
    const o = parsed as {
      formRef?: string;
      values?: unknown;
      juntaMemberSlots?: unknown;
      bfMemberSlots?: unknown;
      pepMemberSlots?: unknown;
    };
    formRef = typeof o.formRef === "string" ? o.formRef.trim() : "";
    if (!formRef) return bad("missing_formRef");
    if (!o.values || typeof o.values !== "object") return bad("missing_values");
    values = o.values as FormState;
    slots = {
      juntaMemberSlots: Number(o.juntaMemberSlots) || 1,
      bfMemberSlots: Number(o.bfMemberSlots) || 1,
      pepMemberSlots: Number(o.pepMemberSlots) || 1,
    };

    for (const [key, value] of form.entries()) {
      if (!key.startsWith("file_")) continue;
      const fieldId = key.slice("file_".length);
      if (!fieldId) continue;
      if (!isBlobLike(value)) continue;
      try {
        const buf = Buffer.from(await value.arrayBuffer());
        const fileName =
          value instanceof File && value.name
            ? value.name
            : `${fieldId}.bin`;
        const mimeType =
          value instanceof File && value.type
            ? value.type
            : "application/octet-stream";
        if (buf.length > KYB_MAX_ATTACHMENT_BYTES_PER_FILE) {
          return bad(`attachment_too_large:${fieldId}`);
        }
        attachments.push({ fieldId, fileName, buffer: buf, mimeType });
      } catch {
        return bad(`attachment_read_failed:${fieldId}`);
      }
    }
    let totalBytes = 0;
    for (const a of attachments) totalBytes += a.buffer.length;
    if (totalBytes > KYB_MAX_TOTAL_ATTACHMENT_BYTES) {
      return bad("attachments_total_too_large");
    }
  } else {
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

    formRef = typeof o.formRef === "string" ? o.formRef.trim() : "";
    if (!formRef) return bad("missing_formRef");
    if (!o.values || typeof o.values !== "object") return bad("missing_values");

    values = o.values as FormState;
    slots = {
      juntaMemberSlots: Number(o.juntaMemberSlots) || 1,
      bfMemberSlots: Number(o.bfMemberSlots) || 1,
      pepMemberSlots: Number(o.pepMemberSlots) || 1,
    };
  }

  const result = await syncKybSubmissionToGoogle({
    formRef,
    values,
    slots,
    attachments: attachments.length > 0 ? attachments : undefined,
  });

  if (!result.ok) {
    console.error("[kyb/google/submission]", result.error);
    return NextResponse.json(
      {
        ok: false,
        error: result.error ?? "sync_failed",
        driveFileId: result.driveFileId,
        driveViewUrl: result.driveViewUrl,
        driveFolderId: result.driveFolderId,
        driveFolderUrl: result.driveFolderUrl,
      },
      { status: 502 },
    );
  }

  const razonSocial = (values.razon_social ?? "").trim();
  const contactEmail =
    (values.email_generales ?? "").trim() ||
    (values.persona_contacto_correo ?? "").trim() ||
    (values.rep_correo ?? "").trim();

  const notify = await sendKybSubmissionNotifyEmail({
    formRef,
    razonSocial,
    contactEmail,
    driveFolderUrl: result.driveFolderUrl ?? "",
    driveViewUrl: result.driveViewUrl ?? "",
    attachmentCount: attachments.length,
  });

  if (!notify.sent) {
    if ("error" in notify) {
      console.error("[kyb/google/submission] notify email failed:", notify.error);
    }
  }

  return NextResponse.json({
    ok: true,
    driveFileId: result.driveFileId,
    driveViewUrl: result.driveViewUrl,
    driveFolderId: result.driveFolderId,
    driveFolderUrl: result.driveFolderUrl,
    attachmentsUploaded: attachments.length,
    notifyEmail: notify.sent
      ? { sent: true as const }
      : "skipped" in notify
        ? { sent: false as const, skipped: notify.skipped }
        : { sent: false as const, error: notify.error },
  });
}
