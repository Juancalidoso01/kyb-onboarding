import "react";

declare global {
  interface Window {
    /** Evita cerrar pestaña mientras el SDK de MetaMap está abierto */
    __kybMetamapModalOpen?: boolean;
  }

  namespace JSX {
    interface IntrinsicElements {
      "metamap-button": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        clientid?: string;
        flowId?: string;
        metadata?: string;
      };
    }
  }
}

export {};
