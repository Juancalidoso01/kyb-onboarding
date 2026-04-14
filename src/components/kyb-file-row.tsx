"use client";

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
      {hint ? <p className={KYB_FIELD_HINT_CLASS}>{hint}</p> : null}
    </div>
  );
}
