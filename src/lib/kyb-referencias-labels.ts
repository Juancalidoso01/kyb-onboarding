/** Paso del formulario con referencias comerciales / bancarias. */
export const REFERENCIAS_STEP_ID = "referencias" as const;

export type RefTipoKyB = "bancaria" | "comercial" | "personal" | "otro";

type RefLabelFieldId =
  | "ref_nombre_entidad"
  | "ref_contacto_entidad"
  | "ref_fecha"
  | "ref_anios_relacion"
  | "ref_telefono"
  | "ref_email";

const REF_LABELS: Record<RefLabelFieldId, Record<RefTipoKyB, string>> = {
  ref_nombre_entidad: {
    bancaria: "Nombre del banco o institución financiera",
    comercial: "Nombre de la empresa o contraparte comercial",
    personal: "Nombre completo de la persona de referencia",
    otro: "Nombre de la entidad, persona u organismo que otorga la referencia",
  },
  ref_contacto_entidad: {
    bancaria:
      "Nombre del oficial de cuenta, sucursal o ejecutivo de negocios (si aplica)",
    comercial: "Nombre del contacto en la empresa de referencia",
    personal: "Relación o vínculo de la persona con la organización",
    otro: "Persona de contacto o forma de verificar la referencia (si aplica)",
  },
  ref_fecha: {
    bancaria: "Fecha de emisión de la carta o referencia bancaria",
    comercial: "Fecha del documento de respaldo o último movimiento relevante",
    personal: "Fecha desde la cual puede ubicarse la referencia",
    otro: "Fecha o vigencia del documento o referencia",
  },
  ref_anios_relacion: {
    bancaria: "Antigüedad de la relación bancaria (años)",
    comercial: "Años de relación comercial",
    personal: "Años de conocimiento o relación",
    otro: "Años de relación o vigencia conocida",
  },
  ref_telefono: {
    bancaria: "Teléfono del banco o del contacto indicado",
    comercial: "Teléfono de la empresa de referencia",
    personal: "Teléfono de la persona de referencia",
    otro: "Teléfono de contacto",
  },
  ref_email: {
    bancaria: "Correo del oficial o de la sucursal (si aplica)",
    comercial: "Correo de contacto comercial",
    personal: "Correo de la persona de referencia",
    otro: "Correo de contacto (si aplica)",
  },
};

/**
 * Etiqueta mostrada según `ref_tipo`. Si no aplica o falta el tipo, devuelve `null`
 * y el wizard usa la etiqueta definida en `kyb-steps`.
 */
export function getReferenciasFieldLabel(
  fieldId: string,
  refTipo: string,
): string | null {
  const raw = refTipo.trim();
  if (!raw) return null;
  if (!(raw in REF_LABELS.ref_nombre_entidad)) return null;
  const t = raw as RefTipoKyB;
  const row = REF_LABELS[fieldId as RefLabelFieldId];
  if (!row) return null;
  return row[t] ?? null;
}
