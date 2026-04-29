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
import reservasData from "../data/reservas.json";
import CourtsList from "./components/CourtsList";
import CourtsMap from "./components/CourtsMap";
import CourtDetails from "./components/CourtDetails";
import type { CourtType, ReservasData } from "./types";
import { SLOT_TIMES, WEEKDAY_LABELS, getStatusForCourt } from "./utils";
import "../styles/colors.css";

export default function Reservas() {
  const campuses = (reservasData as unknown as ReservasData).campuses;
  const [selectedCampusId, setSelectedCampusId] = useState(
    campuses[0]?.id ?? ""
  );
  const [selectedSport, setSelectedSport] = useState<"all" | CourtType>(
    "all"
  );
  const [selectedCourtId, setSelectedCourtId] = useState(
    campuses[0]?.courts[0]?.id ?? ""
  );
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [windowStart, setWindowStart] = useState(0);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [selectionMessage, setSelectionMessage] = useState("");

  const allDates = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 21 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() + index);
      return date;
    });
  }, []);

  const visibleDates = useMemo(
    () => allDates.slice(windowStart, windowStart + 7),
    [allDates, windowStart]
  );

  const selectedDate = allDates[selectedDateIndex] ?? allDates[0];

  const selectedCampus = campuses.find(
    (campus) => campus.id === selectedCampusId
  );

  const filteredCourts = useMemo(() => {
    const courts = selectedCampus?.courts ?? [];
    if (selectedSport === "all") {
      return courts;
    }
    return courts.filter((court) => court.type === selectedSport);
  }, [selectedCampus, selectedSport]);

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
    if (selectedDateIndex < windowStart) {
      setSelectedDateIndex(windowStart);
    }
    if (selectedDateIndex > windowStart + 6) {
      setSelectedDateIndex(windowStart + 6);
    }
  }, [selectedDateIndex, windowStart]);

  const selectedCourt = filteredCourts.find(
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
    <main className="min-h-screen" style={{ backgroundColor: "#FBF9F5" }}>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_280px] gap-6">
          <aside
            className="rounded-2xl p-5"
            style={{ backgroundColor: "#F7FAFC" }}
          >
            <div className="mb-4">
              <h2 className="text-base font-semibold text-forest-green">
                Nuestros Campus
              </h2>
              <p className="text-xs text-main">Selecciona tu campus preferido</p>
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
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                      selectedCampusId === campus.id
                        ? "bg-forest-green text-snow-white"
                        : "bg-snow-white text-forest-green"
                    }`}
                  >
                    ◎
                  </span>
                  <span className="text-sm font-semibold">{campus.name}</span>
                </button>
              ))}
            </div>
          </aside>

          <section className="space-y-5">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-main">
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

              <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
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
                      className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold border transition ${
                        selectedSport === option.id
                          ? "bg-forest-green text-snow-white border-forest-green"
                          : "bg-transparent text-main border-stone-gray hover:border-forest-green"
                      }`}
                    >
                      <option.icon className="w-4 h-4" />
                      {option.label}
                    </button>
                  ))}
                </div>

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
                          className={`w-14 py-2 rounded-xl text-center text-xs font-semibold border transition ${
                            selectedDateIndex === absoluteIndex
                              ? "bg-forest-green text-snow-white border-forest-green"
                              : "bg-snow-white text-main border-transparent"
                          }`}
                        >
                          <span className="block">
                            {isToday ? "Hoy" : WEEKDAY_LABELS[date.getDay()]}
                          </span>
                          <span className="text-base font-bold">
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
                        Math.min(allDates.length - 7, current + 1)
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

            {viewMode === "map" ? (
              <CourtsMap />
            ) : (
              <CourtsList
                courts={filteredCourts}
                selectedCampus={selectedCampus}
                selectedDate={selectedDate}
                selectedCourtId={selectedCourtId}
                onSelectCourt={setSelectedCourtId}
              />
            )}
          </section>

          <CourtDetails
            selectedCourt={selectedCourt}
            selectedCampus={selectedCampus}
            selectedDate={selectedDate}
            selectedCourtSlots={selectedCourtSlots}
            selectedSlots={selectedSlots}
            selectionMessage={selectionMessage}
            totalPrice={totalPrice}
            onToggleSlot={handleSlotToggle}
          />
        </div>
      </div>
      <Footer />
    </main>
  );
}
