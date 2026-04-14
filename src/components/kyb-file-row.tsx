"use client";

import { useState } from "react";
import {
  formatMaxMb,
  KYB_MAX_ATTACHMENT_BYTES_PER_FILE,
  KYB_MAX_TOTAL_ATTACHMENT_BYTES,
} from "@/lib/kyb-attachment-limits";
import { KYB_FIELD_HINT_CLASS } from "@/lib/kyb-prose-classes";
import { KYB_FILE_ACCEPT } from "@/lib/kyb-documentacion";

type Props = {
  id: string;
  fileName: string;
  onChange: (id: string, fileName: string) => void;
  /** Referencia al archivo para subida a servidor (Drive); solo vive en memoria en esta sesión. */
  onFileObject?: (id: string, file: File | null) => void;
  hint?: string;
};

export function KybFileRow({ id, fileName, onChange, onFileObject, hint }: Props) {
  const [rejectReason, setRejectReason] = useState<string | null>(null);

  return (
    <div className="min-w-0 flex-1">
      <label className="flex cursor-pointer flex-col gap-1.5">
        <span className="sr-only">Adjuntar archivo</span>
        <input
          type="file"
          className="block w-full max-w-md text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#4749B6]/10 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-[#4749B6] hover:file:bg-[#4749B6]/15"
          accept={KYB_FILE_ACCEPT}
          onChange={(e) => {
            const f = e.target.files?.[0];
            setRejectReason(null);
            if (f && f.size > KYB_MAX_ATTACHMENT_BYTES_PER_FILE) {
              setRejectReason(
                `Este archivo supera el máximo de ${formatMaxMb(KYB_MAX_ATTACHMENT_BYTES_PER_FILE)} MB por documento.`,
              );
              onChange(id, "");
              onFileObject?.(id, null);
              e.target.value = "";
              return;
            }
            onChange(id, f?.name ?? "");
            onFileObject?.(id, f ?? null);
            e.target.value = "";
          }}
        />
        {fileName.trim() ? (
          <span className="text-xs text-emerald-700">
            Archivo seleccionado: <span className="font-medium">{fileName}</span>
          </span>
        ) : (
          <span className="text-xs text-slate-400">Ningún archivo seleccionado</span>
        )}
      </label>
      <p className="text-[11px] text-slate-500">
        Máximo {formatMaxMb(KYB_MAX_ATTACHMENT_BYTES_PER_FILE)} MB por archivo; hasta{" "}
        {formatMaxMb(KYB_MAX_TOTAL_ATTACHMENT_BYTES)} MB en total entre todos los adjuntos.
      </p>
      {rejectReason ? (
        <p className="text-xs font-medium text-red-600" role="alert">
          {rejectReason}
        </p>
      ) : null}
      {hint ? <p className={KYB_FIELD_HINT_CLASS}>{hint}</p> : null}
    </div>
  );
}
