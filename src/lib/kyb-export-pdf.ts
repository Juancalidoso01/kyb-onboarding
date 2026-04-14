import { jsPDF } from "jspdf";
import { allDocumentacionUploadKeys } from "@/lib/kyb-documentacion";
import { KYB_PDF_PP_LOGO_PNG_BASE64 } from "@/lib/kyb-pdf-assets";
import type { FormState } from "@/lib/kyb-field-complete";
import {
  displayLabelForSummaryField,
  formatKybValueForSummary,
} from "@/lib/kyb-form-summary-format";
import { isKybStepFieldVisible } from "@/lib/kyb-step-field-visibility";
import type { KybFieldVisibilityContext } from "@/lib/kyb-step-field-visibility";
import {
  isRenderableValueField,
  KYB_PDF_FORM_VERSION,
  PP_SERVICIOS_MULTI_OPTIONS,
  PP_SV_METRICA_PAIRS,
  type KybField,
  type KybStep,
} from "@/lib/kyb-steps";

/** Identidad visual alineada con la app (marca morada Punto Pago). */
const PP_BRAND: [number, number, number] = [71, 73, 182];
const PP_TEXT: [number, number, number] = [11, 11, 19];
const PP_SLATE: [number, number, number] = [51, 65, 85];
const PP_MUTED: [number, number, number] = [100, 116, 139];
const PP_BODY: [number, number, number] = [30, 41, 59];
const PP_LINE: [number, number, number] = [226, 232, 240];
/** Fondo suave alineado con puntopago.net (cards / secciones). */
const PP_SOFT: [number, number, number] = [244, 246, 255];
/** Acento tipo “mark” del sitio (amarillo suave). */
const PP_MARK: [number, number, number] = [255, 249, 138];
const PP_ACCENT: [number, number, number] = [57, 221, 86];
const MARGIN = 18;
const MARGIN_BOTTOM = 24;
const MAX_PDF_VALUE_CHARS = 560;
const MAX_PDF_VALUE_LINES = 13;

function includeFieldInSummaryTable(f: KybField): boolean {
  if (f.hidden) return false;
  if (f.type === "static" || f.type === "heading") return false;
  if (
    f.type === "declaracion_resumen" ||
    f.type === "representante_cierre_flow"
  ) {
    return false;
  }
  if (
    f.type === "punto_pago_servicios_multi" ||
    f.type === "punto_pago_metricas_por_servicio" ||
    f.type === "documentacion_personas"
  ) {
    return false;
  }
  return true;
}

function slugFilenamePart(s: string): string {
  const t = s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const trimmed = t.replace(/^-+|-+$/g, "").slice(0, 48);
  return trimmed || "cliente";
}

/** Nombre de archivo: número de formulario si existe; si no, slug por razón social. */
function kybPdfFilename(values: FormState): string {
  const ref = (values.decl_formulario_ref ?? "").trim();
  if (ref) {
    const safe = ref.replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, "");
    return `${safe}.pdf`;
  }
  const rs = slugFilenamePart((values.razon_social ?? "").trim() || "punto-pago-kyb");
  return `kyb-pj-${rs}.pdf`;
}

function lineHeightMm(fontSize: number): number {
  return fontSize * 0.45;
}

function truncatePdfText(s: string, max: number): string {
  const t = (s ?? "").trim().replace(/\s+/g, " ");
  if (t.length <= max) return t;
  return `${t.slice(0, Math.max(0, max - 1))}…`;
}

function addWrappedLeft(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxW: number,
  fontSize: number,
  color: [number, number, number],
  style: "normal" | "bold" | "italic" | "bolditalic" = "normal",
): number {
  doc.setFont("helvetica", style);
  doc.setFontSize(fontSize);
  doc.setTextColor(...color);
  const lines = doc.splitTextToSize(text.trim() || "—", maxW);
  const lh = lineHeightMm(fontSize);
  let yy = y;
  for (const line of lines) {
    doc.text(line, x, yy);
    yy += lh;
  }
  return yy + 2;
}

