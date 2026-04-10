"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { KybWelcomeIntro } from "@/components/kyb-welcome-intro";
import { formatDraftSavedAt } from "@/lib/kyb-local-draft";

const SBP_LOGO_URL =
  "https://www.superbancos.gob.pa/sites/default/files/logo-oficial_0.png";
const SBP_RESOLUCIONES_URL =
  "https://www.superbancos.gob.pa/resoluciones/prevencion-emisor-dinero";

type Props = {
  onContinue: () => void;
  /** Si existe borrador en localStorage, timestamp para mostrar aviso */
  savedDraftAt?: number | null;
  /** Borra el borrador local y abre el formulario vacío */
  onStartFresh?: () => void;
};

const proseClass =
  "text-[15px] leading-[1.75] text-slate-700 sm:text-base sm:leading-[1.8] text-justify hyphens-auto [text-wrap:pretty]";

function AnimatedBlock({
  children,
  delay,
  reduce,
}: {
  children: ReactNode;
  delay: number;
  reduce: boolean;
}) {
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 14 }}
      animate={reduce ? false : { opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

export function KybLanding({
  onContinue,
  savedDraftAt,
  onStartFresh,
}: Props) {
  const reduceMotion = useReducedMotion();
  const reduce = Boolean(reduceMotion);
  const base = reduce ? 0 : 0.06;

  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-6 sm:px-6 sm:pt-10">
      <motion.div
        className="overflow-hidden rounded-2xl border border-white/70 bg-white/80 shadow-[0_8px_40px_-12px_rgba(71,73,182,0.18),0_0_0_1px_rgba(15,23,42,0.05)] backdrop-blur-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="border-b border-slate-100/90 bg-gradient-to-br from-[#4749B6]/[0.12] via-white/95 to-white/80 px-6 py-10 sm:px-10 sm:py-12">
          <motion.p
            className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#4749B6]"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
          >
            Grupo Punto Pago
          </motion.p>
          <motion.h1
            className="mt-3 text-3xl font-bold tracking-tight text-[#0B0B13] sm:text-[2rem] sm:leading-tight"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.04 }}
          >
            Debida diligencia
            <span className="mt-1 block text-xl font-semibold text-slate-600 sm:text-2xl">
              Persona jurídica
            </span>
          </motion.h1>

          <div className="mt-8 space-y-6">
            <AnimatedBlock delay={base} reduce={reduce}>
              <p className={proseClass}>
                Gracias por iniciar su registro. A continuación encontrará el marco legal y
                las reglas del proceso. Cuando esté listo, continúe para completar el perfil
                paso a paso. Si un dato no aplica, puede usar{" "}
                <span className="font-semibold text-[#0B0B13]">N/A</span>.
              </p>
            </AnimatedBlock>

            <AnimatedBlock delay={base + 0.08} reduce={reduce}>
              <p className={proseClass}>
                <span className="font-semibold text-[#0B0B13]">
                  ¿Por qué Punto Pago solicita esta información?
                </span>{" "}
                Para identificar y conocer a las personas jurídicas con las que trabajamos y
                cumplir con las obligaciones de prevención del lavado de activos, del
                financiamiento del terrorismo y de la proliferación de armas de destrucción
                masiva, conforme a la normativa panameña. La{" "}
                <span className="font-semibold text-[#0B0B13]">
                  Superintendencia de Bancos de Panamá (SBP)
                </span>{" "}
                es el ente regulador que supervisa a los sujetos obligados en esta materia.
              </p>
            </AnimatedBlock>

            <AnimatedBlock delay={base + 0.16} reduce={reduce}>
              <div className="rounded-xl border border-slate-200/90 bg-white/90 p-4 shadow-sm sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                  <a
                    href="https://www.superbancos.gob.pa/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative mx-auto h-14 w-[200px] shrink-0 sm:mx-0 sm:h-16 sm:w-[220px]"
                    aria-label="Sitio web de la Superintendencia de Bancos de Panamá"
                  >
                    <Image
                      src={SBP_LOGO_URL}
                      alt="Superintendencia de Bancos de Panamá"
                      fill
                      className="object-contain object-left"
                      sizes="220px"
                      priority
                    />
                  </a>
                  <div className="min-w-0 flex-1">
                    <p className={`${proseClass} text-sm sm:text-[15px]`}>
                      Grupo Punto Pago actúa como sujeto obligado ante la SBP. En el portal de
                      la Superintendencia puede consultar las resoluciones de prevención y el
                      registro de emisores de dinero, incluida la{" "}
                      <span className="font-semibold text-[#0B0B13]">
                        RESOLUCIÓN SBP-PSO-R-2023-01022
                      </span>
                      .
                    </p>
                    <a
                      href={SBP_RESOLUCIONES_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#4749B6] underline decoration-[#4749B6]/30 underline-offset-2 transition hover:decoration-[#4749B6]"
                    >
                      Ver resoluciones y registro — SBP
                      <span aria-hidden className="text-base">
                        ↗
                      </span>
                    </a>
                  </div>
                </div>
              </div>
            </AnimatedBlock>
          </div>
        </div>

        <div className="px-6 py-8 sm:px-10 sm:py-10">
          <KybWelcomeIntro />
        </div>

        <div className="border-t border-slate-100/90 px-6 py-6 sm:px-10">
          {savedDraftAt != null && onStartFresh ? (
            <div className="mb-5 rounded-xl border border-amber-200/90 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 shadow-sm">
              <p className="font-medium">Hay un borrador guardado en este navegador</p>
              <p className="mt-1 text-xs text-amber-900/90">
                Último guardado: {formatDraftSavedAt(savedDraftAt)}. Puede continuar desde ahí
                o empezar un formulario nuevo (se borrará el borrador local).
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-amber-300/90 bg-white px-3 py-2 text-sm font-semibold text-amber-950 shadow-sm transition hover:bg-amber-100/80"
                  onClick={onStartFresh}
                >
                  Empezar de nuevo
                </button>
              </div>
            </div>
          ) : null}
          <motion.button
            type="button"
            className="w-full rounded-xl bg-gradient-to-b from-[#4749B6] to-[#3B3DA6] px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#4749B6]/30 sm:w-auto sm:min-w-[220px]"
            onClick={onContinue}
            whileHover={reduce ? undefined : { scale: 1.02 }}
            whileTap={reduce ? undefined : { scale: 0.98 }}
          >
            {savedDraftAt != null ? "Continuar borrador" : "Continuar al formulario"}
          </motion.button>
          <p className="mt-3 max-w-xl text-xs leading-relaxed text-slate-500">
            El avance del formulario se guarda automáticamente en este navegador (solo en este
            equipo o teléfono). Si borra datos del sitio o usa otro navegador, no se recupera
            el borrador.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
