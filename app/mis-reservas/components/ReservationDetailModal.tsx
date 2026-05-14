"use client";

import { useState } from "react";
import { ArrowDownTrayIcon, CalendarDaysIcon, ClockIcon, MapPinIcon, XMarkIcon } from "@heroicons/react/24/solid";
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-surface-elev border border-default p-6 shadow-floating max-h-[90vh] overflow-y-auto animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-eyebrow text-brand mb-1">Reserva</p>
            <h2 className="font-display font-bold text-xl text-primary">{cancha.nombre}</h2>
            <p className="text-xs text-muted mt-1">ID #<span className="font-mono">{reserva.code}</span></p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-default text-muted hover:text-primary hover:border-strong transition"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5 text-sm">
          <Row icon={<MapPinIcon className="w-4 h-4" />} text={`${campus.nombre} · ${campus.ubicacion}`} />
          <Row icon={<CalendarDaysIcon className="w-4 h-4" />} text={start.toLocaleDateString("es-PE", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })} />
          <Row icon={<ClockIcon className="w-4 h-4" />} text={`${start.getHours().toString().padStart(2,"0")}:00 — ${end.getHours().toString().padStart(2,"0")}:00`} />
        </div>

        <div className="mt-5 border-t border-soft pt-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-muted">Total</span>
          <span className="text-2xl font-display font-bold text-brand">S/{reserva.precio_total.toFixed(2)}</span>
        </div>

        {voucherUrl && (
          <div className="mt-5 rounded-2xl bg-surface-alt border border-soft p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={voucherUrl} alt="Voucher" className="mx-auto rounded-xl max-h-72 shadow-soft" />
            <a
              href={voucherUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full mt-3 !py-2.5"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Descargar voucher
            </a>
          </div>
        )}

        {puedeCancelar && (
          <div className="mt-5 border-t border-soft pt-4">
            {!confirmCancel ? (
              <button
                type="button"
                onClick={() => setConfirmCancel(true)}
                className="w-full rounded-xl border border-danger-soft bg-danger-soft py-3 text-danger font-semibold hover:opacity-90 transition"
              >
                Cancelar reserva
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-primary">¿Seguro que quieres cancelar esta reserva? No se puede deshacer.</p>
                {error && <p className="text-sm text-danger">{error}</p>}
                <div className="flex gap-2">
                  <button type="button" onClick={() => setConfirmCancel(false)} disabled={cancelling} className="btn-secondary flex-1 !py-2.5">
                    No, mantener
                  </button>
                  <button type="button" onClick={handleCancel} disabled={cancelling} className="flex-1 rounded-xl bg-red-500 text-white py-2.5 font-semibold hover:bg-red-600 disabled:opacity-50 transition">
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

function Row({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 text-muted">
      <span className="text-brand opacity-70">{icon}</span>
      <span className="capitalize">{text}</span>
    </div>
  );
}
