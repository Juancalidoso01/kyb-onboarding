"use client";

import { motion, useReducedMotion } from "framer-motion";
import { KybWelcomeIntro } from "@/components/kyb-welcome-intro";

type Props = {
  onContinue: () => void;
};

export function KybLanding({ onContinue }: Props) {
  const reduce = useReducedMotion();

  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-6 sm:px-6 sm:pt-10">
      <motion.div
        className="overflow-hidden rounded-2xl border border-white/70 bg-white/80 shadow-[0_8px_40px_-12px_rgba(71,73,182,0.18),0_0_0_1px_rgba(15,23,42,0.05)] backdrop-blur-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="border-b border-slate-100/90 bg-gradient-to-br from-[#4749B6]/[0.12] via-white/95 to-white/80 px-6 py-10 sm:px-10 sm:py-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#4749B6]">
            Grupo Punto Pago
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#0B0B13] sm:text-[2rem] sm:leading-tight">
            Debida diligencia
            <span className="block text-xl font-semibold text-slate-600 sm:text-2xl">
              Persona jurídica
            </span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600">
            Gracias por iniciar su registro. A continuación encontrará el marco legal y las
            reglas del proceso. Cuando esté listo, continúe para completar el perfil paso a
            paso. Si un dato no aplica, puede usar{" "}
            <span className="font-semibold text-slate-800">N/A</span>.
          </p>
        </div>

        <div className="px-6 py-8 sm:px-10 sm:py-10">
          <KybWelcomeIntro />
        </div>

        <div className="border-t border-slate-100/90 px-6 py-6 sm:px-10">
          <motion.button
            type="button"
            className="w-full rounded-xl bg-gradient-to-b from-[#4749B6] to-[#3B3DA6] px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#4749B6]/30 sm:w-auto sm:min-w-[220px]"
            onClick={onContinue}
            whileHover={reduce ? undefined : { scale: 1.02 }}
            whileTap={reduce ? undefined : { scale: 0.98 }}
          >
            Continuar al formulario
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
