"use client";

import { CheckCircleIcon, ArrowDownTrayIcon } from "@heroicons/react/24/solid";

export type PaymentModalState =
  | { kind: "hidden" }
  | { kind: "processing" }
  | {
      kind: "success";
      voucherUrl: string;
      campus: string;
      cancha: string;
      reservaCode: string;
      fecha: string;
      metodoPago: string;
      horarios: { label: string; precio: number }[];
      total: number;
    };

type Props = { state: PaymentModalState; onVolver: () => void };

export default function PaymentProcessingModal({ state, onVolver }: Props) {
  if (state.kind === "hidden") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 animate-fade-in">
      <div className="w-full max-w-md rounded-3xl bg-surface-elev border border-default p-8 shadow-floating animate-fade-in-up">
        {state.kind === "processing" ? (
          <div className="flex flex-col items-center gap-5 py-6">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-soft" />
              <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-t-brand animate-spin" />
            </div>
            <div className="text-center">
              <h2 className="font-display text-xl font-bold text-primary">Procesando pago…</h2>
              <p className="text-sm text-muted mt-1">Estamos confirmando tu reserva.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="rounded-full bg-brand p-4 mb-4 shadow-elevated">
              <CheckCircleIcon className="w-12 h-12 text-on-brand" />
            </div>
            <h2 className="font-display text-2xl font-bold text-primary text-center">
              Pago Completado
            </h2>
            <p className="text-sm text-muted mt-1 text-center">
              {state.campus} · {state.cancha}
            </p>

            <div className="w-full mt-6 space-y-2 text-sm">
              <Row label="ID Reserva" value={`#${state.reservaCode}`} mono />
              <Row label="Fecha" value={state.fecha} />
              <Row label="Método de Pago" value={state.metodoPago} />
              {state.horarios.map((h, i) => (
                <Row key={i} label={`Horario (${h.label})`} value={`S/${h.precio.toFixed(2)}`} />
              ))}
            </div>

            <div className="w-full mt-5 flex items-center justify-between border-t border-soft pt-4">
              <span className="font-display font-bold text-brand text-xl">Total</span>
              <span className="font-display font-bold text-brand text-2xl">S/{state.total.toFixed(2)}</span>
            </div>

            <div className="w-full mt-6 flex gap-3">
              <button onClick={onVolver} type="button" className="btn-secondary flex-1 !py-3">
                Volver
              </button>
              <a href={state.voucherUrl} download target="_blank" rel="noopener noreferrer" className="btn-primary flex-1 !py-3">
                <ArrowDownTrayIcon className="w-4 h-4" />
                Descargar voucher
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span className={`text-primary font-medium ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}
