"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  KYB_TEXT_CAMPOS_OBLIGATORIOS,
  KYB_TEXT_CONFIDENCIALIDAD,
  KYB_TEXT_CUMPLIMIENTO,
  KYB_TEXT_DEBIDA_DILIGENCIA,
  KYB_TEXT_PEP_DEFINICION,
} from "@/lib/kyb-welcome-content";

const sectionClass =
  "rounded-xl border border-slate-200/90 border-l-[3px] border-l-[#4749B6] bg-white/90 p-4 text-sm leading-relaxed text-slate-700 shadow-sm sm:p-5";

function Section({
  children,
  delay,
}: {
  children: ReactNode;
  delay: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={reduce ? false : { opacity: 1, y: 0 }}
      transition={{ duration: 0.38, delay, ease: [0.22, 1, 0.36, 1] }}
      className={sectionClass}
    >
      {children}
    </motion.div>
  );
}

export function KybWelcomeIntro() {
  const reduce = useReducedMotion();
  const base = reduce ? 0 : 0.06;

  return (
    <div className="space-y-4">
      <Section delay={base}>
        <p className="whitespace-pre-wrap">{KYB_TEXT_DEBIDA_DILIGENCIA}</p>
      </Section>
      <Section delay={base + 0.05}>
        <p className="whitespace-pre-wrap">{KYB_TEXT_CUMPLIMIENTO}</p>
      </Section>
      <Section delay={base + 0.1}>
        <p className="whitespace-pre-wrap">{KYB_TEXT_CONFIDENCIALIDAD}</p>
      </Section>
      <Section delay={base + 0.15}>
        <p className="font-semibold text-[#0B0B13]">{KYB_TEXT_CAMPOS_OBLIGATORIOS}</p>
      </Section>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={reduce ? false : { opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: base + 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden rounded-xl border border-[#4749B6]/25 bg-gradient-to-br from-[#4749B6]/[0.07] via-white/95 to-white/90 shadow-sm"
      >
        <div className="border-b border-[#4749B6]/15 px-4 py-3 sm:px-5">
          <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-[#3B3DA6]">
            Persona expuesta políticamente (PEP)
          </h3>
        </div>
        <div className="px-4 py-4 text-sm leading-relaxed text-slate-700 sm:px-5 sm:py-5">
          <p className="whitespace-pre-wrap">{KYB_TEXT_PEP_DEFINICION}</p>
        </div>
      </motion.div>
    </div>
  );
}
