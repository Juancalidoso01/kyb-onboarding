/**
 * Formulario «Perfil del Cliente PJ» — Punto Pago Panamá V2-2026 (PDF V002-2026).
 * Campos alineados por sección del PDF; ids estables para API / generación de PDF futura.
 */

export type KybFieldType =
  | "text"
  | "email"
  | "tel"
  | "textarea"
  | "select"
  | "checkbox"
  | "yesno"
  | "heading"
  | "static";

export type KybField = {
  id: string;
  label: string;
  type: KybFieldType;
  placeholder?: string;
  options?: { value: string; label: string }[];
  /** Texto de ayuda bajo el campo */
  hint?: string;
};

export type KybStep = {
  id: string;
  title: string;
  description: string;
  fields: KybField[];
};

export const KYB_STEPS: KybStep[] = [
  {
    id: "como_conocio",
    title: "Cómo conoció a la empresa",
    description:
      "Marque las opciones que apliquen (equivalente a la primera tabla del PDF).",
    fields: [
      {
        id: "conocio_mercadeo",
        label: "Mercadeo",
        type: "checkbox",
      },
      {
        id: "conocio_referencia_interna",
        label: "Referencia interna",
        type: "checkbox",
      },
      {
        id: "conocio_cliente_antiguo",
        label: "Cliente antiguo",
        type: "checkbox",
      },
      {
        id: "conocio_redes_web",
        label: "Redes sociales, página web, mensajería instantánea",
        type: "checkbox",
      },
      {
        id: "conocio_referencia_externa",
        label: "Referencia externa",
        type: "checkbox",
      },
      {
        id: "conocio_otro_texto",
        label: "Otro (especifique)",
        type: "text",
        placeholder: "N/A si no aplica",
      },
    ],
  },
  {
    id: "identificacion_cliente",
    title: "Identificación del cliente",
    description:
      "Datos de la persona jurídica según constitución y operación (pág. 1 del PDF).",
    fields: [
      {
        id: "razon_social",
        label: "Nombre de razón social",
        type: "text",
      },
      {
        id: "razon_comercial",
        label: "Nombre de razón comercial",
        type: "text",
      },
      {
        id: "pj_nacional_extranjera",
        label: "Clasificación",
        type: "select",
        options: [
          { value: "", label: "Seleccionar…" },
          { value: "pj_nacional", label: "Persona jurídica nacional" },
          { value: "pj_extranjera", label: "Persona jurídica extranjera" },
        ],
      },
      {
        id: "operativa_estado",
        label: "Operativa",
        type: "select",
        options: [
          { value: "", label: "Seleccionar…" },
          { value: "operativa", label: "Operativa" },
          { value: "no_operativa", label: "No operativa" },
        ],
      },
      {
        id: "tipo_sociedad",
        label: "Tipo de sociedad",
        type: "select",
        options: [
          { value: "", label: "Seleccionar…" },
          { value: "anonima", label: "Sociedad anónima" },
          { value: "civil", label: "Sociedad civil" },
          { value: "fundacion", label: "Fundación" },
          { value: "otros", label: "Otros" },
        ],
      },
      {
        id: "tipo_sociedad_otros_especifique",
        label: "Si eligió «Otros», especifique",
        type: "textarea",
        placeholder: "N/A si no aplica",
      },
      {
        id: "actividad_empresa",
        label: "Actividad a la que se dedica su empresa",
        type: "textarea",
      },
      {
        id: "pct_actividad",
        label: "% de actividad dedicada (si aplica)",
        type: "text",
        placeholder: "N/A",
      },
      {
        id: "cotiza_bolsa",
        label: "¿Esta compañía cotiza en la bolsa?",
        type: "yesno",
      },
      {
        id: "forma_capital",
        label: "Forma de capital",
        type: "select",
        options: [
          { value: "", label: "Seleccionar…" },
          { value: "nominativas", label: "Acciones nominativas" },
          { value: "portador", label: "Acciones al portador" },
          { value: "cuotas", label: "Cuotas de participación" },
        ],
      },
      {
        id: "fecha_constitucion",
        label: "Fecha de constitución",
        type: "text",
        placeholder: "DD/MM/AAAA",
      },
      {
        id: "pais_opera",
        label: "País donde opera",
        type: "text",
      },
      {
        id: "pais_constitucion",
        label: "País de constitución",
        type: "text",
      },
      {
        id: "pais_tributa_ingresos",
        label: "País donde tributa sus ingresos",
        type: "text",
      },
      {
        id: "no_identificacion_tributaria",
        label: "N.º de identificación tributaria",
        type: "text",
      },
      {
        id: "doc_identidad_tipo",
        label: "Documento de identidad (tipo)",
        type: "select",
        options: [
          { value: "", label: "Seleccionar…" },
          { value: "ruc_empresarial", label: "RUC empresarial" },
          { value: "ficha_documento", label: "Ficha o documento" },
          { value: "aviso_operaciones", label: "Aviso de operaciones" },
          { value: "nit", label: "NIT" },
          { value: "otro_id", label: "Otro ID" },
        ],
      },
      {
        id: "doc_identidad_otro",
        label: "Si «Otro ID», especifique",
        type: "text",
        placeholder: "N/A",
      },
      {
        id: "doc_identidad_numero",
        label: "N.º de documento",
        type: "text",
      },
      {
        id: "persona_contacto_nombre",
        label: "Nombre de persona contacto",
        type: "text",
      },
      {
        id: "persona_contacto_telefono",
        label: "Teléfono (contacto)",
        type: "tel",
      },
      {
        id: "persona_contacto_correo",
        label: "Correo (contacto)",
        type: "email",
      },
    ],
  },
  {
    id: "datos_generales",
    title: "Datos generales",
    description: "Dirección comercial y datos de contacto adicionales.",
    fields: [
      {
        id: "direccion_comercial",
        label:
          "Dirección comercial (calle, número, urbanización/edificio, piso, local, etc.)",
        type: "textarea",
      },
      {
        id: "pais",
        label: "País",
        type: "text",
      },
      {
        id: "ciudad",
        label: "Ciudad",
        type: "text",
      },
      {
        id: "provincia",
        label: "Provincia",
        type: "text",
      },
      {
        id: "direccion_auxiliar",
        label:
          "Dirección auxiliar de facturación o correspondencia (si es distinta)",
        type: "textarea",
        placeholder: "N/A",
      },
      {
        id: "telefonos_generales",
        label: "Teléfono(s)",
        type: "text",
      },
      {
        id: "celulares_generales",
        label: "Celular(es)",
        type: "text",
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
    title: "Gobierno corporativo / junta directiva / consejo fundacional",
    description:
      "Hasta cinco miembros (como en el PDF). Si hay menos, use N/A en filas vacías.",
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
              id: `junta_${n}_nombre`,
              label: "Nombre",
              type: "text" as const,
            },
            {
              id: `junta_${n}_apellidos`,
              label: "Apellidos",
              type: "text" as const,
            },
            {
              id: `junta_${n}_nacionalidad`,
              label: "Nacionalidad",
              type: "text" as const,
            },
            {
              id: `junta_${n}_identificacion`,
              label: "N.º de identificación",
              type: "text" as const,
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
    title: "Representante legal o apoderado",
    description: "Datos del representante según el PDF.",
    fields: [
      {
        id: "rep_nombre_apellido",
        label: "Nombre y apellido",
        type: "text",
      },
      {
        id: "rep_identificacion",
        label: "N.º identificación",
        type: "text",
      },
      {
        id: "rep_nacionalidad",
        label: "Nacionalidad",
        type: "text",
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
        label: "Profesión / ocupación",
        type: "text",
      },
      {
        id: "rep_actividad_economica",
        label: "Actividad económica",
        type: "text",
      },
      {
        id: "rep_pais_residencia",
        label: "País de residencia",
        type: "text",
      },
      {
        id: "rep_investigacion_ilicita",
        label:
          "¿El representante, apoderado o la sociedad son o han sido objeto de investigación o condena por actividad ilícita, PBC/FT, fraude o corrupción (art. 254-A CP), etc.?",
        type: "yesno",
      },
      {
        id: "rep_investigacion_explicacion",
        label: "En caso afirmativo, explique",
        type: "textarea",
        placeholder: "N/A",
      },
    ],
  },
  {
    id: "beneficiarios_finales",
    title: "Accionistas o beneficiario final",
    description:
      "Hasta tres filas como en el PDF. Personas naturales o jurídicas con control o influencia significativa.",
    fields: [
      ...[1, 2, 3].flatMap(
        (n) =>
          [
            {
              id: `__h_bf_${n}`,
              label: `Beneficiario final / accionista ${n}`,
              type: "heading" as const,
            },
            {
              id: `bf_${n}_tipo_persona`,
              label: "Tipo de persona",
              type: "select" as const,
              options: [
                { value: "", label: "Seleccionar…" },
                { value: "N", label: "Natural (N)" },
                { value: "J", label: "Jurídica (J)" },
              ],
            },
            {
              id: `bf_${n}_fecha_nac_const`,
              label: "Fecha de nacimiento / constitución",
              type: "text" as const,
              placeholder: "DD/MM/AAAA o N/A",
            },
            {
              id: `bf_${n}_nombre_razon`,
              label: "Nombre completo / razón social",
              type: "text" as const,
            },
            {
              id: `bf_${n}_cedula_ruc`,
              label: "Cédula o RUC",
              type: "text" as const,
            },
            {
              id: `bf_${n}_nacionalidad`,
              label: "Nacionalidad",
              type: "text" as const,
            },
            {
              id: `bf_${n}_pais_nacimiento`,
              label: "País de nacimiento",
              type: "text" as const,
            },
            {
              id: `bf_${n}_fecha_condicion_bf`,
              label: "Fecha en que adquiere condición de beneficiario final",
              type: "text" as const,
            },
            {
              id: `bf_${n}_pct_participacion`,
              label: "% de participación en la empresa",
              type: "text" as const,
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
    title: "Perfil financiero",
    description:
      "Declaración de origen lícito de actividades (según PDF). Montos en USD.",
    fields: [
      {
        id: "static_origen_licito",
        label: "",
        type: "static",
        hint: "Declaro que todas las actividades que ejerzo son de origen lícito y legal.",
      },
      {
        id: "ingresos_mensuales_usd",
        label: "Ingresos mensuales aproximados (USD)",
        type: "text",
      },
      {
        id: "ingresos_anuales_usd",
        label: "Ingresos anuales aproximados (USD)",
        type: "text",
      },
    ],
  },
  {
    id: "referencias",
    title: "Referencias",
    description: "Referencia bancaria, comercial o personal (una fila principal).",
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
        ],
      },
      {
        id: "ref_nombre_entidad",
        label: "Nombre de la persona / empresa / banco",
        type: "text",
      },
      {
        id: "ref_contacto_entidad",
        label: "Nombre de la persona de contacto (empresa/banco)",
        type: "text",
        placeholder: "N/A",
      },
      {
        id: "ref_fecha",
        label: "Fecha de la referencia",
        type: "text",
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
          "¿Ha sido objeto de investigación, indagación o condena por ilícitos PBC/FT, fraude o corrupción?",
        type: "yesno",
      },
      {
        id: "ref_investigacion_explicacion",
        label: "En caso afirmativo, explique",
        type: "textarea",
        placeholder: "N/A",
      },
    ],
  },
  {
    id: "producto_medios_pago",
    title: "Medios de pago y producto (préstamo)",
    description:
      "Sección del PDF sobre descuentos, transferencias, préstamo y frecuencia. Ajuste si el producto no aplica.",
    fields: [
      {
        id: "medio_descuento_directo",
        label: "Descuento directo",
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
        label: "Motivo del préstamo",
        type: "textarea",
        placeholder: "N/A si no aplica",
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
        placeholder: "N/A",
      },
      {
        id: "prestamo_monto_anual",
        label: "Monto anual del préstamo",
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
        placeholder: "N/A",
      },
      {
        id: "prestamo_tipo",
        label: "Tipo de préstamo",
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
    description: "Definición según Ley 23/2015 y normativa aplicable (resumen en el PDF).",
    fields: [
      {
        id: "pep_alguno_catalogado",
        label:
          "¿Alguna persona natural del formulario (dignatarios, directores, representante, apoderado y/o beneficiarios finales) es PEP o familiar/cercano de PEP, según Ley 23?",
        type: "yesno",
      },
      {
        id: "__h_pep_datos",
        label: "Si respondió «Sí», datos del PEP o familiar/colaborador",
        type: "heading",
      },
      {
        id: "pep_primer_nombre",
        label: "Primer nombre",
        type: "text",
        placeholder: "N/A",
      },
      {
        id: "pep_segundo_nombre",
        label: "Segundo nombre",
        type: "text",
        placeholder: "N/A",
      },
      {
        id: "pep_primer_apellido",
        label: "Primer apellido",
        type: "text",
        placeholder: "N/A",
      },
      {
        id: "pep_segundo_apellido",
        label: "Segundo apellido",
        type: "text",
        placeholder: "N/A",
      },
      {
        id: "pep_nacionalidad",
        label: "Nacionalidad",
        type: "text",
        placeholder: "N/A",
      },
      {
        id: "pep_cedula_pasaporte",
        label: "# Cédula o pasaporte",
        type: "text",
        placeholder: "N/A",
      },
      {
        id: "pep_periodo_cargo",
        label: "Periodo de cargo",
        type: "text",
        placeholder: "N/A",
      },
      {
        id: "pep_pais",
        label: "País",
        type: "text",
        placeholder: "N/A",
      },
      {
        id: "pep_funciones_cargo",
        label: "¿Qué funciones o cargo público desempeña o ha desempeñado?",
        type: "textarea",
        placeholder: "N/A",
      },
      {
        id: "pep_parentesco",
        label: "Parentesco o relación",
        type: "textarea",
        placeholder: "N/A",
      },
    ],
  },
  {
    id: "documentacion_entregar",
    title: "Documentación a entregar y observaciones",
    description:
      "Checklist del PDF. La carga de archivos se puede integrar después.",
    fields: [
      {
        id: "doc_cedulas_dignatarios",
        label:
          "Cédula o pasaporte de dignatarios, directores, beneficiario final, representante, apoderado, protector, administrador o consejero",
        type: "checkbox",
      },
      {
        id: "doc_aviso_operaciones",
        label: "Copia de certificado de aviso de operaciones o equivalente",
        type: "checkbox",
      },
      {
        id: "doc_pacto_social",
        label: "Copia de pacto social y sus adendas",
        type: "checkbox",
      },
      {
        id: "doc_origen_fondos",
        label: "Origen de fondos (declaración de renta, estados financieros, etc.)",
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
          "Factura de servicio público (luz, agua, teléfono; antigüedad no mayor a 3 meses)",
        type: "checkbox",
      },
      {
        id: "observaciones",
        label: "Observaciones o comentarios adicionales",
        type: "textarea",
        placeholder: "N/A",
      },
    ],
  },
  {
    id: "declaracion",
    title: "Declaración del cliente",
    description:
      "Texto conforme al PDF. La firma manuscrita/digital puede añadirse en una fase posterior.",
    fields: [
      {
        id: "static_declaracion",
        label: "",
        type: "static",
        hint: "Declaro de manera voluntaria que las afirmaciones de este formulario son correctas y autorizo a Grupo Punto Pago a verificar la información. Me obligo a informar cambios en un plazo no mayor a 30 días.",
      },
      {
        id: "decl_nombre_cliente",
        label: "Nombre del cliente (quien declara)",
        type: "text",
      },
      {
        id: "decl_fecha",
        label: "Fecha",
        type: "text",
        placeholder: "DD/MM/AAAA",
      },
    ],
  },
];

/** IDs que no se envían como valor de formulario (solo UI) */
export function isRenderableValueField(f: KybField): boolean {
  return f.type !== "heading" && f.type !== "static";
}
