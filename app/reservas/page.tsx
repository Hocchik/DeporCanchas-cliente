"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  MapIcon,
  QueueListIcon,
  SparklesIcon,
  TrophyIcon,
  BoltIcon,
} from "@heroicons/react/24/solid";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CourtsList from "./components/CourtsList";
import CourtsMap from "./components/CourtsMap";
import CourtDetails from "./components/CourtDetails";
import type { Court, CourtType, ReservasData } from "./types";
import { SLOT_TIMES, WEEKDAY_LABELS, getStatusForCourt } from "./utils";
import { createClient } from "../../lib/supabase/client";
import "../styles/colors.css";

type CampusRow = {
  id: number;
  nombre: string;
  ubicacion: string;
  estado: string;
};

type CourtRow = {
  id: number;
  campus_id: number;
  nombre: string;
  tipo_deporte: string;
  estado: string;
};

type AvailabilityRow = {
  canchasdep_id: number;
  dias_de_la_semana: number;
  hora_abre: string;
  hora_cierra: string;
};

type ReservaRow = {
  canchasdep_id: number;
  fecha_empieza: string;
  fecha_termina: string;
  estado: string | null;
};

type TarifaRow = {
  canchasdep_id: number;
  precio_reemplazo: number | null;
  tarifas: {
    nombre: string | null;
    precio: number;
    prioridad: number;
    hora_empieza: string | null;
    hora_termina: string | null;
    fecha_empieza: string | null;
    fecha_termina: string | null;
  }[];
};

type BaseTariffs = {
  futbol7: number;
  futbol11: number;
  tenis: number;
  padel: number;
};

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toMinutes = (timeValue: string) => {
  const [hours, minutes] = timeValue.split(":").map(Number);
  return hours * 60 + minutes;
};

const isReservationActive = (estado: string | null) => {
  if (!estado) {
    return true;
  }
  const normalized = estado.trim().toLowerCase();
  return !["cancelado", "anulado", "rechazado"].includes(normalized);
};

const normalizeText = (value: string) =>
  value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const matchesSportKey = (sportKey: Court["sportKey"], name?: string | null) => {
  if (!name) {
    return false;
  }
  const normalized = normalizeText(name);
  if (sportKey === "tenis") {
    return normalized.includes("tenis");
  }
  if (sportKey === "padel") {
    return normalized.includes("padel");
  }
  if (sportKey === "futbol11") {
    return (
      normalized.includes("futbol 11") ||
      normalized.includes("futbol11") ||
      normalized.includes("futbol once")
    );
  }
  return (
    normalized.includes("futbol 7") ||
    normalized.includes("futbol7") ||
    normalized.includes("futsal")
  );
};

const isDateInRange = (
  dateKey: string,
  start: string | null,
  end: string | null
) => {
  if (start && dateKey < start) {
    return false;
  }
  if (end && dateKey > end) {
    return false;
  }
  return true;
};

const resolveCourtPrice = (
  court: Court,
  date: Date,
  baseTariffs: BaseTariffs
) => {
  const dateKey = toDateKey(date);
  const sportKey = court.sportKey ?? "futbol7";
  const candidates = (court.tariffs ?? [])
    .filter((tarifa) => matchesSportKey(sportKey, tarifa.nombre))
    .filter((tarifa) =>
      isDateInRange(dateKey, tarifa.fecha_empieza, tarifa.fecha_termina)
    );

  if (candidates.length) {
    candidates.sort((a, b) => {
      const priorityA = a.prioridad ?? 0;
      const priorityB = b.prioridad ?? 0;
      return priorityA - priorityB;
    });
    return candidates[0].precio ?? 0;
  }

  return baseTariffs[sportKey] ?? 0;
};

const courtImageForType = (type: CourtType) => {
  if (type === "futbol") {
    return "/Canchas_de_futbol_los_olivos.png";
  }
  if (type === "tenis") {
    return "/Canchasfutbol8.jpg";
  }
  return "/Clubterrazas_Miraflores.jpg";
};

