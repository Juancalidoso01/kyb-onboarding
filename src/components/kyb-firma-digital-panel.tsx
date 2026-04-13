"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { KYB_FIELD_HINT_CLASS } from "@/lib/kyb-prose-classes";
import type { FormState } from "@/lib/kyb-field-complete";

type Props = {
  values: FormState;
  setField: (id: string, v: string) => void;
};

const CANVAS_W = 560;
const CANVAS_H = 200;

export function KybFirmaDigitalPanel({ values, setField }: Props) {
  const saved = (values.decl_firma_canvas_data_url ?? "").trim();
  const [open, setOpen] = useState(false);
  const [consent, setConsent] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const hasInk = useRef(false);
  const [hasDrawing, setHasDrawing] = useState(false);

  const resetCanvas = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    hasInk.current = false;
    setHasDrawing(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    resetCanvas();
    setConsent(false);
  }, [open, resetCanvas]);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current;
    if (!c) return { x: 0, y: 0 };
    const r = c.getBoundingClientRect();
    return {
      x: e.clientX - r.left,
      y: e.clientY - r.top,
    };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    const { x, y } = pos(e);
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = pos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    hasInk.current = true;
    setHasDrawing(true);
  };

  const endStroke = () => {
    drawing.current = false;
  };

  const capture = () => {
    const c = canvasRef.current;
    if (!c || !consent || !hasInk.current || !hasDrawing) return;
    const dataUrl = c.toDataURL("image/png");
    setField("decl_firma_canvas_data_url", dataUrl);
    setOpen(false);
  };

  const clearSaved = () => {
    setField("decl_firma_canvas_data_url", "");
  };

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-[#0B0B13]">
          Firma digital del representante legal
        </h3>
        <p className={KYB_FIELD_HINT_CLASS}>
          Dibuje su firma en el recuadro (como en una tabla de firmas). Debe aceptar el consentimiento antes de guardar.
        </p>
      </div>

      {saved ? (
        <div className="rounded-xl border border-emerald-200/90 bg-emerald-50/80 p-4">
          <p className="text-sm font-semibold text-emerald-900">
            Firma digital registrada
          </p>
          <div className="mt-3 overflow-hidden rounded-lg border border-emerald-200/80 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={saved}
              alt="Firma capturada"
              className="max-h-32 w-full object-contain object-left"
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-xl border border-slate-200/90 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
              onClick={() => setOpen(true)}
            >
              Volver a firmar
            </button>
            <button
              type="button"
              className="text-sm font-medium text-red-700 underline-offset-2 hover:underline"
              onClick={clearSaved}
            >
              Borrar firma
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="w-full rounded-2xl border-2 border-dashed border-[#4749B6]/35 bg-[#4749B6]/[0.04] px-4 py-4 text-sm font-semibold text-[#4749B6] shadow-sm transition hover:border-[#4749B6]/55 hover:bg-[#4749B6]/[0.08]"
          onClick={() => setOpen(true)}
        >
          Abrir recuadro de firma digital
        </button>
      )}

      {open ? (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="kyb-firma-modal-title"
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xl">
            <h4
              id="kyb-firma-modal-title"
              className="text-base font-semibold text-[#0B0B13]"
            >
              Firma en el área
            </h4>
            <p className="mt-1 text-xs text-slate-600">
              Use el dedo o el mouse. Limpie y vuelva a intentar si comete un error.
            </p>
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
              <canvas
                ref={canvasRef}
                width={CANVAS_W}
                height={CANVAS_H}
                className="block w-full touch-none"
                style={{ maxHeight: CANVAS_H }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endStroke}
                onPointerCancel={endStroke}
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={resetCanvas}
              >
                Limpiar
              </button>
            </div>
            <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm text-slate-800">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-slate-300 text-[#4749B6] focus:ring-[#4749B6]"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              <span>
                Declaro que la firma anterior corresponde al representante legal y que acepto su uso en la declaración de este formulario KYB (borrador).
              </span>
            </label>
            <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
                onClick={() => setOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="rounded-xl bg-gradient-to-b from-[#4749B6] to-[#3B3DA6] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#4749B6]/25 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={!consent || !hasDrawing}
                title={
                  !consent
                    ? "Acepte el consentimiento"
                    : !hasDrawing
                      ? "Dibuje su firma en el recuadro"
                      : undefined
                }
                onClick={capture}
              >
                Guardar firma
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
