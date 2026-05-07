import React from "react";
import { SparklesIcon, TrophyIcon, BoltIcon, QueueListIcon } from "@heroicons/react/24/solid";
import type { CourtType } from "../types";

interface FilterBarProps {
  selectedSport: "all" | CourtType;
  setSelectedSport: (sport: "all" | CourtType) => void;
  visibleDates: Date[];
  selectedDateIndex: number;
  setSelectedDateIndex: (idx: number) => void;
  windowStart: number;
  setWindowStart: (idx: number) => void;
  allDates: Date[];
  visibleCount: number;
}

const WEEKDAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default function FilterBar({
  selectedSport,
  setSelectedSport,
  visibleDates,
  selectedDateIndex,
  setSelectedDateIndex,
  windowStart,
  setWindowStart,
  allDates,
  visibleCount,
}: FilterBarProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <div className="bg-snow-white rounded-2xl p-4 shadow-sm">
        <p className="text-base font-semibold text-main mb-3">Filtrar canchas</p>
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
              onClick={() => setSelectedSport(option.id as "all" | CourtType)}
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
        <p className="text-base font-semibold text-main mb-3">Selecciona fecha</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setWindowStart(Math.max(0, windowStart - 1))}
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
                  <span className="text-lg font-bold">{date.getDate()}</span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() =>
              setWindowStart(
                Math.min(
                  Math.max(0, allDates.length - visibleCount),
                  windowStart + 1
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
  );
}