function addWrappedValueBlock(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxW: number,
  fontSize: number,
  color: [number, number, number],
  maxLines: number,
): number {
  const display = truncatePdfText(text || "—", MAX_PDF_VALUE_CHARS);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(fontSize);
  doc.setTextColor(...color);
  const lines = doc.splitTextToSize(display, maxW);
  const limited = lines.slice(0, maxLines);
  const lh = lineHeightMm(fontSize);
  let yy = y;
  for (const line of limited) {
    doc.text(line, x, yy);
    yy += lh;
  }
  if (lines.length > maxLines) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(fontSize - 0.6);
    doc.setTextColor(...PP_MUTED);
    doc.text("(Continúa en expediente digital / Sheet)", x, yy);
    yy += lh;
  }
  return yy + 2;
}

/** Fila marca Punto Pago (logo oficial del sitio + copy). */
/** Wordmark PNG 320×132 — mantiene proporción en mm. */
const PP_LOGO_NATIVE_W = 320;
const PP_LOGO_NATIVE_H = 132;

function drawBrandRow(
  doc: jsPDF,
  pageW: number,
  margin: number,
  yStart: number,
): number {
  const y = yStart;
  const stampW = 14;
  const maxLogoW = pageW - margin * 2 - stampW - 5;
  const logoW = Math.min(56, maxLogoW);
  const logoH = (logoW * PP_LOGO_NATIVE_H) / PP_LOGO_NATIVE_W;
  try {
    doc.addImage(
      `data:image/png;base64,${KYB_PDF_PP_LOGO_PNG_BASE64}`,
      "PNG",
      margin,
      y,
      logoW,
      logoH,
    );
  } catch {
    doc.setFillColor(...PP_SOFT);
    doc.roundedRect(margin, y, logoW, logoH, 1.2, 1.2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...PP_BRAND);
    doc.text("punto pago", margin + 2, y + logoH * 0.55);
  }
  const stamp = "KYB";
  doc.setFillColor(...PP_MARK);
  doc.roundedRect(pageW - margin - stampW, y + 1, stampW, 6.2, 1, 1, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...PP_TEXT);
  doc.text(
    stamp,
    pageW - margin - stampW + (stampW - doc.getTextWidth(stamp)) / 2,
    y + 5.4,
  );
  let yy = y + logoH + 2.8;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.6);
  doc.setTextColor(...PP_MUTED);
  const tag = "Grupo Punto Pago  ·  Super app de pagos y servicios  ·  puntopago.net";
  const tagLines = doc.splitTextToSize(tag, pageW - margin * 2);
  doc.text(tagLines, margin, yy);
  yy += tagLines.length * lineHeightMm(7.6) + 2;
  return yy;
}

function addFieldBlock(
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  maxW: number,
): number {
  let yy = y;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.6);
  doc.setTextColor(...PP_BRAND);
  const labelLines = doc.splitTextToSize(label.toUpperCase(), maxW);
  doc.text(labelLines, x, yy);
  yy += labelLines.length * lineHeightMm(7.6) + 0.8;

  const display = (value ?? "").trim() || "—";
  yy = addWrappedValueBlock(
    doc,
    display,
    x,
    yy,
    maxW,
    9,
    PP_BODY,
    MAX_PDF_VALUE_LINES,
  );

  doc.setDrawColor(...PP_LINE);
  doc.setLineWidth(0.1);
  doc.line(x, yy, x + maxW, yy);
  yy += 3.2;
  return yy;
}

