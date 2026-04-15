"use client";

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