const buildAvailabilityForCourt = (
  courtId: number,
  dates: Date[],
  availabilityRows: AvailabilityRow[],
  reservas: ReservaRow[]
) => {
  const blockedByDate: Record<string, string[]> = {};
  const occupiedByDate: Record<string, string[]> = {};

  const availabilityByDay = availabilityRows
    .filter((row) => row.canchasdep_id === courtId)
    .reduce<Record<string, { start: number; end: number }[]>>(
      (accumulator, row) => {
        const key = String(row.dias_de_la_semana);
        const start = toMinutes(row.hora_abre);
        const end = toMinutes(row.hora_cierra);
        if (!accumulator[key]) {
          accumulator[key] = [];
        }
        accumulator[key].push({ start, end });
        return accumulator;
      },
      {}
    );

  const reservationsByDate = reservas
    .filter((row) => row.canchasdep_id === courtId)
    .filter((row) => isReservationActive(row.estado))
    .reduce<Record<string, Set<string>>>((accumulator, row) => {
      const start = new Date(row.fecha_empieza);
      const end = new Date(row.fecha_termina);
      const dateKey = toDateKey(start);
      const startMinutes = start.getHours() * 60 + start.getMinutes();
      const endMinutes = end.getHours() * 60 + end.getMinutes();
      const slotSet = accumulator[dateKey] ?? new Set<string>();

      SLOT_TIMES.forEach((time) => {
        const slotMinutes = toMinutes(time);
        if (slotMinutes >= startMinutes && slotMinutes < endMinutes) {
          slotSet.add(time);
        }
      });

      accumulator[dateKey] = slotSet;
      return accumulator;
    }, {});

  dates.forEach((date) => {
    const dateKey = toDateKey(date);
    const dayKey = String(date.getDay());
    const ranges = availabilityByDay[dayKey] ?? [];

    const blockedTimes = SLOT_TIMES.filter((time) => {
      if (!ranges.length) {
        return true;
      }
      const slotMinutes = toMinutes(time);
      return !ranges.some(
        (range) => slotMinutes >= range.start && slotMinutes < range.end
      );
    });

    blockedByDate[dateKey] = blockedTimes;

    const occupiedSet = reservationsByDate[dateKey];
    occupiedByDate[dateKey] = occupiedSet
      ? Array.from(occupiedSet.values())
      : [];
  });

  return { blockedByDate, occupiedByDate };
};

