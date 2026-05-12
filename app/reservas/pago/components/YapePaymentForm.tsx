"use client";

import { useState } from "react";

type Props = {
  onSubmit: (file: File) => Promise<void>;
  disabled?: boolean;
};

export default function YapePaymentForm({ onSubmit, disabled }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="rounded-2xl bg-snow-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-forest-green text-snow-white font-semibold">1</span>
          <p className="font-semibold text-main">Escanea y realiza el pago</p>
        </div>
        <div className="grid place-items-center rounded-xl border border-stone-gray bg-snow-white p-5 text-main">
          <div className="h-40 w-40 rounded-md border border-stone-gray bg-white p-2 shadow-sm">
            <svg viewBox="0 0 120 120" className="h-full w-full" role="img" aria-hidden="true">
              <rect width="120" height="120" fill="#ffffff" />
              <rect x="6" y="6" width="36" height="36" fill="#0f2f1f" />
              <rect x="12" y="12" width="24" height="24" fill="#ffffff" />
              <rect x="18" y="18" width="12" height="12" fill="#0f2f1f" />
              <rect x="78" y="6" width="36" height="36" fill="#0f2f1f" />
              <rect x="84" y="12" width="24" height="24" fill="#ffffff" />
              <rect x="90" y="18" width="12" height="12" fill="#0f2f1f" />
              <rect x="6" y="78" width="36" height="36" fill="#0f2f1f" />
              <rect x="12" y="84" width="24" height="24" fill="#ffffff" />
              <rect x="18" y="90" width="12" height="12" fill="#0f2f1f" />
              <rect x="54" y="54" width="60" height="40" fill="#0f2f1f" />
            </svg>
          </div>
          <p className="mt-3 text-sm text-main">DeporCanchas SAC</p>
          <p className="text-xs text-main">987 654 321</p>
        </div>
      </div>
      <div className="rounded-2xl bg-snow-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-forest-green text-snow-white font-semibold">2</span>
          <p className="font-semibold text-main">Sube tu comprobante</p>
        </div>
        <label className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-forest-green/50 bg-stone-gray/10 px-6 py-10 cursor-pointer text-main">
          <span className="inline-flex items-center gap-2 rounded-full bg-forest-green px-4 py-2 text-snow-white text-sm font-semibold">
            {file ? file.name : "Subir Archivo"}
          </span>
          <input
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              if (f && f.size > 2 * 1024 * 1024) {
                setError("Archivo muy grande (máx 2MB)");
                setFile(null);
              } else {
                setError("");
                setFile(f);
              }
            }}
          />
        </label>
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        <button
          type="button"
          disabled={!file || disabled}
          onClick={() => file && onSubmit(file)}
          className="mt-4 w-full rounded-xl bg-forest-green py-3 text-snow-white font-semibold disabled:opacity-50"
        >
          Confirmar Pago →
        </button>
      </div>
    </div>
  );
}
