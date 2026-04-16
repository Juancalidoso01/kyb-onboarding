"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  KybEyebrowBrandLetters,
  KybSubtitleBrandSheen,
  TextWithBrand,
} from "@/components/kyb-welcome-intro";
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

/** Móvil: alineado a la izquierda (mejor lectura); desde sm justificado + guiones. */
const bodyClass =
  "text-left text-pretty text-[15px] leading-relaxed text-slate-700 hyphens-none sm:hyphens-auto sm:text-justify sm:text-base sm:leading-[1.75]";

/** Acento de marca (alineado al índigo del ecosistema Punto Pago / puntopago.net). */
const accentClass = "font-semibold text-[#4749B6]";

function LandingAccent({ children }: { children: ReactNode }) {
  return <span className={accentClass}>{children}</span>;
}

const introListContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.11, delayChildren: 0.05 },
  },
};

const introListItem = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const marcoListContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.12 },
  },
};

const marcoListItem = {
  hidden: { opacity: 0, x: -6 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const legalSectionsContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.08 },
  },
};

const legalSectionItem = {
  hidden: { opacity: 0, y: 6 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  },
};

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
        <div className="bg-gradient-to-br from-[#4749B6]/[0.12] via-white/95 to-slate-50/40 px-6 py-8 sm:px-10 sm:py-12">
          <motion.p
            className="text-[11px] font-semibold uppercase tracking-[0.14em]"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35 }}
          >
            <KybEyebrowBrandLetters text="Grupo Punto Pago" />
          </motion.p>
          <motion.h1
            className="mt-2.5 text-3xl font-bold tracking-tight text-[#0B0B13] sm:mt-3 sm:text-[2rem] sm:leading-tight"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.04 }}
          >
            Debida diligencia
            <KybSubtitleBrandSheen>Persona jurídica</KybSubtitleBrandSheen>
          </motion.h1>

          <AnimatedBlock delay={base} reduce={reduce}>
            <div className="mt-5 rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_1px_0_0_rgba(15,23,42,0.04)] backdrop-blur-sm sm:mt-6 sm:p-7">
              <motion.div
                className={`${bodyClass} space-y-3 text-slate-800 sm:space-y-3.5`}
                variants={reduce ? { hidden: {}, show: {} } : introListContainer}
                initial="hidden"
                animate="show"
              >
                <motion.p variants={reduce ? {} : introListItem}>
                  Formulario por <LandingAccent>secciones</LandingAccent> para identificar a la{" "}
                  <LandingAccent>persona jurídica</LandingAccent>, quienes la representan y los{" "}
                  <LandingAccent>beneficiarios finales</LandingAccent>, en el marco de la{" "}
                  <LandingAccent>debida diligencia</LandingAccent> y la prevención{" "}
                  <LandingAccent>PBC/FT/FPADM</LandingAccent>. Puede{" "}
                  <LandingAccent>guardar el avance en este navegador</LandingAccent> hasta enviar.
                </motion.p>
                <motion.p variants={reduce ? {} : introListItem}>
                  Puede diligenciarlo <LandingAccent>cualquier persona autorizada</LandingAccent>{" "}
                  por la empresa; suele ser más rápido quien tenga el negocio y la documentación a
                  mano (área jurídica, cumplimiento, <LandingAccent>AML/FT</LandingAccent> o enlace en
                  el exterior, si aplica).
                </motion.p>
              </motion.div>

              <div className="mt-5 sm:mt-6">
                <motion.p
                  className={sectionLabelClass}
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.35, delay: reduce ? 0 : 0.2 }}
                >
                  Marco regulatorio
                </motion.p>
                <motion.ul
                  className="mt-2.5 list-none space-y-2 text-[15px] leading-snug text-slate-700 sm:mt-3 sm:space-y-2.5 sm:text-base"
                  variants={reduce ? { hidden: {}, show: {} } : marcoListContainer}
                  initial="hidden"
                  animate="show"
                >
                  <motion.li variants={reduce ? {} : marcoListItem}>
                    <span className={accentClass}>Finalidad.</span> Cumplimiento de obligaciones en{" "}
                    <LandingAccent>PBC/FT/FPADM</LandingAccent> conforme a la legislación panameña.
                  </motion.li>
                  <motion.li variants={reduce ? {} : marcoListItem}>
                    <span className={accentClass}>Supervisión.</span> La Superintendencia de Bancos
                    de Panamá (<LandingAccent>SBP</LandingAccent>) supervisa a los sujetos
                    obligados; <LandingAccent>Grupo Punto Pago</LandingAccent> actúa como tal ante la
                    SBP.
                  </motion.li>
                  <motion.li variants={reduce ? {} : marcoListItem}>
                    <span className={accentClass}>Consulta.</span> Resoluciones y registro en el
                    portal de la SBP, incluida la{" "}
                    <span className="font-semibold text-[#0B0B13]">
                      RESOLUCIÓN SBP-PSO-R-2023-01022
                    </span>
                    .
                  </motion.li>
                </motion.ul>
                <div className="mt-3.5 flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-100 pt-3 text-sm sm:mt-4 sm:pt-4">
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
                className="my-5 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent sm:my-6"
                aria-hidden
              />

              <div>
                <motion.p
                  className={sectionLabelClass}
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.35, delay: reduce ? 0 : 0.28 }}
                >
                  Alcance, normativa y tratamiento de la información
                </motion.p>
                <motion.div
                  className="mt-3 space-y-3 sm:mt-4 sm:space-y-3.5"
                  variants={reduce ? { hidden: {}, show: {} } : legalSectionsContainer}
                  initial="hidden"
                  animate="show"
                >
                  {KYB_WELCOME_SECTIONS.map((section) => (
                    <motion.p
                      key={section.label}
                      className={bodyClass}
                      variants={reduce ? {} : legalSectionItem}
                    >
                      <span className={accentClass}>{section.label}.</span>{" "}
                      <TextWithBrand>{section.body}</TextWithBrand>
                    </motion.p>
                  ))}
                </motion.div>
              </div>
            </div>
          </AnimatedBlock>
        </div>

        <div className="border-t border-slate-100/90 px-6 py-6 sm:px-10">
          {savedDraftAt != null && onStartFresh ? (
            <div className="mb-5 rounded-xl border border-amber-200/90 bg-amber-50/90 px-4 py-4 text-sm text-amber-950 shadow-sm">
              <p className="text-base font-semibold text-amber-950">
                Continuar diligenciando
              </p>
              <p className="mt-2 text-xs leading-relaxed text-amber-900/90">
                En este navegador hay un borrador guardado (última actualización:{" "}
                {formatDraftSavedAt(savedDraftAt)}). Puede{" "}
                <span className="font-medium">retomar el mismo avance</span> donde lo dejó o, si
                prefiere, <span className="font-medium">iniciar un formulario nuevo</span> en
                blanco; en ese caso se elimina solo el borrador de este equipo.
              </p>
              <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
                <motion.button
                  type="button"
                  className="w-full rounded-xl bg-gradient-to-b from-[#4749B6] to-[#3B3DA6] px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#4749B6]/30 sm:w-auto sm:min-w-[240px]"
                  onClick={onContinue}
                  whileHover={reduce ? undefined : { scale: 1.02 }}
                  whileTap={reduce ? undefined : { scale: 0.98 }}
                >
                  Continuar diligenciando
                </motion.button>
                <button
                  type="button"
                  className="w-full rounded-xl border border-amber-300/90 bg-white px-5 py-3 text-sm font-semibold text-amber-950 shadow-sm transition hover:bg-amber-100/80 sm:w-auto"
                  onClick={onStartFresh}
                >
                  Iniciar formulario nuevo
                </button>
              </div>
            </div>
          ) : savedDraftAt != null ? (
            <motion.button
              type="button"
              className="w-full rounded-xl bg-gradient-to-b from-[#4749B6] to-[#3B3DA6] px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#4749B6]/30 sm:w-auto sm:min-w-[240px]"
              onClick={onContinue}
              whileHover={reduce ? undefined : { scale: 1.02 }}
              whileTap={reduce ? undefined : { scale: 0.98 }}
            >
              Continuar diligenciando
            </motion.button>
          ) : (
            <motion.button
              type="button"
              className="w-full rounded-xl bg-gradient-to-b from-[#4749B6] to-[#3B3DA6] px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#4749B6]/30 sm:w-auto sm:min-w-[220px]"
              onClick={onContinue}
              whileHover={reduce ? undefined : { scale: 1.02 }}
              whileTap={reduce ? undefined : { scale: 0.98 }}
            >
              Continuar al formulario
            </motion.button>
          )}
          <p className="mt-3 max-w-xl text-xs leading-relaxed text-slate-500">
            El avance se guarda solo en este navegador; no se recupera en otro dispositivo ni
            tras borrar los datos del sitio.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
