"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownTrayIcon, CalendarDaysIcon, ClockIcon, ExclamationTriangleIcon, MapPinIcon, ArrowPathIcon, XMarkIcon } from "@heroicons/react/24/solid";
import type { Reserva } from "./ReservationCard";

type RefundPreview = {
  puede_cancelar: boolean;
  horas_hasta_reserva: number;
  porcentaje: 0 | 50 | 100;
  monto_pagado: number;
  monto_reembolso: number;
  metodo_destino: "tarjeta" | "yape" | "plin" | null;
  destino_detalle: string | null;
};

type Props = {
  reserva: Reserva | null;
  onClose: () => void;
  onCancelled: () => void;
};

export default function ReservationDetailModal({ reserva, onClose, onCancelled }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<"detalle" | "confirmar">("detalle");
  const [preview, setPreview] = useState<RefundPreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  // Reset al cambiar de reserva
  useEffect(() => {
    setStep("detalle");
    setPreview(null);
    setError("");
  }, [reserva?.id]);

  if (!reserva) return null;

  const start = new Date(reserva.fecha_empieza);
  const end = new Date(reserva.fecha_termina);
  const cancha = reserva.canchas_deportivas;
  const campus = cancha.campus;
  const voucherUrl = reserva.pagos?.[0]?.voucher_url ?? null;
  const puedeCancelar = reserva.estado === "pagada" && start > new Date();

  async function startCancelFlow() {
    setStep("confirmar");
    setError("");
    setLoadingPreview(true);
    try {
      const res = await fetch(`/api/reservas/${reserva!.id}/refund-preview`);
      if (!res.ok) {
        setError("No se pudo calcular el reembolso. Intenta de nuevo.");
        setLoadingPreview(false);
        return;
      }
      setPreview((await res.json()) as RefundPreview);
    } catch {
      setError("Error de red.");
    } finally {
      setLoadingPreview(false);
    }
  }

  async function handleCancel() {
    setCancelling(true);
    setError("");
    const res = await fetch(`/api/reservas/${reserva!.id}/cancelar`, { method: "POST" });
    setCancelling(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error === "ya_empezo" ? "La reserva ya empezó." : "Error al cancelar.");
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
        className="w-full max-w-lg rounded-3xl bg-surface-elev border border-default p-6 shadow-floating max-h-[92vh] overflow-y-auto animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {step === "detalle" ? (
          <DetailView
            reserva={reserva}
            start={start}
            end={end}
            voucherUrl={voucherUrl}
            puedeCancelar={puedeCancelar}
            onClose={onClose}
            onCancelClick={startCancelFlow}
            onReanudar={() => {
              // Pre-rellena cancha + fecha en /reservas para volver a intentarlo.
              const ymd = reserva.fecha_empieza.slice(0, 10);
              router.push(
                `/reservas?campus=${campus.id}&cancha=${cancha.id}&fecha=${ymd}`
              );
            }}
          />
        ) : (
          <ConfirmCancelView
            campus={campus.nombre}
            cancha={cancha.nombre}
            start={start}
            end={end}
            preview={preview}
            loadingPreview={loadingPreview}
            cancelling={cancelling}
            error={error}
            onBack={() => setStep("detalle")}
            onConfirm={handleCancel}
          />
        )}
      </div>
    </div>
  );
}

function DetailView({
  reserva, start, end, voucherUrl, puedeCancelar, onClose, onCancelClick, onReanudar,
}: {
  reserva: Reserva;
  start: Date; end: Date;
  voucherUrl: string | null;
  puedeCancelar: boolean;
  onClose: () => void;
  onCancelClick: () => void;
  onReanudar: () => void;
}) {
  const esNoCompletada = reserva.estado === "expirada";
  const cancha = reserva.canchas_deportivas;
  const campus = cancha.campus;
  return (
    <>
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
        <Row icon={<ClockIcon className="w-4 h-4" />} text={`${start.getHours().toString().padStart(2, "0")}:00 — ${end.getHours().toString().padStart(2, "0")}:00`} />
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
          <button
            type="button"
            onClick={onCancelClick}
            className="w-full rounded-xl border border-danger-soft bg-danger-soft py-3 text-danger font-semibold hover:opacity-90 transition"
          >
            Cancelar reserva
          </button>
        </div>
      )}

      {esNoCompletada && (
        <div className="mt-5 border-t border-soft pt-4 space-y-2">
          <p className="text-xs text-muted">
            Tu pago no se completó dentro de los 10 minutos. El horario quedó libre y puede haberse ocupado.
          </p>
          <button
            type="button"
            onClick={onReanudar}
            className="btn-primary w-full !py-3"
          >
            <ArrowPathIcon className="w-4 h-4" />
            Reservar este horario de nuevo
          </button>
        </div>
      )}
    </>
  );
}

