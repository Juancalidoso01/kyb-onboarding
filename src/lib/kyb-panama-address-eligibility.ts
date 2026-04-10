import { PAIS_PANAMA } from "@/data/paises";
import type { FormState } from "@/lib/kyb-field-complete";

/**
 * Panamá para direcciones asistidas y teléfonos en datos generales: coherente con
 * país donde opera y país del domicilio (oculto / sincronizado).
 */
export function showPanamaAddressLookup(values: FormState): boolean {
  const paisDg = (values.pais ?? "").trim();
  if (paisDg && paisDg !== PAIS_PANAMA) return false;
  const paisOp = (values.pais_opera ?? "").trim();
  if (paisOp && paisOp !== PAIS_PANAMA) return false;
  return true;
}
