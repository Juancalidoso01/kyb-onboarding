"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { TextWithBrand } from "@/components/kyb-welcome-intro";
import { KYB_WELCOME_SECTIONS } from "@/lib/kyb-welcome-content";
import { formatDraftSavedAt } from "@/lib/kyb-local-draft";

const SBP_RESOLUCIONES_URL =
  "https://www.superbancos.gob.pa/resoluciones/prevencion-emisor-dinero";

type Props = {
  onContinue: () => void;
  /** Si existe borrador en localStorage, timestamp para mostrar aviso */
  savedDraftAt?: number | null;
  /** Borra el borrador local y abre el formulario vacío */
  onStartFresh?: () => void;
};

const sectionLabelClass =
  "text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500";

const bodyClass =
  "text-[15px] leading-relaxed text-slate-700 sm:text-base sm:leading-[1.75] text-justify hyphens-auto [text-wrap:pretty]";

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
        <div className="bg-gradient-to-br from-[#4749B6]/[0.12] via-white/95 to-slate-50/40 px-6 py-10 sm:px-10 sm:py-12">
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

          <AnimatedBlock delay={base} reduce={reduce}>
            <div className="mt-8 rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_1px_0_0_rgba(15,23,42,0.04)] backdrop-blur-sm sm:p-7">
              <div className={`${bodyClass} space-y-4 text-slate-800`}>
                <p>
                  En los pasos siguientes se solicitará la información y la documentación para
                  identificar a la persona jurídica, a quienes la representan y a los beneficiarios
                  finales, en el marco de la debida diligencia y del cumplimiento en materia de
                  prevención de lavado de activos, financiamiento del terrorismo y proliferación
                  (PBC/FT/FPADM). El proceso está organizado en secciones consecutivas; el avance
                  puede guardarse en este navegador hasta completar el envío.
                </p>
                <p>
                  Puede diligenciarlo cualquier persona autorizada por la empresa. Como sugerencia,
                  suele resultar más ágil que lo complete quien concentre el conocimiento del negocio
                  y la documentación —por ejemplo, alguien del área jurídica, de cumplimiento o
                  prevención (AML/FT), o un contacto de referencia en otro país cuando aplique. Si no
                  cuenta con ese perfil, no hay inconveniente: lo importante es que quien lo haga
                  pueda reunir la información solicitada.
                </p>
              </div>

              <div className="mt-8">
                <p className={sectionLabelClass}>Marco regulatorio</p>
                <ul className="mt-3 list-none space-y-2.5 text-[15px] leading-snug text-slate-700 sm:text-base">
                  <li>
                    <span className="font-semibold text-[#0B0B13]">Finalidad.</span>{" "}
                    Cumplimiento de obligaciones en PBC/FT/FPADM conforme a la legislación
                    panameña.
                  </li>
                  <li>
                    <span className="font-semibold text-[#0B0B13]">Supervisión.</span> La
                    Superintendencia de Bancos de Panamá (SBP) supervisa a los sujetos obligados;{" "}
                    <span className="font-semibold text-[#0B0B13]">Grupo Punto Pago</span> actúa
                    como tal ante la SBP.
                  </li>
                  <li>
                    <span className="font-semibold text-[#0B0B13]">Consulta.</span> Resoluciones
                    y registro en el portal de la SBP, incluida la{" "}
                    <span className="font-semibold text-[#0B0B13]">
                      RESOLUCIÓN SBP-PSO-R-2023-01022
                    </span>
                    .
                  </li>
                </ul>
                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-100 pt-4 text-sm">
                  <a
                    href="https://www.superbancos.gob.pa/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#4749B6] underline decoration-[#4749B6]/30 underline-offset-2 transition hover:decoration-[#4749B6]"
                  >
                    Portal de la SBP ↗
                  </a>
                  <a
                    href={SBP_RESOLUCIONES_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#4749B6] underline decoration-[#4749B6]/30 underline-offset-2 transition hover:decoration-[#4749B6]"
                  >
                    Prevención y registro de emisores ↗
                  </a>
                </div>
              </div>

              <div
                className="my-8 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"
                aria-hidden
              />

              <div>
                <p className={sectionLabelClass}>Alcance, normativa y tratamiento de la información</p>
                <div className="mt-4 space-y-5">
                  {KYB_WELCOME_SECTIONS.map((section) => (
                    <p key={section.label} className={bodyClass}>
                      <span className="font-semibold text-[#0B0B13]">{section.label}.</span>{" "}
                      <TextWithBrand>{section.body}</TextWithBrand>
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </AnimatedBlock>
        </div>

        <div className="border-t border-slate-100/90 px-6 py-6 sm:px-10">
          {savedDraftAt != null && onStartFresh ? (
            <div className="mb-5 rounded-xl border border-amber-200/90 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 shadow-sm">
              <p className="font-medium">Borrador almacenado en este navegador</p>
              <p className="mt-1 text-xs text-amber-900/90">
                Última actualización: {formatDraftSavedAt(savedDraftAt)}. Puede reanudar o
                iniciar un formulario nuevo (el borrador local se eliminará).
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-amber-300/90 bg-white px-3 py-2 text-sm font-semibold text-amber-950 shadow-sm transition hover:bg-amber-100/80"
                  onClick={onStartFresh}
                >
                  Iniciar de nuevo
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
            {savedDraftAt != null ? "Reanudar borrador" : "Continuar al formulario"}
          </motion.button>
          <p className="mt-3 max-w-xl text-xs leading-relaxed text-slate-500">
            El avance se guarda solo en este navegador; no se recupera en otro dispositivo ni
            tras borrar los datos del sitio.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
