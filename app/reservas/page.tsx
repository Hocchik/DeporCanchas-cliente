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
import { limaYMD, addDaysYMD, limaToUtcISO, dowYMD } from "@/lib/lima-time";
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

const hourInRange = (minutes: number, start: string | null, end: string | null) => {
  if (!start || !end) return true;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const s = sh * 60 + sm;
  const e = eh * 60 + em;
  return minutes >= s && minutes < e;
};

const timeToMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

/**
 * Resuelve el precio efectivo de UN slot concreto, idéntico a
 * `lib/reservas/calcularPrecio` (servidor) — pero pure-client.
 * Filtra reglas por día Lima + fecha + hora; toma la de menor `prioridad`.
 * Si nada aplica, usa `precioDefault`; último recurso, baseTariffs por deporte.
 */
const priceForSlot = (
  court: Court,
  date: Date,
  slotTime: string,
  baseTariffs: BaseTariffs
): number => {
  const ymd = limaYMD(date);
  const dow = dowYMD(ymd);
  const slotMin = timeToMinutes(slotTime);
  const sportKey = court.sportKey ?? "futbol7";

  const aplicables = (court.tariffs ?? [])
    .filter((t) => !t.dias || t.dias.length === 0 || t.dias.includes(dow))
    .filter((t) => isDateInRange(ymd, t.fecha_empieza, t.fecha_termina))
    .filter((t) => hourInRange(slotMin, t.hora_empieza, t.hora_termina));

  if (aplicables.length) {
    aplicables.sort((a, b) => (a.prioridad ?? 0) - (b.prioridad ?? 0));
    return aplicables[0].precio ?? 0;
  }
  if (court.precioDefault != null) return court.precioDefault;
  return baseTariffs[sportKey] ?? 0;
};

/**
 * "Desde S/X" mostrado en la card: el **mínimo** que el cliente podría pagar
 * en ese día evaluando cada slot operativo (08:00–21:00). Así el "desde" no
 * exagera con una regla horaria especial — refleja el precio real más bajo.
 */
const resolveCourtPrice = (court: Court, date: Date, baseTariffs: BaseTariffs): number => {
  let min = Infinity;
  for (const t of SLOT_TIMES) {
    const p = priceForSlot(court, date, t, baseTariffs);
    if (p < min) min = p;
  }
  return Number.isFinite(min) ? min : 0;
};

/**
 * Construye etiquetas legibles de "tramos especiales" del día: reglas con
 * franja horaria distinta al "desde". Ej.: "Después de las 18:00 cuesta S/150".
 */
