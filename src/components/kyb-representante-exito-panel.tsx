/**
 * Misma estética de cierre exitoso: escritorio (PDF + número) vs móvil (sin PDF).
 */
export function KybRepresentanteExitoPanel(
  props:
    | { variant: "mobile" }
    | { variant: "desktop"; numeroFormulario: string },
) {
  const shell =
    "space-y-5 rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/95 via-white to-[#4749B6]/[0.06] p-6 shadow-sm sm:p-8";

  if (props.variant === "mobile") {
    return (
      <div className={shell}>
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-800">
            Gracias
          </p>
          <h2 className="mt-2 text-xl font-bold text-[#0B0B13]">
            Verificación completada
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">
            Su identidad y su firma quedaron registradas. En la computadora donde
            se abrió el formulario KYB podrá finalizar y descargar el documento
            con el resumen. Puede cerrar esta página.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={shell}>
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-800">
          Gracias por completar el proceso
        </p>
        <h3 className="mt-2 text-xl font-bold text-[#0B0B13]">
          Formulario enviado correctamente
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-slate-700">
          La verificación de identidad y la firma digital quedaron registradas.
          Se descargó el PDF con el resumen; consérvelo para sus registros y
          compártalo con su asesor de Punto Pago.
        </p>
        <div className="mt-6 rounded-xl border border-slate-200/90 bg-white px-4 py-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Número de formulario
          </p>
          <p className="mt-1 font-mono text-lg font-bold text-[#4749B6]">
            {props.numeroFormulario}
          </p>
          <p className="mt-2 text-xs text-slate-600">
            Use este número como referencia ante Punto Pago o en cualquier
            seguimiento.
          </p>
        </div>
      </div>
    </div>
  );
}
