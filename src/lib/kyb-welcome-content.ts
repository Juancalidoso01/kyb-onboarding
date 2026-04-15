/**
 * Párrafos de alcance / normativa / datos en la portada (`KybLanding`), misma tarjeta que el marco regulatorio.
 */

export type KybWelcomeSection = {
  label: string;
  body: string;
};

export const KYB_WELCOME_SECTIONS: KybWelcomeSection[] = [
  {
    label: "Alcance",
    body: "Identificación del cliente jurídico y de los beneficiarios finales, en el marco de PBC/FT/FPADM. GRUPO PUNTO PAGO empleará los datos para la relación contractual, el cumplimiento normativo y la administración del riesgo.",
  },
  {
    label: "Normativa de referencia",
    body: "Ley 23 de 2015, Decreto Ejecutivo 35 de 2022, Acuerdo de Prevención 004-2018, disposiciones de la Superintendencia de Bancos de Panamá y orientaciones de la Unidad de Análisis Financiero.",
  },
  {
    label: "Tratamiento de la información",
    body: "Uso confidencial para debida diligencia y obligaciones legales, con arreglo a la Ley 81 de 2019.",
  },
];
