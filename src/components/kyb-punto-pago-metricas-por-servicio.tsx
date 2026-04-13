"use client";

import type { FormEvent, KeyboardEvent } from "react";
import { KybFormattedNumberField } from "@/components/kyb-formatted-number-field";
import { KYB_FIELD_HINT_CLASS } from "@/lib/kyb-prose-classes";
import { getFormatErrorForField } from "@/lib/kyb-format-validation";
import type { FormState } from "@/lib/kyb-field-complete";
import type { KybField } from "@/lib/kyb-steps";
import {
  PP_SERVICIOS_MULTI_OPTIONS,
  PP_SV_METRICA_PAIRS,
} from "@/lib/kyb-steps";

type Props = {
  values: FormState;
  setField: (id: string, v: string) => void;
  inputClass: string;
  onTypingKey: (e: KeyboardEvent<HTMLInputElement>) => void;
  onInputFeedback: (e: FormEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  label: string;
  hint?: string;
};

function labelServicio(serviceId: string): string {
  return (
    PP_SERVICIOS_MULTI_OPTIONS.find((o) => o.id === serviceId)?.label ??
    serviceId
  );
}

export function KybPuntoPagoMetricasPorServicio({
  values,
  setField,
  inputClass,
  onTypingKey,
  onInputFeedback,
  label,
  hint,
}: Props) {
  const seleccionados = PP_SV_METRICA_PAIRS.filter(
    (row) => values[row.serviceId] === "true",
  );

  return (
    <div className="space-y-4">
      <div>
        <span className="mb-1.5 block text-sm font-medium text-[#0B0B13]">
          {label}
        </span>
        {hint ? <p className={KYB_FIELD_HINT_CLASS}>{hint}</p> : null}
      </div>

      {seleccionados.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200/95 bg-slate-50/80 px-4 py-8 text-center text-sm text-slate-500">
          Marque uno o más servicios en la lista superior para completar montos y
          transacciones aquí.
        </div>
      ) : (
        <ul className="space-y-4">
          {seleccionados.map((row) => {
            const titulo = labelServicio(row.serviceId);
            const esOtros = row.serviceId === "pp_sv_otros";
            const montoF: KybField = {
              id: row.montoId,
              label: "",
              type: "text",
              numberFormat: "usd",
            };
            const txF: KybField = {
              id: row.txId,
              label: "",
              type: "text",
              numberFormat: "quantity",
            };
            const errMonto = getFormatErrorForField(montoF, values);
            const errTx = getFormatErrorForField(txF, values);

            return (
              <li
                key={row.serviceId}
                className="overflow-hidden rounded-2xl border border-slate-200/90 border-l-[4px] border-l-[#4749B6] bg-gradient-to-br from-white via-white to-slate-50/40 p-4 shadow-sm sm:p-5"
              >
                <h4 className="border-b border-[#4749B6]/15 pb-2 text-sm font-semibold text-[#0B0B13]">
                  {titulo}
                </h4>

                <div className="mt-4 space-y-4">
                  {esOtros ? (
                    <label className="block">
                      <span className="mb-1.5 block text-sm font-medium text-slate-800">
                        Describa el servicio o negocio («Otros»)
                      </span>
                      <textarea
                        className={`${inputClass} min-h-[88px]`}
                        rows={3}
                        placeholder="Detalle qué tipo de operación o producto aplica…"
                        value={values.pp_sv_otros_especifique ?? ""}
                        onChange={(e) =>
                          setField("pp_sv_otros_especifique", e.target.value)
                        }
                        onInput={onInputFeedback}
                      />
                    </label>
                  ) : null}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block sm:col-span-1">
                      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-600">
                        Monto mensual estimado
                      </span>
                      <KybFormattedNumberField
                        id={row.montoId}
                        value={values[row.montoId] ?? ""}
                        onChange={(c) => setField(row.montoId, c)}
                        variant="usd"
                        inputClass={inputClass}
                        placeholder="0"
                        invalid={errMonto !== null}
                        onTypingKey={onTypingKey}
                        onInputFeedback={onInputFeedback}
                      />
                      {errMonto ? (
                        <p className="mt-1.5 text-xs font-medium text-red-600" role="alert">
                          {errMonto}
                        </p>
                      ) : (
                        <p className="mt-1.5 text-[11px] text-slate-500">
                          Referencia mensual en US$ para este servicio.
                        </p>
                      )}
                    </label>

                    <label className="block sm:col-span-1">
                      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-600">
                        Transacciones mensuales (cantidad)
                      </span>
                      <KybFormattedNumberField
                        id={row.txId}
                        value={values[row.txId] ?? ""}
                        onChange={(c) => setField(row.txId, c)}
                        variant="quantity"
                        inputClass={inputClass}
                        placeholder="0"
                        invalid={errTx !== null}
                        onTypingKey={onTypingKey}
                        onInputFeedback={onInputFeedback}
                      />
                      {errTx ? (
                        <p className="mt-1.5 text-xs font-medium text-red-600" role="alert">
                          {errTx}
                        </p>
                      ) : (
                        <p className="mt-1.5 text-[11px] text-slate-500">
                          Número aproximado de operaciones o transacciones al mes.
                        </p>
                      )}
                    </label>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
