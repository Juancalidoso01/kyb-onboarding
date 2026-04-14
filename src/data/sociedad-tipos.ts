/**
 * Opciones de tipo de sociedad (lista cerrada para el formulario KYB).
 */

export const SOCIEDAD_COMBO_OPTIONS: {
  value: string;
  label: string;
  disabled?: boolean;
}[] = [
  { value: "colectiva", label: "Sociedad colectiva" },
  { value: "colectiva_limitada", label: "Sociedad colectiva limitada" },
  { value: "civil", label: "Sociedad civil" },
  { value: "comandita", label: "Sociedad en comandita" },
  { value: "anonima", label: "Sociedad anónima" },
  { value: "anonima_extranjera", label: "Sociedad anónima extranjera" },
];
