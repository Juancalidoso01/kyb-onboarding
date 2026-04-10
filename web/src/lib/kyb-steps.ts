/**
 * Definición de pasos del onboarding.
 * Cuando tengas el PDF, mapea cada campo del formulario a `fields` y/o
 * `pdfFieldId` (nombre del campo en el PDF si generas el documento por código).
 */
export type KybField = {
  id: string;
  label: string;
  type: "text" | "email" | "tel" | "textarea" | "select";
  placeholder?: string;
  options?: { value: string; label: string }[];
  /** Referencia opcional al nombre del campo en el PDF original */
  pdfFieldId?: string;
};

export type KybStep = {
  id: string;
  title: string;
  description: string;
  fields: KybField[];
};

export const KYB_STEPS: KybStep[] = [
  {
    id: "contacto",
    title: "Contacto y solicitud",
    description:
      "Persona que completa el proceso y canal de contacto (ajusta textos a tu PDF).",
    fields: [
      {
        id: "nombre_completo",
        label: "Nombre completo",
        type: "text",
        placeholder: "Según documento de identidad",
      },
      {
        id: "email",
        label: "Correo electrónico",
        type: "email",
      },
      {
        id: "telefono",
        label: "Teléfono",
        type: "tel",
      },
    ],
  },
  {
    id: "empresa",
    title: "Datos de la empresa",
    description:
      "Razón social, identificación fiscal y domicilio comercial.",
    fields: [
      {
        id: "razon_social",
        label: "Razón social",
        type: "text",
      },
      {
        id: "id_fiscal",
        label: "ID fiscal / RUC / NIT (según país)",
        type: "text",
      },
      {
        id: "direccion",
        label: "Dirección fiscal",
        type: "textarea",
        placeholder: "Calle, ciudad, país",
      },
    ],
  },
  {
    id: "operacion",
    title: "Actividad y volumen",
    description:
      "Sector, descripción del negocio y volumen estimado (ejemplo genérico).",
    fields: [
      {
        id: "sector",
        label: "Sector / industria",
        type: "select",
        options: [
          { value: "", label: "Seleccionar…" },
          { value: "retail", label: "Retail" },
          { value: "servicios", label: "Servicios" },
          { value: "otro", label: "Otro" },
        ],
      },
      {
        id: "descripcion_negocio",
        label: "Descripción del negocio",
        type: "textarea",
      },
    ],
  },
  {
    id: "documentacion",
    title: "Documentación",
    description:
      "Aquí irán cargas de archivos (constitución, IDs, etc.). Por ahora solo nota.",
    fields: [
      {
        id: "nota_docs",
        label: "Comentarios sobre documentos a adjuntar",
        type: "textarea",
        placeholder: "Próximo paso: integrar subida segura de archivos y checklist según tu PDF.",
      },
    ],
  },
];
