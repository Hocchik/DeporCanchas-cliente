import React from "react";
import { SparklesIcon, TrophyIcon, BoltIcon, QueueListIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import type { CourtType } from "../types";
import { limaYMD, dowYMD } from "@/lib/lima-time";

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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
      <div className="card-soft p-4">
        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Deporte</p>
        <div className="flex flex-wrap gap-2">
          {[
            { id: "all", label: "Todos", icon: SparklesIcon },
            { id: "futbol", label: "Fútbol", icon: TrophyIcon },
            { id: "tenis", label: "Tenis", icon: BoltIcon },
            { id: "padel", label: "Pádel", icon: QueueListIcon },
          ].map((option) => {
            const active = selectedSport === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelectedSport(option.id as "all" | CourtType)}
                className={[
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border transition",
                  active
                    ? "bg-brand text-on-brand border-brand"
                    : "bg-transparent text-primary border-default hover:border-strong hover:bg-brand-soft",
                ].join(" ")}
              >
                <option.icon className="w-3.5 h-3.5" />
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="card-soft p-4">
        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Fecha</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setWindowStart(Math.max(0, windowStart - 1))}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-default text-primary hover:border-strong hover:bg-brand-soft transition"
            aria-label="Días anteriores"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            {visibleDates.map((date, index) => {
              const absoluteIndex = windowStart + index;
              const isToday = absoluteIndex === 0;
              const active = selectedDateIndex === absoluteIndex;
              const ymd = limaYMD(date);
              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => setSelectedDateIndex(absoluteIndex)}
                  className={[
                    "flex-1 min-w-[64px] py-2 rounded-xl text-center font-semibold border transition",
                    active
                      ? "bg-brand text-on-brand border-brand shadow-soft"
                      : "bg-surface text-primary border-default hover:border-strong",
                  ].join(" ")}
                >
                  <span className="block text-xs">
                    {isToday ? "Hoy" : WEEKDAY_LABELS[dowYMD(ymd)]}
                  </span>
                  <span className="text-lg font-bold leading-tight">{Number(ymd.slice(8, 10))}</span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() =>
              setWindowStart(
                Math.min(Math.max(0, allDates.length - visibleCount), windowStart + 1)
              )
            }
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-default text-primary hover:border-strong hover:bg-brand-soft transition"
            aria-label="Días siguientes"
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
