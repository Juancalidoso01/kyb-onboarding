"use client";

import { useReducedMotion } from "framer-motion";

const brandPattern = /(GRUPO PUNTO PAGO|Grupo Punto Pago)/gi;

/** Resalta el nombre comercial dentro de textos legales importados desde `kyb-welcome-content`. */
export function TextWithBrand({ children }: { children: string }) {
  const parts = children.split(brandPattern);
  return (
    <>
      {parts.map((part, i) =>
        /^grupo punto pago$/i.test(part) ? (
          <span key={i} className="font-semibold text-[#4749B6]">
            Grupo Punto Pago
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

/** Línea corta superior con micro-movimiento por letra (solo si no hay reduced motion). */
export function KybEyebrowBrandLetters({ text }: { text: string }) {
  const reduce = useReducedMotion();
  if (reduce) {
    return <span>{text}</span>;
  }
  return (
    <span className="inline-flex flex-wrap">
      {text.split("").map((ch, i) => (
        <span
          key={`${i}-${ch}`}
          className="pp-kyb-letter-nudge text-[#4749B6]"
          style={{ animationDelay: `${i * 0.055}s` }}
        >
          {ch === " " ? "\u00a0" : ch}
        </span>
      ))}
    </span>
  );
}

/** Subtítulo principal con brillo de color tipo marca. */
export function KybSubtitleBrandSheen({ children }: { children: string }) {
  const reduce = useReducedMotion();
  if (reduce) {
    return (
      <span className="mt-1 block text-xl font-semibold text-[#4749B6] sm:text-2xl">
        {children}
      </span>
    );
  }
  return (
    <span className="pp-kyb-brand-sheen mt-1 block text-xl font-semibold sm:text-2xl">
      {children}
    </span>
  );
}
