"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CalendarDaysIcon } from "@heroicons/react/24/solid";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useSession } from "../contexts/SessionContext";
import ReservationCard, { type Reserva } from "./components/ReservationCard";
import ReservationDetailModal from "./components/ReservationDetailModal";

type Filter = "proximas" | "pasadas" | "canceladas";

const FILTER_LABELS: Record<Filter, string> = {
  proximas: "Próximas",
  pasadas: "Pasadas",
  canceladas: "Canceladas",
};

export default function MisReservasPage() {
  const router = useRouter();
  const { user, loading } = useSession();
  const [filter, setFilter] = useState<Filter>("proximas");
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [selected, setSelected] = useState<Reserva | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login?next=/mis-reservas");
  }, [loading, user, router]);

  const loadReservas = useCallback(async (f: Filter) => {
    setLoadingList(true);
    const res = await fetch(`/api/reservas/mias?filter=${f}`);
    if (res.ok) {
      const json = await res.json();
      setReservas(json.reservas as Reserva[]);
    }
    setLoadingList(false);
  }, []);

  useEffect(() => {
    if (user) loadReservas(filter);
  }, [user, filter, loadReservas]);

  if (loading || !user) return null;

  return (
    <main className="min-h-screen flex flex-col bg-app">
      <Navbar />
      <section className="flex-1 max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12 w-full">
        <div className="mb-8">
          <p className="text-eyebrow text-brand mb-2">Tu actividad</p>
          <h1 className="text-display-lg">Mis reservas</h1>
          <p className="text-muted text-sm mt-2">
            Revisa, descarga el voucher o cancela tus reservas (hasta 24h antes).
          </p>
        </div>

        <div className="inline-flex items-center gap-1 rounded-full bg-surface-alt p-1 border border-soft mb-6">
          {(Object.keys(FILTER_LABELS) as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={[
                "px-4 py-2 text-sm font-semibold rounded-full transition",
                filter === f ? "bg-surface text-brand shadow-soft" : "text-muted hover:text-primary",
              ].join(" ")}
            >
              {FILTER_LABELS[f]}
            </button>
          ))}
        </div>

        {loadingList ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[0, 1].map((i) => (
              <div key={i} className="card-soft p-4 flex gap-4 animate-pulse-soft">
                <div className="h-24 w-32 rounded-xl bg-surface-alt" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 rounded bg-surface-alt" />
                  <div className="h-3 w-1/2 rounded bg-surface-alt" />
                  <div className="h-3 w-1/3 rounded bg-surface-alt" />
                </div>
              </div>
            ))}
          </div>
        ) : reservas.length === 0 ? (
          <div className="card-soft p-10 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent text-brand mb-4">
              <CalendarDaysIcon className="w-7 h-7" />
            </div>
            <p className="font-display font-semibold text-lg text-primary mb-1">
              Sin reservas {FILTER_LABELS[filter].toLowerCase()}
            </p>
            <p className="text-sm text-muted max-w-sm mx-auto mb-5">
              {filter === "proximas"
                ? "Cuando reserves una cancha, aparecerá aquí."
                : "Aquí verás las reservas en este estado."}
            </p>
            {filter === "proximas" && (
              <a href="/reservas" className="btn-primary inline-flex">
                Reservar ahora
              </a>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {reservas.map((r) => (
              <ReservationCard key={r.id} reserva={r} onClick={() => setSelected(r)} />
            ))}
          </div>
        )}
      </section>
      <Footer />

      <ReservationDetailModal
        reserva={selected}
        onClose={() => setSelected(null)}
        onCancelled={() => {
          setSelected(null);
          loadReservas(filter);
        }}
      />
    </main>
  );
}
