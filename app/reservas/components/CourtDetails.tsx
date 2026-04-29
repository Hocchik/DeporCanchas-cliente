import type { Campus, Court, CourtTimeSlot } from "../types";
import { formatTimeLabel, LEGEND_COLORS } from "../utils";

type CourtDetailsProps = {
  selectedCourt?: Court;
  selectedCampus?: Campus;
  selectedDate?: Date;
  selectedCourtSlots: CourtTimeSlot[];
  selectedSlots: string[];
  selectionMessage: string;
  totalPrice: number;
  onToggleSlot: (time: string) => void;
};

export default function CourtDetails({
  selectedCourt,
  selectedCampus,
  selectedDate,
  selectedCourtSlots,
  selectedSlots,
  selectionMessage,
  totalPrice,
  onToggleSlot,
}: CourtDetailsProps) {
  if (!selectedCourt) {
    return (
      <aside className="bg-snow-white rounded-2xl p-5 shadow-sm h-fit">
        <h2 className="text-sm font-semibold text-main mb-4">
          Detalles de cancha
        </h2>
        <p className="text-sm text-main">
          No hay canchas disponibles para este filtro.
        </p>
      </aside>
    );
  }

  return (
    <aside className="bg-snow-white rounded-2xl p-5 shadow-sm h-fit">
      <h2 className="text-sm font-semibold text-main mb-4">
        Detalles de cancha
      </h2>
      <div className="space-y-4">
        <div>
          <p className="text-sm font-semibold text-forest-green">
            {selectedCourt.name}
          </p>
          <p className="text-xs text-main">
            {selectedCampus?.name} - {selectedCampus?.address}
          </p>
          <p className="text-xs text-main mt-1">
            Fecha: {selectedDate?.toLocaleDateString("es-PE")}
          </p>
        </div>

        <div>
          <p className="text-xs text-main mb-2">Horarios disponibles (1h)</p>
          <div className="grid grid-cols-2 gap-2">
            {selectedCourtSlots.map((slot) => {
              const isSelected = selectedSlots.includes(slot.time);
              const isFree = slot.status === "free";
              const isBlocked = slot.status === "blocked";
              const isOccupied = slot.status === "occupied";

              let backgroundColor = LEGEND_COLORS[slot.status];
              let borderColor = "transparent";
              let textColor = isBlocked ? "#F7F7F7" : "#0A3D2E";

              if (isFree) {
                borderColor = isSelected ? "#0A3D2E" : "#E2E8F0";
                if (isSelected) {
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
                  className="px-2 py-2 rounded-md text-xs font-semibold border transition"
                  style={{
                    backgroundColor,
                    color: textColor,
                    borderColor,
                    opacity: isFree ? 1 : 0.85,
                  }}
                  disabled={!isFree}
                >
                  {isOccupied ? `× ${formatTimeLabel(slot.time)}` : formatTimeLabel(slot.time)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl bg-stone-gray px-3 py-3 text-xs text-main">
          <p className="font-semibold">Ayuda de reserva</p>
          <p>
            Puedes elegir 1 hora o 2 horas consecutivas. Si una hora esta
            bloqueada u ocupada, no podras saltarla.
          </p>
          {selectionMessage && (
            <p className="mt-2 text-forest-green font-semibold">
              {selectionMessage}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-stone-gray pt-4">
          <span className="text-sm font-semibold text-main">Total:</span>
          <span className="text-lg font-bold text-forest-green">
            S/{totalPrice.toFixed(2)}
          </span>
        </div>

        <button
          type="button"
          className="w-full bg-forest-green text-snow-white py-3 rounded-xl font-semibold shadow hover:bg-main transition"
          disabled={selectedSlots.length === 0}
        >
          Confirmar horarios
        </button>
      </div>
    </aside>
  );
}
