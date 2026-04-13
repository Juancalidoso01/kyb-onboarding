"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type KybPersonalizationValue = {
  liveDiligenciaNombre: string;
  setLiveDiligenciaNombre: (n: string) => void;
};

const KybPersonalizationContext = createContext<
  KybPersonalizationValue | undefined
>(undefined);

export function KybPersonalizationProvider({ children }: { children: ReactNode }) {
  const [liveDiligenciaNombre, setLiveDiligenciaNombre] = useState("");
  const value = useMemo(
    () => ({ liveDiligenciaNombre, setLiveDiligenciaNombre }),
    [liveDiligenciaNombre],
  );
  return (
    <KybPersonalizationContext.Provider value={value}>
      {children}
    </KybPersonalizationContext.Provider>
  );
}

export function useKybPersonalizationOptional(): KybPersonalizationValue | undefined {
  return useContext(KybPersonalizationContext);
}
