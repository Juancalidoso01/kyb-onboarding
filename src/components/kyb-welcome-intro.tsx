"use client";

import { motion, useReducedMotion } from "framer-motion";
import { KYB_WELCOME_SECTIONS } from "@/lib/kyb-welcome-content";

const brandPattern = /(GRUPO PUNTO PAGO|Grupo Punto Pago)/gi;

function TextWithBrand({ children }: { children: string }) {
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

const prose =
  "text-[15px] leading-[1.82] text-slate-700 text-justify hyphens-auto [text-wrap:pretty] sm:text-base sm:leading-[1.85]";

export function KybWelcomeIntro() {
  const reduce = Boolean(useReducedMotion());

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl px-4 py-6 sm:px-6 sm:py-8"
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-[#4749B6]/[0.07] via-transparent to-[#6366f1]/[0.04]"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#4749B6]/25 to-transparent" />

      <motion.div
        className="relative space-y-6 sm:space-y-7"
        initial="hidden"
        animate="show"
        variants={
          reduce
            ? { hidden: {}, show: {} }
            : {
                hidden: {},
                show: {
                  transition: { staggerChildren: 0.11, delayChildren: 0.06 },
                },
              }
        }
      >
        {KYB_WELCOME_SECTIONS.map((section, idx) => (
          <motion.p
            key={idx}
            className={prose}
            variants={
              reduce
                ? {}
                : {
                    hidden: { opacity: 0, y: 12 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
                    },
                  }
            }
          >
            <span className="font-semibold text-[#0B0B13]">{section.label}.</span>{" "}
            <TextWithBrand>{section.body}</TextWithBrand>
          </motion.p>
        ))}
      </motion.div>
    </motion.div>
  );
}
