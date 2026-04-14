/**
 * Notificación por correo tras un KYB exitoso (destinatarios fijos en servidor).
 * Usa Resend (https://resend.com): RESEND_API_KEY + dominio verificado en RESEND_FROM.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function kybNotifyEmailConfigured(): boolean {
  const raw = process.env.KYB_NOTIFY_EMAILS?.trim();
  const key = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM?.trim();
  if (!raw || !key || !from) return false;
  const to = raw
    .split(/[,;]+/)
    .map((x) => x.trim())
    .filter(Boolean);
  return to.length > 0;
}

export type KybNotifyEmailResult =
  | { sent: true }
  | { sent: false; skipped: string }
  | { sent: false; error: string };

export async function sendKybSubmissionNotifyEmail(input: {
  formRef: string;
  razonSocial: string;
  contactEmail: string;
  driveFolderUrl: string;
  driveViewUrl: string;
  attachmentCount: number;
}): Promise<KybNotifyEmailResult> {
  const key = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM?.trim();
  const raw = process.env.KYB_NOTIFY_EMAILS?.trim();

  if (!raw) return { sent: false, skipped: "no_kyb_notify_emails" };
  const to = raw
    .split(/[,;]+/)
    .map((x) => x.trim())
    .filter(Boolean);
  if (!to.length) return { sent: false, skipped: "no_kyb_notify_emails" };
  if (!key) return { sent: false, skipped: "no_resend_api_key" };
  if (!from) return { sent: false, skipped: "no_resend_from" };

  const rs = input.razonSocial || "—";
  const subject = `[KYB] Nuevo expediente ${input.formRef} — ${rs}`;

  const text = [
    "Nuevo formulario KYB registrado en Drive y Sheet.",
    "",
    `Número de formulario: ${input.formRef}`,
    `Razón social: ${rs}`,
    `Correo contacto (formulario): ${input.contactEmail || "—"}`,
    `Archivos adjuntos subidos: ${input.attachmentCount}`,
    "",
    "Carpeta del expediente (Drive):",
    input.driveFolderUrl,
    "",
    "PDF resumen KYB:",
    input.driveViewUrl,
    "",
    "— Notificación automática (kyb-onboarding)",
  ].join("\n");

  const hRef = escapeHtml(input.formRef);
  const hRs = escapeHtml(rs);
  const hMail = escapeHtml(input.contactEmail || "—");
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body style="font-family:system-ui,sans-serif;line-height:1.5;color:#0f172a">
<p><strong>Nuevo formulario KYB</strong> registrado en Drive y en la hoja de cálculo.</p>
<ul>
<li><strong>Formulario:</strong> ${hRef}</li>
<li><strong>Razón social:</strong> ${hRs}</li>
<li><strong>Correo contacto:</strong> ${hMail}</li>
<li><strong>Adjuntos:</strong> ${input.attachmentCount}</li>
</ul>
<p><a href="${escapeHtml(input.driveFolderUrl)}">Abrir carpeta del expediente en Drive</a></p>
<p><a href="${escapeHtml(input.driveViewUrl)}">Abrir PDF resumen KYB</a></p>
<p style="color:#64748b;font-size:12px">Notificación automática.</p>
</body></html>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        text,
        html,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      return {
        sent: false,
        error: errBody || `resend_http_${res.status}`,
      };
    }
    return { sent: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { sent: false, error: msg };
  }
}