const buildDayPriceNotes = (
  court: Court,
  date: Date,
  desde: number
): string[] => {
  const ymd = limaYMD(date);
  const dow = dowYMD(ymd);
  const reglas = (court.tariffs ?? [])
    .filter((t) => !t.dias || t.dias.length === 0 || t.dias.includes(dow))
    .filter((t) => isDateInRange(ymd, t.fecha_empieza, t.fecha_termina))
    .filter((t) => t.hora_empieza && t.hora_termina) // solo tramos horarios
    .filter((t) => Math.abs((t.precio ?? 0) - desde) > 0.01);

  // Dedup por (hora_empieza, hora_termina, precio)
  const seen = new Set<string>();
  const notes: string[] = [];
  for (const t of reglas) {
    const key = `${t.hora_empieza}-${t.hora_termina}-${t.precio}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const h1 = (t.hora_empieza ?? "").slice(0, 5);
    const h2 = (t.hora_termina ?? "").slice(0, 5);
    notes.push(`De ${h1} a ${h2} cuesta S/${(t.precio ?? 0).toFixed(2)}/h`);
  }
  return notes;
};

export default function Reservas() {
  const router = useRouter();
  const { user } = useSession();
  const isAuthed = Boolean(user);

  // Pre-selección desde query string (ej. cuando vienen de "Reservar de nuevo" en Mis Reservas).
  // Lo leemos de window al montar para no requerir <Suspense> sobre useSearchParams.
  const [prefill, setPrefill] = useState<{ campus: string; cancha: string; fecha: string }>({ campus: "", cancha: "", fecha: "" });
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    setPrefill({
      campus: sp.get("campus") ?? "",
      cancha: sp.get("cancha") ?? "",
      fecha: sp.get("fecha") ?? "",
    });
  }, []);
  const prefillCampusId = prefill.campus;
  const prefillCourtId = prefill.cancha;
  const prefillFecha = prefill.fecha;

  // visibleCount se mide dinámicamente desde FilterBar según el ancho real
  // del carrusel de fechas; mientras llega el primer reporte usamos 2.
  const [visibleCount, setVisibleCount] = useState(2);

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
  // selectedSport ahora es un id libre: "all" | "futbol" | el `valor` raw del tipo (ej. "Tenis", "Padel", "Voley", etc.)
  const [selectedSport, setSelectedSport] = useState<string>("all");
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
    if (!campuses.length || selectedCampusId) return;
    // Pre-seleccionar desde query string si el campus existe; si no, el primero.
    if (prefillCampusId && campuses.some((c) => c.id === prefillCampusId)) {
      setSelectedCampusId(prefillCampusId);
    } else {
      setSelectedCampusId(campuses[0].id);
    }
  }, [campuses, selectedCampusId, prefillCampusId]);

  // Pre-seleccionar cancha desde query string una vez el campus está listo.
  useEffect(() => {
    if (!prefillCourtId || !selectedCampusId) return;
    const campus = campuses.find((c) => c.id === selectedCampusId);
    if (campus?.courts.some((c) => c.id === prefillCourtId)) {
      setSelectedCourtId(prefillCourtId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCampusId, campuses.length]);

  // Pre-seleccionar fecha desde query string (YYYY-MM-DD); si está en el rango.
  useEffect(() => {
    if (!prefillFecha) return;
    const idx = allDates.findIndex((d) => limaYMD(d) === prefillFecha);
    if (idx >= 0) setSelectedDateIndex(idx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDates.length]);

  // Opciones de deporte derivadas del campus activo: "Todos" + "Fútbol" (agrupa
  // F7+F11 si hay) + cada otro tipo único como standalone (Tenis, Pádel, y
  // cualquier tipo nuevo creado desde el admin como Vóley, Básquet, etc.).
  const availableSports = useMemo(() => {
    const courts = selectedCampus?.courts ?? [];
    const out: { id: string; label: string }[] = [{ id: "all", label: "Todos" }];
    const hasFutbol = courts.some((c) => /futbol/i.test(c.sportValue ?? c.type ?? ""));
    if (hasFutbol) out.push({ id: "futbol", label: "Fútbol" });
    const seen = new Set<string>();
    for (const c of courts) {
      const v = c.sportValue ?? "";
      if (!v || /futbol/i.test(v)) continue;
      if (seen.has(v)) continue;
      seen.add(v);
      out.push({ id: v, label: c.sportLabel || v });
    }
    return out;
  }, [selectedCampus]);

  const filteredCourts = useMemo(() => {
    const courts = selectedCampus?.courts ?? [];
    if (selectedSport === "all") return courts;
    if (selectedSport === "futbol") return courts.filter((c) => /futbol/i.test(c.sportValue ?? c.type ?? ""));
    return courts.filter((c) => (c.sportValue ?? "") === selectedSport);
  }, [selectedCampus, selectedSport]);

  // Si el deporte seleccionado ya no existe en el campus actual, volver a "all".
  useEffect(() => {
    if (!availableSports.some((o) => o.id === selectedSport)) setSelectedSport("all");
  }, [availableSports, selectedSport]);

  const pricedCourts = useMemo(
    () => filteredCourts.map((c) => {
      const desde = resolveCourtPrice(c, selectedDate, baseTariffs);
      return {
        ...c,
        pricePerHour: desde,
        dayPriceNotes: buildDayPriceNotes(c, selectedDate, desde),
      };
    }),
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

  // Cuando visibleCount crece (al ensanchar la ventana) el windowStart puede
  // dejar el carrusel "fuera de rango"; lo clampeamos al máximo válido.
  useEffect(() => {
    const max = Math.max(0, allDates.length - visibleCount);
    if (windowStart > max) setWindowStart(max);
  }, [windowStart, visibleCount, allDates.length]);

  const selectedCourt = pricedCourts.find((c) => c.id === selectedCourtId);

  const selectedCourtSlots = useMemo(() => {
    if (!selectedCourt || !selectedDate) return [];
    return getStatusForCourt(selectedCourt, selectedDate);
  }, [selectedCourt, selectedDate]);

  const handleSlotToggle = (courtId: string, time: string) => {
    // Click en un slot de OTRA cancha: cambio automático + aviso.
    // Sólo permitimos reservar en una cancha a la vez.
    if (courtId !== selectedCourtId) {
      const targetCourt = pricedCourts.find((c) => c.id === courtId);
      if (!targetCourt || targetCourt.disponible === false) return;
      const targetSlot = selectedDate ? getStatusForCourt(targetCourt, selectedDate).find((s) => s.time === time) : null;
      if (!targetSlot || targetSlot.status !== "free") return;
      setSelectedCourtId(courtId);
      setSelectedSlots([time]);
      setSelectionMessage("Cambiaste de cancha. Solo puedes reservar en una cancha a la vez.");
      return;
    }

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

  // Total real por slot: respeta las reglas con horario (ej. domingos 18-22 más
  // caro). Espeja exactamente el cálculo del server (calcularPrecioReserva).
  const totalPrice = useMemo(() => {
    if (!selectedCourt) return 0;
    return selectedSlots.reduce(
      (sum, t) => sum + priceForSlot(selectedCourt, selectedDate, t, baseTariffs),
      0
    );
  }, [selectedCourt, selectedSlots, selectedDate, baseTariffs]);

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
            <div className="lg:hidden mb-4">
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

            <div className="grid grid-cols-1 gap-6 items-start lg:grid-cols-[240px_minmax(0,1fr)_320px] xl:grid-cols-[260px_minmax(0,1fr)_340px]">
              <CampusSidebar
                campuses={campuses}
                selectedCampusId={selectedCampusId}
                onSelect={setSelectedCampusId}
              />

              <section className="order-2 lg:order-2 space-y-5">
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
                    sportOptions={availableSports}
                    visibleDates={visibleDates}
                    selectedDateIndex={selectedDateIndex}
                    setSelectedDateIndex={setSelectedDateIndex}
                    windowStart={windowStart}
                    setWindowStart={setWindowStart}
                    allDates={allDates}
                    visibleCount={visibleCount}
                    onVisibleCountChange={setVisibleCount}
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

              <div className="order-3 lg:order-3 h-auto lg:sticky lg:top-20 self-start">
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
