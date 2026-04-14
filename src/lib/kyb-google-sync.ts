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
/** `drive.file` a veces devuelve 403 al crear archivos en carpetas compartidas / unidades compartidas. */
const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive";

export type KybDriveAttachment = {
  fieldId: string;
  fileName: string;
  buffer: Buffer;
  mimeType: string;
};

function driveFileViewUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/view`;
}

function driveFolderViewUrl(folderId: string): string {
  return `https://drive.google.com/drive/folders/${folderId}`;
}

function googleApiErrorMessage(e: unknown, fallback: string): string {
  if (e && typeof e === "object" && "response" in e) {
    const data = (e as { response?: { data?: unknown } }).response?.data;
    if (data !== undefined) {
      try {
        return typeof data === "string" ? data : JSON.stringify(data);
      } catch {
        /* ignore */
      }
    }
  }
  if (e instanceof Error) return e.message;
  return fallback;
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

function safeDriveFileName(fieldId: string, original: string): string {
  const cleaned = (original || "archivo").replace(/[\\/:*?"<>|]+/g, "-");
  const prefix = fieldId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 40);
  return `${prefix}_${cleaned}`.slice(0, 200) || "adjunto.bin";
}

export type GoogleSubmissionResult = {
  ok: boolean;
  driveFileId?: string;
  driveViewUrl?: string;
  driveFolderId?: string;
  driveFolderUrl?: string;
  error?: string;
};

/**
 * Crea carpeta por expediente, sube PDF + adjuntos y agrega fila al Sheet.
 */
export async function syncKybSubmissionToGoogle(input: {
  formRef: string;
  values: FormState;
  slots: SubmissionSlotCounts;
  attachments?: KybDriveAttachment[];
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
    return {
      ok: false,
      error: googleApiErrorMessage(e, "pdf_build_failed"),
    };
  }

  const drive = google.drive({ version: "v3", auth });
  const sheets = google.sheets({ version: "v4", auth });

  const folderNameSafe = input.formRef.replace(/[\\/:*?"<>|]+/g, "-").slice(0, 200);

  let submissionFolderId: string;
  try {
    const folderRes = await drive.files.create({
      requestBody: {
        name: folderNameSafe,
        parents: [folderId],
        mimeType: "application/vnd.google-apps.folder",
      },
      fields: "id",
      supportsAllDrives: true,
    });
    submissionFolderId = folderRes.data.id ?? "";
    if (!submissionFolderId) {
      return { ok: false, error: "drive_folder_create_no_id" };
    }
  } catch (e) {
    return {
      ok: false,
      error: googleApiErrorMessage(e, "drive_folder_create_failed"),
    };
  }

  const folderUrl = driveFolderViewUrl(submissionFolderId);

  const pdfName = `${input.formRef.replace(/[\\/:*?"<>|]+/g, "-")}.pdf`;

  let pdfFileId: string;
  try {
    const created = await drive.files.create({
      requestBody: {
        name: pdfName,
        parents: [submissionFolderId],
        mimeType: "application/pdf",
      },
      media: {
        mimeType: "application/pdf",
        body: Readable.from(pdfBuffer),
      },
      fields: "id",
      supportsAllDrives: true,
    });
    pdfFileId = created.data.id ?? "";
    if (!pdfFileId) {
      return { ok: false, error: "drive_upload_no_id" };
    }
  } catch (e) {
    return { ok: false, error: googleApiErrorMessage(e, "drive_pdf_upload_failed") };
  }

  const pdfViewUrl = driveFileViewUrl(pdfFileId);

  const attachmentLines: string[] = [];
  for (const att of input.attachments ?? []) {
    if (!att.buffer.length) continue;
    try {
      const nm = safeDriveFileName(att.fieldId, att.fileName);
      const up = await drive.files.create({
        requestBody: {
          name: nm,
          parents: [submissionFolderId],
        },
        media: {
          mimeType: att.mimeType || "application/octet-stream",
          body: Readable.from(att.buffer),
        },
        fields: "id",
        supportsAllDrives: true,
      });
      const fid = up.data.id ?? "";
      if (fid) {
        attachmentLines.push(`${att.fieldId}: ${driveFileViewUrl(fid)}`);
      }
    } catch (e) {
      return {
        ok: false,
        driveFileId: pdfFileId,
        driveViewUrl: pdfViewUrl,
        driveFolderId: submissionFolderId,
        driveFolderUrl: folderUrl,
        error: googleApiErrorMessage(e, "drive_attachment_failed"),
      };
    }
  }

  const linksCellLines = [
    `Carpeta expediente: ${folderUrl}`,
    `PDF resumen KYB: ${pdfViewUrl}`,
    ...attachmentLines,
  ];
  let linksCell = linksCellLines.join("\n");
  if (linksCell.length > 48_000) {
    linksCell = `${linksCell.slice(0, 48_000)}…`;
  }

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
    pdfViewUrl,
    director,
    fechaDecl,
    vid,
    archivosResumen(valuesWithRef),
    sanitizeValuesJson(valuesWithRef),
    linksCell,
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
    return {
      ok: false,
      driveFileId: pdfFileId,
      driveViewUrl: pdfViewUrl,
      driveFolderId: submissionFolderId,
      driveFolderUrl: folderUrl,
      error: googleApiErrorMessage(e, "sheets_append_failed"),
    };
  }

  return {
    ok: true,
    driveFileId: pdfFileId,
    driveViewUrl: pdfViewUrl,
    driveFolderId: submissionFolderId,
    driveFolderUrl: folderUrl,
  };
}
