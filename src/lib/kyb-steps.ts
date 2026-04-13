import { SOCIEDAD_COMBO_OPTIONS } from "@/data/sociedad-tipos";
import { DOCUMENTACION_PERSONAS_FIELD_ID } from "@/lib/kyb-documentacion";
import { PEP_MEMBER_SLOTS_MAX } from "@/lib/kyb-pep-content";

/**
 * Formulario «Perfil del Cliente PJ» — Punto Pago Panamá V2-2026 (PDF V002-2026).
 * Campos alineados por sección del PDF; ids estables para API / generación de PDF futura.
 */
export const KYB_PDF_FORM_VERSION = "V002-2026";

export type KybFieldType =
  | "text"
  | "email"
  | "tel"
  | "textarea"
  | "select"
  | "checkbox"
  | "yesno"
  | "heading"
  | "static"
  | "date"
  | "combobox"
  | "country"
  | "activity_search"
  | "profession_search"
  | "percent"
  /** Listas de carga por junta / accionistas / representante (solo UI). */
  | "documentacion_personas"
  /** Adjunto de un archivo; el estado guarda el nombre del archivo mostrado. */
  | "file"
  /** Multiselect de servicios PP (sincroniza `pp_sv_*`). */
  | "punto_pago_servicios_multi"
  /** Monto mensual y transacciones solo para servicios seleccionados. */
  | "punto_pago_metricas_por_servicio";

export type KybField = {
  id: string;
  label: string;
  type: KybFieldType;
  placeholder?: string;
  options?: { value: string; label: string; disabled?: boolean }[];
  /** Texto de ayuda bajo el campo */
  hint?: string;
  /**
   * Con `type: checkbox`, muestra un segundo control con `input type=file`;
   * el nombre del archivo se guarda en esta clave de estado.
   */
  fileAttachmentId?: string;
  /** Bloques de texto para `type: "static"` (p. ej. intro con varios párrafos justificados). */
  staticParagraphs?: string[];
  /** Valor en estado/API pero sin control visible (sincronizado por lógica). */
  hidden?: boolean;
  /**
   * Montos en USD o cantidades: separadores de miles al escribir; el estado guarda valor «canónico» (solo dígitos; USD admite hasta 2 decimales).
   */
  numberFormat?: "usd" | "quantity";
};

export type KybStep = {
  id: string;
  /** Título como en el PDF (mayúsculas cuando el impreso lo usa así) */
  title: string;
  description: string;
  /** Ubicación en el formulario impreso V002-2026 (útil para generar PDF final) */
  pdfPage?: string;
  fields: KybField[];
};

/** Paso junta / consejo: máximo de filas en PDF; la UI muestra 1 al inicio y “+” para el resto. */
export const JUNTA_DIRECTIVA_STEP_ID = "junta_directiva" as const;
export const JUNTA_MEMBER_SLOTS_MAX = 5;

/** Índice de miembro (1..N) si el id pertenece a la sección junta; si no, null. */
export function juntaFieldMemberSlot(fieldId: string): number | null {
  const h = fieldId.match(/^__h_junta_(\d+)$/);
  if (h) return parseInt(h[1], 10);
  const j = fieldId.match(/^junta_(\d+)_/);
  if (j) return parseInt(j[1], 10);
  return null;
}

/** Claves de valor por fila de junta (para vaciar al eliminar último miembro). Solo persona natural. */
export const JUNTA_MEMBER_FIELD_SUFFIXES = [
  "cargo",
  "fecha_nacimiento",
  "nombre_completo",
  "cedula_pasaporte",
  "nacionalidad",
  "direccion",
] as const;

export function formKeysForJuntaMemberSlot(slot: number): string[] {
  return JUNTA_MEMBER_FIELD_SUFFIXES.map((s) => `junta_${slot}_${s}`);
}

/** Beneficiarios finales: hasta 20 filas en la web (PDF impreso puede tener menos líneas). */
export const BENEFICIARIOS_FINALES_STEP_ID = "beneficiarios_finales" as const;
export const BF_MEMBER_SLOTS_MAX = 20;

export function bfFieldMemberSlot(fieldId: string): number | null {
  const h = fieldId.match(/^__h_bf_(\d+)$/);
  if (h) return parseInt(h[1], 10);
  const j = fieldId.match(/^bf_(\d+)_/);
  if (j) return parseInt(j[1], 10);
  return null;
}

const BF_MEMBER_FIELD_SUFFIXES = [
  "tipo_persona",
  "fecha_nacimiento",
  "nombre_completo",
  "cedula_pasaporte",
  "razon_social",
  "ruc",
  "nacionalidad",
  "pais_nacimiento",
  "fecha_condicion_bf",
  "pct_participacion",
  "direccion",
] as const;

export function formKeysForBfMemberSlot(slot: number): string[] {
  return BF_MEMBER_FIELD_SUFFIXES.map((s) => `bf_${slot}_${s}`);
}

/** Servicios de interés con Punto Pago (checkboxes del paso `servicios_punto_pago`). */
export const PP_SERVICIOS_CHECKBOX_IDS = [
  "pp_sv_recaudacion",
  "pp_sv_hub_pagos",
  "pp_sv_dispersion_fondos",
  "pp_sv_agente_subagente",
  "pp_sv_remesas",
  "pp_sv_prestamos_financieras",
  "pp_sv_emision_tarjetas",
  "pp_sv_reventa",
  "pp_sv_otros",
] as const;

