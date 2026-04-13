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

/**
 * Genera un PDF con el resumen de respuestas, datos MetaMap, nombre y fecha de declaración,
 * e imagen de la firma digital si existe.
 */
export function buildAndDownloadKybPdf(
  values: FormState,
  summarySteps: KybStep[],
  visibility: KybFieldVisibilityContext,
): void {
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 14;
  const maxW = pageW - margin * 2;
  let y = margin;

  const ensureSpace = (h: number) => {
    if (y + h > 280) {
      doc.addPage();
      y = margin;
    }
  };

  const addParagraphs = (text: string, size: number) => {
    const lines = doc.splitTextToSize(text, maxW);
    ensureSpace(lines.length * size * 0.45 + 2);
    doc.setFontSize(size);
    doc.setTextColor(15, 23, 42);
    doc.text(lines, margin, y);
    y += lines.length * size * 0.45 + 3;
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(11, 11, 19);
  doc.text("Formulario KYB — Persona jurídica (borrador)", margin, y);
  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(71, 73, 182);
  doc.text(`Versión formulario: ${KYB_PDF_FORM_VERSION}`, margin, y);
  y += 7;

  const rs = (values.razon_social ?? "").trim();
  if (rs) {
    doc.setTextColor(15, 23, 42);
    addParagraphs(`Razón social: ${rs}`, 10);
  }

  for (const st of summarySteps) {
    ensureSpace(12);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(51, 65, 85);
    doc.text(st.title, margin, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

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

    for (const r of rows) {
      const block = `${r.label}: ${r.value}`;
      const lines = doc.splitTextToSize(block, maxW);
      ensureSpace(lines.length * 4.2 + 2);
      doc.setTextColor(51, 65, 85);
      doc.text(lines, margin, y);
      y += lines.length * 4.2 + 1;
    }
    y += 4;
  }

  ensureSpace(22);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(51, 65, 85);
  doc.text("Declaración y verificación del representante", margin, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  const dn = (values.decl_director_nombre ?? "").trim();
  const df = (values.decl_fecha ?? "").trim();
  const vid = (values.decl_metamap_verification_id ?? "").trim();
  const iid = (values.decl_metamap_identity_id ?? "").trim();
  addParagraphs(
    `Nombre quien suscribe la declaración: ${dn || "—"}\nFecha declaración: ${df || "—"}\nMetaMap verificationId: ${vid || "—"}${iid ? `\nMetaMap identityId: ${iid}` : ""}`,
    9,
  );

  const formRef = (values.decl_formulario_ref ?? "").trim();
  if (formRef) {
    addParagraphs(`Número de formulario: ${formRef}`, 9);
  }

  const sig = (values.decl_firma_canvas_data_url ?? "").trim();
  if (sig.startsWith("data:image")) {
    ensureSpace(50);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Firma digital (captura)", margin, y);
    y += 5;
    try {
      const iw = 120;
      const ih = 40;
      doc.addImage(sig, "PNG", margin, y, iw, ih);
      y += ih + 6;
    } catch {
      addParagraphs("(No se pudo incrustar la imagen de firma en el PDF.)", 9);
    }
  }

  const stamp = slugFilenamePart(rs || "punto-pago-kyb");
  const fname = `kyb-pj-${stamp}.pdf`;
  doc.save(fname);
}
