/**
 * MetaMap Web Button (público). Client id y flow id son públicos en el navegador.
 * Pueden definirse en .env.local; si faltan, se usan los valores del proyecto (dashboard Metamap).
 * No incluya el client secret en el front; solo en backend si integra API server-to-server.
 * @see https://docs.metamap.com/docs/web-metamap-button
 */
const FALLBACK_METAMAP_CLIENT_ID = "612566a0a0be80001b035915";
const FALLBACK_METAMAP_FLOW_ID = "69b84638b43624798a4477fd";

let metamapPublicConfigCache: { clientId: string; flowId: string } | null = null;

export function getMetamapPublicConfig(): { clientId: string; flowId: string } {
  if (metamapPublicConfigCache) return metamapPublicConfigCache;
  metamapPublicConfigCache = {
    clientId:
      process.env.NEXT_PUBLIC_METAMAP_CLIENT_ID?.trim() ||
      FALLBACK_METAMAP_CLIENT_ID,
    flowId:
      process.env.NEXT_PUBLIC_METAMAP_FLOW_ID?.trim() ||
      FALLBACK_METAMAP_FLOW_ID,
  };
  return metamapPublicConfigCache;
}