/** Etiquetas para la lista desplegable multiselect (mismo orden que `PP_SERVICIOS_CHECKBOX_IDS`). */
export const PP_SERVICIOS_MULTI_OPTIONS: { id: (typeof PP_SERVICIOS_CHECKBOX_IDS)[number]; label: string }[] =
  [
    { id: "pp_sv_recaudacion", label: "Recaudación de pagos" },
    { id: "pp_sv_hub_pagos", label: "Hub de pagos" },
    { id: "pp_sv_dispersion_fondos", label: "Dispersión de fondos" },
    { id: "pp_sv_agente_subagente", label: "Agente o subagente de Punto Pago" },
    { id: "pp_sv_remesas", label: "Servicios relacionados a remesas" },
    {
      id: "pp_sv_prestamos_financieras",
      label: "Servicios relacionados a préstamos o financieras",
    },
    {
      id: "pp_sv_emision_tarjetas",
      label: "Servicios relacionados a emisión de tarjetas",
    },
    { id: "pp_sv_reventa", label: "Reventa de servicios de Punto Pago" },
    { id: "pp_sv_otros", label: "Otros" },
  ];

/**
 * Por cada servicio marcado: monto mensual (USD) y número de transacciones mensuales.
 * Incluye «Otros» (además de `pp_sv_otros_especifique`).
 */
export const PP_SV_METRICA_PAIRS = [
  {
    serviceId: "pp_sv_recaudacion",
    montoId: "pp_mm_recaudacion",
    txId: "pp_tx_mensual_recaudacion",
  },
  {
    serviceId: "pp_sv_hub_pagos",
    montoId: "pp_mm_hub_pagos",
    txId: "pp_tx_mensual_hub_pagos",
  },
  {
    serviceId: "pp_sv_dispersion_fondos",
    montoId: "pp_mm_dispersion_fondos",
    txId: "pp_tx_mensual_dispersion_fondos",
  },
  {
    serviceId: "pp_sv_agente_subagente",
    montoId: "pp_mm_agente_subagente",
    txId: "pp_tx_mensual_agente_subagente",
  },
  {
    serviceId: "pp_sv_remesas",
    montoId: "pp_mm_remesas",
    txId: "pp_tx_mensual_remesas",
  },
  {
    serviceId: "pp_sv_prestamos_financieras",
    montoId: "pp_mm_prestamos_financieras",
    txId: "pp_tx_mensual_prestamos_financieras",
  },
  {
    serviceId: "pp_sv_emision_tarjetas",
    montoId: "pp_mm_emision_tarjetas",
    txId: "pp_tx_mensual_emision_tarjetas",
  },
  {
    serviceId: "pp_sv_reventa",
    montoId: "pp_mm_reventa",
    txId: "pp_tx_mensual_reventa",
  },
  {
    serviceId: "pp_sv_otros",
    montoId: "pp_mm_otros",
    txId: "pp_tx_mensual_otros",
  },
] as const;

/** Claves de estado: montos y transacciones por servicio. */
export function allPuntoPagoMetricFieldKeys(): string[] {
  const keys: string[] = [];
  for (const m of PP_SV_METRICA_PAIRS) {
    keys.push(m.montoId, m.txId);
  }
  return keys;
}

export function algunaSeleccionServicioPuntoPago(
  values: Record<string, string>,
): boolean {
  return PP_SERVICIOS_CHECKBOX_IDS.some((id) => values[id] === "true");
}

/** Si cotiza en bolsa, el paso de accionistas/beneficiario final no aplica (datos públicos). */
export function filterStepsByCotizaBolsa(
  allSteps: KybStep[],
  cotizaBolsa: string | undefined,
): KybStep[] {
  if ((cotizaBolsa ?? "").trim() === "si") {
    return allSteps.filter((s) => s.id !== BENEFICIARIOS_FINALES_STEP_ID);
  }
  return allSteps;
}

