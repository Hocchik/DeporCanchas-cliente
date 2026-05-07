"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { formatTimeRange24 } from "../utils";

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const toTimeLabel = (minutes: number) => {
  const hours = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

const buildRangeLabel = (first: string, last: string) => {
  const startMinutes = toMinutes(first);
  const endMinutes = toMinutes(last) + 60;
  return `${toTimeLabel(startMinutes)} - ${toTimeLabel(endMinutes)}`;
};

export default function PagoPage() {
  const router = useRouter();
  const [method, setMethod] = useState<"wallet" | "card">("wallet");
  const [showQrSummary, setShowQrSummary] = useState(false);
  const [storedReservation, setStoredReservation] = useState<{
    campusName?: string;
    campusAddress?: string;
    courtName?: string;
    courtImage?: string;
    date?: string;
    slots: string[];
    total: number;
  } | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("reservationPayment");
    if (!raw) {
      router.push("/reservas");
      return;
    }
    try {
      const parsed = JSON.parse(raw) as {
        campusName?: string;
        campusAddress?: string;
        courtName?: string;
        courtImage?: string;
        date?: string;
        slots: string[];
        total: number;
      };
      setStoredReservation(parsed);
    } catch {
      sessionStorage.removeItem("reservationPayment");
      router.push("/reservas");
    }
  }, [router]);

  const summary = useMemo(() => {
    const campus = storedReservation?.campusName ?? "Sede";
    const address = storedReservation?.campusAddress ?? "";
    const court = storedReservation?.courtName ?? "Cancha";
    const image =
      storedReservation?.courtImage ?? "/Canchas_de_futbol_los_olivos.png";
    const dateValue = storedReservation?.date
      ? new Date(storedReservation.date)
      : null;
    const slots = storedReservation?.slots ?? [];
    const total = storedReservation?.total ?? 0;
    const perSlot = slots.length ? total / slots.length : 0;

    const sortedSlots = [...slots].sort();
    const earliest = sortedSlots[0];
    const latest = sortedSlots[sortedSlots.length - 1];
    const rangeLabel = earliest && latest ? buildRangeLabel(earliest, latest) : "-";

    return {
      campus,
      address,
      court,
      image,
      dateValue,
      slots,
      total,
      perSlot,
      rangeLabel,
    };
  }, [storedReservation]);

  const handleClose = () => {
    sessionStorage.removeItem("reservationPayment");
    router.push("/reservas");
  };

  return (
    <main
      className="min-h-screen text-base flex flex-col"
      style={
        {
          backgroundColor: "#FBF9F5",
          ["--grass-green" as string]: "#84C940",
        } as React.CSSProperties
      }
    >
      <Navbar />
      <section className="max-w-6xl mx-auto px-4 py-10 w-full flex-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-main">Paso final</p>
            <h1 className="text-3xl md:text-4xl font-bold text-main">
              Confirmacion de Pago
            </h1>
          </div>
          <a
            href="/reservas"
            className="text-3xl font-semibold text-main hover:text-forest-green"
            aria-label="Cerrar"
            onClick={(event) => {
              event.preventDefault();
              handleClose();
            }}
          >
            ×
          </a>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <div>
            <div className="inline-flex rounded-full bg-stone-gray p-1">
              <button
                type="button"
                onClick={() => setMethod("wallet")}
                className={`px-4 py-2 text-sm font-semibold rounded-full transition border ${
                  method === "wallet"
                    ? "bg-snow-white text-main border-stone-gray"
                    : "text-main border-transparent opacity-70"
                }`}
              >
                Billetera Digital (Yape/Plin)
              </button>
              <button
                type="button"
                onClick={() => setMethod("card")}
                className={`px-4 py-2 text-sm font-semibold rounded-full transition border ${
                  method === "card"
                    ? "bg-snow-white text-main border-stone-gray"
                    : "text-main border-transparent opacity-70"
                }`}
              >
                Credit/Debit Card
              </button>
            </div>

            {method === "wallet" ? (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-2xl bg-snow-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-forest-green text-snow-white font-semibold">
                      1
                    </span>
                    <p className="font-semibold text-main">Escanea y realiza el pago</p>
                  </div>
                  <div className="grid place-items-center rounded-xl border border-stone-gray bg-snow-white p-5 text-main">
                    <button
                      type="button"
                      onClick={() => setShowQrSummary((prev) => !prev)}
                      className="h-40 w-40 rounded-md border border-stone-gray bg-white p-2 shadow-sm cursor-pointer"
                      aria-label="Escanear QR"
                    >
                      <svg
                        viewBox="0 0 120 120"
                        className="h-full w-full"
                        role="img"
                        aria-hidden="true"
                      >
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
                        <rect x="54" y="54" width="12" height="12" fill="#0f2f1f" />
                        <rect x="72" y="54" width="6" height="6" fill="#0f2f1f" />
                        <rect x="84" y="54" width="12" height="12" fill="#0f2f1f" />
                        <rect x="54" y="72" width="6" height="6" fill="#0f2f1f" />
                        <rect x="66" y="72" width="12" height="12" fill="#0f2f1f" />
                        <rect x="84" y="72" width="6" height="6" fill="#0f2f1f" />
                        <rect x="54" y="90" width="18" height="6" fill="#0f2f1f" />
                        <rect x="78" y="90" width="6" height="6" fill="#0f2f1f" />
                        <rect x="90" y="90" width="6" height="6" fill="#0f2f1f" />
                      </svg>
                    </button>
                    <p className="mt-2 text-xs text-main">Toca el QR para simular escaneo</p>
                    <p className="mt-3 text-sm text-main">DeporCanchas SAC</p>
                    <p className="text-xs text-main">987 654 321</p>
                  </div>
                </div>
                <div className="rounded-2xl bg-snow-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-forest-green text-snow-white font-semibold">
                      2
                    </span>
                    <p className="font-semibold text-main">Sube tu comprobante</p>
                  </div>
                  <label className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-forest-green/50 bg-stone-gray/10 px-6 py-10 cursor-pointer text-main">
                    <span className="inline-flex items-center gap-2 rounded-full bg-forest-green px-4 py-2 text-snow-white text-sm font-semibold">
                      Subir Archivo
                    </span>
                    <input type="file" className="hidden" />
                  </label>
                  <button
                    type="button"
                    className="mt-4 w-full rounded-xl bg-forest-green py-3 text-snow-white font-semibold"
                  >
                    Confirmar Pago →
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl bg-snow-white p-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm text-main mb-2">Nombre del titular</label>
                    <input
                      type="text"
                      className="w-full rounded-xl border border-stone-gray bg-stone-gray/30 px-4 py-3 text-main"
                      placeholder="Nombre completo"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-main mb-2">Numero de tarjeta</label>
                    <input
                      type="text"
                      className="w-full rounded-xl border border-stone-gray bg-stone-gray/30 px-4 py-3 text-main"
                      placeholder="0000 0000 0000 0000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-main mb-2">Fecha de expiracion</label>
                    <input
                      type="text"
                      className="w-full rounded-xl border border-stone-gray bg-stone-gray/30 px-4 py-3 text-main"
                      placeholder="MM/AA"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-main mb-2">CVV</label>
                    <input
                      type="password"
                      className="w-full rounded-xl border border-stone-gray bg-stone-gray/30 px-4 py-3 text-main"
                      placeholder="***"
                    />
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="rounded-xl bg-stone-gray px-6 py-3 text-main"
                  >
                    Limpiar
                  </button>
                  <button
                    type="button"
                    className="rounded-xl bg-forest-green px-6 py-3 text-snow-white font-semibold"
                  >
                    Realizar Pago →
                  </button>
                </div>
              </div>
            )}
          </div>

          <aside className="rounded-2xl bg-snow-white p-5 shadow-sm h-fit">
            <h3 className="text-sm font-semibold text-main mb-4">Resumen de tu reserva</h3>
            <div className="flex items-center gap-3">
              <img
                src={summary.image}
                alt={summary.court}
                className="h-16 w-24 rounded-lg object-cover"
              />
              <div>
                <p className="font-semibold text-main">{summary.campus}</p>
                <p className="text-xs text-main">
                  {summary.court}{summary.address ? ` • ${summary.address}` : ""}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-stone-gray/40 px-3 py-2">
                <p className="text-xs text-main">Fecha</p>
                <p className="text-sm font-semibold text-main">
                  {summary.dateValue
                    ? summary.dateValue.toLocaleDateString("es-PE")
                    : "-"}
                </p>
              </div>
              <div className="rounded-xl bg-stone-gray/40 px-3 py-2">
                <p className="text-xs text-main">Hora</p>
                <p className="text-sm font-semibold text-main">
                  {summary.rangeLabel}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-sm text-main">
              {summary.slots.length ? (
                summary.slots.map((slot) => (
                  <div key={slot} className="flex items-center justify-between">
                    <span>{formatTimeRange24(slot)}</span>
                    <span>S/{summary.perSlot.toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <p className="text-main">Sin horarios seleccionados.</p>
              )}
            </div>

            <div className="mt-4 border-t border-stone-gray pt-4 flex items-center justify-between">
              <span className="font-semibold text-main">Total</span>
              <span className="text-lg font-bold text-forest-green">
                S/{summary.total.toFixed(2)}
              </span>
            </div>
          </aside>
        </div>
      </section>
      {showQrSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-snow-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-sm font-semibold text-main">Resumen de tu reserva</h3>
              <button
                type="button"
                className="text-xl text-main"
                onClick={() => setShowQrSummary(false)}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
            <div className="mt-3 text-sm text-main space-y-1">
              <p className="font-semibold">{summary.campus}</p>
              <p>{summary.court}</p>
              <p>
                {summary.dateValue
                  ? summary.dateValue.toLocaleDateString("es-PE")
                  : "-"} · {summary.rangeLabel}
              </p>
              <p>Total: S/{summary.total.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </main>
  );
}
