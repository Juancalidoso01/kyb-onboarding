export type GoogleServiceAccount = {
  client_email: string;
  private_key: string;
};

/**
 * Credenciales desde JSON completo (env o base64) o par email + clave PEM.
 * En .env la clave suele llevar `\n` escapado; se normaliza aquí.
 */
export function loadGoogleServiceAccount(): GoogleServiceAccount | null {
  const b64 = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64?.trim();
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
  let jsonStr = "";
  if (b64) {
    try {
      const clean = b64.replace(/\s+/g, "");
      jsonStr = Buffer.from(clean, "base64").toString("utf8");
    } catch {
      return null;
    }
  } else if (raw) {
    jsonStr = raw;
  } else {
    const email = process.env.GOOGLE_CLIENT_EMAIL?.trim();
    const keyRaw = process.env.GOOGLE_PRIVATE_KEY?.trim();
    if (!email || !keyRaw) return null;
    return {
      client_email: email,
      private_key: keyRaw.replace(/\\n/g, "\n"),
    };
  }
  try {
    const j = JSON.parse(jsonStr) as {
      client_email?: string;
      private_key?: string;
    };
    if (!j.client_email || !j.private_key) return null;
    return {
      client_email: j.client_email,
      private_key: j.private_key.replace(/\\n/g, "\n"),
    };
  } catch {
    return null;
  }
}

export function googleSheetsDriveConfigured(): boolean {
  const sheet = process.env.GOOGLE_SHEET_ID?.trim();
  const folder = process.env.GOOGLE_DRIVE_FOLDER_ID?.trim();
  return Boolean(sheet && folder && loadGoogleServiceAccount());
}
