"use client";

import { useState } from "react";
import { ArrowUpTrayIcon, CheckCircleIcon, QrCodeIcon } from "@heroicons/react/24/solid";

type Props = {
  onSubmit: (file: File) => Promise<void>;
  disabled?: boolean;
};

export default function YapePaymentForm({ onSubmit, disabled }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Paso 1 — QR */}
      <div className="card-soft p-5">
        <Step n={1} label="Escanea el QR y paga" />
        <div className="mt-4 rounded-2xl border border-default bg-surface-alt p-5 flex flex-col items-center">
          <div className="h-44 w-44 rounded-xl bg-surface p-3 shadow-soft flex items-center justify-center">
            <svg viewBox="0 0 120 120" className="h-full w-full" role="img" aria-hidden="true">
              <rect width="120" height="120" fill="transparent" />
              <rect x="6" y="6" width="36" height="36" fill="currentColor" />
              <rect x="12" y="12" width="24" height="24" fill="var(--surface)" />
              <rect x="18" y="18" width="12" height="12" fill="currentColor" />
              <rect x="78" y="6" width="36" height="36" fill="currentColor" />
              <rect x="84" y="12" width="24" height="24" fill="var(--surface)" />
              <rect x="90" y="18" width="12" height="12" fill="currentColor" />
              <rect x="6" y="78" width="36" height="36" fill="currentColor" />
              <rect x="12" y="84" width="24" height="24" fill="var(--surface)" />
              <rect x="18" y="90" width="12" height="12" fill="currentColor" />
              <rect x="54" y="54" width="60" height="40" fill="currentColor" />
              <rect x="60" y="60" width="14" height="14" fill="var(--surface)" />
              <rect x="86" y="60" width="14" height="14" fill="var(--surface)" />
              <rect x="60" y="80" width="14" height="14" fill="var(--surface)" />
            </svg>
          </div>
          <div className="mt-3 text-center">
            <p className="text-sm font-semibold text-primary">DeporCanchas SAC</p>
            <p className="text-xs text-muted flex items-center justify-center gap-1.5 mt-0.5">
              <QrCodeIcon className="w-3.5 h-3.5" />
              987 654 321
            </p>
          </div>
        </div>
      </div>

      {/* Paso 2 — Subir comprobante */}
      <div className="card-soft p-5">
        <Step n={2} label="Sube tu comprobante" />
        <label className="mt-4 flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-default hover:border-strong bg-surface-alt px-6 py-10 cursor-pointer transition group">
          <div className="rounded-full bg-accent text-brand p-3 group-hover:scale-105 transition-transform">
            {file ? <CheckCircleIcon className="w-6 h-6" /> : <ArrowUpTrayIcon className="w-6 h-6" />}
          </div>
          <span className="text-sm font-semibold text-primary text-center max-w-[220px] truncate">
            {file ? file.name : "Elige un archivo o arrástralo"}
          </span>
          <span className="text-xs text-muted">PNG o JPG · máx 2MB</span>
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
        {error && <p className="text-danger text-xs mt-2 ml-1">{error}</p>}
        <button
          type="button"
          disabled={!file || disabled}
          onClick={() => file && onSubmit(file)}
          className="btn-primary w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Confirmar pago →
        </button>
      </div>
    </div>
  );
}

function Step({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-brand text-on-brand font-semibold text-sm">
        {n}
      </span>
      <p className="font-semibold text-primary text-sm">{label}</p>
    </div>
  );
}
