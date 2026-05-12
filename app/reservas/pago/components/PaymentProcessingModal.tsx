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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-snow-white p-8 shadow-xl">
        {state.kind === "processing" ? (
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full border-4 border-stone-gray border-t-forest-green animate-spin" />
            <h2 className="text-xl font-bold text-main">Procesando pago…</h2>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="rounded-full bg-forest-green p-4 mb-3">
              <CheckCircleIcon className="w-12 h-12 text-snow-white" />
            </div>
            <h2 className="text-2xl font-bold text-main">Pago Completado</h2>
            <p className="text-sm text-main mt-1">
              {state.campus} - {state.cancha}
            </p>

            <div className="w-full mt-6 space-y-2 text-sm">
              <Row label="ID Reserva" value={`#${state.reservaCode}`} />
              <Row label="Fecha" value={state.fecha} />
              <Row label="Método de Pago" value={state.metodoPago} />
              {state.horarios.map((h, i) => (
                <Row key={i} label={`Horario (${h.label})`} value={`S/${h.precio.toFixed(2)}`} />
              ))}
            </div>

            <div className="w-full mt-6 flex items-center justify-between border-t border-stone-gray pt-4">
              <span className="font-bold text-forest-green text-xl">Total</span>
              <span className="font-bold text-forest-green text-xl">S/{state.total.toFixed(2)}</span>
            </div>

            <div className="w-full mt-6 flex gap-3">
              <button
                onClick={onVolver}
                type="button"
                className="flex-1 rounded-xl border border-stone-gray py-3 text-main font-semibold"
              >
                Volver
              </button>
              <a
                href={state.voucherUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-xl bg-forest-green py-3 text-snow-white font-semibold inline-flex items-center justify-center gap-2"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
                Descargar voucher
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-main">{label}</span>
      <span className="text-main font-medium">{value}</span>
    </div>
  );
}
