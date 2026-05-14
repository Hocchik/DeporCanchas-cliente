"use client";

import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";

type Props = {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  busy?: boolean;
};

export default function ConfirmExitModal({ open, onCancel, onConfirm, busy }: Props) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 backdrop-blur-sm px-4 animate-fade-in"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-surface-elev border border-default p-7 shadow-floating animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-danger-soft p-3 shrink-0">
            <ExclamationTriangleIcon className="w-6 h-6 text-danger" />
          </div>
          <div className="flex-1">
            <h2 className="font-display font-bold text-lg text-primary">
              ¿Seguro que quieres salir?
            </h2>
            <p className="text-sm text-muted mt-1.5 leading-relaxed">
              Si abandonas esta página, <span className="text-primary font-semibold">tu reserva se cancelará</span> y el horario quedará disponible para otros usuarios.
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="btn-secondary flex-1 !py-2.5 disabled:opacity-50"
          >
            No, seguir aquí
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="flex-1 rounded-xl bg-red-500 text-white py-2.5 font-semibold hover:bg-red-600 disabled:opacity-50 transition"
          >
            {busy ? "Cancelando…" : "Sí, salir"}
          </button>
        </div>
      </div>
    </div>
  );
}
