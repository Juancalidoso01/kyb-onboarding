import { Readable } from "node:stream";
import { google } from "googleapis";
import { allDocumentacionUploadKeys } from "@/lib/kyb-documentacion";
import { buildKybPdfBuffer } from "@/lib/kyb-export-pdf";
import type { FormState } from "@/lib/kyb-field-complete";
import {
  googleSheetsDriveConfigured,
  loadGoogleServiceAccount,
} from "@/lib/kyb-google-credentials";
import {
  buildSummaryContextForPdf,
  type SubmissionSlotCounts,
} from "@/lib/kyb-submission-pdf-context";

const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";

function driveFileViewUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/view`;
}

function sanitizeValuesJson(values: FormState): string {
  const omit = new Set(["decl_firma_canvas_data_url"]);
  const o: Record<string, string> = {};
  for (const [k, v] of Object.entries(values)) {
    if (omit.has(k)) continue;
    const s = (v ?? "").trim();
    if (!s) continue;
    o[k] = s.length > 800 ? `${s.slice(0, 800)}…` : s;
  }
  let json = JSON.stringify(o);
  const max = 45_000;
  if (json.length > max) json = `${json.slice(0, max)}…`;
  return json;
}

function archivosResumen(values: FormState): string {
  const parts = allDocumentacionUploadKeys()
    .filter((k) => (values[k] ?? "").trim())
    .map((k) => `${k}: ${(values[k] ?? "").trim()}`);
  const s = parts.join(" | ");
  return s.length > 5000 ? `${s.slice(0, 5000)}…` : s;
}

export type GoogleSubmissionResult = {
  ok: boolean;
  driveFileId?: string;
  driveViewUrl?: string;
  error?: string;
};

/**
 * Sube el PDF a Drive y agrega una fila al Sheet. Idempotencia no garantizada
 * (cada llamada añade fila); el cliente debe llamar una vez al finalizar.
 */
export async function syncKybSubmissionToGoogle(input: {
  formRef: string;
  values: FormState;
  slots: SubmissionSlotCounts;
}): Promise<GoogleSubmissionResult> {
  if (!googleSheetsDriveConfigured()) {
    return { ok: false, error: "google_not_configured" };
  }
  const creds = loadGoogleServiceAccount();
  const spreadsheetId = process.env.GOOGLE_SHEET_ID!.trim();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID!.trim();
  const tab =
    (process.env.GOOGLE_SHEET_TAB?.trim() || "Hoja 1").replace(/'/g, "''");
  const appendRange = `'${tab}'!A1`;

  if (!creds) {
    return { ok: false, error: "google_credentials_missing" };
  }

  const auth = new google.auth.JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: [SHEETS_SCOPE, DRIVE_SCOPE],
  });

  const { summarySteps, visibility } = buildSummaryContextForPdf(
    input.values,
    input.slots,
  );
  const valuesWithRef: FormState = {
    ...input.values,
    decl_formulario_ref: input.formRef,
  };

  let pdfBuffer: Buffer;
  try {
    pdfBuffer = buildKybPdfBuffer(valuesWithRef, summarySteps, visibility);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "pdf_build_failed";
    return { ok: false, error: msg };
  }

  const drive = google.drive({ version: "v3", auth });
  const sheets = google.sheets({ version: "v4", auth });

  const safeName = `${input.formRef.replace(/[\\/:*?"<>|]+/g, "-")}.pdf`;

  let fileId: string;
  try {
    const created = await drive.files.create({
      requestBody: {
        name: safeName,
        parents: [folderId],
        mimeType: "application/pdf",
      },
      media: {
        mimeType: "application/pdf",
        body: Readable.from(pdfBuffer),
      },
      fields: "id",
      supportsAllDrives: true,
    });
    fileId = created.data.id ?? "";
    if (!fileId) {
      return { ok: false, error: "drive_upload_no_id" };
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "drive_upload_failed";
    return { ok: false, error: msg };
  }

  const viewUrl = driveFileViewUrl(fileId);
  const rs = (valuesWithRef.razon_social ?? "").trim();
  const email =
    (valuesWithRef.email_generales ?? "").trim() ||
    (valuesWithRef.persona_contacto_correo ?? "").trim() ||
    (valuesWithRef.rep_correo ?? "").trim();
  const director = (valuesWithRef.decl_director_nombre ?? "").trim();
  const fechaDecl = (valuesWithRef.decl_fecha ?? "").trim();
  const vid = (valuesWithRef.decl_metamap_verification_id ?? "").trim();

  const row = [
    new Date().toISOString(),
    input.formRef,
    rs,
    email,
    viewUrl,
    director,
    fechaDecl,
    vid,
    archivosResumen(valuesWithRef),
    sanitizeValuesJson(valuesWithRef),
  ];

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: appendRange,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [row] },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "sheets_append_failed";
    return {
      ok: false,
      driveFileId: fileId,
      driveViewUrl: viewUrl,
      error: msg,
    };
  }

  return { ok: true, driveFileId: fileId, driveViewUrl: viewUrl };
}
