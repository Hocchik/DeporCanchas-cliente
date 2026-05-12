"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useSession } from "../contexts/SessionContext";
import ReservationCard, { type Reserva } from "./components/ReservationCard";
import ReservationDetailModal from "./components/ReservationDetailModal";

type Filter = "proximas" | "pasadas" | "canceladas";

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
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: "#FBF9F5" }}>
      <Navbar />
      <section className="max-w-5xl mx-auto px-4 py-10 w-full flex-1">
        <h1 className="text-3xl font-bold text-main mb-6">Mis Reservas</h1>

        <div className="inline-flex rounded-full bg-stone-gray p-1 mb-6">
          {(["proximas", "pasadas", "canceladas"] as Filter[]).map((f) => (
            <button key={f} type="button" onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition border ${
                filter === f ? "bg-snow-white text-main border-stone-gray" : "text-main border-transparent opacity-70"
              }`}>
              {f === "proximas" ? "Próximas" : f === "pasadas" ? "Pasadas" : "Canceladas"}
            </button>
          ))}
        </div>

        {loadingList ? (
          <p className="text-main">Cargando…</p>
        ) : reservas.length === 0 ? (
          <p className="text-main">No tienes reservas en esta categoría.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
