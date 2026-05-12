import { CheckCircleIcon } from "@heroicons/react/24/solid";
import type { Campus, Court, CourtTimeSlot } from "../types";
import { formatTimeRange24, getStatusForCourt } from "../utils";

type CourtsListProps = {
  courts: Court[];
  selectedCampus?: Campus;
  selectedDate?: Date;
  selectedCourtId: string;
  selectedCourtSlots: CourtTimeSlot[];
  selectedSlots: string[];
  selectionMessage: string;
  onSelectCourt: (courtId: string) => void;
  onToggleSlot: (time: string) => void;
};

export default function CourtsList({
  courts,
  selectedCampus,
  selectedDate,
  selectedCourtId,
  selectedCourtSlots,
  selectedSlots,
  selectionMessage,
  onSelectCourt,
  onToggleSlot,
}: CourtsListProps) {
  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted">
        <LegendDot className="bg-surface border border-default" label="Libre" />
        <LegendDot className="bg-brand" label="Seleccionado" />
        <LegendDot className="bg-danger-soft border border-danger-soft" label="Ocupado" />
        <LegendDot className="bg-surface-alt opacity-60" label="Bloqueado" />
      </div>

      <div className="space-y-6">
        {courts.map((court) => {
          const isSelected = selectedCourtId === court.id;
          const timeStatus = selectedDate ? getStatusForCourt(court, selectedDate) : [];
          const slotsToRender = isSelected && selectedCourtSlots.length ? selectedCourtSlots : timeStatus;

          return (
            <div key={court.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-4">
              {/* Card de la cancha */}
              <button
                type="button"
                onClick={() => onSelectCourt(court.id)}
                className={[
                  "relative w-full text-left rounded-2xl border-2 overflow-hidden bg-surface-elev transition",
                  isSelected
                    ? "border-brand shadow-card"
                    : "border-soft shadow-soft hover:border-default hover:shadow-card hover:-translate-y-0.5",
                ].join(" ")}
              >
                {isSelected && (
                  <span className="absolute right-3 top-3 z-10 inline-flex items-center justify-center w-8 h-8 rounded-full bg-brand text-on-brand shadow-soft">
                    <CheckCircleIcon className="w-5 h-5" />
                  </span>
                )}
                <div className="relative h-44 w-full overflow-hidden bg-surface-alt">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={court.image}
                    alt={court.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-display font-semibold text-lg text-primary truncate">
                        {court.name}
                      </h3>
                      <p className="text-sm text-muted truncate">
                        {selectedCampus?.address}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted">desde</p>
                      <p className="text-base font-bold text-brand leading-tight">
                        S/{court.pricePerHour.toFixed(2)}
                        <span className="text-xs font-medium text-muted">/h</span>
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="chip">{court.type.toUpperCase()}</span>
                    {isSelected && (
                      <span className="chip chip-strong">Seleccionada</span>
                    )}
                  </div>
                </div>
              </button>

              {/* Panel de horarios */}
              <div
                className={[
                  "card-soft p-4 transition",
                  isSelected ? "border-default" : "",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm font-semibold text-primary">
                      Selecciona tu horario
                    </p>
                    <p className="text-xs text-muted">
                      {selectedDate ? selectedDate.toLocaleDateString("es-PE", { weekday: "long", day: "2-digit", month: "long" }) : "Selecciona una fecha"}
                    </p>
                  </div>
                  {!isSelected && (
                    <span className="text-xs font-semibold text-brand">
                      ← Elige la cancha
                    </span>
                  )}
                </div>

                <div className={[
                  "grid grid-cols-2 gap-2",
                  isSelected ? "" : "opacity-50 pointer-events-none",
                ].join(" ")}>
                  {slotsToRender.map((slot) => {
                    const isSelectedSlot = isSelected && selectedSlots.includes(slot.time);
                    const cls = slotClass(slot.status, isSelectedSlot);
                    const disabled = !isSelected || slot.status !== "free";
                    return (
                      <button
                        key={slot.time}
                        type="button"
                        onClick={() => onToggleSlot(slot.time)}
                        disabled={disabled}
                        className={[
                          "px-2 py-2 rounded-lg text-sm font-semibold border transition",
                          cls,
                        ].join(" ")}
                      >
                        {slot.status === "occupied"
                          ? `× ${formatTimeRange24(slot.time)}`
                          : formatTimeRange24(slot.time)}
                      </button>
                    );
                  })}
                </div>

                {isSelected && selectionMessage && (
                  <p className="mt-3 text-xs font-semibold text-brand">
                    {selectionMessage}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`w-3 h-3 rounded-full ${className}`} />
      {label}
    </span>
  );
}

function slotClass(status: "free" | "blocked" | "occupied", isSelected: boolean): string {
  if (isSelected) {
    return "bg-brand text-on-brand border-brand shadow-soft";
  }
  if (status === "occupied") {
    return "slot-occupied cursor-not-allowed";
  }
  if (status === "blocked") {
    return "bg-surface-alt text-soft border-default opacity-60 cursor-not-allowed";
  }
  // free
  return "bg-surface text-primary border-default hover:border-brand hover:bg-brand-soft";
}
