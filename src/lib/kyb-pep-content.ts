/**
 * Contenido del paso PEP — definición y lista de campos de detalle (solo si aplica).
 */

/** Campos que solo se muestran y validan si la respuesta a `pep_alguno_catalogado` es «si». */
export const PEP_DETAIL_FIELD_IDS = [
  "pep_primer_nombre",
  "pep_segundo_nombre",
  "pep_primer_apellido",
  "pep_segundo_apellido",
  "pep_nacionalidad",
  "pep_cedula_pasaporte",
  "pep_periodo_cargo",
  "pep_pais",
  "pep_funciones_cargo",
  "pep_parentesco",
] as const;

/** Sub-encabezado del bloque de datos (campo `heading`); visible solo si PEP aplica. */
export const PEP_HEADING_FIELD_ID = "__h_pep_datos" as const;

export const PEP_STEP_ID = "pep" as const;

/**
 * Párrafos justificados: qué es una PEP, base legal, alcance familiar y exclusión.
 */
export const KYB_TEXT_PEP_STATIC_PARAGRAPHS: string[] = [
  "Una Persona Expuesta Políticamente (PEP) es quien desempeña o ha desempeñado funciones públicas relevantes o de alto nivel en un Estado, o a quien una organización internacional le ha confiado funciones importantes. La idea es identificar exposición a riesgos asociados a cargos o relaciones de esa naturaleza.",
  "En Panamá, el marco general incluye la Ley 23 de 2015 y normativa de debida diligencia aplicable al sistema financiero; el artículo 4, numeral 18, orienta quién puede catalogarse como PEP según el vínculo con funciones públicas.",
  "El concepto de PEP también alcanza a familiares cercanos (cónyuge o pareja estable, padres, hermanos e hijos) y a estrechos colaboradores de la persona PEP, en los términos que la normativa y las políticas internas consideren pertinentes para el análisis del cliente.",
  "No se busca tipificar como PEP a quienes sólo ocupan cargos de rango medio o inferior frente a las categorías de alto nivel o con mando y jurisdicción que la norma y la práctica del sector tienen en cuenta para estos efectos.",
];

/** @deprecated Preferir `KYB_TEXT_PEP_STATIC_PARAGRAPHS` en la UI. */
export const KYB_TEXT_PEP_DEFINICION = KYB_TEXT_PEP_STATIC_PARAGRAPHS.join("\n\n");

/** @deprecated Sustituido por párrafos en `staticParagraphs`. */
export const KYB_TEXT_PEP_BLOQUE_ANTES_PREGUNTA = `PERSONA EXPUESTA POLÍTICAMENTE (PEP)

${KYB_TEXT_PEP_DEFINICION}`;
