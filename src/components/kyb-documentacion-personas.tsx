"use client";

import { KYB_FIELD_HINT_CLASS } from "@/lib/kyb-prose-classes";
import {
  nombreAccionistaParaDocumentos,
} from "@/lib/kyb-documentacion";
import { KybFileRow } from "@/components/kyb-file-row";
import type { FormState } from "@/lib/kyb-field-complete";

type Props = {
  values: FormState;
  onFileName: (fieldId: string, fileName: string) => void;
  juntaMemberSlots: number;
  bfMemberSlots: number;
  /** Si cotiza en bolsa, no hay paso de accionistas en el flujo. */
  omitirAccionistas: boolean;
};

export function KybDocumentacionPersonas({
  values,
  onFileName,
  juntaMemberSlots,
  bfMemberSlots,
  omitirAccionistas,
}: Props) {
  const rep = (values.rep_nombre_apellido ?? "").trim();

  return (
    <div className="space-y-6 rounded-xl border border-slate-200/90 border-l-[3px] border-l-[#4749B6] bg-gradient-to-br from-[#4749B6]/[0.06] via-white/95 to-slate-50/40 p-4 shadow-sm sm:p-5">
      <div>
        <h3 className="text-sm font-semibold text-[#0B0B13]">
          Cédula o pasaporte — Gobierno corporativo (junta / consejo)
        </h3>
        <p className={KYB_FIELD_HINT_CLASS}>
          Por cada miembro registrado en «Gobierno corporativo», adjunte la identificación
          correspondiente. Los nombres se toman de ese paso.
        </p>
        <ul className="mt-3 space-y-3">
          {Array.from({ length: juntaMemberSlots }, (_, i) => i + 1).map((slot) => {
            const nombre = (values[`junta_${slot}_nombre_completo`] ?? "").trim();
            const label =
              nombre ||
              `(Sin nombre en miembro ${slot} — complétese en Gobierno corporativo)`;
            const fid = `doc_upl_junta_${slot}`;
            return (
              <li
                key={fid}
                className="flex flex-col gap-2 rounded-lg border border-slate-200/80 bg-white/90 px-3 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
              >
                <span className="text-sm font-medium text-slate-800 sm:max-w-[55%]">
                  {label}
                </span>
                <KybFileRow
                  id={fid}
                  fileName={values[fid] ?? ""}
                  onChange={onFileName}
                />
              </li>
            );
          })}
        </ul>
      </div>

      {!omitirAccionistas ? (
        <div>
          <h3 className="text-sm font-semibold text-[#0B0B13]">
            Cédula, pasaporte o documento — Accionistas o beneficiario final
          </h3>
          <p className={KYB_FIELD_HINT_CLASS}>
            Por cada fila visible en «Accionistas o beneficiario final», adjunte el documento
            de identificación o constitución que corresponda (persona natural o jurídica).
          </p>
          <ul className="mt-3 space-y-3">
            {Array.from({ length: bfMemberSlots }, (_, i) => i + 1).map((slot) => {
              const nombre = nombreAccionistaParaDocumentos(values, slot);
              const tipo = (values[`bf_${slot}_tipo_persona`] ?? "").trim();
              const sufijo =
                tipo === "J"
                  ? "(persona jurídica)"
                  : tipo === "N"
                    ? "(persona natural)"
                    : "";
              const label =
                nombre ||
                `(Fila ${slot}: sin nombre o tipo — complétese en Accionistas o BF)`;
              const fid = `doc_upl_bf_${slot}`;
              return (
                <li
                  key={fid}
                  className="flex flex-col gap-2 rounded-lg border border-slate-200/80 bg-white/90 px-3 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                >
                  <span className="text-sm font-medium text-slate-800 sm:max-w-[55%]">
                    {label}{" "}
                    {sufijo ? (
                      <span className="font-normal text-slate-500">{sufijo}</span>
                    ) : null}
                  </span>
                  <KybFileRow
                    id={fid}
                    fileName={values[fid] ?? ""}
                    onChange={onFileName}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      <div>
        <h3 className="text-sm font-semibold text-[#0B0B13]">
          Representante legal o apoderado
        </h3>
        <p className={KYB_FIELD_HINT_CLASS}>
          Adjunte cédula o pasaporte del representante legal o apoderado indicado en el
          formulario.
        </p>
        <div className="mt-3 flex flex-col gap-2 rounded-lg border border-slate-200/80 bg-white/90 px-3 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <span className="text-sm font-medium text-slate-800 sm:max-w-[55%]">
            {rep ||
              "(Sin nombre — complétese en Representante legal o apoderado)"}
          </span>
          <KybFileRow
            id="doc_upl_representante"
            fileName={values.doc_upl_representante ?? ""}
            onChange={onFileName}
          />
        </div>
      </div>
    </div>
  );
}
