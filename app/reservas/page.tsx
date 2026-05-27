"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CourtsList from "./components/CourtsList";
import CourtsMap from "./components/CourtsMap";
import CourtDetails from "./components/CourtDetails";
import CampusSidebar from "./components/CampusSidebar";
import CampusMobileMenu from "./components/CampusMobileMenu";
import FilterBar from "./components/FilterBar";
import ViewModeToggle from "./components/ViewModeToggle";
import AuthModal from "../components/AuthModal";
import type { Court, CourtType } from "./types";
import { SLOT_TIMES, getStatusForCourt } from "./utils";
import { limaYMD, addDaysYMD, limaToUtcISO } from "@/lib/lima-time";
import { useReservasData, type BaseTariffs } from "./hooks/useReservasData";
import { useSession } from "../contexts/SessionContext";
import "../styles/colors.css";

const toDateKey = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const normalizeText = (v: string) =>
  v.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

const matchesSportKey = (sportKey: Court["sportKey"], name?: string | null) => {
  if (!name) return false;
  const n = normalizeText(name);
  if (sportKey === "tenis") return n.includes("tenis");
  if (sportKey === "padel") return n.includes("padel");
  if (sportKey === "futbol11") {
    return n.includes("futbol 11") || n.includes("futbol11") || n.includes("futbol once");
  }
  return n.includes("futbol 7") || n.includes("futbol7") || n.includes("futsal");
};

const isDateInRange = (dateKey: string, start: string | null, end: string | null) => {
  if (start && dateKey < start) return false;
  if (end && dateKey > end) return false;
  return true;
};

const resolveCourtPrice = (court: Court, date: Date, baseTariffs: BaseTariffs) => {
  const dateKey = toDateKey(date);
  const sportKey = court.sportKey ?? "futbol7";
  const candidates = (court.tariffs ?? [])
    .filter((t) => matchesSportKey(sportKey, t.nombre))
    .filter((t) => isDateInRange(dateKey, t.fecha_empieza, t.fecha_termina));

  if (candidates.length) {
    candidates.sort((a, b) => (a.prioridad ?? 0) - (b.prioridad ?? 0));
    return candidates[0].precio ?? 0;
  }
  return baseTariffs[sportKey] ?? 0;
};

