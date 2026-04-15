/** Error al finalizar: lista de incidencias para mostrar en modal (validación + adjuntos). */
export class KybSubmissionBlockedError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    const list = issues.filter((s) => s.trim().length > 0);
    super(list.length > 0 ? list.join("\n") : "No se pudo finalizar el formulario.");
    this.name = "KybSubmissionBlockedError";
    this.issues = list.length > 0 ? list : [this.message];
  }
}

export function isKybSubmissionBlockedError(
  e: unknown,
): e is KybSubmissionBlockedError {
  return e instanceof KybSubmissionBlockedError;
}
