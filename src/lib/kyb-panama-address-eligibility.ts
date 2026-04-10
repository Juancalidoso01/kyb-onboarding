import { PAIS_PANAMA } from "@/data/paises";
import type { FormState } from "@/lib/kyb-field-complete";

/**
 * Autocompletado Panamá (Geoapify + lista local) cuando la operación y el país
 * del domicilio comercial no contradicen Panamá.
 */
export function showPanamaCommercialAddressLookup(values: FormState): boolean {
  const paisDg = (values.pais ?? "").trim();
  if (paisDg && paisDg !== PAIS_PANAMA) return false;
  const paisOp = (values.pais_opera ?? "").trim();
  if (paisOp && paisOp !== PAIS_PANAMA) return false;
  return true;
}