export default function Reservas() {
  const router = useRouter();
  const { user } = useSession();
  const isAuthed = Boolean(user);

  const visibleCount = useMemo(() => 2, []);

  const allDates = useMemo(() => {
    // Anclado a hora Lima: cada día es mediodía Lima del YMD correspondiente,
    // así limaYMD(date) devuelve el día correcto en cualquier zona del navegador.
    const base = limaYMD();
    return Array.from(
      { length: 21 },
      (_, i) => new Date(`${addDaysYMD(base, i)}T12:00:00-05:00`)
    );
  }, []);

  const { campuses, baseTariffs, isLoading, loadError } = useReservasData(allDates);

  const [selectedCampusId, setSelectedCampusId] = useState("");
  const [selectedSport, setSelectedSport] = useState<"all" | CourtType>("all");
  const [selectedCourtId, setSelectedCourtId] = useState("");
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [windowStart, setWindowStart] = useState(0);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [selectionMessage, setSelectionMessage] = useState("");
  const [isCampusMenuOpen, setIsCampusMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const visibleDates = useMemo(
    () => allDates.slice(windowStart, windowStart + visibleCount),
    [allDates, windowStart, visibleCount]
  );
  const selectedDate = allDates[selectedDateIndex] ?? allDates[0];
  const selectedCampus = campuses.find((c) => c.id === selectedCampusId);

  useEffect(() => {
    if (campuses.length && !selectedCampusId) setSelectedCampusId(campuses[0].id);
  }, [campuses, selectedCampusId]);

  const filteredCourts = useMemo(() => {
    const courts = selectedCampus?.courts ?? [];
    return selectedSport === "all" ? courts : courts.filter((c) => c.type === selectedSport);
  }, [selectedCampus, selectedSport]);

  const pricedCourts = useMemo(
    () => filteredCourts.map((c) => ({ ...c, pricePerHour: resolveCourtPrice(c, selectedDate, baseTariffs) })),
    [filteredCourts, selectedDate, baseTariffs]
  );

  useEffect(() => {
    if (!filteredCourts.length) { setSelectedCourtId(""); return; }
    if (!filteredCourts.some((c) => c.id === selectedCourtId)) {
      // Prefiere la primera cancha disponible; si todas están en mantenimiento, cae a la primera
      const firstAvailable = filteredCourts.find((c) => c.disponible !== false) ?? filteredCourts[0];
      setSelectedCourtId(firstAvailable.id);
    }
  }, [filteredCourts, selectedCourtId]);

  useEffect(() => {
    setSelectedSlots([]);
    setSelectionMessage("");
  }, [selectedCourtId, selectedDateIndex]);

  useEffect(() => {
    if (selectedDateIndex < windowStart) setSelectedDateIndex(windowStart);
    if (selectedDateIndex > windowStart + visibleCount - 1) setSelectedDateIndex(windowStart + visibleCount - 1);
  }, [selectedDateIndex, windowStart, visibleCount]);

  const selectedCourt = pricedCourts.find((c) => c.id === selectedCourtId);

  const selectedCourtSlots = useMemo(() => {
    if (!selectedCourt || !selectedDate) return [];
    return getStatusForCourt(selectedCourt, selectedDate);
  }, [selectedCourt, selectedDate]);

  const handleSlotToggle = (time: string) => {
    const slot = selectedCourtSlots.find((entry) => entry.time === time);
    if (!slot || slot.status !== "free") return;

    setSelectedSlots((previous) => {
      setSelectionMessage("");
      if (previous.includes(time)) return previous.filter((i) => i !== time);
      if (previous.length === 0) return [time];
      if (previous.length === 1) {
        const a = SLOT_TIMES.indexOf(previous[0]);
        const b = SLOT_TIMES.indexOf(time);
        if (Math.abs(a - b) !== 1) {
          setSelectionMessage("Para reservar 2 horas, deben ser consecutivas. Selecciona una hora contigua.");
          return previous;
        }
        return [previous[0], time].sort((x, y) => SLOT_TIMES.indexOf(x) - SLOT_TIMES.indexOf(y));
      }
      setSelectionMessage("Solo puedes elegir 1 o 2 horas. Selecciona una nueva hora para reiniciar.");
      return [time];
    });
  };

  const totalPrice = selectedCourt ? selectedSlots.length * selectedCourt.pricePerHour : 0;

  const handleConfirmReservation = async (payload: {
    campusName?: string;
    campusAddress?: string;
    courtName?: string;
    courtImage?: string;
    date?: Date;
    slots: string[];
    total: number;
  }) => {
    if (!isAuthed) {
      setShowAuthModal(true);
      return;
    }
    if (!selectedCourt || !payload.date || !payload.slots.length) return;

    const sorted = [...payload.slots].sort((a, b) => SLOT_TIMES.indexOf(a) - SLOT_TIMES.indexOf(b));
    const [sh, sm] = sorted[0].split(":").map(Number);
    const [eh, em] = sorted[sorted.length - 1].split(":").map(Number);
    // Horas de pared Lima → instante UTC (el último slot ocupa hasta +1h)
    const ymd = limaYMD(payload.date);
    const pad = (n: number) => n.toString().padStart(2, "0");
    const start = new Date(limaToUtcISO(ymd, `${pad(sh)}:${pad(sm)}:00`));
    const endTotalMin = eh * 60 + em + 60;
    const end = new Date(
      limaToUtcISO(ymd, `${pad(Math.floor(endTotalMin / 60))}:${pad(endTotalMin % 60)}:00`)
    );

    setSubmitting(true);
    try {
      const res = await fetch("/api/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          canchasdep_id: Number(selectedCourt.id),
          fecha_empieza: start.toISOString(),
          fecha_termina: end.toISOString(),
        }),
      });

      if (res.status === 401) {
        setShowAuthModal(true);
        return;
      }
      if (res.status === 409) {
        setSelectionMessage("Ese horario ya no está disponible. Elige otro.");
        return;
      }
      if (!res.ok) {
        setSelectionMessage("Error al crear la reserva. Intenta de nuevo.");
        return;
      }

      const data = await res.json();
      router.push(`/reservas/pago?code=${data.reserva.code}`);
    } catch {
      setSelectionMessage("Error de red. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-app">
      <Navbar />
      <AuthModal
        open={showAuthModal && !isAuthed}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={() => setShowAuthModal(false)}
      />
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6 md:py-10">
        {isLoading ? (
          <div className="card-soft p-8 text-center text-muted animate-pulse-soft">
            Cargando sedes y canchas…
          </div>
        ) : loadError ? (
          <div className="card-soft p-8 text-center text-danger">
            Ocurrió un error al cargar las reservas: {loadError}
          </div>
        ) : !campuses.length ? (
          <div className="card-soft p-8 text-center text-muted">
            No hay sedes disponibles en este momento.
          </div>
        ) : (
          <>
            <div className="md:hidden mb-4">
              <button
                type="button"
                onClick={() => setIsCampusMenuOpen(true)}
                className="btn-secondary !py-2 !px-3"
                aria-label="Abrir menú de sedes"
              >
                <span className="text-lg">≡</span>
                Seleccionar sede
              </button>
            </div>
            <CampusMobileMenu
              campuses={campuses}
              selectedCampusId={selectedCampusId}
              isOpen={isCampusMenuOpen}
              onClose={() => setIsCampusMenuOpen(false)}
              onSelect={setSelectedCampusId}
            />

            <div className="grid grid-cols-1 gap-6 items-start md:grid-cols-[260px_minmax(0,1fr)_320px]">
              <CampusSidebar
                campuses={campuses}
                selectedCampusId={selectedCampusId}
                onSelect={setSelectedCampusId}
              />

              <section className="order-2 md:order-2 space-y-5">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-eyebrow text-brand mb-1">Sede activa</p>
                      <h2 className="text-display-md font-display text-primary">{selectedCampus?.name ?? "Sede"}</h2>
                    </div>
                    <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
                  </div>
                  <FilterBar
                    selectedSport={selectedSport}
                    setSelectedSport={setSelectedSport}
                    visibleDates={visibleDates}
                    selectedDateIndex={selectedDateIndex}
                    setSelectedDateIndex={setSelectedDateIndex}
                    windowStart={windowStart}
                    setWindowStart={setWindowStart}
                    allDates={allDates}
                    visibleCount={visibleCount}
                  />
                </div>

                {viewMode === "map" ? (
                  <CourtsMap />
                ) : (
                  <CourtsList
                    courts={pricedCourts}
                    selectedCampus={selectedCampus}
                    selectedDate={selectedDate}
                    selectedCourtId={selectedCourtId}
                    selectedCourtSlots={selectedCourtSlots}
                    selectedSlots={selectedSlots}
                    selectionMessage={selectionMessage}
                    onSelectCourt={setSelectedCourtId}
                    onToggleSlot={handleSlotToggle}
                  />
                )}
              </section>

              <div className="order-3 md:order-3 h-auto md:sticky md:top-20 self-start">
                <CourtDetails
                  selectedCourt={selectedCourt}
                  selectedCampus={selectedCampus}
                  selectedDate={selectedDate}
                  selectedSlots={selectedSlots}
                  totalPrice={totalPrice}
                  onConfirm={handleConfirmReservation}
                  submitting={submitting}
                />
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </main>
  );
}
