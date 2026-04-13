import { jsPDF } from "jspdf";
import { allDocumentacionUploadKeys } from "@/lib/kyb-documentacion";
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
const MARGIN = 18;
const MARGIN_BOTTOM = 24;

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

/**
 * Párrafo con líneas justificadas (última línea alineada a la izquierda).
 */
function addJustifiedBlock(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxW: number,
  fontSize: number,
  color: [number, number, number],
): number {
  const parts = text.split(/\n/).map((p) => p.trim()).filter(Boolean);
  let yy = y;
  for (let pi = 0; pi < parts.length; pi++) {
    yy = addJustifiedParagraph(doc, parts[pi], x, yy, maxW, fontSize, color);
    if (pi < parts.length - 1) yy += 1.5;
  }
  return yy;
}

function addJustifiedParagraph(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxW: number,
  fontSize: number,
  color: [number, number, number],
): number {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(fontSize);
  doc.setTextColor(...color);
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return y;

  const lines: string[][] = [];
  let line: string[] = [];
  for (const word of words) {
    const trial = line.length ? [...line, word].join(" ") : word;
    if (doc.getTextWidth(trial) <= maxW || !line.length) {
      line.push(word);
    } else {
      lines.push(line);
      line = [word];
    }
  }
  if (line.length) lines.push(line);

  const lh = lineHeightMm(fontSize);
  let yy = y;
  for (let li = 0; li < lines.length; li++) {
    const isLast = li === lines.length - 1;
    const ws = lines[li];
    if (!ws.length) continue;
    if (ws.length === 1 || isLast) {
      doc.text(ws.join(" "), x, yy);
    } else {
      let totalW = 0;
      for (const w of ws) totalW += doc.getTextWidth(w);
      const gaps = ws.length - 1;
      const extra = maxW - totalW;
      const gapW = gaps > 0 ? extra / gaps : 0;
      let cx = x;
      for (let i = 0; i < ws.length; i++) {
        doc.text(ws[i], cx, yy);
        cx += doc.getTextWidth(ws[i]) + (i < ws.length - 1 ? gapW : 0);
      }
    }
    yy += lh;
  }
  return yy + 2.5;
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
  doc.setFontSize(8.2);
  doc.setTextColor(...PP_SLATE);
  const labelLines = doc.splitTextToSize(label.toUpperCase(), maxW);
  doc.text(labelLines, x, yy);
  yy += labelLines.length * lineHeightMm(8.2) + 1.2;

  const display = (value ?? "").trim() || "—";
  yy = addJustifiedBlock(doc, display, x, yy, maxW, 9.2, PP_BODY);

  doc.setDrawColor(...PP_LINE);
  doc.setLineWidth(0.12);
  doc.line(x, yy, x + maxW, yy);
  yy += 4;
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
  let y = yStart;
  doc.setDrawColor(...PP_BRAND);
  doc.setLineWidth(0.6);
  doc.line(margin, y, pageW - margin, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...PP_MUTED);
  const left = "GRUPO PUNTO PAGO";
  doc.text(left, margin, y);
  const right = formVersion;
  const rw = doc.getTextWidth(right);
  doc.text(right, pageW - margin - rw, y);
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...PP_BRAND);
  const line1 = "FORMULARIO DEL CLIENTE";
  const line2 = "PERSONA JURÍDICA";
  doc.text(line1, (pageW - doc.getTextWidth(line1)) / 2, y);
  y += 7.5;
  doc.text(line2, (pageW - doc.getTextWidth(line2)) / 2, y);
  y += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...PP_SLATE);
  const sub = "Perfil del cliente — Persona jurídica (debida diligencia)";
  doc.text(sub, (pageW - doc.getTextWidth(sub)) / 2, y);
  y += 8;

  const intro =
    "Este documento resume la información declarada en el formulario digital. " +
    "Los datos tienen carácter declarativo y serán utilizados para identificación, verificación y gestión de riesgos, " +
    "conforme a la normativa aplicable en materia de prevención de blanqueo de capitales y protección de datos personales.";
  y = addJustifiedBlock(doc, intro, margin, y, maxW, 8.5, PP_BODY);
  y += 4;
  return y;
}

function drawSectionBanner(doc: jsPDF, x: number, y: number, maxW: number, title: string): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  const t = title.toUpperCase();
  const lines = doc.splitTextToSize(t, maxW - 5);
  const lineH = lineHeightMm(9.5);
  const h = Math.max(8.5, lines.length * lineH + 4);
  doc.setFillColor(...PP_BRAND);
  doc.rect(x, y, maxW, h, "F");
  doc.setTextColor(255, 255, 255);
  const ty = y + lineH + 2.2;
  doc.text(lines, x + 2.5, ty);
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
    doc.text(`Grupo Punto Pago · ${version}`, MARGIN, pageH - 11);
    const center = `Página ${i} de ${n}`;
    doc.text(center, (pageW - doc.getTextWidth(center)) / 2, pageH - 11);
    const right = formRef.trim() || "—";
    const rw = doc.getTextWidth(right);
    doc.text(right, pageW - MARGIN - rw, pageH - 11);
    doc.setDrawColor(...PP_LINE);
    doc.setLineWidth(0.25);
    doc.line(MARGIN, pageH - 13.5, pageW - MARGIN, pageH - 13.5);
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
    ensureSpace(16);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...PP_TEXT);
    doc.text("RAZÓN SOCIAL", MARGIN, y);
    y += 5;
    y = addJustifiedBlock(doc, rs, MARGIN, y, maxW, 10, PP_TEXT);
    y += 5;
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
        rows.push({
          label: "Nombres de archivo cargados",
          value: keys.map((k) => `${k}: ${values[k]}`).join("; "),
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
      doc.setFontSize(9.2);
      const valueLines = doc.splitTextToSize(
        (r.value || "—").trim() || "—",
        innerW,
      ).length;
      const est =
        labelLines * lineHeightMm(8.2) +
        valueLines * lineHeightMm(9.2) +
        18;
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
    doc.setTextColor(...PP_SLATE);
    doc.text("FIRMA DIGITAL (CAPTURA)", innerX, y);
    y += 5.5;
    try {
      const boxW = Math.min(innerW, 115);
      const boxH = 38;
      doc.addImage(sig, "PNG", innerX, y, boxW, boxH);
      y += boxH + 5;
    } catch {
      y = addJustifiedBlock(
        doc,
        "(No se pudo incrustar la imagen de firma en el PDF.)",
        innerX,
        y,
        innerW,
        8.5,
        PP_MUTED,
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