export const KYB_STEPS: KybStep[] = [
  {
    id: "intro_formulario",
    title: "FORMULARIO PERFIL DEL CLIENTE — PERSONA JURÍDICA",
    description:
      "Indique quién diligencia este formulario. Los demás pasos se personalizarán con su nombre.",
    pdfPage: "Pág. 1 (encabezado)",
    fields: [
      {
        id: "nombre_diligencia",
        label: "Nombre completo de quien diligencia este formulario",
        type: "text",
        placeholder: "Ej. María González de León",
      },
    ],
  },
  {
    id: "como_conocio",
    title: "INDIQUE COMO CONOCIÓ A LA EMPRESA",
    description: "Marque las opciones que apliquen.",
    pdfPage: "Pág. 1",
    fields: [
      {
        id: "conocio_mercadeo",
        label: "Mercadeo",
        type: "checkbox",
      },
      {
        id: "conocio_referencia_interna",
        label: "Referencia Interna",
        type: "checkbox",
      },
      {
        id: "conocio_cliente_antiguo",
        label: "Cliente Antiguo",
        type: "checkbox",
      },
      {
        id: "conocio_redes_web",
        label: "Redes sociales, página web, mensajería instantánea",
        type: "checkbox",
      },
      {
        id: "conocio_referencia_externa",
        label: "Referencia Externa",
        type: "checkbox",
      },
      {
        id: "conocio_otro_texto",
        label: "Otro:",
        type: "text",
      },
    ],
  },
  {
    id: "identificacion_cliente",
    title: "IDENTIFICACIÓN DEL CLIENTE",
    description:
      "Nombre de razón social y comercial, tipo de persona jurídica, sociedad, actividad, bolsa, capital, países, identificación tributaria y documento de identidad, persona de contacto.",
    pdfPage: "Pág. 1",
    fields: [
      {
        id: "razon_social",
        label: "Nombre de Razón Social",
        type: "text",
      },
      {
        id: "razon_comercial",
        label: "Nombre de Razón Comercial",
        type: "text",
      },
      {
        id: "pj_nacional_extranjera",
        label: "Persona jurídica (marque la que corresponda)",
        type: "select",
        options: [
          { value: "", label: "Seleccionar…" },
          { value: "pj_nacional", label: "Persona Jurídica Nacional" },
          { value: "pj_extranjera", label: "Persona Jurídica Extranjera" },
        ],
      },
      {
        id: "operativa_estado",
        label: "Estado operativo",
        type: "select",
        options: [
          { value: "", label: "Seleccionar…" },
          { value: "operativa", label: "Operativa" },
          { value: "no_operativa", label: "No Operativa" },
        ],
      },
      {
        id: "tipo_sociedad",
        label: "Tipo de Sociedad",
        type: "combobox",
        options: SOCIEDAD_COMBO_OPTIONS,
      },
      {
        id: "tipo_sociedad_otros_especifique",
        label: "Especifique el tipo de sociedad (solo si eligió «Otro»)",
        type: "textarea",
      },
      {
        id: "actividad_empresa",
        label: "Actividad a la que se dedica su empresa",
        type: "activity_search",
        placeholder: "Buscar actividad…",
      },
      {
        id: "actividad_empresa_especifique",
        label: "Describa la actividad (solo si eligió «Actividad no enlistada»)",
        type: "textarea",
      },
      {
        id: "pct_actividad",
        label: "% de actividad dedicada (si aplica)",
        type: "percent",
        placeholder: "0–100",
        hint: "Solo valores de 0 a 100. Deje vacío si no aplica.",
      },
      {
        id: "cotiza_bolsa",
        label: "Esta Compañía cotiza en la bolsa",
        type: "yesno",
        hint: "Si responde «Sí», no se mostrará el paso «Accionistas o beneficiario final» (información pública).",
      },
      {
        id: "forma_capital",
        label: "Forma de Capital",
        type: "select",
        options: [
          { value: "", label: "Seleccionar…" },
          { value: "nominativas", label: "Acciones Nominativas" },
          { value: "portador", label: "Acciones al Portador" },
          { value: "cuotas", label: "Cuotas de Participación" },
        ],
      },
      {
        id: "fecha_constitucion",
        label: "Fecha de Constitución",
        type: "date",
      },
      {
        id: "pais_opera",
        label: "País donde Opera",
        type: "country",
      },
      {
        id: "pais_constitucion",
        label: "País de Constitución",
        type: "country",
      },
      {
        id: "pais_tributa_ingresos",
        label: "País donde Tributa sus ingresos",
        type: "country",
      },
      {
        id: "no_identificacion_tributaria",
        label: "No. De identificación tributaria",
        type: "text",
      },
      {
        id: "doc_identidad_tipo",
        label: "Documento de Identidad (escoja una opción)",
        type: "select",
        options: [
          { value: "", label: "Seleccionar…" },
          { value: "ruc_empresarial", label: "RUC Empresarial" },
          { value: "ficha_documento", label: "Ficha o Documento" },
          { value: "aviso_operaciones", label: "Aviso de Operaciones" },
          { value: "nit", label: "NIT" },
          { value: "otro_id", label: "Otro ID" },
        ],
      },
      {
        id: "doc_identidad_otro",
        label: "Especifique el documento (solo si eligió «Otro ID» arriba)",
        type: "text",
      },
      {
        id: "doc_identidad_numero",
        label: "No. de Documento",
        type: "text",
      },
      {
        id: "persona_contacto_nombre",
        label: "Nombre de Persona Contacto",
        type: "text",
      },
      {
        id: "persona_contacto_cargo",
        label: "Cargo",
        type: "select",
        options: [
          { value: "", label: "Seleccionar…" },
          {
            value: "director_cumplimiento",
            label: "Director(a) de cumplimiento",
          },
          {
            value: "oficial_cumplimiento",
            label: "Oficial de cumplimiento (compliance)",
          },
          { value: "gerente_riesgos", label: "Gerente de riesgos" },
          { value: "gerente_legal", label: "Gerente legal" },
          {
            value: "representante_legal",
            label: "Representante legal / apoderado(a)",
          },
          {
            value: "finanzas_contabilidad",
            label: "Finanzas / contabilidad",
          },
          { value: "otro_cargo", label: "Otro (especifique abajo)" },
        ],
      },
      {
        id: "persona_contacto_cargo_especifique",
        label: "Especifique el cargo",
        type: "text",
      },
      {
        id: "persona_contacto_telefono",
        label: "Teléfono",
        type: "tel",
      },
      {
        id: "persona_contacto_correo",
        label: "Correo",
        type: "email",
      },
    ],
  },
  {
    id: "datos_generales",
    title: "DATOS GENERALES",
    description:
      "Dirección comercial y auxiliar (misma búsqueda asistida en Panamá), país/provincia/ciudad según identificación y dirección; teléfonos y correo.",
    pdfPage: "Pág. 1",
    fields: [
      {
        id: "direccion_comercial",
        label:
          "Dirección Comercial de la empresa (Calle, Número, Urbanización/Edificio, Piso, Local, etc.)",
        type: "textarea",
      },
      {
        id: "direccion_auxiliar",
        label:
          "Dirección Auxiliar de Facturación o Correspondencia (si es diferente a la anterior)",
        type: "textarea",
      },
      {
        id: "pais",
        label: "País",
        type: "country",
        hidden: true,
      },
      {
        id: "ciudad",
        label: "Ciudad",
        type: "text",
        hidden: true,
      },
      {
        id: "provincia",
        label: "Provincia",
        type: "text",
        hidden: true,
      },
      {
        id: "telefonos_generales",
        label: "Teléfono(s)",
        type: "text",
        hint: "Mismo prefijo que en identificación del cliente. Fijo o celular (8 dígitos tras +507). Varios números: péguelos con coma o escríbalos en el campo completo.",
      },
      {
        id: "celulares_generales",
        label: "Celular(es)",
        type: "text",
        hint: "Prefijo según país de la empresa; suelen ser celulares (ej. 6…). Varios números: igual que en teléfonos, con coma.",
      },
      {
        id: "email_generales",
        label: "E-mail",
        type: "email",
      },
    ],
  },
  {
    id: "junta_directiva",
    title:
      "GOBIERNO CORPORATIVO / JUNTA DIRECTIVA / CONSEJO FUNDACIONAL",
    description:
      "Indique al menos un miembro de la junta o consejo como persona natural: cargo, fecha de nacimiento, nombre completo, documento, nacionalidad y dirección. La opción persona natural o jurídica aplica solo en el paso de accionistas o beneficiario final. Puede añadir filas con + Agregar miembro o quitar la última con Eliminar último miembro si se equivocó.",
    pdfPage: "Pág. 1–2",
    fields: [
      ...[1, 2, 3, 4, 5].flatMap(
        (n) =>
          [
            {
              id: `__h_junta_${n}`,
              label: `Miembro ${n}`,
              type: "heading" as const,
            },
            {
              id: `junta_${n}_cargo`,
              label: `Cargo (miembro ${n})`,
              type: "select" as const,
              options: [
                { value: "", label: "Seleccionar…" },
                { value: "presidente", label: "Presidente" },
                { value: "vicepresidente", label: "Vicepresidente" },
                { value: "secretario", label: "Secretario" },
                { value: "tesorero", label: "Tesorero" },
                { value: "director", label: "Director" },
                { value: "otro", label: "Otro" },
              ],
            },
            {
              id: `junta_${n}_fecha_nacimiento`,
              label: "Fecha de nacimiento",
              type: "date" as const,
            },
            {
              id: `junta_${n}_nombre_completo`,
              label: "Nombre completo",
              type: "text" as const,
            },
            {
              id: `junta_${n}_cedula_pasaporte`,
              label: "Cédula o pasaporte",
              type: "text" as const,
            },
            {
              id: `junta_${n}_nacionalidad`,
              label: "Nacionalidad",
              type: "country" as const,
              placeholder: "Buscar país…",
            },
            {
              id: `junta_${n}_direccion`,
              label: "Dirección",
              type: "textarea" as const,
            },
          ] satisfies KybField[],
      ),
    ],
  },
  {
    id: "representante_legal",
    title: "REPRESENTANTE LEGAL O APODERADO",
    description:
      "Nombre, identificación, nacionalidad, dirección, teléfono, correo, profesión, actividad económica, país de residencia y declaración sobre investigaciones.",
    pdfPage: "Pág. 2",
    fields: [
      {
        id: "rep_nombre_apellido",
        label: "Nombre y Apellido",
        type: "text",
      },
      {
        id: "rep_identificacion",
        label: "No. Identificación",
        type: "text",
      },
      {
        id: "rep_nacionalidad",
        label: "Nacionalidad",
        type: "country",
        placeholder: "Buscar país…",
      },
      {
        id: "rep_direccion",
        label: "Dirección",
        type: "textarea",
      },
      {
        id: "rep_telefono",
        label: "Teléfono",
        type: "tel",
      },
      {
        id: "rep_correo",
        label: "Correo",
        type: "email",
      },
      {
        id: "rep_profesion",
        label: "Profesión / Ocupación",
        type: "profession_search",
        placeholder: "Buscar profesión u ocupación…",
      },
      {
        id: "rep_actividad_economica",
        label: "Actividad Económica",
        type: "activity_search",
        placeholder: "Buscar actividad económica…",
      },
      {
        id: "rep_actividad_economica_especifique",
        label:
          "Describa la actividad económica (solo si eligió «Actividad no enlistada»)",
        type: "textarea",
      },
      {
        id: "rep_pais_residencia",
        label: "País de Residencia",
        type: "country",
      },
      {
        id: "rep_investigacion_ilicita",
        label:
          "Indique si el Representante Legal, Apoderado o la Sociedad misma son o han sido objeto de investigación, indagación, condena por actividad ilícita, delitos de blanqueo de capitales o financiamiento de terrorismo, fraude o corrupción pública o algunos de los delitos establecidos en el ART.254-A del código penal.",
        type: "yesno",
      },
      {
        id: "rep_investigacion_explicacion",
        label: "En caso afirmativo, explique",
        type: "textarea",
      },
    ],
  },
  {
    id: "beneficiarios_finales",
    title: "ACCIONISTAS O BENEFICIARIO FINAL",
    description: "",
    pdfPage: "Pág. 2",
    fields: [
      {
        id: "static_bf_definicion",
        label: "",
        type: "static",
        staticParagraphs: [
          "Indique al menos un beneficiario final o accionista, ya sea persona natural o jurídica, completando los datos solicitados (similar a la sección de Gobierno / Junta). Puede agregar hasta 20 registros con el botón «+ Agregar persona» o eliminar el último con «Eliminar última fila».",
          "Se debe procurar identificar que al menos un 10% o más de la participación o control corresponda a personas naturales. El objetivo es identificar a las personas naturales que, directa o indirectamente, poseen, controlan o ejercen influencia significativa, incluso cuando existan personas jurídicas en la estructura.",
          "Se consideran beneficiarios finales las personas naturales que ejercen el control final o en cuyo nombre o beneficio se realiza una transacción.",
        ],
      },
      ...Array.from({ length: BF_MEMBER_SLOTS_MAX }, (_, i) => i + 1).flatMap(
        (n) =>
          [
            {
              id: `__h_bf_${n}`,
              label: `Fila ${n} — Beneficiario final / accionista`,
              type: "heading" as const,
            },
            {
              id: `bf_${n}_tipo_persona`,
              label: "Persona natural o jurídica",
              type: "select" as const,
              options: [
                { value: "", label: "Seleccionar…" },
                { value: "N", label: "Persona natural" },
                { value: "J", label: "Persona jurídica" },
              ],
            },
            {
              id: `bf_${n}_fecha_nacimiento`,
              label: "Fecha de nacimiento",
              type: "date" as const,
            },
            {
              id: `bf_${n}_nombre_completo`,
              label: "Nombre completo",
              type: "text" as const,
            },
            {
              id: `bf_${n}_cedula_pasaporte`,
              label: "Cédula o pasaporte",
              type: "text" as const,
            },
            {
              id: `bf_${n}_razon_social`,
              label: "Razón social",
              type: "text" as const,
            },
            {
              id: `bf_${n}_ruc`,
              label: "RUC",
              type: "text" as const,
            },
            {
              id: `bf_${n}_nacionalidad`,
              label: "Nacionalidad",
              type: "country" as const,
              placeholder: "Buscar país…",
            },
            {
              id: `bf_${n}_pais_nacimiento`,
              label: "País de nacimiento o de constitución",
              type: "country" as const,
            },
            {
              id: `bf_${n}_fecha_condicion_bf`,
              label: "Fecha en la que adquiere condición de Beneficiario final",
              type: "date" as const,
            },
            {
              id: `bf_${n}_pct_participacion`,
              label: "% De Participación en la empresa",
              type: "percent" as const,
              placeholder: "0–100",
              hint: "Solo valores de 0 a 100. Deje vacío si no aplica.",
            },
            {
              id: `bf_${n}_direccion`,
              label: "Dirección",
              type: "textarea" as const,
            },
          ] satisfies KybField[],
      ),
    ],
  },
  {
    id: "perfil_financiero",
    title: "PERFIL FINANCIERO",
    description:
      "Refleja el tamaño económico general de su organización (facturación o ingresos de la empresa en su conjunto), no el volumen ligado a los servicios de Punto Pago que detallará más adelante. Cuando ya exista documentación formal (por ejemplo, declaración de renta o estados financieros), los importes deben ser coherentes con ella. Si es un cliente nuevo, sin historial o aún sin saber cuánto facturará, puede indicar estimaciones o proyecciones razonables; no se le exige una cifra exacta ni documentos que aún no tenga. Ej.: una compañía puede facturar millones de USD al mes por su actividad principal. Después de este paso seguirán cómo pagará a Grupo Punto Pago y objeto del servicio, servicios de interés con Punto Pago, volumen estimado de operaciones con Punto Pago, referencias y PEP.",
    pdfPage: "Pág. 2",
    fields: [
      {
        id: "static_origen_licito",
        label: "",
        type: "static",
        hint: "DECLARO QUE TODAS LAS ACTIVIDADES QUE EJERZO SON DE ORIGEN LICITO Y LEGAL.",
      },
      {
        id: "ingresos_mensuales_usd",
        label: "Facturación o ingresos mensuales aproximados de la organización (USD)",
        type: "text",
        numberFormat: "usd",
        hint: "Total a nivel empresa (todas sus líneas de negocio), no el monto relacionado solo con Punto Pago. Si aún no tiene cifras, indique una estimación o proyección razonable; cuando tenga declaración de renta o estados financieros, debe alinearse con ellos.",
      },
      {
        id: "ingresos_anuales_usd",
        label: "Facturación o ingresos anuales aproximados de la organización (USD)",
        type: "text",
        numberFormat: "usd",
        hint: "Magnitud global del negocio; se distingue de los montos de operación con Grupo Punto Pago que indicará en pasos posteriores. Puede usar proyección anual si la empresa es nueva o en arranque.",
      },
    ],
  },
  {
    id: "medios_pago",
    title: "MEDIOS DE PAGO HACIA GRUPO PUNTO PAGO",
    description:
      "Indique el objeto de la relación con Punto Pago y cómo prevé cumplir los pagos hacia Grupo Punto Pago (comisiones, liquidaciones u otros flujos pactados). Las casillas siguientes son los mecanismos o canales por los que su empresa podría efectuar esos desembolsos; luego elegirá los servicios de interés.",
    pdfPage: "Pág. 3",
    fields: [
      {
        id: "static_medios_pp_contexto",
        label: "",
        type: "static",
        staticParagraphs: [
          "Este bloque se enfoca en cómo su empresa pagará a Grupo Punto Pago en el marco del servicio: comisiones, tarifas, liquidaciones periódicas o cualquier flujo de dinero acordado desde el cliente hacia Grupo Punto Pago.",
          "No confunda esto con el perfil financiero general de la empresa (facturación global) ni con el volumen operativo con Punto Pago que verá más adelante: aquí se declara el propósito comercial previsto y los medios o rutas con los que prevé cubrir lo que deba pagarse a Grupo Punto Pago.",
        ],
      },
      {
        id: "pp_objeto_servicio_cliente",
        label:
          "Objeto del servicio o alcance previsto con Grupo Punto Pago (síntesis)",
        type: "textarea",
        placeholder:
          "Ej.: uso de plataforma de recaudación para cobros a clientes finales; distribución de comisiones por transacciones procesadas; relación de agente…",
        hint: "Describa brevemente para qué contrata o usará los servicios y qué se espera de la relación comercial.",
      },
      {
        id: "pp_forma_pago_hacia_punto_pago",
        label:
          "¿Cómo prevé pagar a Grupo Punto Pago? (comisiones, cargos y flujos hacia Punto Pago)",
        type: "textarea",
        placeholder:
          "Ej.: liquidación mensual por transferencia ACH; descuento en origen sobre cobros; débito acordado; facturación y pago por factura…",
        hint: "Indique la forma en que su empresa cubrirá comisiones u otros importes adeudados a Grupo Punto Pago, o el flujo de dinero cliente → Grupo Punto Pago que aplique.",
      },
      {
        id: "medio_descuento_directo",
        label: "Descuento directo (aplicable a liquidaciones o cobros acordados)",
        type: "checkbox",
      },
      {
        id: "medio_transferencia_ach",
        label: "Transferencia ACH",
        type: "checkbox",
      },
      {
        id: "medio_internacional",
        label: "Internacional",
        type: "checkbox",
      },
      {
        id: "medio_nacional",
        label: "Nacional",
        type: "checkbox",
      },
    ],
  },
  {
    id: "servicios_punto_pago",
    title: "SERVICIOS DE INTERÉS CON PUNTO PAGO",
    description:
      "Seleccione los servicios de interés y, para cada uno elegido, indique el monto mensual estimado y la cantidad de transacciones mensuales previstas. Si elige «Otros», describa el alcance y complete también montos y volumen. Luego indique la frecuencia operativa global.",
    pdfPage: "Pág. 3",
    fields: [
      {
        id: "static_servicios_pp",
        label: "",
        type: "static",
        staticParagraphs: [
          "Este conocimiento del cliente (KYB) cubre a personas jurídicas que desean operar con los servicios de Grupo Punto Pago.",
          "Use la lista desplegable para elegir uno o más servicios. Solo verá y deberá diligenciar el monto mensual (USD) y el número de transacciones mensuales para los servicios que haya marcado.",
        ],
      },
      {
        id: "pp_servicios_interes_ui",
        label: "Servicios de interés con Grupo Punto Pago",
        type: "punto_pago_servicios_multi",
        hint: "Abra el menú, marque todas las que apliquen y revise las etiquetas de su selección.",
      },
      {
        id: "static_perfil_ref",
        label: "",
        type: "static",
        hint: "Para cada servicio elegido deberá indicar montos y volumen de transacciones mensuales estimados (línea base de referencia). Si el uso habitual supera con holgura lo aquí declarado, Grupo Punto Pago podrá solicitar aclaraciones.",
      },
      {
        id: "pp_metricas_servicios_ui",
        label: "Montos y transacciones mensuales por servicio seleccionado",
        type: "punto_pago_metricas_por_servicio",
        hint: "Solo aparecen tarjetas para los servicios que marcó. Estimaciones razonables; puede refinarlas con su asesor.",
      },
      {
        id: "operaciones_frecuencia",
        label: "Frecuencia esperada o aproximada de operaciones y transacciones",
        type: "select",
        options: [
          { value: "", label: "Seleccionar…" },
          { value: "diaria", label: "Diaria" },
          { value: "semanal", label: "Semanal" },
          { value: "quincenal", label: "Cada 15 días" },
          { value: "mensual", label: "Mensual" },
          { value: "trimestral", label: "Cada 3 meses" },
          { value: "otro", label: "Otro" },
        ],
      },
      {
        id: "operaciones_frecuencia_otro",
        label: "Si «Otro», especifique",
        type: "text",
      },
    ],
  },
  {
    id: "volumen_operaciones",
    title: "VOLUMEN ANUAL DE OPERACIONES ESTIMADO (USD)",
    description:
      "Indique el orden de magnitud del volumen anual de operaciones que proyecta en relación con los servicios seleccionados. Si elige «Otros», especifique.",
    pdfPage: "Pág. 3",
    fields: [
      {
        id: "volumen_operaciones_anual",
        label: "Rango de volumen anual estimado (USD)",
        type: "select",
        options: [
          { value: "", label: "Seleccionar…" },
          { value: "menos_100k", label: "Menos de US$ 100.000" },
          { value: "100k_500k", label: "US$ 100.000 a US$ 500.000" },
          { value: "501k_1m", label: "US$ 501.000 a US$ 1.000.000" },
          { value: "1m_5m", label: "US$ 1.000.000 a US$ 5.000.000" },
          { value: "otros", label: "Otros" },
        ],
      },
      {
        id: "volumen_operaciones_otros",
        label: "Si «Otros», especifique el volumen o monto",
        type: "text",
        numberFormat: "usd",
      },
    ],
  },
  {
    id: "referencias",
    title: "REFERENCIAS",
    description:
      "Elija el tipo de referencia (las etiquetas cambian: bancaria, comercial, personal u otra). Si es «Otra», descríbala en una línea. Complete datos y la declaración sobre investigaciones; en el siguiente paso irá PEP.",
    pdfPage: "Pág. 3",
    fields: [
      {
        id: "ref_tipo",
        label: "Tipo de referencia",
        type: "select",
        options: [
          { value: "", label: "Seleccionar…" },
          { value: "bancaria", label: "Bancaria" },
          { value: "comercial", label: "Comercial" },
          { value: "personal", label: "Personal" },
          { value: "otro", label: "Otra" },
        ],
      },
      {
        id: "ref_tipo_otro_descripcion",
        label: "Descripción breve (solo si el tipo es «Otra»)",
        type: "textarea",
        hint: "Ej.: profesional, carta de recomendación. Una o dos frases bastan.",
      },
      {
        id: "ref_nombre_entidad",
        label: "Nombre de la persona, empresa o institución de referencia",
        type: "text",
      },
      {
        id: "ref_contacto_entidad",
        label: "Persona de contacto o vínculo con la referencia",
        type: "text",
      },
      {
        id: "ref_fecha",
        label: "Fecha de la referencia o del documento",
        type: "date",
      },
      {
        id: "ref_anios_relacion",
        label: "Años de relación o antigüedad",
        type: "text",
      },
      {
        id: "ref_telefono",
        label: "Teléfono",
        type: "tel",
      },
      {
        id: "ref_email",
        label: "Correo electrónico",
        type: "email",
      },
      {
        id: "ref_investigacion_cliente",
        label:
          "Indique si Ud. Ha sido objeto de investigación, indagación o condena por actividad ilícita, delitos de blanqueo de capitales o financiamiento de terrorismo, fraude o corrupción pública.",
        type: "yesno",
      },
      {
        id: "ref_investigacion_explicacion",
        label: "En caso afirmativo, explique",
        type: "textarea",
      },
    ],
  },
  {
    id: "pep",
    title: "Persona expuesta políticamente (PEP)",
    description:
      "PEP es quien tiene o tuvo función pública relevante (o equivalente internacional), o familiar cercano o colaborador cercano según la norma (p. ej. Ley 23/2015). Responda la pregunta; si «Sí», complete cada persona y use + para agregar hasta cinco.",
    pdfPage: "Pág. 3",
    fields: [
      {
        id: "pep_alguno_catalogado",
        label:
          "¿Alguna persona natural de este formulario (dignatarios, directores, representante, apoderado o beneficiarios finales) califica como PEP, familiar cercano o colaborador cercano, conforme a la Ley 23/2015 y normativa aplicable?",
        type: "yesno",
        hint: "«No» = no complete el bloque. «Sí» = una fila por persona; puede sumar filas con + abajo.",
      },
      ...Array.from({ length: PEP_MEMBER_SLOTS_MAX }, (_, i) => i + 1).flatMap(
        (n) =>
          [
            {
              id: `__h_pep_${n}`,
              label: `Persona catalogada ${n}`,
              type: "heading" as const,
            },
            {
              id: `pep_${n}_primer_nombre`,
              label: "Primer nombre",
              type: "text" as const,
            },
            {
              id: `pep_${n}_segundo_nombre`,
              label: "Segundo nombre",
              type: "text" as const,
            },
            {
              id: `pep_${n}_primer_apellido`,
              label: "Primer apellido",
              type: "text" as const,
            },
            {
              id: `pep_${n}_segundo_apellido`,
              label: "Segundo apellido",
              type: "text" as const,
            },
            {
              id: `pep_${n}_nacionalidad`,
              label: "Nacionalidad",
              type: "country" as const,
              placeholder: "Buscar país…",
            },
            {
              id: `pep_${n}_cedula_pasaporte`,
              label: "# Cédula o Pasaporte",
              type: "text" as const,
            },
            {
              id: `pep_${n}_periodo_cargo`,
              label: "Periodo de cargo",
              type: "text" as const,
            },
            {
              id: `pep_${n}_pais`,
              label: "País",
              type: "country" as const,
            },
            {
              id: `pep_${n}_funciones_cargo`,
              label: "Funciones o cargo público (desempeña o desempeñó)",
              type: "textarea" as const,
            },
            {
              id: `pep_${n}_parentesco`,
              label: "Parentesco o relación con la organización",
              type: "textarea" as const,
            },
          ] satisfies KybField[],
      ),
    ],
  },
  {
    id: "documentacion_entregar",
    title: "DOCUMENTOS PARA ENTREGAR — Documentación de soporte",
    description:
      "Debe cargar los archivos requeridos en cada apartado. Si opera en Panamá, después de cargar la factura de servicios deberá indicar el NAC o NIS de la sucursal principal. Sin los adjuntos completos no se considera diligenciada esta sección.",
    pdfPage: "Pág. 4",
    fields: [
      {
        id: "doc_static_intro_adjuntos",
        label: "",
        type: "static",
        staticParagraphs: [
          "Cada control de carga debe tener un archivo: el sistema guarda el nombre del archivo en este navegador; el envío formal lo coordina su asesor.",
          "Las filas de personas muestran los nombres ya indicados en Gobierno corporativo, en Accionistas o beneficiario final (si aplica) y en Representante legal, para adjuntar la identificación correcta en cada caso.",
        ],
      },
      {
        id: DOCUMENTACION_PERSONAS_FIELD_ID,
        label: "",
        type: "documentacion_personas",
      },
      {
        id: "doc_upl_factura_servicios",
        type: "file",
        label:
          "Factura de servicios públicos (luz, agua, teléfono u otro) o estado de cuenta",
        hint: "Antigüedad del comprobante no mayor a tres meses. PDF, imagen u otros que acepte su navegador.",
      },
      {
        id: "doc_nac_nis_numero",
        label: "Número NAC o NIS de la sucursal principal (sucursal en Panamá)",
        type: "text",
        placeholder: "Ej. según registro NAC o NIS ante la SBP",
        hint: "Este campo aparece después de cargar la factura de servicios. Indique el número de la sucursal principal. Si no opera en Panamá, no verá este campo.",
      },
      {
        id: "doc_upl_aviso",
        type: "file",
        label:
          "Copia de certificado de aviso de operaciones o equivalente.",
        hint: "PDF, imagen u otros que acepte su navegador.",
      },
      {
        id: "doc_upl_pacto",
        type: "file",
        label: "Copia de Pacto Social y sus adendas.",
        hint: "PDF, imagen u otros que acepte su navegador.",
      },
      {
        id: "doc_upl_origen",
        type: "file",
        label:
          "Origen de fondos (declaración de renta, estados financieros, etc.).",
        hint: "PDF, imagen u otros que acepte su navegador.",
      },
      {
        id: "doc_upl_ref_banc",
        type: "file",
        label: "Referencias bancarias",
        hint: "PDF, imagen u otros que acepte su navegador.",
      },
      {
        id: "observaciones",
        label: "OBSERVACIONES O COMENTARIOS ADICIONALES",
        type: "textarea",
      },
    ],
  },
  {
    id: "declaracion",
    title: "FIRMA Y DECLARACIÓN DEL CLIENTE",
    description:
      "Lea la declaración y complete nombre y fecha. La firma puede completarse según el proceso indicado por su asesor.",
    pdfPage: "Pág. 4",
    fields: [
      {
        id: "static_declaracion",
        label: "",
        type: "static",
        hint: "Declaro de manera voluntaria, libre de cualquier error, fuerza o dolo que todas las afirmaciones y respuestas que he manifestado en este documento son correctas, veraces, completas y autorizo al GRUPO PUNTO PAGO a verificar toda la información detallada. Además, me obligo a informar al GRUPO PUNTO PAGO de cualquier cambio o actualización de información que pueda afectar las afirmaciones y respuestas anotadas en este formulario, en un término no mayor a 30 días.",
      },
      {
        id: "decl_nombre_cliente",
        label: "Nombre del cliente",
        type: "text",
      },
      {
        id: "decl_fecha",
        label: "Fecha",
        type: "date",
      },
    ],
  },
];

/** IDs que no se envían como valor de formulario (solo UI) */
export function isRenderableValueField(f: KybField): boolean {
  return (
    f.type !== "heading" &&
    f.type !== "static" &&
    f.type !== "documentacion_personas" &&
    f.type !== "punto_pago_servicios_multi" &&
    f.type !== "punto_pago_metricas_por_servicio"
  );
}

/** Primer paso: nombre de quien diligencia (obligatorio para avanzar). */
export const NOMBRE_DILIGENCIA_FIELD_ID = "nombre_diligencia" as const;
