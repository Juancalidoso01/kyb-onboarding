"use client";

import { KYB_FIELD_HINT_CLASS } from "@/lib/kyb-prose-classes";
import type { FormState } from "@/lib/kyb-field-complete";
import {
  buildFirmaPaqueteFromWizard,
  downloadFirmaPaqueteJson,
} from "@/lib/kyb-firma-paquete";

type Props = {
  values: FormState;
  meta: {
    juntaMemberSlots: number;
    bfMemberSlots: number;
    pepMemberSlots: number;
    cotiza_bolsa: string;
  };
};

export function KybFirmaPaquetePanel({ values, meta }: Props) {
  const razon = (values.razon_social ?? "").trim() || "cliente";

  return (
    <div className="space-y-4 rounded-xl border border-dashed border-[#4749B6]/40 bg-[#4749B6]/[0.04] p-4 sm:p-5">
      <div>
        <h3 className="text-sm font-semibold text-[#0B0B13]">
          Firma del director en otro dispositivo
        </h3>
        <p className={KYB_FIELD_HINT_CLASS}>
          Descargue un archivo JSON con el borrador. Envíelo por un canal seguro
          (correo institucional, Teams, etc.) a quien debe firmar. Esa persona
          abre la página de firma, carga el archivo y confirma que revisó el
          resumen antes de completar su parte.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="rounded-xl bg-gradient-to-b from-[#4749B6] to-[#3B3DA6] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#4749B6]/25 transition hover:opacity-[0.97]"
          onClick={() => {
            downloadFirmaPaqueteJson(
              buildFirmaPaqueteFromWizard(values, meta),
              razon,
            );
          }}
        >
          Descargar paquete para el director (.json)
        </button>
        <a
          href="/firmar-director"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-xl border border-[#4749B6]/35 bg-white px-5 py-2.5 text-sm font-semibold text-[#4749B6] shadow-sm transition hover:bg-slate-50"
        >
          Abrir página «Firma del director» (nueva pestaña)
        </a>
      </div>
      <p className="text-[11px] leading-snug text-slate-500">
        Este flujo no sustituye una firma electrónica avanzada: es una verificación
        de lectura y coherencia. Para producción puede enlazarse luego con su API
        o proveedor de firma certificada.
      </p>
    </div>
  );
}
