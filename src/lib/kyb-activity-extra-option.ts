/**
 * Opción fija al final del listado de actividades (no viene del Google Sheet).
 * Si el usuario la elige, debe completar el textarea asociado en el paso del formulario.
 */
export const KYB_ACTIVITY_NOT_LISTED_VALUE = "__actividad_no_enlistada__";

export const KYB_ACTIVITY_NOT_LISTED_LABEL =
  "Actividad no enlistada (describa abajo)";

export function appendActivityNotListedOption(
  options: { value: string; label: string }[],
): { value: string; label: string }[] {
  const rest = options.filter((o) => o.value !== KYB_ACTIVITY_NOT_LISTED_VALUE);
  return [
    ...rest,
    { value: KYB_ACTIVITY_NOT_LISTED_VALUE, label: KYB_ACTIVITY_NOT_LISTED_LABEL },
  ];
}