export default function Reservas() {
  const [campuses, setCampuses] = useState<ReservasData["campuses"]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedCampusId, setSelectedCampusId] = useState("");
  const [selectedSport, setSelectedSport] = useState<"all" | CourtType>(
    "all"
  );
  const [selectedCourtId, setSelectedCourtId] = useState("");
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [windowStart, setWindowStart] = useState(0);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [selectionMessage, setSelectionMessage] = useState("");
  const [isCampusMenuOpen, setIsCampusMenuOpen] = useState(false);
  const [baseTariffs, setBaseTariffs] = useState<BaseTariffs>({
    futbol7: 0,
    futbol11: 0,
    tenis: 0,
    padel: 0,
  });

  const visibleCount = useMemo(() => 2, []);

  const allDates = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 21 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() + index);
      return date;
    });
  }, []);

  const visibleDates = useMemo(
    () => allDates.slice(windowStart, windowStart + visibleCount),
    [allDates, windowStart, visibleCount]
  );

  const selectedDate = allDates[selectedDateIndex] ?? allDates[0];

  const selectedCampus = campuses.find(
    (campus) => campus.id === selectedCampusId
  );

  useEffect(() => {
    if (campuses.length && !selectedCampusId) {
      setSelectedCampusId(campuses[0].id);
    }
  }, [campuses, selectedCampusId]);

  const filteredCourts = useMemo(() => {
    const courts = selectedCampus?.courts ?? [];
    if (selectedSport === "all") {
      return courts;
    }
    return courts.filter((court) => court.type === selectedSport);
  }, [selectedCampus, selectedSport]);

  const pricedCourts = useMemo(
    () =>
      filteredCourts.map((court) => ({
        ...court,
        pricePerHour: resolveCourtPrice(court, selectedDate, baseTariffs),
      })),
    [filteredCourts, selectedDate, baseTariffs]
  );

  console.log("Priced courts:", pricedCourts);

  useEffect(() => {
    if (!filteredCourts.length) {
      setSelectedCourtId("");
      return;
    }
    if (!filteredCourts.some((court) => court.id === selectedCourtId)) {
      setSelectedCourtId(filteredCourts[0].id);
    }
  }, [filteredCourts, selectedCourtId]);

  useEffect(() => {
    setSelectedSlots([]);
    setSelectionMessage("");
  }, [selectedCourtId, selectedDateIndex]);

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    const loadReservasData = async () => {
      try {
        setIsLoading(true);
        setLoadError("");

        const today = new Date();
        const startDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 21);

        const [campusResult, courtsResult, availabilityResult, tarifasResult, reservasResult, baseTarifasResult] =
          await Promise.all([
            supabase.from("campus").select("id, nombre, ubicacion, estado"),
            supabase
              .from("canchas_deportivas")
              .select("id, campus_id, nombre, tipo_deporte, estado"),
            supabase
              .from("cancha_disponibilidad")
              .select("canchasdep_id, dias_de_la_semana, hora_abre, hora_cierra"),
            supabase
              .from("tarifas_canchasdep")
              .select(
                "canchasdep_id, precio_reemplazo, tarifas (nombre, precio, prioridad, hora_empieza, hora_termina, fecha_empieza, fecha_termina)"
              ),
            supabase
              .from("reservas")
              .select("canchasdep_id, fecha_empieza, fecha_termina, estado")
              .gte("fecha_empieza", startDate.toISOString())
              .lt("fecha_empieza", endDate.toISOString()),
            supabase.from("tarifas").select("nombre, precio"),
          ]);

        if (
          campusResult.error ||
          courtsResult.error ||
          availabilityResult.error ||
          tarifasResult.error ||
          reservasResult.error ||
          baseTarifasResult.error
        ) {
          throw (
            campusResult.error ||
            courtsResult.error ||
            availabilityResult.error ||
            tarifasResult.error ||
            reservasResult.error ||
            baseTarifasResult.error
          );
        }

        const campusRows = (campusResult.data ?? []) as CampusRow[];
        const courtRows = (courtsResult.data ?? []) as CourtRow[];
        const availabilityRows =
          (availabilityResult.data ?? []) as AvailabilityRow[];
        const tarifaRows = (tarifasResult.data ?? []) as TarifaRow[];
        const reservaRows = (reservasResult.data ?? []) as ReservaRow[];
        const baseTarifaRows =
          (baseTarifasResult.data ?? []) as { nombre: string; precio: number }[];

        const baseByName = baseTarifaRows.reduce<BaseTariffs>(
          (accumulator, tarifa) => {
            const normalized = normalizeText(tarifa.nombre);
            if (normalized.includes("futbol 11") || normalized.includes("futbol11")) {
              accumulator.futbol11 = tarifa.precio;
            } else if (
              normalized.includes("futbol 7") ||
              normalized.includes("futbol7") ||
              normalized.includes("futsal")
            ) {
              accumulator.futbol7 = tarifa.precio;
            } else if (normalized.includes("padel")) {
              accumulator.padel = tarifa.precio;
            } else if (normalized.includes("tenis")) {
              accumulator.tenis = tarifa.precio;
            }
            return accumulator;
          },
          { futbol7: 0, futbol11: 0, tenis: 0, padel: 0 }
        );

        const mappedCampuses = campusRows.map((campus) => {
          const campusCourts = courtRows
            .filter((court) => court.campus_id === campus.id)
            .map((court) => {
              const normalizedType = court.tipo_deporte
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "");
              let sportKey: Court["sportKey"] = "futbol7";
              let type: CourtType = "futbol";
              if (normalizedType.includes("tenis")) {
                type = "tenis";
                sportKey = "tenis";
              } else if (normalizedType.includes("padel")) {
                type = "padel";
                sportKey = "padel";
              } else if (
                normalizedType.includes("futbol 11") ||
                normalizedType.includes("futbol11") ||
                normalizedType.includes("futbol once")
              ) {
                type = "futbol";
                sportKey = "futbol11";
              } else if (
                normalizedType.includes("futbol") ||
                normalizedType.includes("futsal")
              ) {
                type = "futbol";
                sportKey = "futbol7";
              }

              const availability = buildAvailabilityForCourt(
                court.id,
                allDates,
                availabilityRows,
                reservaRows
              );

              const tariffCandidates = tarifaRows
                .filter((tarifa) => tarifa.canchasdep_id === court.id)
                .flatMap((tarifa) => {
                  const items = Array.isArray(tarifa.tarifas)
                    ? tarifa.tarifas
                    : tarifa.tarifas
                      ? [tarifa.tarifas]
                      : [];
                  return items.map((item) => ({
                    ...item,
                    precio: tarifa.precio_reemplazo ?? item.precio,
                  }));
                });

              return {
                id: String(court.id),
                name: court.nombre,
                type,
                sportKey,
                tariffs: tariffCandidates,
                pricePerHour: 0,
                image: courtImageForType(type),
                availability,
              } satisfies Court;
            });

          return {
            id: String(campus.id),
            name: campus.nombre,
            address: campus.ubicacion,
            courts: campusCourts,
          };
        });

        if (isMounted) {
          setBaseTariffs(baseByName);
          setCampuses(mappedCampuses);
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }
        const message = error instanceof Error ? error.message : String(error);
        setLoadError(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadReservasData();

    return () => {
      isMounted = false;
    };
  }, [allDates]);

  useEffect(() => {
    if (selectedDateIndex < windowStart) {
      setSelectedDateIndex(windowStart);
    }
    if (selectedDateIndex > windowStart + visibleCount - 1) {
      setSelectedDateIndex(windowStart + visibleCount - 1);
    }
  }, [selectedDateIndex, windowStart, visibleCount]);

  const selectedCourt = pricedCourts.find(
    (court) => court.id === selectedCourtId
  );

  const selectedCourtSlots = useMemo(() => {
    if (!selectedCourt || !selectedDate) {
      return [];
    }
    return getStatusForCourt(selectedCourt, selectedDate);
  }, [selectedCourt, selectedDate]);

  const handleSlotToggle = (time: string) => {
    const slot = selectedCourtSlots.find((entry) => entry.time === time);
    if (!slot || slot.status !== "free") {
      return;
    }

    setSelectedSlots((previous) => {
      setSelectionMessage("");
      if (previous.includes(time)) {
        return previous.filter((item) => item !== time);
      }

      if (previous.length === 0) {
        return [time];
      }

      if (previous.length === 1) {
        const currentIndex = SLOT_TIMES.indexOf(previous[0]);
        const nextIndex = SLOT_TIMES.indexOf(time);
        if (Math.abs(currentIndex - nextIndex) !== 1) {
          setSelectionMessage(
            "Para reservar 2 horas, deben ser consecutivas. Selecciona una hora contigua."
          );
          return previous;
        }
        return [previous[0], time].sort(
          (a, b) => SLOT_TIMES.indexOf(a) - SLOT_TIMES.indexOf(b)
        );
      }

      setSelectionMessage(
        "Solo puedes elegir 1 o 2 horas. Selecciona una nueva hora para reiniciar."
      );
      return [time];
    });
  };

  const totalPrice = selectedCourt
    ? selectedSlots.length * selectedCourt.pricePerHour
    : 0;

    
  return (
    <main
      className="min-h-screen text-base"
      style={
        {
          backgroundColor: "#FBF9F5",
          ["--grass-green" as string]: "#84C940",
        } as React.CSSProperties
      }
    >
      <Navbar />
      <div className="w-full px-4 py-4 md:px-0 md:py-0">
        {isLoading ? (
          <div className="bg-snow-white rounded-2xl p-6 text-base text-main">
            Cargando sedes y canchas...
          </div>
        ) : loadError ? (
          <div className="bg-snow-white rounded-2xl p-6 text-base text-main">
            Ocurrio un error al cargar las reservas: {loadError}
          </div>
        ) : !campuses.length ? (
          <div className="bg-snow-white rounded-2xl p-6 text-base text-main">
            No hay sedes disponibles en este momento.
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setIsCampusMenuOpen(true)}
              className="md:hidden mb-4 inline-flex items-center gap-2 rounded-xl border border-forest-green px-3 py-2 text-base font-semibold text-forest-green"
              aria-label="Abrir menu de sedes"
            >
              <span className="text-lg">≡</span>
              Seleccionar sede
            </button>

            {isCampusMenuOpen && (
              <div className="fixed inset-0 z-40 md:hidden">
                <div
                  className="absolute inset-0 bg-black/40"
                  onClick={() => setIsCampusMenuOpen(false)}
                />
                <div className="relative mx-auto mt-16 w-[90%] max-w-sm rounded-2xl bg-snow-white p-5 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-forest-green">
                      Nuestros Campus
                    </h2>
                    <button
                      type="button"
                      onClick={() => setIsCampusMenuOpen(false)}
                      className="rounded-full border border-stone-gray px-3 py-1 text-base"
                      aria-label="Cerrar menu de sedes"
                    >
                      ×
                    </button>
                  </div>
                  <p className="text-base text-main mb-3">
                    Selecciona tu campus preferido
                  </p>
                  <div className="space-y-2">
                    {campuses.map((campus) => (
                      <button
                        key={campus.id}
                        type="button"
                        onClick={() => {
                          setSelectedCampusId(campus.id);
                          setIsCampusMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition ${
                          selectedCampusId === campus.id
                            ? "bg-grass-green text-forest-green"
                            : "text-main hover:bg-stone-gray"
                        }`}
                      >
                        <span className="text-base font-semibold">
                          {campus.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 items-start md:items-start md:grid-cols-[260px_minmax(0,1fr)_320px]">
          <aside
            className="order-1 hidden h-auto shadow-sm md:order-1 md:block p-5 md:sticky md:top-0 self-start"
            style={{ backgroundColor: "#F7FAFC" }}
          >
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-forest-green mt-5">
                Nuestros Campus
              </h2>
              <p className="text-base text-main">Selecciona tu campus preferido</p>
            </div>
            <div className="space-y-2">
              {campuses.map((campus) => (
                <button
                  key={campus.id}
                  type="button"
                  onClick={() => setSelectedCampusId(campus.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition ${
                    selectedCampusId === campus.id
                      ? "bg-grass-green text-forest-green"
                      : "text-main hover:bg-snow-white"
                  }`}
                >
                  <span className="text-base font-semibold">{campus.name}</span>
                </button>
              ))}
            </div>
          </aside>

          <section className="order-2 md:order-2 space-y-5 pt-4 md:pt-8">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-main">
                    {selectedCampus?.name ?? "Sede"}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    aria-label="Ver listado"
                    className={`relative overflow-hidden px-4 py-2 rounded-lg border transition ${
                      viewMode === "list"
                        ? "border-forest-green"
                        : "border-stone-gray"
                    }`}
                  >
                    <span
                      className={`absolute inset-0 bg-snow-white transition duration-200 ${
                        viewMode === "list"
                          ? "opacity-100 scale-100"
                          : "opacity-0 scale-95"
                      }`}
                    />
                    <QueueListIcon
                      className={`relative z-10 w-5 h-5 transition ${
                        viewMode === "list"
                          ? "text-forest-green"
                          : "text-main"
                      }`}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("map")}
                    aria-label="Ver croquis"
                    className={`relative overflow-hidden px-4 py-2 rounded-lg border transition ${
                      viewMode === "map"
                        ? "border-forest-green"
                        : "border-stone-gray"
                    }`}
                  >
                    <span
                      className={`absolute inset-0 bg-snow-white transition duration-200 ${
                        viewMode === "map"
                          ? "opacity-100 scale-100"
                          : "opacity-0 scale-95"
                      }`}
                    />
                    <MapIcon
                      className={`relative z-10 w-5 h-5 transition ${
                        viewMode === "map"
                          ? "text-forest-green"
                          : "text-main"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-snow-white rounded-2xl p-4 shadow-sm">
                  <p className="text-base font-semibold text-main mb-3">
                    Filtrar canchas
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: "all", label: "Todos", icon: SparklesIcon },
                      { id: "futbol", label: "Futbol", icon: TrophyIcon },
                      { id: "tenis", label: "Tenis", icon: BoltIcon },
                      { id: "padel", label: "Padel", icon: QueueListIcon },
                    ].map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() =>
                          setSelectedSport(option.id as "all" | CourtType)
                        }
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-sm font-semibold border transition ${
                          selectedSport === option.id
                            ? "bg-forest-green text-snow-white border-forest-green"
                            : "bg-transparent text-main border-stone-gray hover:border-forest-green"
                        }`}
                      >
                        <option.icon className="w-3.5 h-3.5" />
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-snow-white rounded-2xl p-4 shadow-sm">
                  <p className="text-base font-semibold text-main mb-3">
                    Selecciona fecha
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setWindowStart((current) => Math.max(0, current - 1))
                      }
                      className="px-3 py-2 rounded-lg border border-stone-gray text-main"
                      aria-label="Ver dias anteriores"
                    >
                      ‹
                    </button>
                    <div className="flex items-center gap-2">
                      {visibleDates.map((date, index) => {
                        const absoluteIndex = windowStart + index;
                        const isToday = absoluteIndex === 0;
                        return (
                          <button
                            key={date.toISOString()}
                            type="button"
                            onClick={() => setSelectedDateIndex(absoluteIndex)}
                            className={`min-w-[56px] py-2 rounded-xl text-center text-base font-semibold border transition ${
                              selectedDateIndex === absoluteIndex
                                ? "bg-forest-green text-snow-white border-forest-green"
                                : "bg-snow-white text-main border-transparent"
                            }`}
                          >
                            <span className="block">
                              {isToday ? "Hoy" : WEEKDAY_LABELS[date.getDay()]}
                            </span>
                            <span className="text-lg font-bold">
                              {date.getDate()}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setWindowStart((current) =>
                          Math.min(
                            Math.max(0, allDates.length - visibleCount),
                            current + 1
                          )
                        )
                      }
                      className="px-3 py-2 rounded-lg border border-stone-gray text-main"
                      aria-label="Ver mas dias"
                    >
                      ›
                    </button>
                  </div>
                </div>
              </div>
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

          <div className="order-3 md:order-3 h-auto md:sticky md:top-0 self-start">
            <CourtDetails
              selectedCourt={selectedCourt}
              selectedCampus={selectedCampus}
              selectedDate={selectedDate}
              selectedSlots={selectedSlots}
              totalPrice={totalPrice}
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