function ConfirmCancelView({
  campus, cancha, start, end, preview, loadingPreview, cancelling, error, onBack, onConfirm,
}: {
  campus: string; cancha: string;
  start: Date; end: Date;
  preview: RefundPreview | null;
  loadingPreview: boolean;
  cancelling: boolean;
  error: string;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const hayReembolso = !!preview && preview.porcentaje > 0 && preview.monto_reembolso > 0;
  const destinoLabel = preview?.metodo_destino === "tarjeta"
    ? preview.destino_detalle
    : preview?.metodo_destino
      ? `Yape al ${preview.destino_detalle ?? "—"}`
      : "—";

  return (
    <>
      <div className="flex items-start gap-4 mb-5">
        <div className="rounded-full bg-danger-soft p-3 shrink-0">
          <ExclamationTriangleIcon className="w-6 h-6 text-danger" />
        </div>
        <div>
          <h2 className="font-display font-bold text-xl text-primary">¿Cancelar tu reserva?</h2>
          <p className="text-sm text-muted mt-1">
            Liberarás el horario y no podrás recuperarlo.
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-surface-alt border border-soft p-4 mb-4">
        <p className="font-semibold text-primary text-sm">{cancha}</p>
        <p className="text-xs text-muted mt-0.5 capitalize">
          {campus} · {start.toLocaleDateString("es-PE", { weekday: "long", day: "2-digit", month: "long" })} ·{" "}
          {start.getHours().toString().padStart(2, "0")}:00 — {end.getHours().toString().padStart(2, "0")}:00
        </p>
      </div>

      {loadingPreview ? (
        <div className="text-sm text-muted py-3 animate-pulse-soft">Calculando reembolso…</div>
      ) : preview ? (
        <div className="rounded-2xl border border-soft p-4 space-y-2 text-sm">
          <Line label="Pagaste" value={`S/${preview.monto_pagado.toFixed(2)}`} />
          <Line label="Tiempo hasta tu reserva" value={`${preview.horas_hasta_reserva.toFixed(1)}h`} />
          {hayReembolso ? (
            <>
              <Line
                label={`Reembolso (${preview.porcentaje}%)`}
                value={`S/${preview.monto_reembolso.toFixed(2)}`}
                strong
              />
              <Line label="Se acreditará a" value={destinoLabel ?? "—"} />
              <p className="text-xs text-muted pt-2 border-t border-soft">
                La devolución se realizará dentro de 5 a 7 días hábiles. Recibirás un correo cuando se acredite.
              </p>
            </>
          ) : (
            <div className="rounded-xl bg-danger-soft border border-danger-soft px-3 py-2.5 mt-1">
              <p className="text-sm text-danger font-semibold">Sin reembolso</p>
              <p className="text-xs text-danger/90 mt-0.5">
                Cancelaste a menos de 24 horas del juego, por política no aplica reembolso.
              </p>
            </div>
          )}
        </div>
      ) : null}

      {error && <p className="text-sm text-danger mt-3">{error}</p>}

      <div className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={onBack}
          disabled={cancelling}
          className="btn-secondary flex-1 !py-2.5"
        >
          Volver
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={cancelling || loadingPreview || !preview}
          className="flex-1 rounded-xl bg-red-500 text-white py-2.5 font-semibold hover:bg-red-600 disabled:opacity-50 transition"
        >
          {cancelling ? "Cancelando…" : "Sí, cancelar"}
        </button>
      </div>
    </>
  );
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span className={strong ? "text-brand font-display font-bold text-base" : "text-primary font-medium"}>{value}</span>
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
