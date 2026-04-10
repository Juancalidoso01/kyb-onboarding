/**
 * Opciones planas para tipo de sociedad (búsqueda mientras escribe).
 * Incluye encabezados y variantes para facilitar la búsqueda.
 */

export const SOCIEDAD_COMBO_OPTIONS: {
  value: string;
  label: string;
  disabled?: boolean;
}[] = [
  { value: "__section_capital__", label: "— I. Sociedades de Capital —", disabled: true },
  { value: "sa_parent", label: "1. Sociedad Anónima (S.A.)" },
  { value: "sa_tradicional", label: "Sociedad Anónima tradicional" },
  { value: "sa_operativa", label: "Sociedad Anónima operativa" },
  { value: "sa_holding", label: "Sociedad Anónima holding" },
  { value: "sa_patrimonial", label: "Sociedad Anónima patrimonial" },
  { value: "sa_offshore", label: "Sociedad Anónima offshore" },
  { value: "sa_nominativas", label: "Sociedad Anónima con acciones nominativas" },
  { value: "sa_pacto_especial", label: "Sociedad Anónima con pacto especial" },
  { value: "comandita_acc_parent", label: "2. Sociedad en Comandita por Acciones" },
  { value: "comandita_acc_abierta", label: "Sociedad en Comandita por Acciones abierta" },
  { value: "comandita_acc_cerrada", label: "Sociedad en Comandita por Acciones cerrada" },

  { value: "__section_personas__", label: "— II. Sociedades de Personas —", disabled: true },
  { value: "srl_parent", label: "3. Sociedad de Responsabilidad Limitada (S.R.L.)" },
  { value: "srl_familiar", label: "Sociedad de Responsabilidad Limitada familiar" },
  { value: "srl_cerrada", label: "Sociedad de Responsabilidad Limitada cerrada" },
  { value: "srl_operativa", label: "Sociedad de Responsabilidad Limitada operativa" },
  { value: "srl_patrimonial", label: "Sociedad de Responsabilidad Limitada patrimonial" },
  { value: "colectiva_parent", label: "4. Sociedad Colectiva" },
  { value: "colectiva_simple", label: "Sociedad Colectiva simple" },
  { value: "colectiva_comercial", label: "Sociedad Colectiva comercial" },
  { value: "colectiva_profesional", label: "Sociedad Colectiva profesional" },
  { value: "comandita_simple_parent", label: "5. Sociedad en Comandita Simple" },
  { value: "comandita_simple_tradicional", label: "Sociedad en Comandita Simple tradicional" },
  { value: "comandita_simple_familiar", label: "Sociedad en Comandita Simple familiar" },
  { value: "comandita_simple_inversion", label: "Sociedad en Comandita Simple de inversión" },

  { value: "__section_individuales__", label: "— III. Estructuras individuales —", disabled: true },
  { value: "eirl_parent", label: "6. Empresa Individual de Responsabilidad Limitada (EIRL)" },
  { value: "eirl_operativa", label: "EIRL operativa" },
  { value: "eirl_patrimonial", label: "EIRL patrimonial" },
  { value: "pnao_parent", label: "7. Persona Natural con Aviso de Operación" },
  { value: "pnao_independiente", label: "Persona Natural independiente" },
  { value: "pnao_comercial", label: "Persona Natural comercial" },
  { value: "pnao_profesional", label: "Persona Natural profesional" },

  {
    value: "__section_otras__",
    label: "— IV. Otras figuras jurídicas relacionadas —",
    disabled: true,
  },
  { value: "fip_parent", label: "8. Fundación de Interés Privado" },
  { value: "fip_patrimonial", label: "Fundación patrimonial" },
  { value: "fip_sucesoria", label: "Fundación sucesoria" },
  { value: "fip_activos", label: "Fundación de protección de activos" },
  { value: "asoc_parent", label: "9. Asociaciones sin fines de lucro" },
  { value: "asoc_civil", label: "Asociación civil" },
  { value: "asoc_ong", label: "Organización no gubernamental (ONG)" },
  { value: "asoc_fund_publica", label: "Fundación pública" },

  { value: "__section_especiales__", label: "— V. Estructuras especiales —", disabled: true },
  { value: "sucursal_ext", label: "10. Sucursal de sociedad extranjera" },
  { value: "consorcio_parent", label: "11. Consorcio / Joint Venture" },
  { value: "consorcio_contractual", label: "Consorcio contractual" },
  { value: "jv_estructurado", label: "Joint Venture estructurado" },
  { value: "reg_parent", label: "12. Sociedades reguladas" },
  { value: "reg_financiera", label: "Sociedad financiera" },
  { value: "reg_bancaria", label: "Sociedad bancaria" },
  { value: "reg_fiduciaria", label: "Sociedad fiduciaria" },
  { value: "reg_casa_valores", label: "Casa de valores" },

  { value: "__otro__", label: "Otro — especificar en el campo siguiente" },
];