function drawCoverHeader(
  doc: jsPDF,
  pageW: number,
  margin: number,
  maxW: number,
  yStart: number,
  formVersion: string,
): number {
  doc.setFillColor(...PP_BRAND);
  doc.rect(0, 0, pageW, 4.2, "F");
  doc.setFillColor(...PP_SOFT);
  doc.rect(0, 4.2, pageW, 28, "F");
  let y = Math.max(11, yStart);

  y = drawBrandRow(doc, pageW, margin, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.setTextColor(...PP_TEXT);
  const line1 = "Formulario KYB";
  doc.text(line1, (pageW - doc.getTextWidth(line1)) / 2, y);
  y += 9;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12.5);
  doc.setTextColor(...PP_BRAND);
  const line2 = "Cliente · persona jurídica";
  doc.text(line2, (pageW - doc.getTextWidth(line2)) / 2, y);
  y += 7;

  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(...PP_SLATE);
  const sub = "Know Your Business — debida diligencia documentada";
  doc.text(sub, (pageW - doc.getTextWidth(sub)) / 2, y);
  y += 7;

  doc.setDrawColor(...PP_BRAND);
  doc.setLineWidth(0.28);
  doc.setLineDashPattern([0.6, 1.2], 0);
  const dashW = 48;
  doc.line((pageW - dashW) / 2, y, (pageW + dashW) / 2, y);
  doc.setLineDashPattern([], 0);
  y += 6;

  const intro =
    "Resumen declarativo del onboarding digital. Uso interno: identificación, verificación y riesgos (AML / datos personales). " +
    "El expediente íntegro permanece en los canales oficiales de Grupo Punto Pago.";
  y = addWrappedLeft(doc, intro, margin, y, maxW, 8.4, PP_BODY);
  y += 3;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...PP_MUTED);
  doc.text(formVersion, margin, y);
  const foot = "puntopago.net";
  doc.text(foot, pageW - margin - doc.getTextWidth(foot), y);
  y += 7;
  return y;
}

function drawSectionBanner(doc: jsPDF, x: number, y: number, maxW: number, title: string): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.2);
  const t = title.toUpperCase();
  const lines = doc.splitTextToSize(t, maxW - 12);
  const lineH = lineHeightMm(9.2);
  const h = Math.max(9, lines.length * lineH + 5);
  doc.setFillColor(...PP_SOFT);
  doc.roundedRect(x, y, maxW, h, 1.8, 1.8, "F");
  doc.setFillColor(...PP_BRAND);
  doc.rect(x, y, 1.5, h, "F");
  doc.setTextColor(...PP_TEXT);
  const ty = y + lineH + 2.6;
  doc.text(lines, x + 4, ty);
  return y + h + 3.5;
}

/** Separador sutil entre secciones (no encierra bloques que puedan partirse entre páginas). */
function drawSectionFooterLine(doc: jsPDF, pageW: number, y: number): number {
  doc.setDrawColor(...PP_LINE);
  doc.setLineWidth(0.35);
  doc.line(MARGIN, y, pageW - MARGIN, y);
  return y + 6;
}

function applyFooters(doc: jsPDF, formRef: string, version: string) {
  const n = doc.getNumberOfPages();
  const pageH = doc.internal.pageSize.getHeight();
  const pageW = doc.internal.pageSize.getWidth();
  for (let i = 1; i <= n; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...PP_MUTED);
    doc.text(`KYB · Grupo Punto Pago · ${version}`, MARGIN, pageH - 11);
    const center = `Página ${i} de ${n}`;
    doc.text(center, (pageW - doc.getTextWidth(center)) / 2, pageH - 11);
    const right = formRef.trim() || "—";
    const rw = doc.getTextWidth(right);
    doc.text(right, pageW - MARGIN - rw, pageH - 11);
    doc.setDrawColor(...PP_LINE);
    doc.setLineWidth(0.22);
    doc.line(MARGIN, pageH - 13.5, pageW - MARGIN, pageH - 13.5);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(6.2);
    doc.text("puntopago.net", pageW - MARGIN - doc.getTextWidth("puntopago.net"), pageH - 7.2);
  }
}

