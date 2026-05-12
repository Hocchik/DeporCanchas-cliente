"use client";

import { useState } from "react";
import type { Reserva } from "./ReservationCard";

type Props = {
  reserva: Reserva | null;
  onClose: () => void;
  onCancelled: () => void;
};

export default function ReservationDetailModal({ reserva, onClose, onCancelled }: Props) {
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  if (!reserva) return null;

  const start = new Date(reserva.fecha_empieza);
  const end = new Date(reserva.fecha_termina);
  const cancha = reserva.canchas_deportivas;
  const campus = cancha.campus;
  const voucherUrl = reserva.pagos?.[0]?.voucher_url ?? null;

  const ahora = new Date();
  const ventana24h = new Date(ahora.getTime() + 24 * 3600 * 1000);
  const puedeCancelar = reserva.estado === "pagada" && start > ventana24h;

  async function handleCancel() {
    setCancelling(true);
    setError("");
    const res = await fetch(`/api/reservas/${reserva!.id}/cancelar`, { method: "POST" });
    setCancelling(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error === "fuera_de_ventana" ? "No se puede cancelar a menos de 24h" : "Error al cancelar");
      return;
    }
    onCancelled();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-snow-white p-6 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <h2 className="text-xl font-bold text-main">Detalle de reserva</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="text-2xl text-main">×</button>
        </div>

        <div className="mt-4 space-y-2 text-sm text-main">
          <div className="flex justify-between"><span>ID Reserva</span><span className="font-mono">#{reserva.code}</span></div>
          <div className="flex justify-between"><span>Sede</span><span>{campus.nombre}</span></div>
          <div className="flex justify-between"><span>Cancha</span><span>{cancha.nombre}</span></div>
          <div className="flex justify-between"><span>Fecha</span><span>{start.toLocaleDateString("es-PE")}</span></div>
          <div className="flex justify-between"><span>Hora</span>
            <span>{start.getHours().toString().padStart(2,"0")}:00 - {end.getHours().toString().padStart(2,"0")}:00</span>
          </div>
          <div className="flex justify-between font-semibold border-t border-stone-gray pt-2">
            <span>Total</span><span className="text-forest-green">S/{reserva.precio_total.toFixed(2)}</span>
          </div>
        </div>

        {voucherUrl && (
          <div className="mt-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={voucherUrl} alt="Voucher" className="mx-auto rounded-lg border border-stone-gray max-h-80" />
            <a href={voucherUrl} download target="_blank" rel="noopener noreferrer"
              className="mt-3 block text-center rounded-xl bg-forest-green py-3 text-snow-white font-semibold">
              Descargar voucher
            </a>
          </div>
        )}

        {puedeCancelar && (
          <div className="mt-5 border-t border-stone-gray pt-4">
            {!confirmCancel ? (
              <button type="button" onClick={() => setConfirmCancel(true)}
                className="w-full rounded-xl border border-red-500 py-3 text-red-600 font-semibold">
                Cancelar reserva
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-main">¿Seguro que quieres cancelar esta reserva? No se puede deshacer.</p>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div className="flex gap-2">
                  <button type="button" onClick={() => setConfirmCancel(false)} disabled={cancelling}
                    className="flex-1 rounded-xl border border-stone-gray py-2 text-main">No</button>
                  <button type="button" onClick={handleCancel} disabled={cancelling}
                    className="flex-1 rounded-xl bg-red-500 py-2 text-white font-semibold disabled:opacity-50">
                    {cancelling ? "Cancelando…" : "Sí, cancelar"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
