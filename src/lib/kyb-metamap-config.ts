/**
 * MetaMap Web Button (público). Obtener client id y flow en el dashboard Metamap.
 * @see https://docs.metamap.com/docs/web-metamap-button
 */
export function getMetamapPublicConfig():
  | { clientId: string; flowId: string }
  | null {
  const clientId = process.env.NEXT_PUBLIC_METAMAP_CLIENT_ID?.trim();
  const flowId = process.env.NEXT_PUBLIC_METAMAP_FLOW_ID?.trim();
  if (!clientId || !flowId) return null;
  return { clientId, flowId };
}