function renderKybPdfToDoc(
  values: FormState,
  summarySteps: KybStep[],
  visibility: KybFieldVisibilityContext,
): InstanceType<typeof jsPDF> {
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const maxW = pageW - MARGIN * 2;
  const yMax = pageH - MARGIN_BOTTOM;
  let y = MARGIN;

  const ensureSpace = (need: number) => {
    if (y + need > yMax) {
      doc.addPage();
      y = MARGIN;
    }
  };

  y = drawCoverHeader(doc, pageW, MARGIN, maxW, y, KYB_PDF_FORM_VERSION);

  const rs = (values.razon_social ?? "").trim();
  if (rs) {
    const rsT = truncatePdfText(rs, 240);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    const rsLines = doc.splitTextToSize(rsT, maxW - 7).length;
    const boxH = 8 + rsLines * lineHeightMm(11) + 3;
    ensureSpace(boxH + 4);
    doc.setFillColor(...PP_SOFT);
    doc.roundedRect(MARGIN, y - 1, maxW, boxH, 2, 2, "F");
    doc.setFillColor(...PP_MARK);
    doc.rect(MARGIN, y - 1, 2.2, boxH, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.4);
    doc.setTextColor(...PP_BRAND);
    doc.text("RAZÓN SOCIAL", MARGIN + 5, y + 3.6);
    y = addWrappedLeft(
      doc,
      rsT,
      MARGIN + 5,
      y + 6.2,
      maxW - 7,
      11,
      PP_TEXT,
      "bold",
    );
    y += 3;
  }

  for (const st of summarySteps) {
    const rows: { label: string; value: string }[] = [];
    for (const f of st.fields) {
      if (!includeFieldInSummaryTable(f)) continue;
      if (!isKybStepFieldVisible(st, f, values, visibility)) continue;
      if (!isRenderableValueField(f)) continue;
      rows.push({
        label: displayLabelForSummaryField(f, values, st.id),
        value: formatKybValueForSummary(f, values),
      });
    }

    if (st.id === "servicios_punto_pago") {
      const selected = PP_SERVICIOS_MULTI_OPTIONS.filter(
        (o) => values[o.id] === "true",
      );
      if (selected.length > 0) {
        rows.push({
          label: "Servicios Punto Pago elegidos",
          value: selected.map((o) => o.label).join(" · "),
        });
      }
      for (const row of PP_SV_METRICA_PAIRS) {
        if (values[row.serviceId] !== "true") continue;
        const opt = PP_SERVICIOS_MULTI_OPTIONS.find((o) => o.id === row.serviceId);
        const m = (values[row.montoId] ?? "").trim();
        const t = (values[row.txId] ?? "").trim();
        if (!m && !t) continue;
        rows.push({
          label: `${opt?.label ?? row.serviceId} — métricas`,
          value: `USD/mes: ${m || "—"} · Transacciones/mes: ${t || "—"}`,
        });
      }
    }

    if (st.id === "documentacion_entregar") {
      const keys = allDocumentacionUploadKeys().filter((k) =>
        (values[k] ?? "").trim(),
      );
      if (keys.length > 0) {
        const shortList = keys
          .slice(0, 4)
          .map((k) => `${k}: ${truncatePdfText((values[k] ?? "").trim(), 48)}`)
          .join(" · ");
        const more =
          keys.length > 4 ? ` (+${keys.length - 4} más en expediente)` : "";
        rows.push({
          label: "Documentación cargada",
          value: `${keys.length} archivo(s). ${shortList}${more}`,
        });
      }
    }

    if (!rows.length) continue;

    const innerX = MARGIN + 3.5;
    const innerW = maxW - 7;

    ensureSpace(14);
    y += 5;
    ensureSpace(12);
    y = drawSectionBanner(doc, innerX, y, innerW, st.title);

    for (const r of rows) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.2);
      const labelLines = doc.splitTextToSize(r.label.toUpperCase(), innerW).length;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const valuePreview = truncatePdfText(
        (r.value || "—").trim() || "—",
        MAX_PDF_VALUE_CHARS,
      );
      const valueLines = Math.min(
        doc.splitTextToSize(valuePreview, innerW).length,
        MAX_PDF_VALUE_LINES + 1,
      );
      const est =
        labelLines * lineHeightMm(7.6) +
        valueLines * lineHeightMm(9) +
        16;
      ensureSpace(est);
      y = addFieldBlock(doc, r.label, r.value, innerX, y, innerW);
    }

    y += 2;
    y = drawSectionFooterLine(doc, pageW, y);
  }

  ensureSpace(40);
  y += 4;
  const innerX = MARGIN + 3.5;
  const innerW = maxW - 7;
  ensureSpace(12);
  y = drawSectionBanner(
    doc,
    innerX,
    y,
    innerW,
    "Declaración y verificación del representante",
  );

  ensureSpace(14);
  doc.setFillColor(...PP_SOFT);
  doc.roundedRect(innerX, y, innerW, 8, 1.2, 1.2, "F");
  doc.setDrawColor(...PP_ACCENT);
  doc.setLineWidth(0.4);
  doc.line(innerX, y + 1.2, innerX + 1.8, y + 6.8);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(...PP_SLATE);
  doc.text(
    "« Verificación de identidad y firma digital — trazabilidad del expediente »",
    innerX + 4,
    y + 5.2,
  );
  y += 10;

  const dn = (values.decl_director_nombre ?? "").trim();
  const df = (values.decl_fecha ?? "").trim();
  const vid = (values.decl_metamap_verification_id ?? "").trim();
  const iid = (values.decl_metamap_identity_id ?? "").trim();
  const formRef = (values.decl_formulario_ref ?? "").trim();

  ensureSpace(30);
  y = addFieldBlock(doc, "Nombre quien suscribe la declaración", dn || "—", innerX, y, innerW);
  ensureSpace(20);
  y = addFieldBlock(doc, "Fecha de la declaración", df || "—", innerX, y, innerW);
  ensureSpace(20);
  y = addFieldBlock(
    doc,
    "Referencia verificación de identidad",
    vid || "—",
    innerX,
    y,
    innerW,
  );
  if (iid) {
    ensureSpace(20);
    y = addFieldBlock(doc, "Referencia identidad", iid, innerX, y, innerW);
  }
  if (formRef) {
    ensureSpace(20);
    y = addFieldBlock(doc, "Número de formulario", formRef, innerX, y, innerW);
  }

  const sig = (values.decl_firma_canvas_data_url ?? "").trim();
  if (sig.startsWith("data:image")) {
    ensureSpace(52);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...PP_BRAND);
    doc.text("Firma digital (captura en pantalla)", innerX, y);
    y += 5.5;
    try {
      const boxW = Math.min(innerW, 115);
      const boxH = 38;
      doc.addImage(sig, "PNG", innerX, y, boxW, boxH);
      y += boxH + 5;
    } catch {
      y = addWrappedLeft(
        doc,
        "(No se pudo incrustar la imagen de firma en el PDF.)",
        innerX,
        y,
        innerW,
        8.5,
        PP_MUTED,
        "italic",
      );
    }
  }

  y += 3;
  y = drawSectionFooterLine(doc, pageW, y);

  const footerRef = formRef || "Borrador sin número asignado";
  applyFooters(doc, footerRef, KYB_PDF_FORM_VERSION);
  return doc;
}

/** Genera el PDF en memoria (servidor: subida a Drive, etc.). */
export function buildKybPdfBuffer(
  values: FormState,
  summarySteps: KybStep[],
  visibility: KybFieldVisibilityContext,
): Buffer {
  const doc = renderKybPdfToDoc(values, summarySteps, visibility);
  return Buffer.from(doc.output("arraybuffer") as ArrayBuffer);
}

/**
 * Genera un PDF con el resumen de respuestas, referencias de verificación de identidad,
 * e imagen de la firma digital si existe y lo descarga en el navegador.
 */
export function buildAndDownloadKybPdf(
  values: FormState,
  summarySteps: KybStep[],
  visibility: KybFieldVisibilityContext,
): void {
  const doc = renderKybPdfToDoc(values, summarySteps, visibility);
  doc.save(kybPdfFilename(values));
}
