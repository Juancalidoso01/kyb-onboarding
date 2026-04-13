"use client";

import { KybDeclaracionWitness } from "@/components/kyb-declaracion-estado";
import { KybFirmaDigitalPanel } from "@/components/kyb-firma-digital-panel";
import { KybMetamapDirectorKyc } from "@/components/kyb-metamap-director-kyc";
import type { FormState } from "@/lib/kyb-field-complete";

type Props = {
  values: FormState;
  setField: (id: string, v: string) => void;
};

export function KybRepresentanteFirmaKyc({ values, setField }: Props) {
  return (
    <div
      id="kyb-bloque-firma-representante"
      className="scroll-mt-28 space-y-10 rounded-2xl border border-slate-200/90 bg-slate-50/60 p-4 shadow-sm sm:p-6"
    >
      <p className="text-xs leading-relaxed text-slate-600">
        Si el representante usa <strong>este mismo equipo</strong>, puede completar
        MetaMap y la firma aquí. Si ya usó el celular con el código QR, los datos
        aparecerán solos al sincronizar.
      </p>
      <KybMetamapDirectorKyc values={values} setField={setField} />
      <div className="border-t border-slate-200/90 pt-8">
        <KybFirmaDigitalPanel values={values} setField={setField} />
      </div>
      <div className="border-t border-slate-200/90 pt-6">
        <KybDeclaracionWitness values={values} />
      </div>
    </div>
  );
}
