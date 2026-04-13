"use client";

import type { FormState } from "@/lib/kyb-field-complete";
import { KybFirmaDigitalPanel } from "@/components/kyb-firma-digital-panel";
import { KybMetamapDirectorKyc } from "@/components/kyb-metamap-director-kyc";

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
      <KybMetamapDirectorKyc values={values} setField={setField} />
      <div className="border-t border-slate-200/90 pt-8">
        <KybFirmaDigitalPanel values={values} setField={setField} />
      </div>
    </div>
  );
}
