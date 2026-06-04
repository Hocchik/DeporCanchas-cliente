import React, { useEffect, useRef } from "react";
import { SparklesIcon, TrophyIcon, BoltIcon, QueueListIcon, TagIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { limaYMD, dowYMD } from "@/lib/lima-time";

export type SportOption = { id: string; label: string };

interface FilterBarProps {
  selectedSport: string;
  setSelectedSport: (sport: string) => void;
  /** Opciones dinámicas derivadas de los tipos de cancha presentes en el campus. */
  sportOptions: SportOption[];
  visibleDates: Date[];
  selectedDateIndex: number;
  setSelectedDateIndex: (idx: number) => void;
  windowStart: number;
  setWindowStart: (idx: number) => void;
  allDates: Date[];
  visibleCount: number;
  /** Reportado al padre para que ajuste `visibleCount` al ancho real. */
  onVisibleCountChange?: (n: number) => void;
}

// Cada píldora ocupa min 64px (ver `min-w-[64px]` abajo) y entre píldoras hay
// gap-2 (8px). Mantener sincronizado con el JSX.
const PILL_MIN_WIDTH = 64;
const PILL_GAP = 8;

const WEEKDAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

/** Icono por id conocido; cualquier id nuevo (Vóley, Básquet, etc.) usa TagIcon. */
const ICON_BY_ID: Record<string, React.ComponentType<{ className?: string }>> = {
  all: SparklesIcon,
  futbol: TrophyIcon,
  Tenis: BoltIcon,
  Padel: QueueListIcon,
};

export default function FilterBar({
  selectedSport,
  setSelectedSport,
  sportOptions,
  visibleDates,
  selectedDateIndex,
  setSelectedDateIndex,
  windowStart,
  setWindowStart,
  allDates,
  visibleCount,
  onVisibleCountChange,
}: FilterBarProps) {
  const pillsRowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!onVisibleCountChange || typeof ResizeObserver === "undefined") return;
    const el = pillsRowRef.current;
    if (!el) return;

    const compute = () => {
      const width = el.clientWidth;
      if (width <= 0) return;
      // n*pill + (n-1)*gap ≤ width  ⇒  n ≤ (width + gap) / (pill + gap)
      const fit = Math.floor((width + PILL_GAP) / (PILL_MIN_WIDTH + PILL_GAP));
      const next = Math.max(1, Math.min(allDates.length || 1, fit));
      if (next !== visibleCount) onVisibleCountChange(next);
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [allDates.length, visibleCount, onVisibleCountChange]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
      <div className="card-soft p-4">
        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Deporte</p>
        <div className="flex flex-wrap gap-2">
          {sportOptions.map((option) => {
            const active = selectedSport === option.id;
            const Icon = ICON_BY_ID[option.id] ?? TagIcon;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setSelectedSport(option.id)}
                className={[
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border transition",
                  active
                    ? "bg-brand text-on-brand border-brand"
                    : "bg-transparent text-primary border-default hover:border-strong hover:bg-brand-soft",
                ].join(" ")}
              >
                <Icon className="w-3.5 h-3.5" />
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
          <div ref={pillsRowRef} className="flex items-center gap-2 flex-1 min-w-0">
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
