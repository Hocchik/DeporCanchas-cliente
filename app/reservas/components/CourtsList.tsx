import type { Campus, Court, CourtTimeSlot } from "../types";
import { formatTimeRange24, getStatusForCourt, LEGEND_COLORS } from "../utils";

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
    <div className="space-y-6 text-base">
      <div className="flex flex-wrap items-center gap-4 text-base text-main">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: LEGEND_COLORS.occupied }}
          />
          Ocupado
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full border"
            style={{
              backgroundColor: LEGEND_COLORS.free,
              borderColor: "#E2E8F0",
            }}
          />
          Libre
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: LEGEND_COLORS.blocked }}
          />
          Bloqueado
        </div>
      </div>

      <div className="space-y-6">
        {courts.map((court) => {
          const isSelected = selectedCourtId === court.id;
          const timeStatus = selectedDate
            ? getStatusForCourt(court, selectedDate)
            : [];
          const slotsToRender = isSelected && selectedCourtSlots.length
            ? selectedCourtSlots
            : timeStatus;

          return (
            <div
              key={court.id}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <button
                type="button"
                onClick={() => onSelectCourt(court.id)}
                className={`relative w-full text-left bg-snow-white rounded-2xl p-4 shadow-sm border-2 transition ${
                  isSelected
                    ? "border-black shadow-md"
                    : "border-transparent hover:border-forest-green/60"
                }`}
              >
                {isSelected && (
                  <span className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black text-snow-white text-base font-bold">
                    ✓
                  </span>
                )}
                <div className="flex flex-col gap-4">
                  <div className="w-full h-44 rounded-xl overflow-hidden bg-stone-gray">
                    <img
                      src={court.image}
                      alt={court.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-semibold text-forest-green">
                          {court.name}
                        </h3>
                        <p className="text-base text-main">
                          {selectedCampus?.address}
                        </p>
                      </div>
                      <span className="text-base font-bold text-forest-green">
                        S/{court.pricePerHour.toFixed(2)}/h
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="inline-flex items-center rounded-full bg-stone-gray px-3 py-1 text-sm font-semibold text-main">
                        {court.type.toUpperCase()}
                      </span>
                      {isSelected && (
                        <span className="inline-flex items-center rounded-full bg-grass-green px-3 py-1 text-sm font-semibold text-forest-green">
                          Seleccionada
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>

              <div
                className={`bg-snow-white rounded-2xl p-4 shadow-sm border transition ${
                  isSelected
                    ? "border-forest-green/70"
                    : "border-transparent"
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <p className="text-base font-semibold text-main">
                      Seleccionar horarios
                    </p>
                    <p className="text-sm text-main">
                      {selectedDate
                        ? selectedDate.toLocaleDateString("es-PE")
                        : "Selecciona una fecha"}
                    </p>
                  </div>
                  {!isSelected && (
                    <span className="text-xs font-semibold text-forest-green">
                      Selecciona la cancha
                    </span>
                  )}
                </div>

                <div
                  className={`grid grid-cols-2 gap-2 ${
                    isSelected ? "" : "pointer-events-none opacity-50"
                  }`}
                >
                  {slotsToRender.map((slot) => {
                    const isSelectedSlot =
                      isSelected && selectedSlots.includes(slot.time);
                    const isFree = slot.status === "free";
                    const isBlocked = slot.status === "blocked";
                    const isOccupied = slot.status === "occupied";

                    let backgroundColor = LEGEND_COLORS[slot.status];
                    let borderColor = "transparent";
                    let textColor = isBlocked ? "#F7F7F7" : "#0A3D2E";

                    if (isFree) {
                      borderColor = isSelectedSlot ? "#0A3D2E" : "#E2E8F0";
                      if (isSelectedSlot) {
                        backgroundColor = "#0A3D2E";
                        textColor = "#FFFFFF";
                      }
                    }

                    if (isOccupied) {
                      backgroundColor = "#FEE2E2";
                      borderColor = "#FCA5A5";
                      textColor = "#DC2626";
                    }

                    return (
                      <button
                        key={slot.time}
                        type="button"
                        onClick={() => onToggleSlot(slot.time)}
                        className="px-2 py-1.5 rounded-md text-sm font-semibold border transition"
                        style={{
                          backgroundColor,
                          color: textColor,
                          borderColor,
                          opacity: isFree ? 1 : 0.85,
                        }}
                        disabled={!isSelected || !isFree}
                      >
                        {isOccupied
                          ? `× ${formatTimeRange24(slot.time)}`
                          : formatTimeRange24(slot.time)}
                      </button>
                    );
                  })}
                </div>

                {isSelected && selectionMessage && (
                  <p className="mt-3 text-sm font-semibold text-forest-green">
                    {selectionMessage}
                  </p>
                )}

                {/* {isSelected && selectedSlots.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedSlots.map((slot) => (
                      <span
                        key={slot}
                        className="rounded-full bg-grass-green px-3 py-1 text-sm font-semibold text-forest-green"
                      >
                        {formatTimeRange24(slot)}
                      </span>
                    ))}
                  </div>
                )} */}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
