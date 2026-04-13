import { SOCIEDAD_COMBO_OPTIONS } from "@/data/sociedad-tipos";
import { KYB_TEXT_PEP_BLOQUE_ANTES_PREGUNTA } from "@/lib/kyb-pep-content";

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
  | "percent";

export type KybField = {
  id: string;
  label: string;
  type: KybFieldType;
  placeholder?: string;
  options?: { value: string; label: string; disabled?: boolean }[];
  /** Texto de ayuda bajo el campo */
  hint?: string;
  /** Bloques de texto para `type: "static"` (p. ej. intro con varios párrafos justificados). */
  staticParagraphs?: string[];
  /** Valor en estado/API pero sin control visible (sincronizado por lógica). */
  hidden?: boolean;
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
      "Declaración y montos en USD. Indique medio de pago y datos del préstamo en el siguiente paso si aplica.",
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
        label: "Ingresos mensuales aproximados son de: (USD)",
        type: "text",
      },
      {
        id: "ingresos_anuales_usd",
        label: "Ingresos anuales aproximados son de: (USD)",
        type: "text",
      },
    ],
  },
  {
    id: "referencias",
    title: "REFERENCIAS",
    description:
      "Tipo de referencia, datos de contacto y declaración sobre investigaciones.",
    pdfPage: "Pág. 3",
    fields: [
      {
        id: "ref_tipo",
        label: "Tipo de Referencia",
        type: "select",
        options: [
          { value: "", label: "Seleccionar…" },
          { value: "bancaria", label: "Bancaria" },
          { value: "comercial", label: "Comercial" },
          { value: "personal", label: "Personal" },
        ],
      },
      {
        id: "ref_nombre_entidad",
        label: "Nombre de la Persona/Empresa/Banco",
        type: "text",
      },
      {
        id: "ref_contacto_entidad",
        label: "Nombre de la Persona de Contacto (para Empresas/Banco)",
        type: "text",
      },
      {
        id: "ref_fecha",
        label: "Fecha de la Referencia",
        type: "date",
      },
      {
        id: "ref_anios_relacion",
        label: "Años de relación",
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
    id: "producto_medios_pago",
    title: "DOCUMENTOS PARA ENTREGAR — Medio de pago y préstamo",
    description:
      "Medios de pago, motivo del préstamo, frecuencia, monto y tipo.",
    pdfPage: "Pág. 3",
    fields: [
      {
        id: "medio_descuento_directo",
        label: "Descuento Directo",
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
      {
        id: "prestamo_motivo",
        label: "Motivo del Préstamo",
        type: "textarea",
      },
      {
        id: "prestamo_frecuencia",
        label: "Frecuencia esperada o aproximada de pagos y otras transacciones",
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
        id: "prestamo_frecuencia_otro",
        label: "Si «Otro», especifique",
        type: "text",
      },
      {
        id: "prestamo_monto_anual",
        label: "MONTO ANUAL DEL PRÉSTAMO",
        type: "select",
        options: [
          { value: "", label: "Seleccionar…" },
          { value: "menos_1000", label: "Menos de $1.000" },
          { value: "1000_5000", label: "$1.000 a $5.000" },
          { value: "5000_10000", label: "$5.000 a $10.000" },
          { value: "10000_15000", label: "$10.000 a $15.000" },
          { value: "otros", label: "Otros" },
        ],
      },
      {
        id: "prestamo_monto_otros",
        label: "Si «Otros» en monto, especifique",
        type: "text",
      },
      {
        id: "prestamo_tipo",
        label: "TIPO DE PRÉSTAMO",
        type: "select",
        options: [
          { value: "", label: "Seleccionar…" },
          { value: "personal_proyectos", label: "Préstamo personal de proyectos" },
          { value: "administrativo", label: "Préstamo administrativo" },
          { value: "empresarial", label: "Préstamo empresarial" },
          { value: "ejecutivo", label: "Préstamo a ejecutivo" },
          { value: "contratista", label: "Préstamo a contratista" },
        ],
      },
    ],
  },
  {
    id: "pep",
    title: "Persona expuesta políticamente (PEP)",
    description:
      "Lea la definición y responda la pregunta. Si aplica, complete los datos del PEP o familiar/estrecho colaborador.",
    pdfPage: "Pág. 3",
    fields: [
      {
        id: "static_pep_definicion",
        label: "",
        type: "static",
        hint: KYB_TEXT_PEP_BLOQUE_ANTES_PREGUNTA,
      },
      {
        id: "pep_alguno_catalogado",
        label:
          "¿Alguna de las personas naturales incluidas en el presente formulario (dignatarios, directores, representante legal, apoderado y/o beneficiario(s) final(es)) desempeña o ha desempeñado en los últimos dos (2) años un cargo público que le catalogue como PEP, o es familiar cercano (cónyuge o pareja, padres, hermanos e hijos) o estrecho colaborador de una persona PEP, conforme a la Ley 23 de 2015 (artículo 4, numeral 18) y normativa aplicable?",
        type: "yesno",
      },
      {
        id: "__h_pep_datos",
        label:
          "DATOS GENERALES DEL PEP O DEL FAMILIAR/ESTRECHO COLABORADOR (Solo si respondió SI)",
        type: "heading",
      },
      {
        id: "pep_primer_nombre",
        label: "Primer nombre",
        type: "text",
      },
      {
        id: "pep_segundo_nombre",
        label: "Segundo nombre",
        type: "text",
      },
      {
        id: "pep_primer_apellido",
        label: "Primer apellido",
        type: "text",
      },
      {
        id: "pep_segundo_apellido",
        label: "Segundo apellido",
        type: "text",
      },
      {
        id: "pep_nacionalidad",
        label: "Nacionalidad",
        type: "country",
        placeholder: "Buscar país…",
      },
      {
        id: "pep_cedula_pasaporte",
        label: "# Cédula o Pasaporte",
        type: "text",
      },
      {
        id: "pep_periodo_cargo",
        label: "Periodo de Cargo",
        type: "text",
      },
      {
        id: "pep_pais",
        label: "País",
        type: "country",
      },
      {
        id: "pep_funciones_cargo",
        label: "¿Qué funciones o cargo público desempeña o ha desempeñado?",
        type: "textarea",
      },
      {
        id: "pep_parentesco",
        label: "Parentesco o Relación:",
        type: "textarea",
      },
    ],
  },
  {
    id: "documentacion_entregar",
    title: "DOCUMENTOS PARA ENTREGAR — Documentación de soporte",
    description:
      "Marque la documentación que entregará (cédulas, aviso de operaciones, pacto social, etc.) y añada observaciones si corresponde.",
    pdfPage: "Pág. 4",
    fields: [
      {
        id: "doc_cedulas_dignatarios",
        label:
          "Cédula o pasaporte de Dignatarios, Directores, Beneficiario Final, Representante Legal, Apoderado, Protector, Administrador o consejero.",
        type: "checkbox",
      },
      {
        id: "doc_aviso_operaciones",
        label: "Copia de certificado de aviso de operaciones o equivalente.",
        type: "checkbox",
      },
      {
        id: "doc_pacto_social",
        label: "Copia de Pacto Social y sus adendas.",
        type: "checkbox",
      },
      {
        id: "doc_origen_fondos",
        label: "Origen de fondos (declaración de renta, estados financieros, etc.).",
        type: "checkbox",
      },
      {
        id: "doc_referencias_bancarias",
        label: "Referencias bancarias",
        type: "checkbox",
      },
      {
        id: "doc_factura_servicios",
        label:
          "Factura de Servicios Público (Estado de cuenta de luz, agua, teléfono, con una antigüedad no mayor a tres meses)",
        type: "checkbox",
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
  return f.type !== "heading" && f.type !== "static";
}

/** Primer paso: nombre de quien diligencia (obligatorio para avanzar). */
export const NOMBRE_DILIGENCIA_FIELD_ID = "nombre_diligencia" as const;
